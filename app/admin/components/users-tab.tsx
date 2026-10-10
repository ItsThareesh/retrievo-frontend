"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { AlertCircle, Ban, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { moderateUser } from "@/lib/api/admin";
import { UserDetail } from "@/types/admin";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { UsersSkeleton } from "./skeletons";
import { getUsers } from "@/lib/api/admin";
import { handleBanError } from "@/lib/ban-handler";

import { useDebouncedValue } from "@/lib/hooks/useDebounce";

const PAGE_SIZE = 20;

/** 0-based sliding window of up to 5 page numbers around the current page */
function getPageNumbers(current: number, totalPages: number): number[] {
    const start = Math.max(0, Math.min(current - 2, totalPages - 5));
    const end = Math.min(totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function UsersTable({ users, onUpdate }: { users: UserDetail[], onUpdate: () => void }) {
    const { data: session } = useSession();
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        action: () => Promise<void>;
        title: string;
        description: string;
    }>({ open: false, action: async () => { }, title: "", description: "" });

    const handleModerateUser = async (
        userId: number,
        action: "warn" | "temp_ban" | "perm_ban" | "unban",
        reason?: string
    ) => {
        try {
            await moderateUser(userId, { action, reason, ban_days: 7 }, session?.backendToken);
            onUpdate();
        } catch (error) {
            if (handleBanError(error)) return;
            console.error("Failed to moderate user:", error);
        }
    };

    const confirmAction = (action: () => Promise<void>, title: string, description: string) => {
        setActionDialog({ open: true, action, title, description });
    };

    const banButton = (user: UserDetail) => {
        if (!user.is_banned) {
            return (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            confirmAction(
                                () => handleModerateUser(user.id, "warn"),
                                "Warn User",
                                `Add a warning to ${user.name}'s account?`
                            )
                        }
                    >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Warn
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() =>
                            confirmAction(
                                () =>
                                    handleModerateUser(
                                        user.id,
                                        "temp_ban",
                                        "Temporary ban"
                                    ),
                                "Temporary Ban",
                                `Temporarily ban ${user.name} for 7 days?`
                            )
                        }
                    >
                        <Ban className="h-3 w-3 mr-1" />
                        Ban
                    </Button>
                </>
            );
        }

        return (
            <Button
                size="sm"
                variant="outline"
                onClick={() =>
                    confirmAction(
                        () => handleModerateUser(user.id, "unban"),
                        "Unban User",
                        `Remove ban from ${user.name}?`
                    )
                }
            >
                Unban
            </Button>
        );
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-b-2 border-muted">
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">User</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Email</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Phone</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Posts</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Reports</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Warnings</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Status</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-12 text-sm">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="px-6 py-5 align-middle">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarImage src={user.image || ""} alt={user.name} />
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <Link href={`/profile/${user.public_id}`} className="text-sm font-medium text-foreground hover:underline truncate max-w-[180px]">
                                            {user.name}
                                        </Link>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle max-w-[220px]">
                                    <span className="text-sm text-muted-foreground block truncate">{user.email}</span>
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle max-w-[160px]">
                                    {user.phone ? (
                                        <span className="text-sm text-foreground block truncate">{user.phone}</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle text-center">
                                    <span className="text-sm text-foreground">{user.items_posted}</span>
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle text-center">
                                    {user.reports_received > 0 ? (
                                        <span className="text-sm font-medium text-red-600">
                                            {user.reports_received}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">0</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle text-center">
                                    {user.warning_count > 0 ? (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                                            {user.warning_count}
                                        </Badge>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">0</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle">
                                    {user.is_banned ? (
                                        <Badge variant="destructive" className="text-xs">
                                            <Ban className="h-3 w-3 mr-1" />
                                            Banned
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                            Active
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle text-right">
                                    <div className="flex gap-2 justify-end">
                                        {banButton(user)}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )))}
                </TableBody>
            </Table>

            <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{actionDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>{actionDialog.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                await actionDialog.action();
                                setActionDialog({ ...actionDialog, open: false });
                            }}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function UsersTab() {
    const { data: session } = useSession();
    const token = session?.backendToken;
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 500);
    const [page, setPage] = useState(0);

    const { data, isLoading, isValidating, mutate } = useSWR(
        token ? ['users', debouncedSearch, page, token] : null,
        ([, search, p, t]) => getUsers(search, p * PAGE_SIZE, PAGE_SIZE, t),
        { keepPreviousData: true },
    );

    const users = data?.users ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <Card>
            <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                <div>
                    <CardTitle className="text-xl">User Management</CardTitle>
                    <CardDescription className="mt-1.5">Monitor and moderate platform users</CardDescription>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-200" />
                    <Input
                        type="search"
                        placeholder="Search by name, email, or phone"
                        className="pl-9 bg-background border-muted-foreground/20 placeholder:text-neutral-500 transition-all duration-200 focus:border-primary/50"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                    />
                </div>
            </div>
            <CardContent className="px-6 pt-6 pb-6">
                {!data && isLoading ? (
                    <UsersSkeleton />
                ) : (
                    <>
                        <UsersTable users={users} onUpdate={mutate} />
                        {total > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-2 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} users
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
                                    {getPageNumbers(page, totalPages).map((p) => (
                                        <Button
                                            key={p}
                                            size="sm"
                                            variant={p === page ? "default" : "outline"}
                                            aria-label={`Page ${p + 1}`}
                                            aria-current={p === page ? "page" : undefined}
                                            onClick={() => setPage(p)}
                                        >
                                            {p + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        aria-label="Next page"
                                        disabled={page >= totalPages - 1}
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
        </Card>
    );
}
