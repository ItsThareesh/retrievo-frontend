"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { APIError } from "@/lib/api-error";
import { handleBanError } from "@/lib/ban-handler";
import { getPushPublicKey, subscribePush, unsubscribePush } from "@/lib/api/push";
import { updateNotificationPreferences } from "@/lib/api/profile";

const SW_PATH = "/sw.js";

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

export function usePushNotifications() {
    const { data: session, status, update: updateSession } = useSession();
    const token = session?.backendToken;

    const [supported, setSupported] = useState(true);
    const [enabled, setEnabled] = useState(false);
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
                }
                return;
            }

            try {
                const [subscription] = await Promise.all([
                    currentSubscription(),
                    navigator.serviceWorker.ready,
                ]);
                if (!cancelled && mountedRef.current) {
                    setEnabled(
                        !!subscription && Notification.permission === "granted"
                    );
                }
            } catch (err) {
                console.error("Failed to inspect push subscription:", err);
                if (!cancelled && mountedRef.current) setEnabled(false);
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

    return { supported, enabled, isBusy, enable, disable };
}
