"use client"

import { useState } from "react"
import { Bell, Check, Info, X, CheckCheck, Inbox, Loader2, AlertOctagon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Notification, NotificationType } from "@/types/notification"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/lib/hooks/use-notifications"

export function NotificationsDropdown() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const {
        notifications,
        unreadCount,
        isLoading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Load full notifications when dropdown opens
            loadNotifications();
        }
    };

    const handleMarkAllAsRead = async () => {
        const res = await markAllAsRead();

        if (res.ok) {
            toast.success("All notifications marked as read");
            setIsOpen(false);
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "claim_approved":
                return <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30"><Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /></div>
            case "claim_rejected":
                return <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30"><X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" /></div>
            case "warning_issued":
                return <div className="rounded-full bg-orange-200 p-1.5 dark:bg-orange-900/40">
                    <AlertOctagon className="h-3.5 w-3.5 text-orange-700 dark:text-orange-300" />
                </div>
            case "claim_created":
            case "system_notice":
            default:
                return <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/30"><Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /></div>
        }
    }

    const NotificationItem = ({ notification }: { notification: Notification }) => (
        <DropdownMenuItem
            className={cn(
                "flex items-start gap-3 p-3 cursor-pointer focus:bg-muted/50 rounded-lg my-1 transition-colors",
                !notification.is_read && "bg-muted/30"
            )}
            onClick={() => {
                if (!notification.is_read) {
                    markAsRead(notification.id);
                }

                // Route based on notification type
                if (notification.type === "claim_created") {
                    // Finder reviewing claim - go to item review page
                    router.push(`/items/${notification.item_id}/review-claim`)
                } else if (notification.type === "claim_approved" || notification.type === "claim_rejected") {
                    // Claimant viewing status - go to claim status page
                    router.push(`/claims/${notification.resolution_id}`)
                } else if (notification.item_id) {
                    // Default: go to item page
                    router.push(`/items/${notification.item_id}`)
                }
            }}
        >
            <div className="mt-0.5 shrink-0">
                {getIcon(notification.type)}
            </div>
            <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p
                        className={cn(
                            "text-sm font-medium leading-none truncate",
                            !notification.is_read && "text-foreground"
                        )}
                    >
                        {notification.title}
                    </p>

                    <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notification.message}
                </p>
            </div>
            {!notification.is_read && (
                <div className="shrink-0 self-center">
                    <span className="h-2 w-2 rounded-full bg-primary block ring-2 ring-background" />
                </div>
            )}
        </DropdownMenuItem>
    )

    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
            <div className="bg-muted/50 p-3 rounded-full">
                <Inbox className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
                {message}
            </p>
        </div>
    )

    const LoadingState = () => (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Loading notifications...</p>
        </div>
    )

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-muted/60 transition-colors"
                >
                    <Bell className="h-5 w-5 text-muted-foreground" />

                    {unreadCount > 0 && (
                        unreadCount < 10 ? (
                            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center ring-2 ring-background animate-in zoom-in duration-300">
                                {unreadCount}
                            </span>
                        ) : (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-in zoom-in duration-300" />
                        )
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-[380px] p-0 overflow-hidden shadow-lg border-border/60">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
                    <h2 className="font-semibold text-sm">Notifications</h2>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-muted-foreground hover:text-primary hover:bg-transparent gap-1.5"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <div className="px-4 pt-2">
                        <TabsList className="w-full grid grid-cols-2 h-9">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs">
                                Unread
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 min-w-[1.25rem] text-[10px] font-normal">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="mt-0">
                        <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto px-2 py-1 custom-scrollbar">
                            {isLoading ? (
                                <LoadingState />
                            ) : notifications.length === 0 ? (
                                <EmptyState message="No notifications yet" />
                            ) : (
                                notifications.map((notification) => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="unread" className="mt-0">
                        <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto px-2 py-1 custom-scrollbar">
                            {isLoading ? (
                                <LoadingState />
                            ) : notifications.filter((n) => !n.is_read).length === 0 ? (
                                <EmptyState message="No unread notifications" />
                            ) : (
                                notifications
                                    .filter((n) => !n.is_read)
                                    .map((notification) => (
                                        <NotificationItem key={notification.id} notification={notification} />
                                    ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="p-2 border-t bg-muted/10 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-7 hover:bg-transparent" disabled>
                        Notifications are automatically deleted after 14 days
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
