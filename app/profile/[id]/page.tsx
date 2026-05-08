import { getUserProfile } from '@/lib/api/profile';
import { standardizeItemDate } from '@/lib/date-formatting';
import { UserProfileClient } from './user-profile-client';
import { notFound } from 'next/navigation';

export default async function UserPage({ params }: { params: Promise<{ id: string; }> }) {
    const { id } = await params;

    // Fetch profile data server-side with backend-enforced visibility.
    const result = await getUserProfile(id);

    if (!result.ok || !result.data?.user) {
        return notFound();
    }

    const { user, lost_items, found_items } = result.data;

    return (
        <UserProfileClient
            user={user}
            lostItems={lost_items.map(standardizeItemDate)}
            foundItems={found_items.map(standardizeItemDate)}
        />
    );
}