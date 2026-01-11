"use client"

import { ItemCard } from '@/components/item-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/date-formatting';
import { Item } from '@/types/item';
import { User } from '@/types/user';
import useSWR from 'swr';
import { getUserProfile } from '@/lib/api/swr-items';
import { fetchData } from '@/lib/utils/swrHelper';
import { useMemo } from 'react';
import { UserProfileLoading } from '../user-profile-loading';
import { notFound } from 'next/navigation';

interface UserProfileClientProps {
    public_id: string;
}

export function UserProfileClient({ public_id }: UserProfileClientProps) {
    const { data, isLoading, error } = useSWR(['userProfile', public_id], () =>
        fetchData(() => getUserProfile(public_id))
    );

    const lostItems: Item[] = useMemo(() => {
        if (!data) return [];
        return data.lost_items.map(formatDate);
    }, [data]);

    const foundItems: Item[] = useMemo(() => {
        if (!data) return [];
        return data.found_items.map(formatDate);
    }, [data]);

    const userItems: Item[] = useMemo(() => {
        const items = [...lostItems, ...foundItems];
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return items;
    }, [lostItems, foundItems]);

    // Show loading skeleton while fetching
    if (isLoading) {
        return <UserProfileLoading />;
    }

    // Show 404 if error or no data after loading
    if (error || !data || !data.user) {
        return notFound();
    }

    const user = data.user as User;

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* User Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="sticky top-24">
                        <Card className="overflow-hidden border-muted shadow-sm">
                            <div className="relative h-24 w-full overflow-hidden bg-muted/20">
                                <img
                                    src={user.image}
                                    alt=""
                                    aria-hidden="true"
                                    className="
                                    absolute inset-0 h-full w-full object-cover blur-3xl scale-125 opacity-50 saturate-300"
                                />
                            </div>
                            <CardHeader className="text-center -mt-12 relative z-10">
                                <div className="mx-auto mb-4 p-1 bg-background rounded-full w-fit">
                                    <Avatar className="w-24 h-24 border-2 border-background">
                                        <AvatarImage
                                            src={user.image || ""}
                                            alt={user.name || ""}
                                        />
                                        <AvatarFallback>
                                            {user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle className="text-xl">{user.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <CardContent className="space-y-2 m-2 pb-4">
                                    <p className="text-sm text-muted-foreground">
                                        Member since {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold tracking-tight">Activity</h2>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="flex w-full max-w-md mx-auto mb-8">
                            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                            <TabsTrigger value="found" className="flex-1">Found</TabsTrigger>
                            <TabsTrigger value="lost" className="flex-1">Lost</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-6 animate-in fade-in-50 duration-500">
                            {userItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userItems.map((item) => (
                                        <div key={item.id} className="relative group">
                                            <ItemCard item={item} type={item.type} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                                    <p className="text-muted-foreground">No items reported yet.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="found" className="space-y-6 animate-in fade-in-50 duration-500">
                            {foundItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {foundItems.map((item) => (
                                        <ItemCard key={item.id} item={item} type="found" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                                    <p className="text-muted-foreground">No found items reported.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="lost" className="space-y-6 animate-in fade-in-50 duration-500">
                            {lostItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lostItems.map((item) => (
                                        <ItemCard key={item.id} item={item} type="lost" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                                    <p className="text-muted-foreground">No lost items reported.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
