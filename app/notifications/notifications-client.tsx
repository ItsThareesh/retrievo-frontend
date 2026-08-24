"use client"

import { useEffect } from "react"
import { Check, Info, X, CheckCheck, Inbox, AlertOctagon, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Notification, NotificationIconType } from "@/types/notification"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/lib/hooks/use-notifications"

const ICON_CONFIG: Record<
    NotificationIconType,
    { Icon: typeof Check; bg: string }
> = {
    success: {
        Icon: Check,
        bg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    error: {
        Icon: X,
        bg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
    warning: {
        Icon: AlertOctagon,
        bg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    info: {
        Icon: Info,
        bg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
}

function NotificationIcon({ icon }: { icon: NotificationIconType }) {
    const { Icon, bg } = ICON_CONFIG[icon]
    return (
        <div className={cn("mt-0.5 shrink-0 flex h-10 w-10 items-center justify-center rounded-xl", bg)}>
            <Icon className="h-5 w-5" />
        </div>
    )
}

function RelativeTime({ updatedAt }: { updatedAt: string }) {
    return (
        <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </span>
    )
}

function NotificationCard({
    notification,
    onClick,
}: {
    notification: Notification
    onClick: (notification: Notification) => void
}) {
    return (
        <Card className="border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <button
                type="button"
                onClick={() => onClick(notification)}
                className={cn(
                    "w-full flex items-start gap-4 p-4 text-left cursor-pointer transition-colors",
                    !notification.is_read
                        ? "bg-primary/[0.03] hover:bg-primary/[0.06]"
                        : "hover:bg-muted/40"
                )}
            >
                <NotificationIcon icon={notification.icon} />
                <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                        <p
                            className={cn(
                                "text-sm font-semibold leading-none truncate",
                                !notification.is_read ? "text-foreground" : "text-foreground/70"
                            )}
                        >
                            {notification.title}
                        </p>
                        <RelativeTime updatedAt={notification.updated_at} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                    </p>
                </div>
                {!notification.is_read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary block ring-2 ring-background shrink-0" />
                )}
            </button>
        </Card>
    )
}

function NotificationSkeleton() {
    return (
        <Card className="border-border/60 shadow-sm p-4">
            <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
            </div>
        </Card>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border rounded-lg bg-muted/10 border-dashed border-muted-foreground/20">
            <div className="bg-muted/30 p-4 rounded-full mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{message}</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
                When you receive updates about your items and claims, they&apos;ll show up here.
            </p>
        </div>
    )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border rounded-lg bg-muted/10 border-dashed border-muted-foreground/20">
            <div className="bg-destructive/10 p-4 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive/70" />
            </div>
            <h3 className="text-lg font-semibold">Could not load notifications</h3>
            <Button variant="link" onClick={onRetry} className="mt-2">
                Try again
            </Button>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <NotificationSkeleton key={i} />
            ))}
        </div>
    )
}

export function NotificationsClient() {
    const router = useRouter()

    const {
        notifications,
        unreadCount,
        isLoading,
        isError,
        loadNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications()

    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])

    const handleMarkAllAsRead = async () => {
        const res = await markAllAsRead()

        if (res.ok) {
            toast.success("All notifications marked as read")
        } else {
            toast.error("Failed to mark notifications as read. Please try again.")
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id)
        }

        if (notification.type === 'potential_match' && notification.item_id !== undefined) {
            router.push('/items/' + notification.item_id)
        } else if (notification.type === "resolution" && notification.resolution_id !== undefined) {
            router.push('/resolution/' + notification.resolution_id)
        } else if (notification.type === 'item' && notification.item_id !== undefined) {
            router.push('/items/' + notification.item_id)
        }
    }

    const unread = notifications.filter((n) => !n.is_read)

    const tabTriggerClass =
        "flex-1 data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-98 cursor-pointer transition-all duration-200"

    const renderList = (items: Notification[], isUnreadView: boolean) => {
        if (isLoading) return <LoadingState />
        if (isError) return <ErrorState onRetry={loadNotifications} />
        if (items.length === 0) {
            return <EmptyState message={isUnreadView ? "No unread notifications" : "No notifications yet"} />
        }
        return (
            <div className="space-y-3">
                {items.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} onClick={handleNotificationClick} />
                ))}
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 md:px-10 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground mt-1">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                                : "You're all caught up"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="gap-1.5 shrink-0 border-border/60 bg-background/40 hover:bg-muted/50 hover:text-foreground cursor-pointer"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="flex w-full max-w-md mx-auto mb-8">
                    <TabsTrigger value="all" className={tabTriggerClass}>
                        All
                    </TabsTrigger>
                    <TabsTrigger value="unread" className={tabTriggerClass}>
                        Unread
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 min-w-5 text-[10px] font-normal">
                                {unreadCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0 space-y-6">
                    {renderList(notifications, false)}
                </TabsContent>

                <TabsContent value="unread" className="mt-0 space-y-6">
                    {renderList(unread, true)}
                </TabsContent>
            </Tabs>

            <p className="text-center text-xs text-muted-foreground mt-8">
                Notifications are automatically deleted after 14 days.
            </p>
        </div>
    )
}
