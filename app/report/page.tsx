import { auth } from '@/auth';
import { ItemFormClient } from './item-form-client';
import { redirect } from 'next/navigation';

export default async function ReportPage() {
    const session = await auth();

    if (!session) {
        redirect(`/auth/signin?callbackUrl=/report`);
    }

    if (session?.user.hostel === null) {
        redirect(`/profile?reason=hostel_required`);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ItemFormClient session={session} />
        </div>
    );
}
