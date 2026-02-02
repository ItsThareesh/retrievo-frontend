import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import OnboardingClient from './onboarding-client';
import { SessionProvider } from 'next-auth/react';
import { needsOnboarding } from '@/lib/utils/needsOnboarding';

export default async function OnboardingPage() {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
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
