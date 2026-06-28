"use server";

import { authFetch, APIError } from "./helpers";

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
        if (err instanceof APIError) throw err;

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
        if (err instanceof APIError) throw err;

        console.error("readAllNotifications error:", err);
        return { ok: false, error: String(err) };
    }
}