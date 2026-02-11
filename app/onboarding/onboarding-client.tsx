"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Phone, Building2, Check, Instagram } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateOnboarding } from '@/lib/api/authenticated-api';
import { toast } from 'sonner';
import { OnboardingPayload } from '@/types/user';
import { needsOnboarding } from '@/lib/utils/needsOnboarding';

export default function OnboardingClient() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [phoneNumber, setPhoneNumberState] = useState(session?.user?.phone || '');
    const [hostel, setHostelState] = useState<'boys' | 'girls' | ''>(session?.user?.hostel || '');
    const [instagramId, setInstagramId] = useState(session?.user?.instagramId || "");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countryCode, setCountryCode] = useState("+91");

    const codes = [
        { value: "+91", label: "IN" },
        { value: "+971", label: "UAE" },
        { value: "+966", label: "SA" },
        { value: "+974", label: "QA" },
        { value: "+965", label: "KW" },
        { value: "+968", label: "OM" },
        { value: "+973", label: "BH" },
        { value: "+1", label: "US/CA" },
        { value: "+44", label: "UK" },
        { value: "+61", label: "AU" },
        { value: "+64", label: "NZ" },
        { value: "+353", label: "IE" },
        { value: "+49", label: "DE" },
    ];

    useEffect(() => {
        if (status !== "authenticated") return;

        if (!needsOnboarding(session)) {
            router.replace("/items");
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!hostel) {
            toast.error("Please select your hostel.");
            return;
        }

        if (!phoneNumber.trim() && !instagramId.trim()) {
            toast.error("Please provide at least one contact detail.");
            return;
        }

        if (phoneNumber && phoneNumber.length < 8) {
            toast.error("Please enter a valid phone number.");
            return;
        }

        const payload: OnboardingPayload = {
            hostel,
            phone: phoneNumber.trim()
                ? `${countryCode}${phoneNumber.trim()}`
                : null,
            instagramId: instagramId.trim() || null,
        };

        try {
            setIsSubmitting(true);

            const res = await updateOnboarding(payload);

            if (res.status === 422) {
                toast.error("Invalid. Please check your details and try again.");
                return;
            }

            if (!res.ok) {
                toast.error("Failed to complete onboarding. Please try again.");
                return;
            }

            // Update NextAuth session in one shot
            await update(payload);

            toast.success("Welcome! Your profile has been set up.");
            router.replace("/items");
        } catch (err) {
            console.error("Onboarding error:", err);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-linear-to-br">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
            <Card className="w-full max-w-lg shadow-2xl border-border/40 relative z-10 backdrop-blur-sm bg-background/95">
                <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-3xl font-bold tracking-tight">Welcome Aboard!</CardTitle>
                    <CardDescription className="text-base mt-2">
                        We need a few details to set up your profile.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 pt-6 px-8">
                        {/* Phone Input */}
                        <div className="space-y-3">
                            <label htmlFor="phone" className="text-sm font-medium leading-none flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="flex rounded-md shadow-sm overflow-hidden ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="rounded-r-none w-[70px] border-r-0 [font-variant-numeric:tabular-nums]"
                                        >
                                            <span className="w-7 text-center">{countryCode}</span>
                                            <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="min-w-[200px]">
                                        {codes.map((item) => (
                                            <DropdownMenuItem
                                                key={item.value}
                                                onSelect={() => setCountryCode(item.value)}
                                                className="justify-between"
                                            >
                                                <span className="font-mono">{item.value}</span>
                                                <span className="text-muted-foreground">{item.label}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter your number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumberState(e.target.value)}
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        {/* Hostel Select */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium leading-none flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                Select Hostel <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setHostelState('boys')}
                                    disabled={isSubmitting}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:bg-accent/50 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        hostel === 'boys'
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-muted bg-card text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    <div className={cn(
                                        "p-3 rounded-full",
                                        hostel === 'boys' ? "bg-primary/20" : "bg-muted"
                                    )}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Boys</span>
                                    {hostel === 'boys' && (
                                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-3 h-3 text-primary-foreground" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setHostelState('girls')}
                                    disabled={isSubmitting}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:bg-accent/50 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        hostel === 'girls'
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-muted bg-card text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    <div className={cn(
                                        "p-3 rounded-full",
                                        hostel === 'girls' ? "bg-primary/20" : "bg-muted"
                                    )}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold">Girls</span>
                                    {hostel === 'girls' && (
                                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-3 h-3 text-primary-foreground" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label
                                htmlFor="instagram"
                                className="text-sm font-medium leading-none flex items-center gap-2"
                            >
                                <Instagram className="w-4 h-4 text-muted-foreground" />
                                Instagram ID <span className="text-red-500">*</span>
                            </label>

                            <Input
                                id="instagram"
                                placeholder="your_instagram_id"
                                value={instagramId}
                                onChange={(e) =>
                                    setInstagramId(
                                        e.target.value
                                            .replace(/\s/g, "")   // no spaces
                                            .replace(/^@/, "")    // strip @ if user types it
                                    )
                                }
                                disabled={isSubmitting}
                                className="h-10"
                            />

                            <p className="text-xs text-muted-foreground">
                                Don't include <span className="font-mono">@</span>, just the username.
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Providing at least one contact detail (phone or Instagram) is mandatory.
                            </p>
                        </div>
                    </CardContent>

                    <p className="text-xs text-muted-foreground px-8 mt-4">
                        Make sure your contact details are correct. This helps us reach you quickly if an item linked to your account is found.
                    </p>

                    <CardFooter className="pt-2 pb-8 px-8">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 text-base font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 mt-4"
                            size="lg"
                        >
                            {isSubmitting ? (
                                'Saving...'
                            ) : (
                                <span className="flex items-center gap-2">
                                    Complete Profile
                                </span>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
