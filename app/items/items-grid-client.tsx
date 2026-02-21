"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemCard } from '@/components/item-card';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPaginatedItems } from '@/lib/api/swr-items';
import { formatDate } from '@/lib/date-formatting';
import { ItemsGridSkeleton } from './items-loading-skeleton';
import { useDebouncedValue } from '@/lib/hooks/useDebounce';

// Build a query string for a given page index and current filter values.
// Passed as explicit arguments so both the initial-load effect and the
// loadMore callback always use whichever values are current at call time.
function buildQueryString(
    page: number,
    search: string,
    category: string,
    type: string
): string {
    const params = new URLSearchParams({ page: page.toString(), limit: '12' });
    if (search) params.set('search', search);
    if (category !== 'all') params.set('category', category);
    if (type !== 'all') params.set('item_type', type);
    return params.toString();
}

export function ItemsGridClient({ segment }: { segment: "public" | "boys" | "girls" }) {
    const [searchInput, setSearchInput] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'all' | 'found' | 'lost'>('all');
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Core feed state — items are stored already formatted so no downstream
    // memoization is required.
    const [allItems, setAllItems] = useState<ReturnType<typeof formatDate>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    // Refs prevent stale closures inside the IntersectionObserver callback
    // without forcing the observer effect to re-run on every state update.
    const nextPageRef = useRef(2);
    const loadingMoreRef = useRef(false);
    const hasMoreRef = useRef(false);

    // Debounce search to reduce server action invocations
    const searchQuery = useDebouncedValue(searchInput, 400);
    const typeFilter = activeTab === 'all' ? 'all' : activeTab;

    // Reload from page 1 whenever any filter changes.
    // The Next.js Data Cache (revalidate: 120, tagged per segment) handles
    // deduplication and freshness; no client cache is needed here.
    useEffect(() => {
        let cancelled = false;

        setIsLoading(true);
        setAllItems([]);
        setHasMore(false);
        hasMoreRef.current = false;
        nextPageRef.current = 2; // next incremental page after the first load

        getPaginatedItems(segment, buildQueryString(1, searchQuery, categoryFilter, typeFilter))
            .then((result) => {
                if (cancelled) return;
                if (result.ok && result.data) {
                    setAllItems(result.data.items.map(formatDate));
                    setHasMore(result.data.has_more);
                    hasMoreRef.current = result.data.has_more;
                }
                setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [searchQuery, categoryFilter, typeFilter, segment]);

    // Load the next page and append its items to the existing list.
    // Guards via refs ensure only one concurrent load at a time.
    const loadMore = useCallback(async () => {
        if (loadingMoreRef.current || !hasMoreRef.current) return;

        loadingMoreRef.current = true;
        setIsLoadingMore(true);

        const page = nextPageRef.current;
        const result = await getPaginatedItems(
            segment,
            buildQueryString(page, searchQuery, categoryFilter, typeFilter)
        );

        if (result.ok && result.data) {
            setAllItems(prev => [...prev, ...result.data!.items.map(formatDate)]);
            setHasMore(result.data.has_more);
            hasMoreRef.current = result.data.has_more;
            nextPageRef.current = page + 1;
        }

        loadingMoreRef.current = false;
        setIsLoadingMore(false);
    }, [searchQuery, categoryFilter, typeFilter, segment]);

    // Infinite scroll observer — reconnects whenever hasMore, isLoadingMore,
    // or loadMore (filter set) changes.  When a filter change resets hasMore
    // to false the observer is not attached, preventing spurious page loads.
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: '150px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, loadMore]);

    return (
        <>
            <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center mb-8 transition-all duration-300">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-200" />
                    <Input
                        type="search"
                        placeholder="Search by keyword..."
                        className="pl-9 bg-background border-muted-foreground/20 placeholder:text-neutral-500 transition-all duration-200 focus:border-primary/50"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px] bg-background border-muted-foreground/20 cursor-pointer transition-all duration-200 hover:border-muted-foreground/40">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                                <SelectValue placeholder="Category" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="bags">Bags</SelectItem>
                            <SelectItem value="keys-wallets">Keys & Wallets</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="flex w-full max-w-md mx-auto mb-8 transition-all duration-300">
                    <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-98 cursor-pointer transition-all duration-200">
                        All items
                    </TabsTrigger>
                    <TabsTrigger value="found" className="data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-98 cursor-pointer transition-all duration-200">
                        Found Items
                    </TabsTrigger>
                    <TabsTrigger value="lost" className="data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-98 cursor-pointer transition-all duration-200">
                        Lost Items
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6 relative">
                    {isLoading ? (
                        <ItemsGridSkeleton />
                    ) : allItems.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-1 px-0">
                                {allItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="relative group animate-in fade-in-0 slide-in-from-bottom-3"
                                        style={{
                                            animationDelay: `${Math.min(index * 30, 400)}ms`,
                                            animationDuration: '400ms',
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <ItemCard item={item} type={item.type} />
                                    </div>
                                ))}
                            </div>
                            {hasMore && (
                                <div ref={loadMoreRef} className="flex justify-center py-8 animate-in fade-in-0 duration-300">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground animate-pulse">Loading more...</span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed animate-in fade-in-0 zoom-in-95 duration-500">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No items found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                We couldn't find any items matching your search criteria. Try adjusting your filters.
                            </p>
                            <Button variant="link" onClick={() => { setSearchInput(''); setCategoryFilter('all') }} className="mt-4">
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </>
    );
}
