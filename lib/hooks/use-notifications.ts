"use client";

import useSWR, { mutate } from "swr";
import { Notification } from "@/types/notification";
import {
    getNotifications,
    getNotificationsCount,
    readNotification,
    readAllNotifications,
} from "@/lib/api/notifications";

interface NotificationsResponse {
    notifications: Notification[];
}

interface CountResponse {
    count: number;
}

const NOTIFICATIONS_KEY = "notifications/all";
const COUNT_KEY = "notifications/count";

async function notificationsFetcher(): Promise<NotificationsResponse> {
    const res = await getNotifications();
    // Throw on failure so SWR sets error state, enables retry-on-failure,
    // and prevents stale empty-array data masking a real backend error.
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.data;
}

async function countFetcher(): Promise<CountResponse> {
    const res = await getNotificationsCount();
    if (!res.ok) throw new Error("Failed to fetch notifications count");
    return res.data;
}

// Apply an update to the notifications list and derive the new payload.
// Centralises the shape of the single SWR cache entry so mutations
// never construct the object ad-hoc.
function applyUpdate(
    current: NotificationsResponse | undefined,
    updater: (n: Notification) => Notification
): NotificationsResponse {
    return {
        notifications: (current?.notifications ?? []).map(updater),
    };
}

export function useNotifications() {
    // Lightweight count endpoint — used only as the badge value before the
    // full list has been fetched for the first time.  All write operations
    // target NOTIFICATIONS_KEY exclusively, so this key is never touched
    // by mutations, eliminating the dual-key synchronisation race.
    const { data: countData } = useSWR<CountResponse>(
        COUNT_KEY,
        countFetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5_000,
        }
    );

    const {
        data: notificationsData,
        isLoading,
        error: notificationsError,
        mutate: mutateNotifications,
    } = useSWR<NotificationsResponse>(
        NOTIFICATIONS_KEY,
        notificationsFetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            // SWR is the sole caching layer; the server action no longer
            // uses next.revalidate so this interval is the only TTL.
            dedupingInterval: 300_000, // 5 minutes
            keepPreviousData: true,
        }
    );

    const notifications = notificationsData?.notifications ?? [];

    // Single source of truth.  Once the full list is in the SWR cache the
    // count is derived locally — no separate network call, no sync needed.
    // The count endpoint acts only as a lightweight bootstrap before the
    // first full fetch completes.
    const unreadCount = notificationsData
        ? notifications.filter((n) => !n.is_read).length
        : (countData?.count ?? 0);

    // Trigger a fresh fetch when the user opens the dropdown.  Because the
    // server action now uses cache:"no-store", this always returns live data.
    // Errors are swallowed here — they are surfaced via the `isError` flag
    // returned from the hook so the caller can render an appropriate state.
    const loadNotifications = async (): Promise<void> => {
        try {
            await mutateNotifications();
        } catch {
            // error is exposed via isError; do not let an unhandled rejection
            // propagate from a fire-and-forget call site in the dropdown
        }
    };

    // Mark a single notification as read.
    //
    // Uses SWR's built-in optimistic pattern:
    //   • optimisticData  — applied synchronously before the async fn runs.
    //                       Omitted when the list is not yet in cache to avoid
    //                       committing { notifications: [] } as ground truth.
    //   • rollbackOnError — SWR reverts to the pre-mutation snapshot if the
    //                       async fn throws; no manual snapshot needed.
    //   • revalidate:false — do NOT re-fetch after the async fn resolves;
    //                        the returned value IS the new cache state, and
    //                        re-fetching would be a wasted round trip.
    //   • populateCache:true — use the async fn's return value to update
    //                          NOTIFICATIONS_KEY (default for async mutators;
    //                          stated explicitly for clarity).
    //
    const markAsRead = async (id: string) => {
        try {
            await mutateNotifications(
                async (current) => {
                    const res = await readNotification(id);
                    if (!res.ok) {
                        throw new Error(
                            `markAsRead failed: ${(res as { status?: number }).status ?? "unknown"}`
                        );
                    }
                    return applyUpdate(
                        current,
                        (n) => (n.id === id ? { ...n, is_read: true } : n)
                    );
                },
                {
                    // Guard: if the full list is not yet cached, providing an
                    // optimistic payload of { notifications: [] } would be
                    // worse than showing no change — skip optimistic update.
                    ...(notificationsData && {
                        optimisticData: (current: NotificationsResponse | undefined) =>
                            applyUpdate(
                                current,
                                (n) => (n.id === id ? { ...n, is_read: true } : n)
                            ),
                    }),
                    rollbackOnError: true,
                    revalidate: false,
                    populateCache: true,
                }
            );
            return { ok: true };
        } catch {
            return { ok: false };
        }
    };

    // Mark all notifications as read.  Same atomic pattern as markAsRead.
    const markAllAsRead = async () => {
        try {
            await mutateNotifications(
                async (current) => {
                    const res = await readAllNotifications();
                    if (!res.ok) {
                        throw new Error(
                            `markAllAsRead failed: ${(res as { status?: number }).status ?? "unknown"}`
                        );
                    }
                    return applyUpdate(current, (n) => ({ ...n, is_read: true }));
                },
                {
                    ...(notificationsData && {
                        optimisticData: (current: NotificationsResponse | undefined) =>
                            applyUpdate(current, (n) => ({ ...n, is_read: true })),
                    }),
                    rollbackOnError: true,
                    revalidate: false,
                    populateCache: true,
                }
            );
            return { ok: true };
        } catch {
            return { ok: false };
        }
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        isError: !!notificationsError,
        loadNotifications,
        markAsRead,
        markAllAsRead,
    };
}

// Global trigger for out-of-hook refresh (WebSocket / SSE / background action).
// Always revalidates both keys so the badge stays correct even if the
// dropdown has never been opened.
export function refreshNotifications() {
    mutate(NOTIFICATIONS_KEY);
    mutate(COUNT_KEY);
}