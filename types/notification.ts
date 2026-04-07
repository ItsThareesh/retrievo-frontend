export type NotificationIconType = 'resolution_created' | 'return_initiated' | 'resolution_completed' |
    'resolution_approved' | 'resolution_rejected' | 'resolution_invalidated' | 'system_notice' | 'warning_issued' | 'potential_match';

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
