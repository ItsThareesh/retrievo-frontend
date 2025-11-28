import { auth } from '@/auth';
import { ItemFormClient } from './item-form-client';

interface ItemFormProps {
    type: 'lost' | 'found';
}

export async function ItemForm({ type }: ItemFormProps) {
    const session = await auth();

    return <ItemFormClient type={type} session={session} />;
}