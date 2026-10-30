import { LocationKey } from "@/lib/constants/locations";

export type ResolutionStatus = 'pending' | 'return_initiated' | 'approved' | 'rejected' | 'completed' | 'failed' | 'invalidated' | 'pending_admin_review' | 'expired';

export type ResolutionType = 'owner_initiated' | 'finder_initiated';

export interface Resolution {
    id: string;
    type: ResolutionType;
    lost_item_id?: string;
    found_item_id?: string;
    created_by: string;
    status: ResolutionStatus;
    description?: string;
    rejection_reason?: string;
    created_at: string;
    decided_at: string;
    /** CDN URL of the claimant's evidence photo (absent when none attached) */
    claim_photo?: string | null;
    claim_photo_uploaded_at?: string | null;
    /** Claimant content edits used so far (description + photo, budget = MAX_CLAIM_EDITS = 5) */
    content_edit_count?: number;
}

/** Budget synced with backend `settings.MAX_CLAIM_EDITS` */
export const MAX_CLAIM_EDITS = 5;

export interface FinderContact {
    name: string;
    email: string;
    phone?: string | null;
    instagramId?: string | null;
}

export type ViewerRole = 'admin' | 'finder' | 'owner';

export interface Viewer {
    role: ViewerRole;
}

export type AllowedAction = 'approve' | 'reject' | 'complete' | 'fail';

export interface LinkedItem {
    id: string;
    title: string;
    category: string;
    location: LocationKey;
    date?: string;
    image?: string | null;
    type: 'lost' | 'found';
    hidden?: boolean;
    hidden_reason?: string;
    deleted?: boolean;
}

export interface LinkableItem {
    id: string;
    title: string;
    date?: string;
    location: LocationKey;
    image?: string | null;
}
