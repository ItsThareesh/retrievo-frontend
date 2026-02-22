import { auth } from '@/lib/auth';
import { ItemsGridClient } from './items-grid-client';
import { getPaginatedItems } from '@/lib/api/items';
import { formatDate } from '@/lib/date-formatting';


export default async function BrowseItemsPage() {
    const session = await auth();

    const segment = session?.user?.hostel === "boys" ? "boys" : session?.user?.hostel === "girls" ? "girls" : "public";

    // Fetch page 1 with default filters in the RSC.
    // Cached via Next.js fetch cache (120s TTL, tagged `items-{segment}`).
    // Passed to the client component for instant render — no loading skeleton on first paint.
    const initialResult = await getPaginatedItems(segment, "page=1&limit=12");
    const initialData = initialResult.ok && initialResult.data
        ? { ...initialResult.data, items: initialResult.data.items.map(formatDate) }
        : null;

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

            <ItemsGridClient segment={segment} initialData={initialData} />
        </div >
    );
}