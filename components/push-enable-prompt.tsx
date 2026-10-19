"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { usePushNotifications } from "@/lib/hooks/use-push";

// Multi-device opt-in for push notifications.
//
// The native permission screen is gesture-gated by the browser and cannot be
// triggered programmatically, so this can never be a popup on page load. What
// we can do is combine the two complementary signals:
//   backend -> session.user.notificationPreferences.push === true
//              ("this user opted into push on some device")
//   this device -> !enabled (("this browser has no live registration")
// and offer a one-tap prompt. Tapping it runs enable(), which stays inside the
// click's user gesture — SW registration, the native permission prompt, and
// the subscription POST all work from there.
//
// Shown at most once per browser session; "Not now" or dismissal suppresses
// it for the rest of the session (profile settings remain the permanent route).
const DISMISS_KEY = "retrievo.push.multiDevicePrompt";

export function PushEnablePrompt() {
    const { data: session, status } = useSession();
    const { supported, enabled, ready, enable } = usePushNotifications();

    useEffect(() => {
        if (status !== "authenticated" || !session?.backendToken) {
            console.debug(
                "[push-prompt] skip: not authenticated client-side",
                { status, hasToken: !!session?.backendToken }
            );
            return;
        }
        // All three are resolved by the hook's async inspection; before that
        // finishes we can't tell registration state apart from "unsupported".
        if (!ready) {
            console.debug("[push-prompt] skip: push state inspection still pending");
            return;
        }
        if (!supported) {
            console.debug(
                "[push-prompt] skip: PushManager unavailable — " +
                "(home-screen web app required on iOS, iOS 16.4+)"
            );
            return;
        }
        if (enabled) {
            console.debug("[push-prompt] skip: device already registered");
            return;
        }

        // Don't re-prompt users the browser itself has blocked — profile
        // settings is the recovery path for them.
        if (Notification.permission === "denied") {
            console.debug("[push-prompt] skip: permission denied on this device");
            return;
        }

        // Has the user opted into push from any device? (backend signal)
        if (session.user.notificationPreferences?.push !== true) {
            console.debug("[push-prompt] skip: no push opt-in on any device");
            return;
        }

        // At most once per browser session.
        if (sessionStorage.getItem(DISMISS_KEY)) {
            console.debug("[push-prompt] skip: dismissed earlier this session");
            return;
        }

        // NOT marked "shown" here: iOS keeps PWAs alive for days, and a toast
        // that auto-closes while the device is locked would otherwise be
        // suppressed forever. Suppression only happens on explicit dismissal
        // below. Duplicate renders are safe — sonner dedupes by toast id.
        console.debug("[push-prompt] showing multi-device enable toast");

        toast("Enable push notifications here too?", {
            id: DISMISS_KEY,
            description:
                "You use item-match alerts on another device. Turn them on in this browser to get them here.",
            duration: 25_000,
            action: {
                label: "Enable",
                onClick: () => {
                    sessionStorage.setItem(DISMISS_KEY, "1");
                    enable();
                },
            },
            cancel: {
                label: "Not now",
                onClick: () => sessionStorage.setItem(DISMISS_KEY, "1"),
            },
            onDismiss: () => sessionStorage.setItem(DISMISS_KEY, "1"),
            onAutoClose: () => sessionStorage.setItem(DISMISS_KEY, "1"),
        });
    }, [status, session, ready, supported, enabled, enable]);

    return null;
}
