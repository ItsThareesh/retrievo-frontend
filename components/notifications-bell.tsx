"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/lib/hooks/use-notifications"

export function NotificationsBell() {
    const { unreadCount } = useNotifications()

    return (
        <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-muted/60 active:bg-muted/70 transition-all duration-150 cursor-pointer"
        >
            <Link href="/notifications" aria-label="Notifications">
                <Bell className="h-5 w-5 text-muted-foreground" />

                {unreadCount > 0 && (
                    unreadCount < 10 ? (
                        <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center ring-2 ring-background animate-in zoom-in duration-300">
                            {unreadCount}
                        </span>
                    ) : (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-in zoom-in duration-300" />
                    )
                )}
                <span className="sr-only">Notifications</span>
            </Link>
        </Button>
    )
}
