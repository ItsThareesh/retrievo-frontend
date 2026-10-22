"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, Building2, Clock, ExternalLink, Inbox, Undo2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { getCustodyLog } from "@/lib/api/admin";
import { CustodyLogEntry, CustodyStatus } from "@/types/admin";
import { LOCATION_MAP } from "@/lib/constants/locations";
import { handleBanError } from "@/lib/ban-handler";
import { CustodySkeleton } from "./skeletons";

/** Client-side status filter — the backend log already contains both groups */
type StatusFilter = "all" | CustodyStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "held", label: "At security office" },
    { value: "returned", label: "Returned" },
];

function statusBadge(status: CustodyStatus) {
    if (status === "held") {
        return (
            <Badge className="gap-1 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                <Building2 className="h-3 w-3" />
                At security office
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="gap-1">
            <Undo2 className="h-3 w-3" />
            Returned
        </Badge>
    );
}

function formatTimestamp(ts: string) {
    return format(new Date(ts), "d MMM yyyy, h:mm a");
}

function CustodyEntry({ item }: { item: CustodyLogEntry }) {
    // Hidden-item preview in detail view is allowed for officers now (public
    // items), so returned items link through just like held ones.
    return (
        <div className="flex items-start gap-4 p-5 rounded-lg border bg-card">
            <div className={`p-2 rounded-full mt-1 shrink-0 ${item.status === "held" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-muted"}`}>
                {item.status === "held"
                    ? <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    : <Undo2 className="h-5 w-5 text-muted-foreground" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                        <Link
                            href={`/items/${item.item_id}`}
                            className="font-semibold hover:underline flex items-center gap-1.5 group"
                        >
                            <span>{item.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                            {item.category.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            {" "}· {LOCATION_MAP[item.location as keyof typeof LOCATION_MAP]?.label ?? item.location}
                            {" "}· held by {item.officer_name}
                            {item.original_finder_name && ` · from ${item.original_finder_name}`}
                            {!item.original_finder_name && " · direct-posted at office"}
                        </p>
                    </div>
                    {statusBadge(item.status)}
                </div>

                <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1.5">
                        <Inbox className="h-3.5 w-3.5" />
                        In custody since {formatTimestamp(item.transferred_at)}
                    </span>
                    {item.returned_at && (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Returned {formatDistanceToNow(new Date(item.returned_at), { addSuffix: true })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Custody log - the security officers' admin panel surface.
 *
 * Only custody data: items currently held at the security office and items
 * handed back to their owners. No resolutions, users, or reports — officers
 * bypass the resolution system entirely, so those tabs are admin-only.
 */
export function CustodyLog() {
    const { data: session } = useSession();
    const token = session?.backendToken;
    const [filter, setFilter] = useState<StatusFilter>("all");

    const { data, isLoading, error } = useSWR(
        token ? ["custody-log", token] : null,
        ([, t]) => getCustodyLog(t),
    );

    const entries = useMemo(() => {
        const rows = data ?? [];
        return filter === "all" ? rows : rows.filter((entry) => entry.status === filter);
    }, [data, filter]);

    const heldCount = useMemo(
        () => (data ?? []).filter((entry) => entry.status === "held").length,
        [data],
    );

    if (error && !handleBanError(error)) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    Failed to load the custody log. Please try again later.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                <div>
                    <CardTitle className="text-xl">Custody Log</CardTitle>
                    <CardDescription className="mt-1.5">
                        Items held at the security office and those returned
                        {" "}· <span className="font-medium">{heldCount}</span> currently held
                    </CardDescription>
                </div>
                <div className="flex gap-1">
                    {FILTERS.map((f) => (
                        <Button
                            key={f.value}
                            size="sm"
                            variant={filter === f.value ? "default" : "outline"}
                            onClick={() => setFilter(f.value)}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
            </div>
            <CardContent className="px-6 pt-6 pb-6">
                {!data && isLoading ? (
                    <CustodySkeleton />
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                        <Archive className="h-8 w-8" />
                        <p className="text-sm">
                            {data && data.length > 0
                                ? "No items match this filter"
                                : "No items in security office custody"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries.map((entry) => (
                            <CustodyEntry key={entry.item_id} item={entry} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
