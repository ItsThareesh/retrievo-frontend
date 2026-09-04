"use client"

import { useEffect } from "react";

export function RegisterSW() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            const register = async () => {
                try {
                    const registration = await navigator.serviceWorker.register("/sw.js");
                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener("statechange", () => {
                                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                    newWorker.postMessage({ type: "SKIP_WAITING" });
                                }
                            });
                        }
                    });
                } catch {
                    // Service worker registration failed
                }
            };
            window.addEventListener("load", register);
        }
    }, []);

    return null;
}