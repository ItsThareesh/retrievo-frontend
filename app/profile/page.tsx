import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemCard } from '@/components/item-card';
import { MOCK_USER, MOCK_ITEMS } from '@/lib/mock-data';
import { Settings, LogOut, Edit2, Trash2 } from 'lucide-react';

export default function ProfilePage() {
    const userItems = MOCK_ITEMS.filter(
        (item) => item.ownerId === MOCK_USER.id || item.finderId === MOCK_USER.id
    );

    const lostItems = userItems.filter((item) => item.type === 'lost');
    const foundItems = userItems.filter((item) => item.type === 'found');

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* User Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="sticky top-24">
                        <Card className="overflow-hidden border-muted shadow-sm">
                            <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/30"></div>
                            <CardHeader className="text-center -mt-12 relative z-10">
                                <div className="mx-auto mb-4 p-1 bg-background rounded-full w-fit">
                                    <Avatar className="w-24 h-24 border-2 border-background">
                                        <AvatarImage src={MOCK_USER.avatar} alt={MOCK_USER.name} />
                                        <AvatarFallback>AJ</AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle className="text-xl">{MOCK_USER.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{MOCK_USER.email}</p>
                            </CardHeader>
                            <CardContent className="space-y-2 p-4">
                                <Button variant="outline" className="w-full justify-start h-10">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                                <Button variant="ghost" className="w-full justify-start h-10 text-destructive hover:text-destructive hover:bg-destructive/10">
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
                        <TabsList className="mb-8 bg-muted/50 p-1 w-full sm:w-auto">
                            <TabsTrigger value="all" className="flex-1 sm:flex-none">All Items</TabsTrigger>
                            <TabsTrigger value="lost" className="flex-1 sm:flex-none">My Lost Reports</TabsTrigger>
                            <TabsTrigger value="found" className="flex-1 sm:flex-none">My Found Reports</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-6 animate-in fade-in-50 duration-500">
                            {userItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userItems.map((item) => (
                                        <div key={item.id} className="relative group">
                                            <ItemCard item={item} />
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                                                <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="destructive" className="h-8 w-8 shadow-sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lostItems.map((item) => (
                                        <ItemCard key={item.id} item={item} />
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {foundItems.map((item) => (
                                        <ItemCard key={item.id} item={item} />
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
