import { ItemsLoadingSkeleton } from './items-loading-skeleton';
import { Suspense } from 'react';
import { ItemsGridClient } from './items-grid-client';


export default async function BrowseItemsPage() {
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

            <Suspense fallback={<ItemsLoadingSkeleton />}>
                <ItemsGridClient />
            </Suspense>
        </div >
    );
}