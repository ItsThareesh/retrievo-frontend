export interface OverviewStats {
    total_items: number;
    items_this_month: number;
    items_last_month: number;

    claims_approved_this_month: number;
    claims_approved_last_month: number;
    claims_rejected_this_month: number;
    claims_rejected_last_month: number;
    claims_pending: number;

    active_reports: number;
    reports_this_month: number;
    reports_last_month: number;

    total_users: number;
    users_this_month: number;
    users_last_month: number;
}

export interface ActivityItem {
    id: string;
    type: "claim_approved" | "claim_rejected" | "claim_pending" | "report_filed" | "item_auto_hidden";
    description: string;
    timestamp: string;
    metadata: Record<string, any>;
}

export interface ClaimDetail {
    id: string;
    item_id: string;
    item_title: string;
    item_owner_name: string;
    item_owner_id: string;
    claimer_name: string;
    claimer_id: string;
    claimer_email: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    claim_description: string;
    decided_at: string | null;
}

export interface UserDetail {
    id: number;
    public_id: string;
    name: string;
    email: string;
    image: string;
    created_at: string;
    warning_count: number;
    is_banned: boolean;
    ban_reason: string | null;
    ban_until: string | null;
    items_posted: number;
    reports_received: number;
}

export interface ReportedItemDetail {
    item_id: string;
    item_title: string;
    item_type: "lost" | "found";
    item_owner_name: string;
    item_owner_id: string;
    report_count: number;
    is_hidden: boolean;
    hidden_reason: string | null;
    created_at: string;
    reports: ReportDetail[];
}

export interface ReportDetail {
    id: number;
    reporter_name: string;
    reason: string;
    created_at: string;
    status: string;
}

export interface InsightData {
    most_reported_items: Array<{
        item_id: string;
        title: string;
        report_count: number;
    }>;
    most_reported_users: Array<{
        user_id: string;
        name: string;
        report_count: number;
    }>;
    claim_success_rate: number;
    avg_claim_resolution_time_hours: number | null;
    items_by_category: Array<{
        category: string;
        count: number;
    }>;
    claims_by_status: Record<string, number>;
}

export interface ModerateUserRequest {
    action: "warn" | "temp_ban" | "perm_ban" | "unban";
    reason?: string;
    ban_days?: number;
}

export interface ModerateItemRequest {
    action: "hide" | "restore" | "delete";
    reason?: string;
}
