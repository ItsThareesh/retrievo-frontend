import { clientFetch, clientMutate } from "@/lib/client-fetch";

/** GET: All notifications for the current user */
export function getNotifications(token?: string) {
    return clientFetch('/notifications/all', token);
}

/** GET: Unread notification count */
export function getNotificationCount(token?: string) {
    return clientFetch('/notifications/count', token);
}

/** POST: Mark a single notification as read */
export function readNotification(notificationId: string, token?: string) {
    return clientMutate(`/notifications/${notificationId}/mark-read`, token, { method: "POST" });
}

/** POST: Mark all notifications as read */
export function readAllNotifications(token?: string) {
    return clientMutate(`/notifications/mark-all-read`, token, { method: "POST" });
}
