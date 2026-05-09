export type NotificationIconType = 'success' | 'error' | 'info' | 'warning';

export type NotificationType = 'user' | 'item' | 'resolution' | 'system' | 'potential_match';

export interface Notification {
    id: string;
    created_at: string;
    icon: NotificationIconType;
    type: NotificationType;
    title: string;
    message: string;
    item_id?: string;
    resolution_id?: string;
    is_read: boolean;
}
