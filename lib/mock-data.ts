export type ItemType = 'lost' | 'found';

export interface Item {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    type: ItemType;
    image: string;
    status: 'open' | 'claimed' | 'resolved';
    finderId?: string;
    ownerId?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export const MOCK_ITEMS: Item[] = [
    {
        id: '1',
        title: 'Blue Backpack',
        description: 'Lost my blue Jansport backpack near the library. It has a laptop inside.',
        category: 'Bags',
        date: '2023-10-25',
        location: 'Central Library',
        type: 'lost',
        image: 'https://placehold.co/600x400/2563eb/ffffff?text=Blue+Backpack',
        status: 'open',
        ownerId: 'user1',
    },
    {
        id: '2',
        title: 'iPhone 13 Pro',
        description: 'Found a black iPhone 13 Pro on a bench in the park.',
        category: 'Electronics',
        date: '2023-10-26',
        location: 'City Park',
        type: 'found',
        image: 'https://placehold.co/600x400/000000/ffffff?text=iPhone+13',
        status: 'open',
        finderId: 'user2',
    },
    {
        id: '3',
        title: 'Golden Retriever',
        description: 'Found a friendly dog wandering near the grocery store. Has a collar but no tag.',
        category: 'Pets',
        date: '2023-10-27',
        location: 'Main St. Grocery',
        type: 'found',
        image: 'https://placehold.co/600x400/d97706/ffffff?text=Dog',
        status: 'open',
        finderId: 'user1',
    },
    {
        id: '4',
        title: 'Car Keys',
        description: 'Lost a set of keys with a Toyota fob.',
        category: 'Keys',
        date: '2023-10-24',
        location: 'Parking Lot B',
        type: 'lost',
        image: 'https://placehold.co/600x400/4b5563/ffffff?text=Keys',
        status: 'resolved',
        ownerId: 'user1',
    },
];

export const MOCK_USER: User = {
    id: 'user1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://placehold.co/100x100/2563eb/ffffff?text=AJ',
};
