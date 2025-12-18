import { auth } from '@/auth';
import { ProfileClient } from '@/app/profile/profile-client';
import { fetchAllUserItems, UnauthorizedError } from '@/lib/api';
import { Item } from '@/types/item';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { formatDate } from '@/lib/date-formatting';

export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect('/auth/signin?callbackUrl=/profile');
    }

    let foundItems: Item[] = [];
    let lostItems: Item[] = [];

    try {
        // Returns all items for a user in a single array
        const res = await fetchAllUserItems(session.backendToken);

        lostItems = res.data.lost_items.map(formatDate);
        foundItems = res.data.found_items.map(formatDate);
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            redirect('/auth/signin?callbackUrl=/profile');
        }

        throw err;
    }

    return (
        <SessionProvider>
            <ProfileClient
                session={session}
                lostItems={lostItems}
                foundItems={foundItems}
            />
        </SessionProvider>
    );
}