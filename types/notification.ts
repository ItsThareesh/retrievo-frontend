export type NotificationType = 'resolution_created' | 'return_initiated' | 'resolution_completed' |
    'resolution_approved' | 'resolution_rejected' | 'resolution_invalidated' | 'system_notice' | 'warning_issued';

export interface Notification {
    id: string;
    created_at: string;
    type: NotificationType;
    title: string;
    message: string;
    item_id?: string;
    resolution_id?: string;
    is_read: boolean;
}
