import { fetchAllItems } from '@/lib/api/server';
import { ItemsGridClient } from './items-grid-client';
import { Item } from '@/types/item';
import { auth } from '@/auth';
import { formatDate } from '@/lib/date-formatting';

export async function ItemsDataLoader() {
    const session = await auth();

    // Returns all items in a single array
    const res = await fetchAllItems(session?.backendToken);

    const items = res.data.items;

    const lostItems = items.filter((i: Item) => i.type === "lost").map(formatDate);
    const foundItems = items.filter((i: Item) => i.type === "found").map(formatDate);

    return <ItemsGridClient lostItems={lostItems} foundItems={foundItems} />;
}
