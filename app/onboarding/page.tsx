import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import OnboardingClient from './onboarding-client';
import { SessionProvider } from 'next-auth/react';
import { needsOnboarding } from '@/lib/utils/needsOnboarding';

export default async function OnboardingPage() {
    const session = await auth();

    const isAuthenticated =
        !!session?.user && Date.now() < (session?.expires_at ?? 0);

    // Check authentication
    if (!isAuthenticated) {
        redirect('/auth/signin?callbackUrl=/onboarding');
    }

    if (!needsOnboarding(session)) {
        redirect('/profile');
    }

    return (
        <SessionProvider>
            <OnboardingClient />
        </SessionProvider>
    );
}
