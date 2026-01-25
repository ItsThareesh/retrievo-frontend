"use client";

import useSWR from "swr";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getResolutions } from "@/lib/api/admin";
import { fetchData } from "@/lib/utils/swrHelper";
import { ClaimsSkeleton } from "./skeletons";
import { ResolutionStatus } from "@/types/resolutions";
import { ResolutionDetail } from "@/types/admin";

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

        case "invalidated":
            return (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Invalidated
                </Badge>
            );

        default:
            return null;
    }
}

export function ResolutionsTab() {
    const { data, isLoading } = useSWR(
        ["resolutions", undefined, 50, 0],
        () => fetchData(() => getResolutions(undefined, 50, 0))
    );

    if (isLoading) {
        return <ClaimsSkeleton />;
    }

    const resolutions: ResolutionDetail[] = data ?? [];

    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <CardTitle>Resolution Moderation</CardTitle>
                <CardDescription>
                    Review all claims and return requests across the platform
                </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2 border-muted">
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Item</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Owner</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Finder</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Status</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Submitted</TableHead>
                            <TableHead className="px-6 py-4 text-right text-sm font-semibold text-foreground">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {resolutions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground py-12 text-sm"
                                >
                                    No resolutions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            resolutions.map((res) => (
                                <TableRow key={res.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="px-6 py-5 align-middle">
                                        <span className="text-sm font-medium text-foreground truncate block max-w-xs">
                                            {res.item_title}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-foreground">{res.owner_name}</div>
                                            <div className="text-xs text-muted-foreground leading-relaxed">
                                                {res.owner_email}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-foreground">{res.finder_name}</div>
                                            <div className="text-xs text-muted-foreground leading-relaxed">
                                                {res.finder_email}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle">
                                        <StatusBadge status={res.status} />
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle">
                                        <span className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(res.created_at), { addSuffix: true })}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-6 py-5 align-middle text-right">
                                        <Button size="sm" variant="outline" className="font-medium" asChild>
                                            <Link href={`/resolution/${res.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}