"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { usePushNotifications } from "@/lib/hooks/use-push";

// Multi-device opt-in for push notifications.
//
// Rule: every signed-in user on a device with no push subscription gets the
// enable prompt — shown at every fresh sign-in and on later app openings, and
// stopped only by real outcomes (device registered, browser-blocked
// permission, unsupported platform, or an explicit "Not now" this session).
//
// No user-preference gating: notificationPreferences are a signup-time
// snapshot inside a 30-day JWT, so gating on them made the prompt depend on
// which device logged in most recently (hit-or-miss). The ask itself is
// cheap and answerable, so we always ask.
//
// The native permission screen is gesture-gated by the browser — it cannot be
// triggered programmatically — hence a one-tap toast whose tap runs enable()
// inside the click's user gesture: SW registration, the native prompt, and
// the backend POST (subscription + push preference) all happen there.
const DISMISS_KEY = "retrievo.push.multiDevicePrompt";

export function PushEnablePrompt() {
    const { data: session, status } = useSession();
    const { supported, enabled, ready, enable } = usePushNotifications();

    useEffect(() => {
        if (status !== "authenticated" || !session?.backendToken) return;
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

        // Only an explicit decision suppresses the prompt. Auto-close / app
        // suspension must NOT: iOS keeps PWA processes alive for days, and a
        // toast that timed out while the phone was locked would otherwise be
        // gone forever ("hit or miss" from the user's perspective).
        if (sessionStorage.getItem(DISMISS_KEY)) {
            console.debug("[push-prompt] skip: dismissed earlier this session");
            return;
        }

        console.debug("[push-prompt] showing multi-device enable toast");
        toast("Turn on push notifications for this device?", {
            id: DISMISS_KEY,
            description:
                "Get instant alerts when a lost item is matched, or when someone claims what you found.",
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
            // Swiped away counts as "Not now"; timed-out does not.
            onDismiss: () => sessionStorage.setItem(DISMISS_KEY, "1"),
        });
    }, [status, session, ready, supported, enabled, enable]);

    return null;
}
