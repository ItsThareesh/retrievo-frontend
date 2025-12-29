"use client"

import useSWR, { mutate } from 'swr';
import { Notification } from '@/types/notification';
import { getNotifications, getNotificationsCount, readNotification, readAllNotifications } from '@/lib/api/client';

interface NotificationsResponse {
    notifications: Notification[];
}

interface CountResponse {
    count: number;
}

const NOTIFICATIONS_KEY = 'notifications/all';
const COUNT_KEY = 'notifications/count';

async function notificationsFetcher(): Promise<NotificationsResponse> {
    const res = await getNotifications();
    return res.data;
}

async function countFetcher(): Promise<CountResponse> {
    const res = await getNotificationsCount();
    return res.data;
}

export function useNotifications() {
    // Always fetch count (lightweight)
    const { data: countData, mutate: mutateCount } = useSWR<CountResponse>(
        COUNT_KEY,
        countFetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    // Lazy-load full notifications (only fetched when explicitly called)
    const { data: notificationsData, isLoading, mutate: mutateNotifications } = useSWR<NotificationsResponse>(
        NOTIFICATIONS_KEY,
        null, // Don't fetch automatically - use manual trigger
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false, // Don't auto-fetch on reconnect
            dedupingInterval: 5000,
        }
    );

    const notifications = notificationsData?.notifications ?? [];

    // Use count from full data if available, otherwise use lightweight count
    const unreadCount = notificationsData
        ? notifications.filter(n => !n.is_read).length
        : (countData?.count ?? 0);

    const loadNotifications = async () => {
        // Trigger fetch of full notifications
        const data = await mutateNotifications(notificationsFetcher());

        // Update count based on actual data
        if (data) {
            const actualCount = data.notifications.filter(n => !n.is_read).length;
            mutateCount({ count: actualCount }, false);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistically update notifications
        mutateNotifications(
            (current) => ({
                notifications: current?.notifications.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                ) ?? [],
            }),
            false
        );

        // Optimistically update count
        mutateCount(
            (current) => ({
                count: Math.max(0, (current?.count ?? 0) - 1)
            }),
            false
        );

        // Update on server
        await readNotification(id);
    };

    const markAllAsRead = async () => {
        const previousNotifications = notificationsData;
        const previousCount = countData;

        // Optimistically update notifications
        mutateNotifications(
            (current) => ({
                notifications: current?.notifications.map((n) => ({ ...n, is_read: true })) ?? [],
            }),
            false
        );

        // Optimistically update count
        mutateCount({ count: 0 }, false);

        // Update on server
        const res = await readAllNotifications();

        if (!res.ok) {
            // Revert on error
            mutateNotifications(previousNotifications, false);
            mutateCount(previousCount, false);
        }

        return res;
    };

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

// Global function to trigger refresh from anywhere
export function refreshNotifications() {
    mutate(COUNT_KEY);
    mutate(NOTIFICATIONS_KEY);
}
