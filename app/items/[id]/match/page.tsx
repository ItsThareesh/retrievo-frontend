'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_ITEMS, MOCK_USER } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Send, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Find the lost item being viewed
    const lostItem = MOCK_ITEMS.find((i) => i.id == id);

    // Filter for items found by the current user
    const userFoundItems = MOCK_ITEMS.filter(
        (item) => item.type === 'found' && (item.finderId === MOCK_USER.id && item.category === lostItem?.category)
    );

    if (!lostItem) {
        return (
            <div className="container mx-auto p-8 min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <p className="text-3xl font-semibold text-center">Item not found</p>
            </div>
        );
    }

    const handleNotify = async () => {
        if (!selectedItemId) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        alert('Notification sent to the owner! They will review your match.');
        router.push(`/items/${id}`);
    };

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header Section */}
            <div className="border-b sticky top-0 backdrop-blur-xl bg-background/80">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                        <Link href={`/items/${id}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <h1 className="font-semibold text-lg">Suggest a Match</h1>
                    <div className="w-16" /> {/* Spacer for centering */}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg text-sm flex gap-3 items-center justify-center text-center">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>
                        Select the item from your inventory that you believe matches this lost report.
                        The owner will be notified to verify.
                    </p>
                </div>

                {/* Found Items */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Your Found Items
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            {userFoundItems.length} items available
                        </span>
                    </div>

                    {userFoundItems.length > 0 ? (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {userFoundItems.map((item) => {
                                const isSelected = selectedItemId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItemId(item.id)}
                                        className={`
                                        group relative cursor-pointer rounded-xl border bg-card transition-all duration-200 overflow-hidden
                                        ${isSelected
                                                ? 'border-primary hover:shadow-sm'
                                                : 'border-border hover:border-primary/50 hover:shadow-sm'
                                            }
                                        `}>
                                        <div className="flex gap-4 p-3">
                                            <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0 py-1">
                                                <h3 className={`font-medium truncate pr-6 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1 truncate">{item.category}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.location}</p>
                                            </div>

                                            <div className="absolute top-3 right-3 h-5 w-5 rounded-full border flex items-center justify-center transition-colors">
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
                            <h3 className="font-semibold text-lg mb-2">No Found Items</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                You haven't reported any found items yet.
                            </p>
                            <Button asChild>
                                <Link href="/lost/new">Report Found Item</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-none p-4 bg-background/80  shadow-lg
                backdrop-blur-lg border-t z-50 lg:max-w-5xl lg:rounded-xl lg:border lg:shadow-xl lg:bottom-4">
                <div className="flex items-center gap-4 w-full px-0 sm:px-4">
                    <div className="flex gap-3 w-full sm:w-auto ml-auto">
                        <Button
                            className="flex-1 sm:flex-none min-w-[140px]"
                            disabled={!selectedItemId || isSubmitting}
                            onClick={handleNotify}
                        >
                            {isSubmitting ? (
                                "Sending..."
                            ) : (
                                <>
                                    Notify Owner
                                    <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
}