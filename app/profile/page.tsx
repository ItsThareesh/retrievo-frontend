import { MOCK_ITEMS } from '@/lib/mock-data';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ProfileClient } from '@/components/profile-client';

export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect('/api/auth/signin?callbackUrl=/profile')
    }

    const userItems = MOCK_ITEMS.filter(
        (item) => item.ownerId === session.user.id || item.finderId === session.user.id
    );

    const lostItems = userItems.filter((item) => item.type === 'lost');
    const foundItems = userItems.filter((item) => item.type === 'found');

    return (
        <ProfileClient
            session={session}
            userItems={userItems}
            lostItems={lostItems}
            foundItems={foundItems}
        />
    );
}