import { auth } from '@/auth';
import { ProfileClient } from '@/app/profile/profile-client';
import { SessionProvider } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { needsOnboarding } from '@/lib/utils/needsOnboarding';

export default async function ProfilePage() {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
        redirect('/auth/signin?callbackUrl=/profile');
    }

    // Check if user needs onboarding
    if (needsOnboarding(session)) {
        redirect('/onboarding');
    }

    return (
        <SessionProvider>
            <ProfileClient />
        </SessionProvider>
    );
}