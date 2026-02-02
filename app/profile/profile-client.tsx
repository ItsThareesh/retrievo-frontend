'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemCard } from '@/components/item-card';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import useSWR from 'swr';
import { fetchData } from '@/lib/utils/swrHelper';
import { formatDate } from '@/lib/date-formatting';
import { Item } from '@/types/item';
import { getUserItems } from '@/lib/api/swr-items';
import { UserProfileLoading } from './user-profile-loading';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function ProfileClient() {
    const { data: session } = useSession();

    const toastShownRef = useRef(false); // To prevent multiple toasts

    const params = useSearchParams();
    const reason = params.get("reason");

    // Fetch user items with SWR
    const { data: itemsData, isLoading } = useSWR('userItems', () => fetchData(() => getUserItems()));

    const lostItems: Item[] = useMemo(() => {
        if (!itemsData) return [];
        return itemsData.lost_items.map(formatDate);
    }, [itemsData]);

    const foundItems: Item[] = useMemo(() => {
        if (!itemsData) return [];
        return itemsData.found_items.map(formatDate);
    }, [itemsData]);

    useEffect(() => {
        if (reason === "hostel_required" && !toastShownRef.current) {
            toast.error("Hostel Required", {
                description: "Please set your hostel before reporting items.",
            });
            toastShownRef.current = true;
        } else if (reason === "phone_required" && !toastShownRef.current) {
            toast.error("Phone Number Required", {
                description: "Please add your phone number before reporting items.",
            });
            toastShownRef.current = true;
        }
    }, [reason]);

    if (isLoading) {
        return UserProfileLoading();
    }

    const formattedLost = lostItems.map(item => ({
        ...item,
        type: 'lost' as const
    }));

    const formattedFound = foundItems.map(item => ({
        ...item,
        type: 'found' as const
    }));

    const userItems = [...formattedLost, ...formattedFound].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* User Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="sticky top-24">
                        <Card className="overflow-hidden border-muted shadow-sm">
                            <div className="relative h-24 w-full overflow-hidden bg-muted/20">
                                <Image
                                    src={session?.user.image || ""}
                                    alt=""
                                    aria-hidden="true"
                                    fill
                                    unoptimized
                                    className="object-cover blur-3xl scale-125 opacity-50 saturate-300"
                                />
                            </div>
                            <CardHeader className="text-center -mt-12 relative z-10">
                                <div className="mx-auto mb-4 p-1 bg-background rounded-full w-fit">
                                    <Avatar className="w-24 h-24 border-2 border-background">
                                        <AvatarImage
                                            src={session?.user.image}
                                            alt={session?.user.name}
                                        />
                                        <AvatarFallback>
                                            {session?.user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle className="text-xl">{session?.user.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{session?.user.email}</p>
                            </CardHeader>
                            <CardContent className="space-y-2 p-4">
                                <ThemeToggle />
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start h-10 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold tracking-tight">My Activity</h2>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="flex w-full max-w-md mx-auto mb-8">
                            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                            <TabsTrigger value="found" className="flex-1">Found</TabsTrigger>
                            <TabsTrigger value="lost" className="flex-1">Lost</TabsTrigger>
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
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                                    <p className="text-muted-foreground">No items reported yet.</p>
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
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                                    <p className="text-muted-foreground">No lost items reported.</p>
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
                                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                                    <p className="text-muted-foreground">No found items reported.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}