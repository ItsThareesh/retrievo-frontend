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
}
