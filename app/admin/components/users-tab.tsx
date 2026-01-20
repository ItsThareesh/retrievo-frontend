"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { AlertCircle, Ban } from "lucide-react";
import { getUsers, moderateUser } from "@/lib/api/admin";
import { UserDetail } from "@/types/admin";
import useSWR from "swr";
import { UsersSkeleton } from "./skeletons";
import { fetchData } from "@/lib/utils/swrHelper";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function UsersTable({ users, onUpdate }: { users: UserDetail[], onUpdate: () => void }) {
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
            await moderateUser(userId, { action, reason, ban_days: 7 });
            onUpdate();
        } catch (error) {
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
                                        "Temporary ban - Admin action"
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
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-12 text-sm">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="px-6 py-5 align-middle">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.image} alt={user.name} />
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm font-medium text-foreground">{user.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5 align-middle">
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
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
    const { data: users, isLoading, mutate } = useSWR(['users', 50, 0], () => fetchData(() => getUsers(50, 0)));

    if (isLoading) {
        return <UsersSkeleton />;
    }

    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <CardTitle>User Management</CardTitle>
                <CardDescription>Monitor and moderate platform users</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <UsersTable users={users || []} onUpdate={mutate} />
            </CardContent>
        </Card>
    );
}
