"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Archive, Building2, ChevronLeft, ChevronRight, Clock, ExternalLink, Eye, EyeOff, Inbox, Trash2, Undo2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { getCustodyLog, moderateItem } from "@/lib/api/admin";
import { CustodyLogEntry, CustodyStatus } from "@/types/admin";
import { LOCATION_MAP } from "@/lib/constants/locations";
import { handleBanError } from "@/lib/ban-handler";
import { APIError } from "@/lib/api-error";
import { toast } from "sonner";
import { CustodySkeleton } from "./skeletons";

/** Server-side status filter (?status= held|returned|unset) */
type StatusFilter = "all" | CustodyStatus;

type ModerationAction = "hide" | "restore" | "delete";

const PAGE_SIZE = 20;

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

function CustodyEntry({
    item,
    canManage,
    onModerate,
}: {
    item: CustodyLogEntry;
    /** Officers manage custody inventory; admins only cross-check the log */
    canManage: boolean;
    onModerate: (item: CustodyLogEntry, action: ModerationAction) => void;
}) {
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

                {canManage && item.status === "held" && (
                    <div className="flex items-center gap-2 mt-3">
                        {item.moderation_hidden ? (
                            <Button variant="default" size="sm" className="gap-2" onClick={() => onModerate(item, "restore")}>
                                <Eye className="h-4 w-4" />
                                Restore
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => onModerate(item, "hide")}>
                                <EyeOff className="h-4 w-4" />
                                Hide
                            </Button>
                        )}
                        <Button variant="destructive" size="sm" className="gap-2" onClick={() => onModerate(item, "delete")}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                )}
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
    const isOfficer = session?.user.role === "security_officer";
    const [filter, setFilter] = useState<StatusFilter>("all");
    const [page, setPage] = useState(0);
    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        item: CustodyLogEntry | null;
        action: ModerationAction;
        isLoading: boolean;
    }>({ isOpen: false, item: null, action: "hide", isLoading: false });

    // Counts reflect the server-filtered, paginated slice. Users-tab style:
    // over-fetch one row so a full page proves another page exists — no
    // backend COUNT query needed.
    const { data, isLoading, isValidating, error, mutate } = useSWR(
        token ? ["custody-log", filter, page, token] : null,
        ([, f, p, t]) => getCustodyLog(f, p * PAGE_SIZE, PAGE_SIZE + 1, t),
        { keepPreviousData: true },
    );

    const rows = data ?? [];
    const hasMore = rows.length > PAGE_SIZE;
    const entries = rows.slice(0, PAGE_SIZE);

    // The "N currently held" summary is only accurate when the whole
    // (unfiltered) dataset has been loaded — display it unclaimed otherwise.
    const fullyLoaded = !hasMore && page === 0 && data !== undefined;
    const heldCount = filter === "all" && fullyLoaded
        ? rows.filter((entry) => entry.status === "held").length
        : null;

    const handleFilterChange = (value: StatusFilter) => {
        setFilter(value);
        setPage(0);
    };

    const ACTION_COPY: Record<ModerationAction, { title: string; description: (title: string) => string }> = {
        hide: {
            title: "Hide Item",
            description: (t) => `Hide "${t}" from the public feed while it sits in custody? You can restore it any time.`,
        },
        restore: {
            title: "Restore Item",
            description: (t) => `Restore "${t}" so it can be handed over to its owner again?`,
        },
        delete: {
            title: "Delete Item",
            description: (t) => `Permanently delete "${t}" from security office custody? This removes its record entirely.`,
        },
    };

    const confirmModerate = (entry: CustodyLogEntry, action: ModerationAction) => {
        setDialog({ isOpen: true, item: entry, action, isLoading: false });
    };

    const handleModerate = async () => {
        const entry = dialog.item;
        if (!entry) return;

        setDialog((prev) => ({ ...prev, isLoading: true }));
        try {
            await moderateItem(entry.item_id, { action: dialog.action }, token);
            const verb = dialog.action === "hide" ? "hidden" : dialog.action === "restore" ? "restored" : "deleted";
            toast.success(`Item ${verb} successfully`);
            mutate();
            setDialog({ isOpen: false, item: null, action: "hide", isLoading: false });
        } catch (err) {
            if (handleBanError(err)) return;
            toast.error(err instanceof APIError && err.message ? err.message : `Failed to ${dialog.action} item`);
            setDialog({ isOpen: false, item: null, action: "hide", isLoading: false });
        }
    };

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
                        {heldCount !== null && (
                            <> · <span className="font-medium">{heldCount}</span> currently held</>
                        )}
                    </CardDescription>
                </div>
                <div className="flex gap-1">
                    {FILTERS.map((f) => (
                        <Button
                            key={f.value}
                            size="sm"
                            variant={filter === f.value ? "default" : "outline"}
                            onClick={() => handleFilterChange(f.value)}
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
                            {page > 0
                                ? "No more items"
                                : (filter !== "all" || rows.length > 0)
                                    ? "No items match this filter"
                                    : "No items in security office custody"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {entries.map((entry) => (
                                <CustodyEntry
                                    key={entry.item_id}
                                    item={entry}
                                    canManage={isOfficer}
                                    onModerate={confirmModerate}
                                />
                            ))}
                        </div>

                        {/* footer spacing: full 1.5rem above and below the divider — matches the card stack rhythm (space-y-3), not the table tabs' mt-2 */}
                        {(entries.length > 0 || page > 0) && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t">
                                <p className="text-sm text-muted-foreground">
                                    {entries.length > 0
                                        ? `Showing ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + entries.length}`
                                        : "No more items"}
                                    {isValidating && <span className="ml-2">Loading…</span>}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        aria-label="Previous page"
                                        disabled={page === 0}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground px-2">
                                        Page {page + 1}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        aria-label="Next page"
                                        disabled={!hasMore}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>

            <AlertDialog open={dialog.isOpen} onOpenChange={(open) => setDialog((prev) => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{ACTION_COPY[dialog.action].title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialog.item ? ACTION_COPY[dialog.action].description(dialog.item.title) : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={dialog.isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={dialog.action === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                            disabled={dialog.isLoading}
                            onClick={async (e) => {
                                // prevent the dialog's default close; handle async ourselves
                                e.preventDefault();
                                await handleModerate();
                            }}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
