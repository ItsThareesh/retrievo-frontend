export interface Item {
    id: string;
    created_at: string;
    user_id: string;
    reporter_public_id: string;
    reporter_name: string;
    reporter_picture: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    image: string;
    type: 'lost' | 'found';
    // status: 'open' | 'claimed' | 'resolved';
}
