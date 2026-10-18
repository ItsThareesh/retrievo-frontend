"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, GitCompareArrows, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { APIError } from "@/lib/api-error";
import { handleBanError } from "@/lib/ban-handler";
import { useSession } from "next-auth/react";
import { usePtrRefreshHandler } from "@/components/pull-to-refresh";
import { getItem, getItemMatches } from "@/lib/api/items";
import { ItemCard } from "@/components/item-card";
import { PotentialMatchEntry } from "@/types/item";

function matchedChip(match: PotentialMatchEntry) {
    return (
        <span className="pointer-events-none flex items-center gap-1.5 text-[10px] font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
            <GitCompareArrows className="w-3 h-3" />
            Matched {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
        </span>
    );
}

export default function ItemMatchesPage() {    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.backendToken;

    const params = useParams();
    const id = params.id as string;

    const [itemTitle, setItemTitle] = useState<string | null>(null);
    const [matches, setMatches] = useState<PotentialMatchEntry[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadGenRef = useRef(0);

    const load = useCallback(async () => {
        if (!id || sessionStatus === "loading") return;
        const gen = ++loadGenRef.current;

        setLoading(true);
        setError(false);
        try {
            // Run both reads; a 403 from the matches endpoint means non-owner —
            // the page is owner-gated, route them to the item itself instead.
            const [itemRes, matchRes] = await Promise.all([
                getItem(id, token),
                getItemMatches(id, token).catch((err) => {
                    if (err instanceof APIError && err.status === 403) {
                        return "FORBIDDEN" as const;
                    }
                    throw err;
                }),
            ]);
            if (gen !== loadGenRef.current) return;

            if (matchRes === "FORBIDDEN") {
                router.replace(`/items/${id}`);
                return;
            }

            setItemTitle(itemRes.item.title);
            setMatches(matchRes.matches);
        } catch (err) {
            if (gen !== loadGenRef.current) return;
            if (err instanceof APIError && err.code === "USER_BANNED") {
                handleBanError(err);
                return;
            }
            if (err instanceof APIError && err.status === 401) {
                // Session expired or no session — same treatment as the item page.
                router.push(`/auth/signin?callbackUrl=/items/${id}/matches`);
                return;
            }
            setError(true);
        } finally {
            if (gen === loadGenRef.current) setLoading(false);
        }
    }, [id, token, sessionStatus, router]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const ptrReload = useCallback((): Promise<void> => load(), [load]);
    usePtrRefreshHandler(ptrReload);

    const count = matches?.length ?? 0;

    function handleBack() {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(`/items/${id}`);
        }
    }

    return (
        <div className="container mx-auto px-4 md:px-10 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex items-center gap-2 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="cursor-pointer shrink-0"
                    aria-label="Back to item"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight truncate">
                        {loading || !itemTitle ? "Matches" : "Potential Matches"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {loading
                            ? "Checking for related reports…"
                            : count === 1
                                ? "1 related report found"
                                : `${count} related reports found`}
                    </p>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-2">
                    {[0, 1, 2].map((i) => (
                        <Card key={i} className="overflow-hidden border-muted">
                            <Skeleton className="w-full aspect-4/3 rounded-none" />
                            <div className="p-5 space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="p-5 pt-0">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-16 border rounded-lg bg-muted/10 border-dashed border-muted-foreground/20">
                    <p className="text-muted-foreground">Could not load matches. Please try again.</p>
                    <Button variant="outline" size="sm" onClick={load} className="mt-4 cursor-pointer">
                        Try again
                    </Button>
                </div>
            ) : count === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed border-muted-foreground/20">
                    <Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                        No related reports yet. When somebody&apos;s report looks like yours, it shows up here — and
                        you&apos;ll get a notification.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-2 animate-in fade-in-50 duration-500">
                    {matches!.map((match) => (
                        <ItemCard
                            key={match.item.id}
                            item={{
                                ...match.item,
                                description: "",
                                poster_id: "",
                                visibility: match.item.type === "lost" ? "public" : "public",
                            }}
                            type={match.item.type}
                            overlay={matchedChip(match)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
