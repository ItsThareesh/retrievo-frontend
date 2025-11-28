import { ItemForm } from '@/components/item-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ReportLostPage() {
    const session = await auth();

    if (!session) {
        redirect('/api/auth/signin?callbackUrl=/lost/new')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ItemForm type="lost" />
        </div>
    );
}
