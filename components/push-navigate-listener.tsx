"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Receiving half of the service-worker deep-link contract.
 *
 * public/sw.js can't navigate an already-open app on its own: on
 * notificationclick it focuses the existing tab and posts a
 * { type: "PUSH_NAVIGATE", url } message into it. Without a listener here
 * that message dies silently and the tab just comes to the foreground
 * wherever it happened to be.
 *
 * The url arrives as an absolute same-origin href (the SW resolves the
 * origin-relative payload path against self.location.origin). Normalize to
 * path + query and refuse cross-origin targets before pushing.
 */
export function PushNavigateListener() {
    const router = useRouter();

    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        const onMessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data || data.type !== "PUSH_NAVIGATE") return;
            if (typeof data.url !== "string" || !data.url) return;

            try {
                const target = new URL(data.url, window.location.origin);
                if (target.origin !== window.location.origin) return;
                const path = target.pathname + target.search + target.hash;
                router.push(path);
            } catch {
                return;
            }
        };

        navigator.serviceWorker.addEventListener("message", onMessage);
        return () => navigator.serviceWorker.removeEventListener("message", onMessage);
    }, [router]);

    return null;
}
