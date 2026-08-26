import { clientMutate } from "@/lib/client-fetch";

export function readNotification(notificationId: string, token?: string) {
    return clientMutate(`/notifications/${notificationId}/mark-read`, token, { method: "POST" });
}

export function readAllNotifications(token?: string) {
    return clientMutate(`/notifications/mark-all-read`, token, { method: "POST" });
}
