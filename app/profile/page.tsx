import { auth } from '@/lib/auth';
import { ProfileClient } from '@/app/profile/profile-client';
import { redirect } from 'next/navigation';
import { needsOnboarding } from '@/lib/utils/needsOnboarding';
import { getUserItems } from '@/lib/api/profile';
import { standardizeItemDate } from '@/lib/date-formatting';

export default async function ProfilePage() {
    const session = await auth();

    const isAuthenticated =
        !!session?.user && Date.now() < (session?.expires_at ?? 0);

    // Check authentication
    if (!isAuthenticated) {
        redirect('/auth/signin?callbackUrl=/profile');
    }

    // Check if user needs onboarding
    if (needsOnboarding(session)) {
        redirect('/onboarding');
    }

    // Fetch user items server-side — no caching (user-specific authenticated data)
    const result = await getUserItems();
    const items = result.ok && result.data ? result.data : { lost_items: [], found_items: [] };

    return (
        <ProfileClient
            user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
            }}
            lostItems={items.lost_items.map(standardizeItemDate)}
            foundItems={items.found_items.map(standardizeItemDate)}
        />
    );
}