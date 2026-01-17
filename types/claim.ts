import { Item } from "./item";

export type ResolutionStatus = 'pending' | 'return_initiated' | 'approved' | 'rejected' | 'completed' | 'invalidated';

export interface Resolution {
    id: string;
    item_id: string;
    claimant_id: string;
    status: ResolutionStatus;
    description: string;
    rejection_reason?: string;
    created_at: string;
    decided_at: string;
    item?: Item;
}

export interface FinderContact {
    name: string;
    email: string;
    phone?: string | null;
}
