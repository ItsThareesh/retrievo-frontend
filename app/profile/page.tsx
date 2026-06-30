import Link from 'next/link';
import { Plus } from 'lucide-react';
import { auth } from '@/lib/auth';
import { ProfileClient } from '@/app/profile/profile-client';
import { redirect } from 'next/navigation';
import { needsOnboarding } from '@/lib/utils/needsOnboarding';

export default async function ProfilePage() {
    const session = await auth();

    const isAuthenticated = !!session?.backendToken;

    if (!isAuthenticated) {
        redirect('/auth/signin?callbackUrl=/profile');
    }

    if (needsOnboarding(session!)) {
        redirect('/onboarding');
    }

    return (
        <>
            <ProfileClient />
            <Link
                href="/report"
                className="md:hidden fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            >
                <Plus className="size-6" />
            </Link>
        </>
    );
}