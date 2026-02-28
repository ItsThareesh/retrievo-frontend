"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ItemCard } from "@/components/item-card";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaginatedItems, PaginatedItemsData } from "@/lib/api/items";
import { formatDate } from "@/lib/date-formatting";
import { ItemsGridSkeleton, ItemsLoadMoreSkeleton } from "./items-loading-skeleton";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";

/** Build a query string for the given page and current filter values. */
function buildQueryString(
    page: number,
    search: string,
    category: string,
    type: string,
): string {
    const params = new URLSearchParams({ page: page.toString(), limit: "12" });
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (type !== "all") params.set("item_type", type);
    return params.toString();
}

interface ItemsGridClientProps {
    segment: "public" | "boys" | "girls";
    initialData: PaginatedItemsData | null;
}

export function ItemsGridClient({ segment, initialData }: ItemsGridClientProps) {
    const [searchInput, setSearchInput] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [activeTab, setActiveTab] = useState<"all" | "found" | "lost">("all");
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Core feed state — initialized from RSC data for instant first paint.
    // Initial data is already formatted on the server, so no need to format again.
    const [allItems, setAllItems] = useState(() =>
        initialData ? initialData.items : [],
    );
    const [isLoading, setIsLoading] = useState(!initialData);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(initialData?.has_more ?? false);

    // Refs prevent stale closures inside the IntersectionObserver callback.
    const nextPageRef = useRef(2);
    const loadingMoreRef = useRef(false);
    const hasMoreRef = useRef(initialData?.has_more ?? false);

    // Generation counter: incremented on every filter change.
    // In-flight loadMore calls compare their captured generation against the
    // current value — if they differ, the result is discarded to prevent
    // stale pages from a previous filter set leaking into the new one.
    const generationRef = useRef(0);

    // Track whether the RSC-provided initialData has been consumed so we
    // skip the redundant first fetch when filters are still at defaults.
    const initialDataConsumed = useRef(false);

    const searchQuery = useDebouncedValue(searchInput, 400);
    const typeFilter = activeTab === "all" ? "all" : activeTab;

    // Reload from page 1 whenever any filter changes.
    useEffect(() => {
        const isDefaultFilters =
            searchQuery === "" && categoryFilter === "all" && typeFilter === "all";

        // Skip the very first fetch when the RSC already provided page-1 data.
        if (!initialDataConsumed.current && initialData && isDefaultFilters) {
            initialDataConsumed.current = true;
            return;
        }

        // Bump generation to invalidate any in-flight loadMore calls.
        const gen = ++generationRef.current;

        setIsLoading(true);
        setAllItems([]);
        setHasMore(false);
        hasMoreRef.current = false;
        nextPageRef.current = 2;

        getPaginatedItems(
            segment,
            buildQueryString(1, searchQuery, categoryFilter, typeFilter),
        ).then((result) => {
            // Discard if a newer filter change superseded this one.
            if (gen !== generationRef.current) return;

            if (result.ok && result.data) {
                setAllItems(result.data.items.map(formatDate));
                setHasMore(result.data.has_more);
                hasMoreRef.current = result.data.has_more;
            }
            setIsLoading(false);
        });
    }, [searchQuery, categoryFilter, typeFilter, segment, initialData]);

    // Load the next page and append items. Guarded by refs so only one
    // concurrent load runs at a time, and stale results are discarded.
    const loadMore = useCallback(async () => {
        if (loadingMoreRef.current || !hasMoreRef.current) return;

        loadingMoreRef.current = true;
        setIsLoadingMore(true);

        const gen = generationRef.current;
        const page = nextPageRef.current;

        const result = await getPaginatedItems(
            segment,
            buildQueryString(page, searchQuery, categoryFilter, typeFilter),
        );

        // Discard if filters changed while this page was loading.
        if (gen !== generationRef.current) {
            loadingMoreRef.current = false;
            setIsLoadingMore(false);
            return;
        }

        if (result.ok && result.data) {
            setAllItems((prev) => [...prev, ...result.data!.items.map(formatDate)]);
            setHasMore(result.data.has_more);
            hasMoreRef.current = result.data.has_more;
            nextPageRef.current = page + 1;
        }

        loadingMoreRef.current = false;
        setIsLoadingMore(false);
    }, [searchQuery, categoryFilter, typeFilter, segment]);

    // Infinite scroll — IntersectionObserver triggers loadMore when the
    // sentinel enters the viewport. Reconnects when dependencies change.
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: "150px" },
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, loadMore]);

    return (
        <>
            {/* Filter bar */}
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

            {/* Type tabs + item grid */}
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "all" | "found" | "lost")}
                className="w-full"
            >
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
                                            animationDuration: "400ms",
                                            animationFillMode: "both",
                                        }}
                                    >
                                        <ItemCard item={item} type={item.type} />
                                    </div>
                                ))}
                            </div>

                            {/* Infinite scroll: skeleton cards while fetching */}
                            {isLoadingMore && <ItemsLoadMoreSkeleton />}

                            {/* Invisible sentinel triggers the observer */}
                            {hasMore && !isLoadingMore && (
                                <div ref={loadMoreRef} className="h-4" />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed animate-in fade-in-0 zoom-in-95 duration-500">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No items found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                We couldn&apos;t find any items matching your search criteria. Try
                                adjusting your filters.
                            </p>
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSearchInput("");
                                    setCategoryFilter("all");
                                }}
                                className="mt-4"
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </>
    );
}
