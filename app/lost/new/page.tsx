import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ItemFormClient } from '@/components/item-form-client';

export default async function ReportLostPage() {
    const session = await auth();

    if (!session) {
        redirect('/auth/signin?callbackUrl=/lost/new')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ItemFormClient type="lost" session={session} />
        </div>
    );
}
