"use client";

import useSWR, { mutate } from "swr";
import { Notification } from "@/types/notification";
import {
    getNotifications,
    getNotificationsCount,
    readNotification,
    readAllNotifications,
} from "@/lib/api/authenticated-api";

interface NotificationsResponse {
    notifications: Notification[];
}

interface CountResponse {
    count: number;
}

const NOTIFICATIONS_KEY = "notifications/all";
const COUNT_KEY = "notifications/count";

// Fetch full notifications list
async function notificationsFetcher(): Promise<NotificationsResponse> {
    const res = await getNotifications();
    return res.data;
}

// Fetch unread count only (lightweight endpoint)
async function countFetcher(): Promise<CountResponse> {
    const res = await getNotificationsCount();
    return res.data;
}

export function useNotifications() {
    // Always keep unread count reasonably fresh
    // This drives badges and urgency in the UI
    const { data: countData, mutate: mutateCount } = useSWR<CountResponse>(
        COUNT_KEY,
        countFetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    // Cache full notifications list
    // Not time-critical, so we avoid aggressive revalidation
    const {
        data: notificationsData,
        isLoading,
        mutate: mutateNotifications,
    } = useSWR<NotificationsResponse>(
        NOTIFICATIONS_KEY,
        notificationsFetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 300_000, // cache for 5 minutes
            keepPreviousData: true,
        }
    );

    // Normalized notifications list
    const notifications = notificationsData?.notifications ?? [];

    // Prefer computing unread count from full data if available
    // Fallback to lightweight count endpoint otherwise
    const unreadCount = notificationsData
        ? notifications.filter((n) => !n.is_read).length
        : countData?.count ?? 0;

    // Explicit refresh when user opens notifications panel
    // Uses cached data first, then revalidates if needed
    const loadNotifications = async () => {
        const data = await mutateNotifications();
        if (data) {
            mutateCount(
                {
                    count: data.notifications.filter((n) => !n.is_read).length,
                },
                false
            );
        }
    };

    // Mark a single notification as read
    // Optimistic update first, server update second
    const markAsRead = async (id: string) => {
        const prevNotifications = notificationsData
            ? { notifications: [...notificationsData.notifications] }
            : undefined;

        const prevCount = countData ? { ...countData } : undefined;

        // Optimistic update
        mutateNotifications(
            (current) => ({
                notifications:
                    current?.notifications.map((n) =>
                        n.id === id ? { ...n, is_read: true } : n
                    ) ?? [],
            }),
            false
        );

        mutateCount(
            (current) => ({
                count: Math.max(0, (current?.count ?? 0) - 1),
            }),
            false
        );

        const res = await readNotification(id);

        if (!res.ok) {
            // rollback
            mutateNotifications(prevNotifications, false);
            mutateCount(prevCount, false);
        }

        return res;
    };

    // Mark all notifications as read
    // Snapshot state for rollback in case server call fails
    const markAllAsRead = async () => {
        const previousNotifications = notificationsData;
        const previousCount = countData;

        mutateNotifications(
            (current) => ({
                notifications:
                    current?.notifications.map((n) => ({
                        ...n,
                        is_read: true,
                    })) ?? [],
            }),
            false
        );

        mutateCount({ count: 0 }, false);

        const res = await readAllNotifications();

        // Roll back optimistic updates if server fails
        if (!res.ok) {
            mutateNotifications(previousNotifications, false);
            mutateCount(previousCount, false);
        }

        return res;
    };

    // Force refresh from anywhere
    // Count stays authoritative, full list is soft-refreshed
    const refresh = () => {
        mutateCount();
        mutateNotifications();
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        refresh,
    };
}

// Global trigger for refresh (e.g., after WebSocket / SSE / background action)
export function refreshNotifications() {
    mutate(COUNT_KEY);
    mutate(NOTIFICATIONS_KEY);
}