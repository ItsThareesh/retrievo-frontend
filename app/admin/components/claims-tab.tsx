"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { getClaims } from "@/lib/api/admin";
import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";
import { ClaimsSkeleton } from "./skeletons";
import { fetchData } from "@/lib/utils/swrHelper";

export function ClaimsTab() {
    const { data: claims, isLoading } = useSWR(['claims', undefined, 50, 0], () => fetchData(() => getClaims(undefined, 50, 0)));

    if (isLoading) {
        return <ClaimsSkeleton />;
    }

    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <CardTitle>Claims Moderation</CardTitle>
                <CardDescription>Review and moderate item claims</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-4 py-4">Item</TableHead>
                            <TableHead className="px-4 py-4">Claimer</TableHead>
                            <TableHead className="px-4 py-4">Owner</TableHead>
                            <TableHead className="px-4 py-4">Status</TableHead>
                            <TableHead className="px-4 py-4">Submitted</TableHead>
                            <TableHead className="px-4 py-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(claims || []).length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No claims to review
                                </TableCell>
                            </TableRow>
                        ) : (
                            (claims || []).map((claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell className="font-medium max-w-xs truncate px-4 py-5">
                                        {claim.item_title}
                                    </TableCell>
                                    <TableCell className="px-4 py-5">
                                        <div>
                                            <div className="font-medium">{claim.claimer_name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {claim.claimer_email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-5">{claim.item_owner_name}</TableCell>
                                    <TableCell className="px-4 py-5">
                                        {claim.status === "pending" && (
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Pending
                                            </Badge>
                                        )}
                                        {claim.status === "approved" && (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Approved
                                            </Badge>
                                        )}
                                        {claim.status === "rejected" && (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Rejected
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground px-4 py-5">
                                        {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="px-4 py-5">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <a href={`/claims/${claim.id}`}>View</a>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
