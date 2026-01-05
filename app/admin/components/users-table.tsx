"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { moderateUser } from "@/lib/api/admin";
import { UserDetail } from "@/types/admin";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function UsersTable({ users, onUpdate }: { users: UserDetail[], onUpdate: () => void }) {
    const router = useRouter();
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
                                        "Temporary ban - admin action"
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
                    <TableRow>
                        <TableHead className="px-4 py-4">User</TableHead>
                        <TableHead className="px-4 py-4">Email</TableHead>
                        <TableHead className="px-4 py-4">Items Posted</TableHead>
                        <TableHead className="px-4 py-4">Reports</TableHead>
                        <TableHead className="px-4 py-4">Warnings</TableHead>
                        <TableHead className="px-4 py-4">Status</TableHead>
                        <TableHead className="px-4 py-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="px-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.image} alt={user.name} />
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{user.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground px-4 py-5">
                                    {user.email}
                                </TableCell>
                                <TableCell className="px-4 py-5">{user.items_posted}</TableCell>
                                <TableCell className="px-4 py-5">
                                    {user.reports_received > 0 ? (
                                        <span className="font-medium text-red-600">
                                            {user.reports_received}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">0</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    {user.warning_count > 0 ? (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                            {user.warning_count}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">0</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    {user.is_banned ? (
                                        <Badge variant="destructive">
                                            <Ban className="h-3 w-3 mr-1" />
                                            Banned
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            Active
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    <div className="flex gap-2">
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
