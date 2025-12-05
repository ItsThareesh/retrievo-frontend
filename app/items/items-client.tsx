"use client"

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemCard } from '@/components/item-card';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/items';

interface ItemsBrowseProps {
    initialLostItems: Item[];
    initialFoundItems: Item[];
}

// Helper function to format item data
function formatItem(item: Item) {
    const formattedDate = new Date(item.date)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

    return {
        ...item,
        date: formattedDate,
    };
}

export function ItemsClient({ initialLostItems, initialFoundItems }: ItemsBrowseProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

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

    const filteredLostItems = filterItems(initialLostItems).map(formatItem);
    const filteredFoundItems = filterItems(initialFoundItems).map(formatItem);

    return (
        <>
            <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center mb-8">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by keyword..."
                        className="pl-9 bg-background border-muted-foreground/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px] bg-background border-muted-foreground/20">
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
                            <SelectItem value="keys & wallets">Keys & Wallets</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="lost" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-muted/50 p-1 mx-auto">
                    <TabsTrigger value="lost" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Lost Items</TabsTrigger>
                    <TabsTrigger value="found" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Found Items</TabsTrigger>
                </TabsList>

                <TabsContent value="lost" className="space-y-4 animate-in fade-in-50 duration-500">
                    {filteredLostItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredLostItems.map(item => (
                                <ItemCard key={item.id} item={item} type="lost" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No lost items found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                We couldn't find any lost items matching your search criteria. Try adjusting your filters.
                            </p>
                            <Button variant="link" onClick={() => { setSearchQuery(''); setCategoryFilter('all') }} className="mt-4">
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="found" className="space-y-4 animate-in fade-in-50 duration-500">
                    {filteredFoundItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredFoundItems.map(item => (
                                <ItemCard key={item.id} item={item} type="found" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No found items found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                We couldn't find any found items matching your search criteria. Try adjusting your filters.
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
