"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { APIError } from "@/lib/api-error";
import { handleBanError } from "@/lib/ban-handler";
import { getPushPublicKey, subscribePush, unsubscribePush } from "@/lib/api/push";
import { updateNotificationPreferences } from "@/lib/api/profile";

const SW_PATH = "/sw.js";

// Silent device re-registration: don't re-POST the same subscription on every
// load — once a week is enough to repair a pruned row or refresh an endpoint.
const SYNC_MARKER_KEY = "retrievo.push.lastSync";
const SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    const buffer = new ArrayBuffer(raw.length);
    const output = new Uint8Array(buffer);
    for (let i = 0; i < raw.length; i++) {
        output[i] = raw.charCodeAt(i);
    }
    return output;
}

// Web Push needs an installed PWA on iOS; only check platform support here.
function pushSupported(): boolean {
    return (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
}

async function currentSubscription(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (!registration) return null;
    return registration.pushManager.getSubscription();
}

async function syncSubscriptionSilently(
    subscription: PushSubscription,
    token: string
): Promise<void> {
    // No prompts, no toasts, no preference changes — pure backend row
    // repair/upsert for a device whose subscription was pruned server-side
    // (410/404) or whose endpoint was rotated by the browser.
    const json = subscription.toJSON();
    const endpoint = json.endpoint!;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!endpoint || !p256dh || !auth) return;

    try {
        const marker = JSON.parse(
            localStorage.getItem(SYNC_MARKER_KEY) ?? "null"
        ) as { endpoint: string; at: number } | null;
        if (
            marker &&
            marker.endpoint === endpoint &&
            Date.now() - marker.at < SYNC_INTERVAL_MS
        ) {
            return;
        }
    } catch {
        localStorage.removeItem(SYNC_MARKER_KEY);
    }

    try {
        await subscribePush({ endpoint, p256dh, auth }, token);
        localStorage.setItem(
            SYNC_MARKER_KEY,
            JSON.stringify({ endpoint, at: Date.now() })
        );
    } catch (err) {
        // Marker stays unset, so the next mount retries.
        console.error("Silent push re-sync failed:", err);
    }
}

export function usePushNotifications() {
    const { data: session, status, update: updateSession } = useSession();
    const token = session?.backendToken;

    const [supported, setSupported] = useState(true);
    const [enabled, setEnabled] = useState(false);
    // Inspection of push state is async; the result isn't trustworthy until
    // this flips true (used by the multi-device enable prompt).
    const [ready, setReady] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (status === "loading") return;

        let cancelled = false;
        (async () => {
            if (!pushSupported()) {
                if (!cancelled && mountedRef.current) {
                    setSupported(false);
                    setEnabled(false);
                    setReady(true);
                }
                return;
            }

            try {
                // The page can only *register* a service worker here —
                // navigator.serviceWorker.ready never resolves on devices
                // where no SW has been registered yet (e.g. a freshly
                // installed iOS PWA: nobody has enabled push on it before),
                // which would leave `ready` false forever and keep the
                // multi-device prompt from ever showing. Registration is
                // gesture-free, so this is safe on mount. Same dance as
                // enable() does explicitly.
                await navigator.serviceWorker.register(SW_PATH);
                const registration = await navigator.serviceWorker.ready;

                const subscription = await registration.pushManager.getSubscription();

                const registered = !!subscription && Notification.permission === "granted";

                if (!cancelled && mountedRef.current) {
                    setEnabled(registered);
                    setReady(true);
                }

                // The browser owns device-level push state, the DB holds one
                // row per device. If this device holds a live subscription,
                // quietly make sure the backend row exists too — covers rows
                // pruned by 404/410 and browser-side endpoint rotation.
                if (registered && token) {
                    await syncSubscriptionSilently(subscription!, token);
                }
            } catch (err) {
                console.error("Failed to inspect push subscription:", err);
                if (!cancelled && mountedRef.current) {
                    setEnabled(false);
                    setReady(true);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [status, token]);

    const enable = useCallback(async () => {
        if (isBusy) return;
        if (!token) {
            toast.error("Sign in to enable push notifications.");
            return;
        }
        if (!pushSupported()) {
            toast.error("Push notifications are not supported on this device/browser.");
            return;
        }

        setIsBusy(true);
        try {
            // Fail fast on server misconfiguration (503) before asking for permission.
            const { public_key } = await getPushPublicKey(token);

            // Keep the SW registered and hand back the "ready" registration,
            // which is the one guaranteed to be the active controller.
            await navigator.serviceWorker.register(SW_PATH);
            const registration = await navigator.serviceWorker.ready;

            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                toast.error("Permission denied. Enable notifications in your browser settings.");
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(public_key),
            });

            const json = subscription.toJSON();
            const payload = {
                endpoint: json.endpoint!,
                p256dh: json.keys!.p256dh!,
                auth: json.keys!.auth!,
            };
            await subscribePush(payload, token);
            await updateNotificationPreferences({ push: true }, token);
            await updateSession();

            // Fresh subscription just registered — mark it synced so the
            // silent re-sync doesn't re-POST an identical row next mount.
            localStorage.setItem(
                SYNC_MARKER_KEY,
                JSON.stringify({ endpoint: payload.endpoint, at: Date.now() })
            );

            if (mountedRef.current) setEnabled(true);
            toast.success("Push notifications enabled.");
        } catch (err) {
            if (handleBanError(err)) return;

            if (err instanceof APIError && err.status === 503) {
                toast.error("Push notifications aren't available right now. Try again later.");
                return;
            }
            console.error("Failed to enable push:", err);
            toast.error("Couldn't enable push notifications. Please try again.");
        } finally {
            if (mountedRef.current) setIsBusy(false);
        }
    }, [isBusy, token, updateSession]);

    const disable = useCallback(async () => {
        if (isBusy) return;
        if (!token) {
            toast.error("Sign in to change notification settings.");
            return;
        }

        setIsBusy(true);
        try {
            const subscription = await currentSubscription();
            if (subscription) {
                const json = subscription.toJSON();
                const payload = {
                    endpoint: json.endpoint!,
                    p256dh: json.keys?.p256dh ?? "",
                    auth: json.keys?.auth ?? "",
                };
                try {
                    await unsubscribePush(payload, token);
                } finally {
                    await subscription.unsubscribe();
                }
            }
            await updateNotificationPreferences({ push: false }, token);
            await updateSession();

            if (mountedRef.current) setEnabled(false);
            toast.success("Push notifications disabled.");
        } catch (err) {
            if (handleBanError(err)) return;
            console.error("Failed to disable push:", err);
            toast.error("Couldn't disable push notifications. Please try again.");
        } finally {
            if (mountedRef.current) setIsBusy(false);
        }
    }, [isBusy, token, updateSession]);

    return { supported, enabled, ready, isBusy, enable, disable };
}
