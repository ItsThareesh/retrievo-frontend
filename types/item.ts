import { LOCATION_MAP, LocationKey } from "@/lib/constants/locations";

export interface Item {
    id: string;
    created_at: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: LocationKey;
    image: string | null;
    type: 'lost' | 'found';
    visibility: 'public' | 'girls' | 'boys';
}
