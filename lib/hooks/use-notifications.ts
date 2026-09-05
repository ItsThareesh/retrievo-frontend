"use client";

import useSWR, { mutate } from "swr";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Notification } from "@/types/notification";
import {
    getNotifications,
    getNotificationCount,
    readNotification,
    readAllNotifications,
} from "@/lib/api/notifications";
import { handleBanError } from "@/lib/ban-handler";

interface NotificationsResponse {
    notifications: Notification[];
    last_updated_at: string;
}

interface CountResponse {
    count: number;
    last_updated_at: string;
}

const NOTIFICATIONS_KEY = "notifications/all";
const COUNT_KEY = "notifications/count";
const STORAGE_KEY = "notifications_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FRESH_WINDOW = 60 * 1000; // 1 minute - skip refetch when cache is this fresh

// SWR keys in this app are arrays ([KEY, token]), so a bare string never
// matches. Match on the stable prefix instead.
function matchKey(prefix: string) {
    return (key: unknown) => Array.isArray(key) && key[0] === prefix;
}

interface StoredData {
    data: NotificationsResponse;
    timestamp: number;
    last_updated_at: string;
}

function getStoredNotifications(): StoredData | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored) as StoredData;
        
        if (Date.now() - parsed.timestamp > CACHE_DURATION) {
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }
        
        return parsed;
    } catch {
        return null;
    }
}

function setStoredNotifications(
    data: NotificationsResponse,
    lastUpdatedAt: string
): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ data, timestamp: Date.now(), last_updated_at: lastUpdatedAt })
        );
    } catch {
        // Storage full or unavailable - ignore
    }
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
        last_updated_at: current?.last_updated_at ?? new Date().toISOString(),
    };
}

export function useNotifications() {
    const { data: session } = useSession();
    const token = session?.backendToken;

    const [storedData, setStoredData] = useState<StoredData | null>(null);

    const swrKey = token ? [NOTIFICATIONS_KEY, token] : null;

    const {
        data: notificationsData,
        isLoading,
        error: notificationsError,
        mutate: mutateNotifications,
    } = useSWR<NotificationsResponse>(
        swrKey,
        ([, t]) => getNotifications(t),
        {
            fallbackData: undefined,
            revalidateOnMount: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 300_000, // 5 minutes
            onSuccess: (data) => {
                setStoredNotifications(data, data.last_updated_at);
            },
        }
    );

    const countKey = token ? [COUNT_KEY, token] : null;

    const { data: countData } = useSWR<CountResponse>(
        countKey,
        ([, t]) => getNotificationCount(t),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 10_000, // 10 seconds
            refreshInterval: 120_000, // 2 minutes - lightweight Redis-backed poll
        }
    );

    // Hydrate the session cache before paint so a warm cache never flashes
    // the skeleton. Runs before paint (no visual flash) but after hydration,
    // so the first client render still matches the server output.
    useLayoutEffect(() => {
        const cached = getStoredNotifications();
        if (cached) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStoredData(cached);
            mutateNotifications(cached.data, false);
        }
    }, [mutateNotifications]);

    const cachedNotifications = notificationsData ?? storedData?.data;
    const notifications = cachedNotifications?.notifications ?? [];
    const cachedLastUpdated = storedData?.last_updated_at ?? null;

    // Detect changes: compare count's last_updated_at with cached last_updated_at.
    // If there is no cached last_updated_at yet, treat a non-zero count as stale
    // so we trigger the initial background fetch (e.g., right after signup).
    const hasNewNotifications =
        countData != null &&
        (cachedLastUpdated == null
            ? countData.count > 0
            : countData.last_updated_at != null &&
              countData.last_updated_at !== cachedLastUpdated);

    const backgroundRefreshRef = useRef(false);

    // Background refresh when new notifications detected or cache expired
    useEffect(() => {
        if (hasNewNotifications && !backgroundRefreshRef.current) {
            backgroundRefreshRef.current = true;
            mutateNotifications().finally(() => {
                backgroundRefreshRef.current = false;
            });
        }
    }, [hasNewNotifications, mutateNotifications]);

    const unreadCount = notifications.length > 0
        ? notifications.filter((n) => !n.is_read).length
        : countData?.count ?? 0;

    // Fetch the list unless the session cache was validated moments ago.
    // The count watcher covers staleness in between, so opening the page or
    // dropdown with a seconds-old cache is a free cache hit, not a fetch.
    // Errors are swallowed here — they are surfaced via the `isError` flag
    // returned from the hook so the caller can render an appropriate state.
    const loadNotifications = useCallback(async (): Promise<void> => {
        const cached = getStoredNotifications();
        if (cached && Date.now() - cached.timestamp < FRESH_WINDOW) return;
        try {
            await mutateNotifications();
        } catch (err) {
            handleBanError(err);
            // error is exposed via isError; do not let an unhandled rejection
            // propagate from a fire-and-forget call site in the dropdown
        }
        // Stable identity: callers use it as a useEffect dependency, and a
        // fresh identity every render would refetch in a loop.
    }, [mutateNotifications]);

    // Mark a single notification as read.
    //
    // Uses SWR's built-in optimistic pattern:
    // - optimisticData  — applied synchronously before the async fn runs.
    //                     Omitted when the list is not yet in cache to avoid
    //                     committing { notifications: [] } as ground truth.
    // - rollbackOnError — SWR reverts to the pre-mutation snapshot if the
    //                     async fn throws; no manual snapshot needed.
    // - revalidate:false — do NOT re-fetch after the async fn resolves;
    //                      the returned value IS the new cache state, and
    //                      re-fetching would be a wasted round trip.
    // - populateCache:true — use the async fn's return value to update
    //                        NOTIFICATIONS_KEY (default for async mutators;
    //                        stated explicitly for clarity).

    const markAsRead = async (id: string) => {
        try {
            const updated = await mutateNotifications(
                async (current) => {
                    await readNotification(id, token);
                    return applyUpdate(
                        current,
                        (n) => (n.id === id ? { ...n, is_read: true } : n)
                    );
                },
                {
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
            if (updated) setStoredNotifications(updated, updated.last_updated_at);
            await mutate(
                matchKey(COUNT_KEY),
                (current?: CountResponse) => {
                    if (!current || current.count <= 0) return current;
                    return {
                        ...current,
                        count: Math.max(0, current.count - 1),
                    };
                },
                false
            );
            return { ok: true };
        } catch (err) {
            handleBanError(err);
            return { ok: false };
        }
    };

    const markAllAsRead = async () => {
        try {
            const updated = await mutateNotifications(
                async (current) => {
                    await readAllNotifications(token);
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
            if (updated) setStoredNotifications(updated, updated.last_updated_at);
            await mutate(
                matchKey(COUNT_KEY),
                (current?: CountResponse) => {
                    if (!current) return current;
                    return {
                        ...current,
                        count: 0,
                    };
                },
                false
            );
            return { ok: true };
        } catch (err) {
            handleBanError(err);
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
// Clears sessionStorage and revalidates both keys.
export function refreshNotifications() {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY);
    }
    mutate(matchKey(NOTIFICATIONS_KEY));
    mutate(matchKey(COUNT_KEY));
}
