import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchFoundUserItems, UnauthorizedError } from '@/lib/api';
import ClientMatchPage from './matchpage-client';
import { Item } from '@/types/item';

export default async function MatchPage({ params }: { params: Promise<{ id: string, category: string }> }) {
    const { id, category } = await params;
    const session = await auth();

    if (!session) {
        redirect(`/auth/signin?callbackUrl=/items/match/${category}`);
    }

    let userFoundItems: Item[] = [];

    try {
        const res = await fetchFoundUserItems(category, session.backendToken);
        userFoundItems = res.items ?? [];
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            redirect(`/auth/signin?callbackUrl=/items/match/${category}`);
        }

        throw err;
    }

    return (
        <ClientMatchPage
            userFoundItems={userFoundItems}
            itemId={id}
        />
    );
}