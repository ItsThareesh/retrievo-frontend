import { fetchAllItems } from '@/lib/api';
import { ItemsClient } from './items-client';
import { Item } from '@/types/items';


export default async function BrowseItemsPage() {
    const res = await fetchAllItems();

    const lostItems: Item[] = res.data.lost_items ?? [];
    const foundItems: Item[] = res.data.found_items ?? [];

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

            <ItemsClient initialLostItems={lostItems} initialFoundItems={foundItems} />
        </div>
    );
}