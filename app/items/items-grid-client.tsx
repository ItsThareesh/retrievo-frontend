"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
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
import { clientFetch } from "@/lib/client-fetch";
import { standardizeItemDate } from "@/lib/date-formatting";
import { ItemsGridSkeleton, ItemsLoadMoreSkeleton } from "./items-loading-skeleton";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";
import type { Item } from "@/types/item";

interface PaginatedResponse {
    items: Item[];
    cursor: string | null;
    has_more: boolean;
}

/** Build a query string for the given cursor and current filter values. */
function buildQueryString(
    cursor: string | null,
    search: string,
    category: string,
    type: string,
): string {
    const params = new URLSearchParams({ limit: "16" });
    if (cursor) params.set("cursor", cursor);
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (type !== "all") params.set("item_type", type);
    return params.toString();
}

export function ItemsGridClient() {
    const { data: session, status } = useSession();
    const token = session?.backendToken;

    const [searchInput, setSearchInput] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [activeTab, setActiveTab] = useState<"all" | "found" | "lost">("all");
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const [allItems, setAllItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const nextCursorRef = useRef<string | null>(null);
    const loadingMoreRef = useRef(false);
    const hasMoreRef = useRef(false);
    const generationRef = useRef(0);

    const searchQuery = useDebouncedValue(searchInput, 400);
    const typeFilter = activeTab === "all" ? "all" : activeTab;

    async function fetchPage(
        cursor: string | null,
        search: string,
        category: string,
        type: string,
    ): Promise<PaginatedResponse | null> {
        try {
            const data = await clientFetch<PaginatedResponse>(
                `/items/all?${buildQueryString(cursor, search, category, type)}`,
                token,
            );
            return data;
        } catch {
            return null;
        }
    }

    // Reload from page 1 whenever any filter changes.
    useEffect(() => {
        if (status === "loading") return;
        
        // Bump generation to invalidate any in-flight loadMore calls.
        const gen = ++generationRef.current;

        setIsLoading(true);
        setAllItems([]);
        setHasMore(false);
        hasMoreRef.current = false;
        nextCursorRef.current = null;

        fetchPage(null, searchQuery, categoryFilter, typeFilter).then((data) => {
            if (gen !== generationRef.current || !data) {
                if (gen === generationRef.current) setIsLoading(false);
                return;
            }
            setAllItems(data.items.map(standardizeItemDate));
            setHasMore(data.has_more);
            hasMoreRef.current = data.has_more;
            nextCursorRef.current = data.cursor;
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, categoryFilter, typeFilter, status]);

    // Load the next page and append items.
    const loadMore = useCallback(async () => {
        if (loadingMoreRef.current || !hasMoreRef.current) return;

        loadingMoreRef.current = true;
        setIsLoadingMore(true);

        const gen = generationRef.current;
        const cursor = nextCursorRef.current;

        const data = await fetchPage(cursor, searchQuery, categoryFilter, typeFilter);

        if (gen !== generationRef.current) {
            loadingMoreRef.current = false;
            setIsLoadingMore(false);
            return;
        }

        if (data) {
            setAllItems((prev) => [...prev, ...data.items.map(standardizeItemDate)]);
            setHasMore(data.has_more);
            hasMoreRef.current = data.has_more;
            nextCursorRef.current = data.cursor;
        }

        loadingMoreRef.current = false;
        setIsLoadingMore(false);
    }, [searchQuery, categoryFilter, typeFilter, token]);

    // Infinite scroll
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
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-2 px-0">
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
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border rounded-lg bg-muted/10 border-dashed border-muted-foreground/20 animate-in fade-in-0 zoom-in-95 duration-500">
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
