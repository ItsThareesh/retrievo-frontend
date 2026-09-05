import { ItemsGridClient } from './items-grid-client';
import { ReportFab } from './report-fab';


export default function BrowseItemsPage() {
    return (
        <div className="container mx-auto px-4 md:px-10 py-8 min-h-[calc(100vh-4rem)]">
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

            {/* Mobile FAB - portalled to body, immune to PTR content transform */}
            <ReportFab />
        </div>
    );
}