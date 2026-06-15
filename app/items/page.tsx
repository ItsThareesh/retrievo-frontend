import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ItemsGridClient } from './items-grid-client';


export default function BrowseItemsPage() {
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

            <ItemsGridClient />

            {/* Mobile FAB */}
            <Link
                href="/report"
                className="md:hidden fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            >
                <Plus className="size-6" />
            </Link>
        </div>
    );
}