import { Item } from "./item";
import { User } from "./user";

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Claim {
    id: string;
    item_id: string;
    claimant_id: string;
    status: ClaimStatus;
    claim_description: string;
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
