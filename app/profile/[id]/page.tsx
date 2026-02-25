import { auth } from '@/lib/auth';
import { getUserProfile } from '@/lib/api/profile';
import { formatDate } from '@/lib/date-formatting';
import { UserProfileClient } from './user-profile-client';
import { notFound } from 'next/navigation';

export default async function UserPage({ params }: { params: Promise<{ id: string; }> }) {
    const { id } = await params;

    const session = await auth();
    const segment = session?.user?.hostel === "boys" ? "boys" : session?.user?.hostel === "girls" ? "girls" : "public";

    // Fetch profile data server-side with caching (120s TTL, tagged per profile).
    // Segment-based visibility filtering matches the /items pattern.
    const result = await getUserProfile(id, segment);

    if (!result.ok || !result.data?.user) {
        return notFound();
    }

    const { user, lost_items, found_items } = result.data;

    return (
        <UserProfileClient
            user={user}
            lostItems={lost_items.map(formatDate)}
            foundItems={found_items.map(formatDate)}
        />
    );
}