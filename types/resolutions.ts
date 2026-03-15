export type ResolutionStatus = 'pending' | 'return_initiated' | 'approved' | 'rejected' | 'completed' | 'invalidated';

export type ResolutionType = 'owner-initiated' | 'finder-initiated';

export interface Resolution {
    id: string;
    anchor_item_type: 'lost' | 'found';
    lost_item_id?: string;
    found_item_id?: string;
    created_by: string;
    status: ResolutionStatus;
    description?: string;
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

export interface LinkedItem {
    id: string;
    title: string;
    category: string;
    location: string;
    date?: string;
    image?: string | null;
    type: 'lost' | 'found';
}

export interface LinkableItem {
    id: string;
    title: string;
    date?: string;
    location: string;
    image?: string | null;
}
