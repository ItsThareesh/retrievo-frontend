"use client"

import { useState, useMemo, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemCard } from '@/components/item-card';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/item';
import useSWRInfinite from 'swr/infinite';
import { getPaginatedItems } from '@/lib/api/swr-items';
import { fetchData } from '@/lib/utils/swrHelper';
import { formatDate } from '@/lib/date-formatting';
import { ItemsLoadingSkeleton } from './items-loading-skeleton';

export function ItemsGridClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const loadMoreRef = useRef<HTMLDivElement>(null);

    function getKey(pageIndex: number, previousPageData: any) {
        if (previousPageData && !previousPageData.has_more) return null;
        return `items-page-${pageIndex + 1}`;
    }

    const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
        getKey,
        async function (key) {
            const pageNumber = parseInt(key.split('-')[2]);
            const result = await fetchData(() => getPaginatedItems(pageNumber));
            return result;
        },
        {
            revalidateFirstPage: false,
            revalidateAll: false,
        }
    );

    const allItems = useMemo(() => {
        if (!data) return [];
        return data.flatMap(page => page.items.map(formatDate));
    }, [data]);

    const lostItems = useMemo(() => {
        return allItems.filter((i: Item) => i.type === "lost");
    }, [allItems]);

    const foundItems = useMemo(() => {
        return allItems.filter((i: Item) => i.type === "found");
    }, [allItems]);

    const hasMore = data?.[data.length - 1]?.has_more ?? false; // Check if there's more data to load from the last page

    // Infinite scroll observer
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || isValidating) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isValidating) {
                    setSize(size + 1);
                }
            },
            { rootMargin: '150px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, isValidating, setSize, size]);

    const filterItems = (items: any[]) => {
        return items.filter(item => {
            const matchesSearch =
                (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            const matchesCategory = categoryFilter === 'all' ||
                (item.category?.toLowerCase() || '') === categoryFilter.toLowerCase();

            return matchesSearch && matchesCategory;
        });
    };

    const filteredLostItems = filterItems(lostItems);
    const filteredFoundItems = filterItems(foundItems);

    if (isLoading) {
        return <ItemsLoadingSkeleton />;
    }

    let userItems = [...filteredFoundItems, ...filteredLostItems];
    userItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by lost/found date in descending order

    return (
        <>
            <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center mb-8">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by keyword..."
                        className="pl-9 bg-background border-muted-foreground/20 placeholder:text-neutral-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px] bg-background border-muted-foreground/20 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
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

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="flex w-full max-w-md mx-auto mb-8">
                    <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-98  cursor-pointer">
                        All items
                    </TabsTrigger>
                    <TabsTrigger value="found" className="data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-98  cursor-pointer">
                        Found Items
                    </TabsTrigger>
                    <TabsTrigger value="lost" className="data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-98  cursor-pointer">
                        Lost Items
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 animate-in fade-in-50 duration-500">
                    {userItems.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {userItems.map((item) => (
                                    <div key={item.id} className="relative group">
                                        <ItemCard item={item} type={item.type} />
                                    </div>
                                ))}
                            </div>
                            {hasMore && (
                                <div ref={loadMoreRef} className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No items found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                We couldn't find any found items matching your search criteria. Try adjusting your filters.
                            </p>
                            <Button variant="link" onClick={() => { setSearchQuery(''); setCategoryFilter('all') }} className="mt-4">
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="found" className="space-y-4 animate-in fade-in-50 duration-500">
                    {filteredFoundItems.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredFoundItems.map(item => (
                                    <ItemCard key={item.id} item={item} type="found" />
                                ))}
                            </div>
                            {hasMore && (
                                <div ref={loadMoreRef} className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No items found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                We couldn't find any found items matching your search criteria. Try adjusting your filters.
                            </p>
                            <Button variant="link" onClick={() => { setSearchQuery(''); setCategoryFilter('all') }} className="mt-4">
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="lost" className="space-y-4 animate-in fade-in-50 duration-500">
                    {filteredLostItems.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredLostItems.map(item => (
                                    <ItemCard key={item.id} item={item} type="lost" />
                                ))}
                            </div>
                            {hasMore && (
                                <div ref={loadMoreRef} className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No items found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                We couldn't find any lost items matching your search criteria. Try adjusting your filters.
                            </p>
                            <Button variant="link" onClick={() => { setSearchQuery(''); setCategoryFilter('all') }} className="mt-4">
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </>
    );
}
