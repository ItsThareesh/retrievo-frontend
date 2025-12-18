import { fetchAllItems } from '@/lib/api';
import { ItemsClient } from './items-browsing-client';
import { Item } from '@/types/item';
import { auth } from '@/auth';
import { formatDate } from '@/lib/date-formatting';


export default async function BrowseItemsPage() {
    const session = await auth();

    // Returns all items in a single array
    const res = await fetchAllItems(session?.backendToken);
    const items = res.data.items;

    const lostItems = items.filter((i: Item) => i.type === "lost").map(formatDate);
    const foundItems = items.filter((i: Item) => i.type === "found").map(formatDate);

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Browse Items</h1>
                        <p className="text-muted-foreground mt-1">
                            Search through lost and found items in your area.
                        </p>
                    </div>
                </div>
            </div>

            <ItemsClient lostItems={lostItems} foundItems={foundItems} />
        </div>
    );
}