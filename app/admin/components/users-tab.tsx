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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { changeUserRole, moderateUser } from "@/lib/api/admin";
import { UserDetail, UserRole } from "@/types/admin";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { UsersSkeleton } from "./skeletons";
import { getUsers } from "@/lib/api/admin";
import { handleBanError } from "@/lib/ban-handler";
import { APIError } from "@/lib/api-error";
import { toast } from "sonner";

import { useDebouncedValue } from "@/lib/hooks/useDebounce";

const PAGE_SIZE = 20;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: "student", label: "Student" },
    { value: "staff", label: "Staff" },
    { value: "admin", label: "Admin" },
    { value: "security_officer", label: "Security Officer" },
];

function roleLabel(role: string) {
    return ROLE_OPTIONS.find((opt) => opt.value === role)?.label ?? role;
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
    // Backend rejects admin self-moderation (400); mirror that here so the
    // buttons read as unavailable instead of erroring on submit. Emails are
    // unique in the users table, so this pins the caller's own row exactly.
    const selfEmail = session?.user?.email;
    // Role management is pure-admin (POST /admin/users/{id}/role is gated by
    // get_require_admin). Render the select admin-only anyway so a non-admin
    // panel session never even shows an actionable control.
    const canChangeRoles = session?.user?.role === "admin";
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

    const handleRoleChange = async (userId: number, role: UserRole) => {
        try {
            await changeUserRole(userId, role, session?.backendToken);
            toast.success("Role updated — the user will be signed out on all devices");
            onUpdate();
        } catch (error) {
            if (handleBanError(error)) return;
            toast.error(error instanceof APIError && error.message ? error.message : "Failed to change role");
            onUpdate();
        }
    };

    const banButton = (user: UserDetail) => {
        const isSelf = !!selfEmail && user.email === selfEmail;
        if (!user.is_banned) {
            return (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isSelf}
                        title={isSelf ? "You can't warn your own account" : undefined}
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
                        disabled={isSelf}
                        title={isSelf ? "You can't ban your own account" : undefined}
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
                disabled={isSelf}
                title={isSelf ? "You can't unban your own account" : undefined}
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
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Role</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Phone</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Posts</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Flags</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Warnings</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Status</TableHead>
                        <TableHead className="px-6 py-4 text-sm font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground py-12 text-sm">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => {
                            const isSelf = !!selfEmail && user.email === selfEmail;
                            return (
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
                                        {selfEmail && user.email === selfEmail && (
                                            <Badge variant="outline" className="shrink-0 text-xs bg-muted">
                                                You
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle max-w-[220px]">
                                    <span className="text-sm text-muted-foreground block truncate">{user.email}</span>
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle">
                                    {canChangeRoles ? (
                                        <Select
                                            value={user.role}
                                            disabled={isSelf}
                                            onValueChange={(role: string) => {
                                                if (role === user.role) return;
                                                confirmAction(
                                                    () => handleRoleChange(user.id, role as UserRole),
                                                    "Change Role",
                                                    `Change ${user.name}'s role from ${roleLabel(user.role)} to ${roleLabel(role)}? This signs them out on all devices.`
                                                );
                                            }}
                                        >
                                            <SelectTrigger
                                                size="sm"
                                                className="w-[140px] bg-background border-muted-foreground/20"
                                                title={isSelf ? "You can't change your own role" : roleLabel(user.role)}
                                                aria-label={`Role of ${user.name}`}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROLE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="outline" className="bg-muted text-xs">
                                            {roleLabel(user.role)}
                                        </Badge>
                                    )}
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
                            );
                            })
                        )}
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
        // Over-fetch by one row: a full page means another page exists.
        // No COUNT query needed on the backend.
        ([, search, p, t]) => getUsers(search, p * PAGE_SIZE, PAGE_SIZE + 1, t),
        { keepPreviousData: true },
    );

    const rows = data ?? [];
    const hasMore = rows.length > PAGE_SIZE;
    const users = rows.slice(0, PAGE_SIZE);

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
                        {(users.length > 0 || page > 0) && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-2 border-t">
                                <p className="text-sm text-muted-foreground">
                                    {users.length > 0
                                        ? `Showing ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + users.length}`
                                        : "No more users"}
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
        </Card>
    );
}
