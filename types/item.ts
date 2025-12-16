export interface Item {
    id: string;
    created_at: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    image: string;
    type: 'lost' | 'found';
    visibility: 'public' | 'girls' | 'boys';
    // status: 'open' | 'claimed' | 'resolved';
}
