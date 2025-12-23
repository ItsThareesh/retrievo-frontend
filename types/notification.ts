export type NotificationType = 'claim_created' | 'claim_approved' | 'claim_rejected' | 'system_notice' | 'ban_warning';

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
