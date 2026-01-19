export type ResolutionStatus = 'pending' | 'return_initiated' | 'approved' | 'rejected' | 'completed' | 'invalidated';

export interface Resolution {
    id: string;
    item_id: string;
    created_by: string;
    status: ResolutionStatus;
    description: string;
    rejection_reason?: string;
    created_at: string;
    decided_at: string;
}

export interface FinderContact {
    name: string;
    email: string;
    phone?: string | null;
}

export type ViewerRole = 'admin' | 'finder' | 'owner';

export interface Viewer {
    role: ViewerRole;
}

export type AllowedAction = 'approve' | 'reject' | 'complete' | 'invalidate';
