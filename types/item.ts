import { LocationKey } from "@/lib/constants/locations";

export type item_type = 'lost' | 'found';
export type item_visibility = 'public' | 'boys' | 'girls';

export interface Item {
    id: string;
    created_at: string;
    poster_id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: LocationKey;
    image: string | null;
    type: item_type;
    visibility: item_visibility;
    hidden?: boolean;
    hidden_reason?: string;
    deleted?: boolean;
    /** Set when a security officer holds the item (custody_transferred_at stamped) */
    held_at_security_office?: boolean;
}

/** One entry of GET /items/{id}/matches — the counterpart item + when it matched. */
export interface PotentialMatchEntry {
    item: Pick<Item, "id" | "title" | "image" | "type" | "location" | "category" | "date" | "created_at">;
    matched_at: string;
}
