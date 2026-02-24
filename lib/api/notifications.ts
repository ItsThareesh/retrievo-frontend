"use server";

import { authFetch, safeJson, UnauthorizedError } from "./helpers";

export async function getNotificationsCount() {
    try {
        const res = await authFetch('/notifications/count');

        if (!res.ok) {
            console.error("getNotificationsCount failed:", res.status);
            return {
                ok: false, data: { count: 0 }, status: res.status
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getNotificationsCount error:", err);
        return {
            ok: false, data: { count: 0 }, error: String(err)
        };
    }
}

export async function getNotifications() {
    try {
        const res = await authFetch(
            '/notifications/all',
            { next: { revalidate: 120 } } // Cache for 2 minutes
        );

        if (!res.ok) {
            console.error("getNotifications failed:", res.status);
            return {
                ok: false, data: { notifications: [] }, status: res.status
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getNotifications error:", err);
        return {
            ok: false, data: { notifications: [] }, error: String(err)
        };
    };
}

export async function readNotification(notificationId: string) {
    try {
        const res = await authFetch(`/notifications/${notificationId}/mark-read`, {
            method: "POST",
        });

        if (!res.ok) {
            console.error("readNotification failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("readNotification error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function readAllNotifications() {
    try {
        const res = await authFetch(`/notifications/mark-all-read`, {
            method: "POST",
        });

        if (!res.ok) {
            console.error("readAllNotifications failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("readAllNotifications error:", err);
        return { ok: false, error: String(err) };
    }
}