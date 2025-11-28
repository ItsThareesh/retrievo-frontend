import { MOCK_ITEMS, MOCK_USER } from '@/lib/mock-data';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import ClientMatchPage from '@/components/matchpage-client';

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session) {
        redirect(`/api/auth/signin?callbackUrl=/items/${id}/match`);
    }

    const lostItem = MOCK_ITEMS.find((i) => i.id == id);

    const userFoundItems = MOCK_ITEMS.filter(
        (item) => item.type === 'found' &&
            item.finderId === MOCK_USER.id &&
            item.category === lostItem?.category
    );

    if (!lostItem) {
        notFound();
    }

    return (
        <ClientMatchPage
            lostItem={lostItem}
            userFoundItems={userFoundItems}
            itemId={id}
        />
    );
}