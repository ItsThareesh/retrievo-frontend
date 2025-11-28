import { ItemForm } from '@/components/item-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ReportFoundPage() {
    const session = await auth();

    if (!session) {
        redirect('/api/auth/signin?callbackUrl=/found/new')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ItemForm type="found" />
        </div>
    );
}
