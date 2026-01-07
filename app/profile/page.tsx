import { auth } from '@/auth';
import { ProfileClient } from '@/app/profile/profile-client';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

export default async function ProfilePage() {
    const session = await auth();

    const isAuthenticated =
        !!session?.user && Date.now() < (session?.expires_at ?? 0);

    if (!isAuthenticated) {
        redirect('/auth/signin?callbackUrl=/profile');
    }

    return (
        <SessionProvider>
            <ProfileClient session={session} />
        </SessionProvider>
    );
}