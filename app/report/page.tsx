import { auth } from '@/auth';
import { ItemFormClient } from './item-form-client';
import { redirect } from 'next/navigation';
import { needsOnboarding } from '@/lib/utils/needsOnboarding';

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const { type } = await searchParams;

    if (!type || (type !== 'lost' && type !== 'found')) {
        redirect('/report?type=lost');
    }

    const session = await auth();

    const isAuthenticated =
        !!session?.user && Date.now() < (session?.expires_at ?? 0);

    // Check authentication
    if (!isAuthenticated) {
        redirect(`/auth/signin?callbackUrl=/report?type=${type}`);
    }

    // Check if user needs onboarding
    if (needsOnboarding(session)) {
        redirect('/onboarding');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ItemFormClient session={session} type={type} />
        </div>
    );
}
