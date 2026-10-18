"use client";

import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePushNotifications } from "@/lib/hooks/use-push";

export function PushToggleRow() {
    const { supported, enabled, isBusy, enable, disable } = usePushNotifications();

    return (
        <div
            className={cn(
                "flex items-center gap-3 py-1 px-1 transition-opacity",
                !supported && "opacity-60 pointer-events-none"
            )}
        >
            <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                supported && enabled
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
            )}>
                {supported && enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none">Push notifications</p>
                {!supported && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Push notifications are not supported on this device
                    </p>
                )}
            </div>

            {supported && (
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label="Toggle push notifications"
                    disabled={isBusy}
                    onClick={() => (enabled ? disable() : enable())}
                    className={cn(
                        "relative h-5 w-9 rounded-full transition-colors shrink-0 cursor-pointer",
                        enabled ? "bg-primary" : "bg-muted-foreground/30",
                        isBusy && "opacity-50 pointer-events-none"
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                            enabled && "translate-x-4"
                        )}
                    />
                </button>
            )}
        </div>
    );
}
