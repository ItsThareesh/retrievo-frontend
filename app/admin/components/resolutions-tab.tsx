"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    AlertTriangle,
    Archive,
    ChevronLeft,
    ChevronRight,
    ListFilter,
    Search,
} from "lucide-react";

import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { useSession } from "next-auth/react";
import { getAdminResolutions } from "@/lib/api/admin";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";
import { ClaimsSkeleton } from "./skeletons";
import { ResolutionStatus } from "@/types/resolutions";
import { ResolutionDetail } from "@/types/admin";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "return_initiated", label: "Return initiated" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "invalidated", label: "Invalidated" },
    { value: "expired", label: "Expired" },
    { value: "pending_admin_review", label: "Admin review" },
];

function StatusBadge({ status }: { status: ResolutionStatus }) {
    switch (status) {
        case "pending":
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                </Badge>
            );

        case "approved":
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approved
                </Badge>
            );

        case "completed":
            return (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                </Badge>
            );

        case "return_initiated":
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Return Initiated
                </Badge>
            );

        case "rejected":
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejected
                </Badge>
            );

        case "failed":
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Failed
                </Badge>
            );

        case "invalidated":
            return (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Invalidated
                </Badge>
            );

        case "pending_admin_review":
            return (
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Admin Review
                </Badge>
            );

        case "expired":
            return (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Expired
                </Badge>
            );

        default:
            return null;
    }
}

export function ResolutionsTab() {
    const router = useRouter();
    const { data: session } = useSession();
    const token = session?.backendToken;
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebouncedValue(searchQuery, 500);
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(0);

    const { data, isLoading, isValidating } = useSWR(
        token ? ["resolutions", debouncedSearch, status, page, token] : null,
        // Over-fetch by one row: a full page means another page exists.
        // No COUNT query needed on the backend.
        ([, search, s, p, t]) => getAdminResolutions(search, s, p * PAGE_SIZE, PAGE_SIZE + 1, t),
        { keepPreviousData: true },
    );

    const rows: ResolutionDetail[] = data ?? [];
    const hasMore = rows.length > PAGE_SIZE;
    const resolutions = rows.slice(0, PAGE_SIZE);

    if (!data && isLoading) {
        return <ClaimsSkeleton />;
    }

    return (
        <Card>
            <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                <div>
                    <CardTitle className="text-xl">Resolution Moderation</CardTitle>
                    <CardDescription className="mt-1.5">
                        Review all claims and return requests across the platform
                    </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Select
                        value={status}
                        onValueChange={(value) => {
                            setStatus(value);
                            setPage(0);
                        }}
                    >
                        <SelectTrigger
                            aria-label="Filter by resolution status"
                            className="w-full sm:w-auto bg-background border-muted-foreground/20 gap-2"
                        >
                            <ListFilter className="h-4 w-4 shrink-0" />
                            {status === "all" ? null : <SelectValue />}
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-200" />
                        <Input
                            type="search"
                            placeholder="Search by claimant, finder, or item title"
                            className="pl-9 bg-background border-muted-foreground/20 placeholder:text-neutral-500 transition-all duration-200 focus:border-primary/50"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                </div>
            </div>

            <CardContent className="px-6 pt-6 pb-6">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2 border-muted">
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Lost Item</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Found Item</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Claimant</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Finder</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Status</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Archived</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground whitespace-nowrap">Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resolutions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground py-12 text-sm"
                                >
                                    No resolutions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            resolutions.map((res) => (
                                <TableRow
                                    key={res.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => router.push(`/resolution/${res.id}`)}
                                >
                                    <TableCell className="px-6 py-5 align-middle">
                                        <div className="space-y-1">
                                            {res.lost_item_id ? (
                                                <Link
                                                    href={`/items/${res.lost_item_id}`}
                                                    className="text-sm font-medium text-foreground hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {res.lost_item_title || "N/A"}
                                                </Link>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">N/A</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle">
                                        <div className="space-y-1">
                                            {res.found_item_id ? (
                                                <Link
                                                    href={`/items/${res.found_item_id}`}
                                                    className="text-sm font-medium text-foreground hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {res.found_item_title || "N/A"}
                                                </Link>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">N/A</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle max-w-[200px]">
                                        <div className="space-y-1 min-w-0">
                                            <Link
                                                href={`/profile/${res.owner_id}`}
                                                className="text-sm font-medium text-foreground hover:underline block truncate"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {res.owner_name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground leading-relaxed truncate">
                                                {res.owner_email}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle max-w-[200px]">
                                        <div className="space-y-1 min-w-0">
                                            <Link
                                                href={`/profile/${res.finder_id}`}
                                                className="text-sm font-medium text-foreground hover:underline block truncate"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {res.finder_name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground leading-relaxed truncate">
                                                {res.finder_email}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle">
                                        <StatusBadge status={res.status} />
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle">
                                        {res.archived ? (
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Archive className="h-3.5 w-3.5" />
                                                <span>Archived</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground/50">—</span>
                                        )}
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle whitespace-nowrap">
                                        <span className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(res.created_at), { addSuffix: true })}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {(resolutions.length > 0 || page > 0) && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                            {resolutions.length > 0
                                ? `Showing ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + resolutions.length}`
                                : "No more resolutions"}
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
            </CardContent>
        </Card>
    );
}