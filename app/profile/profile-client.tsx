'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemCard } from '@/components/item-card';
import { LogOut , ChevronDown} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Item } from '@/types/item';
import { ThemeToggle } from '@/components/theme-toggle';
import { setHostel, setPhoneNumber } from '@/lib/api/client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProfileClientProps {
    session: Session;
    lostItems: Item[];
    foundItems: Item[];
}

export function ProfileClient({ session: initialSession, lostItems, foundItems }: ProfileClientProps) {
    const { data: session, update } = useSession();

    const [isSavingHostel, isSettingHostel] = useState(false);
    const [isSavingPhone, isSettingPhone] = useState(false);

    const [phone, setPhone] = useState("");

    const toastShownRef = useRef(false); // To prevent multiple toasts

    const params = useSearchParams();
    const reason = params.get("reason");

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

    const currentSession = session || initialSession;  // Fallback to initial session

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

    const handleSetHostel = async (hostelType: string) => {
        isSettingHostel(true);

        try {
            const res = await setHostel(hostelType);


            if (!res.ok) {
                toast.error("Failed to set hostel. Please try again.");
                return;
            }

            // It doesn't matter on what data we pass, because we are fetching from backend again to ensure correctness
            await update({ hostel: hostelType });
            toast.success("Hostel set successfully!");
        } catch (error) {
            console.error("Error setting hostel:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            isSettingHostel(false);
        }
    };

    const handleSetPhone = async () => {
        if (!phone) {
            toast.error("Enter a valid phone number");
            return;
        }

        isSettingPhone(true);

        try {
            const res = await setPhoneNumber(country_code+phone);

            if (!res.ok) {
                toast.error("Failed to save phone number. Please try again.");
                return;
            }

            // It doesn't matter on what data we pass, because we are fetching from backend again to ensure correctness
            await update({ phone: country_code+phone });
            toast.success("Phone number saved successfully!");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            console.error("Error saving phone number:", error);
        } finally {
            isSettingPhone(false);
        }
    }
    const codes = [
        { value: "+91" },  // India
        { value: "+971" }, // UAE
        { value: "+966" }, // Saudi Arabia
        { value: "+974" }, // Qatar
        { value: "+965" }, // Kuwait
        { value: "+968" }, // Oman
        { value: "+973" }, // Bahrain
        { value: "+1" },   // USA / Canada
        { value: "+44" },  // United Kingdom
        { value: "+61" },  // Australia
        { value: "+64" },  // New Zealand
        { value: "+353" }, // Ireland
        { value: "+49" },  // Germany
    ] 
    const [country_code, setCountrycode] = useState("+91")
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
                                        <AvatarImage
                                            src={currentSession.user.image}
                                            alt={currentSession.user.name}
                                        />
                                        <AvatarFallback>
                                            {currentSession.user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle className="text-xl">{currentSession.user.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{currentSession.user.email}</p>
                            </CardHeader>
                            <CardContent className="space-y-2 p-4">
                                <ThemeToggle />
                                {!currentSession.user.hostel && (
                                    <div className="border p-3 rounded-md mb-2 space-y-3">
                                        <p className="text-sm font-medium">Select Hostel</p>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSetHostel("boys")}
                                                disabled={isSavingHostel}
                                            >
                                                Boys
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleSetHostel("girls")}
                                                disabled={isSavingHostel}
                                            >
                                                Girls
                                            </Button>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-tight">
                                            <b>Note:</b> This is for clothing visibility restrictions. It cannot be changed later.
                                        </p>
                                    </div>
                                )}
                                {!currentSession.user.phone && (
                                    <div className="border p-3 rounded-md space-y-3">
                                        <p className="text-sm font-medium">Add Phone Number</p>
                                        <div className="flex flex-row gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between font-normal text-left max-w-[70px]"
                                            >
                                                {/* Show selected label or placeholder text */}
                                                <span className={!reason ? "text-muted-foreground" : ""}>
                                                {country_code ||  "Select a reason..."}
                                                </span>
                                                <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            
                                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px]">
                                            {codes.map((item) => (
                                                <DropdownMenuItem
                                                key={item.value}
                                                onSelect={() => setCountrycode(item.value)}
                                                className="cursor-pointer"
                                                >
                                                {item.value}
                                                </DropdownMenuItem>
                                            ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Input
                                            placeholder="xxxxxxxxxx"
                                            value={phone}
                                            onChange={(e) =>setPhone(e.target.value)}
                                        />
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={handleSetPhone}
                                            disabled={isSavingPhone}
                                        >
                                            Save
                                        </Button>

                                        <p className="text-xs text-muted-foreground">
                                            This number will be shared only after you accept a claim. <b>It cannot be changed later</b>
                                        </p>
                                    </div>
                                )}
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
                    </Tabs>
                </div>
            </div>
        </div>
    );
}