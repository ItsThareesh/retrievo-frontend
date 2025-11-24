"use client"

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemCard } from '@/components/item-card';
import { MOCK_ITEMS } from '@/lib/mock-data';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BrowseItemsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredItems = MOCK_ITEMS.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const lostItems = filteredItems.filter(item => item.type === 'lost');
    const foundItems = filteredItems.filter(item => item.type === 'found');

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

                <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center">
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
                                <SelectItem value="keys">Keys</SelectItem>
                                <SelectItem value="pets">Pets</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" className="shrink-0 bg-background border-muted-foreground/20">
                            <SlidersHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="lost" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-muted/50 p-1">
                    <TabsTrigger value="lost" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Lost Items</TabsTrigger>
                    <TabsTrigger value="found" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Found Items</TabsTrigger>
                </TabsList>

                <TabsContent value="lost" className="space-y-4 animate-in fade-in-50 duration-500">
                    {lostItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {lostItems.map(item => (
                                <ItemCard key={item.id} item={item} />
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
                    {foundItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {foundItems.map(item => (
                                <ItemCard key={item.id} item={item} />
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
        </div>
    );
}