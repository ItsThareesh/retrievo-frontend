"use client"

import { ItemCard } from '@/components/item-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateString } from '@/lib/date-formatting';
import { Item } from '@/types/item';
import { User as UserType } from '@/types/user';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { APIError } from '@/lib/api-error';
import { clientFetch } from '@/lib/client-fetch';
import { standardizeItemDate } from '@/lib/date-formatting';
import { UserProfileLoading } from '../user-profile-loading';

export default function UserPage() {
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.backendToken;
    const params = useParams();
    const id = params.id as string;

    const [user, setUser] = useState<UserType | null>(null);
    const [lostItems, setLostItems] = useState<Item[]>([]);
    const [foundItems, setFoundItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFoundError, setNotFoundError] = useState(false);

    useEffect(() => {
        if (!id || sessionStatus === "loading") return;
        let cancelled = false;

        setIsLoading(true);
        setNotFoundError(false);
        clientFetch<{ user: UserType; lost_items: Item[]; found_items: Item[] }>(
            `/profile/${id}`,
            token,
        )
            .then((data) => {
                if (cancelled) return;
                setUser(data.user);
                setLostItems(data.lost_items.map(standardizeItemDate));
                setFoundItems(data.found_items.map(standardizeItemDate));
                setIsLoading(false);
            })
            .catch((err) => {
                if (cancelled) return;
                if (err instanceof APIError && err.status === 404) {
                    setNotFoundError(true);
                }
                setIsLoading(false);
            });
        return () => { cancelled = true; };
    }, [id, token, sessionStatus]);

    const userItems: Item[] = useMemo(() => {
        const items = [...lostItems, ...foundItems];
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return items;
    }, [lostItems, foundItems]);

    if (notFoundError) {
        notFound();
    }

    if (isLoading) {
        return <UserProfileLoading />;
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-muted-foreground">Failed to load profile.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-10 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* User Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="sticky top-24">
                        <Card className="border-muted shadow-sm relative">
                            <div className="relative h-24 w-full overflow-hidden bg-muted/40 dark:bg-muted/40">
                                {user.image && (
                                <Image
                                    src={user.image}
                                    alt=""
                                    aria-hidden="true"
                                    fill
                                    draggable={false} 
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                                    className="object-cover blur-3xl scale-125 saturate-300 pointer-events-none select-none"
                                />
                                )}
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
                                <CardTitle className="text-xl px-4 break-words">{user.name}</CardTitle>
                                <p className="text-sm text-muted-foreground px-4 break-words">{user.email}</p>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4">
                                <div className="flex flex-col space-y-3 w-full max-w-[260px] mx-auto justify-center">
                                    <p className="text-sm text-muted-foreground text-center">
                                        Member since {formatDateString(user.created_at)}
                                    </p>
                                </div>
                            </CardContent>
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
                            <TabsTrigger value="all" className="flex-1 cursor-pointer">All</TabsTrigger>
                            <TabsTrigger value="found" className="flex-1 cursor-pointer">Found</TabsTrigger>
                            <TabsTrigger value="lost" className="flex-1 cursor-pointer">Lost</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-6 animate-in fade-in-50 duration-500">
                            {userItems.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userItems.map((item) => (
                                        <div key={item.id} className="relative group">
                                            <ItemCard item={item} type={item.type} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed border-muted-foreground/20">
                                    <Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                                    <p className="text-muted-foreground">No items reported yet.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="found" className="space-y-6 animate-in fade-in-50 duration-500">
                            {foundItems.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {foundItems.map((item) => (
                                        <ItemCard key={item.id} item={item} type="found" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed border-muted-foreground/20">
                                    <Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                                    <p className="text-muted-foreground">No found items reported.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="lost" className="space-y-6 animate-in fade-in-50 duration-500">
                            {lostItems.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lostItems.map((item) => (
                                        <ItemCard key={item.id} item={item} type="lost" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed border-muted-foreground/20">
                                    <Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
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
