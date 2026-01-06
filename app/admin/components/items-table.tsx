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
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { moderateItem } from "@/lib/api/admin";
import { ReportedItemDetail } from "@/types/admin";

export function ItemsTable({ items, onUpdate }: { items: ReportedItemDetail[], onUpdate: () => void }) {
    const router = useRouter();
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        action: () => Promise<void>;
        title: string;
        description: string;
    }>({ open: false, action: async () => { }, title: "", description: "" });

    async function handleModerateItem(itemId: string, action: "hide" | "restore" | "delete") {
        try {
            await moderateItem(itemId, { action });
            onUpdate();
        } catch (error) {
            console.error("Failed to moderate item:", error);
        }
    }

    function confirmAction(action: () => Promise<void>, title: string, description: string) {
        setActionDialog({ open: true, action, title, description });
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-4 py-4">Item</TableHead>
                        <TableHead className="px-4 py-4">Type</TableHead>
                        <TableHead className="px-4 py-4">Owner</TableHead>
                        <TableHead className="px-4 py-4">Reports</TableHead>
                        <TableHead className="px-4 py-4">Status</TableHead>
                        <TableHead className="px-4 py-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No reported items
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.item_id}>
                                <TableCell className="font-medium max-w-xs px-4 py-5">
                                    <div>{item.item_title}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {item.reports.slice(0, 2).map((r) => r.reason).join(", ")}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    <Badge variant="outline">
                                        {item.item_type === "lost" ? "Lost" : "Found"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-5">{item.item_owner_name}</TableCell>
                                <TableCell className="px-4 py-5">
                                    <Badge variant="destructive">{item.report_count}</Badge>
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    {item.is_hidden ? (
                                        <Badge variant="outline" className="bg-red-50 text-red-700">
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Hidden
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            <Eye className="h-3 w-3 mr-1" />
                                            Visible
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.push(`/items/${item.item_id}`)
                                            }
                                        >
                                            View Item
                                        </Button>
                                        {!item.is_hidden ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    confirmAction(
                                                        () => handleModerateItem(item.item_id, "hide"),
                                                        "Hide Item",
                                                        `Hide "${item.item_title}" from public view?`
                                                    )
                                                }
                                            >
                                                <EyeOff className="h-3 w-3 mr-1" />
                                                Hide
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    confirmAction(
                                                        () => handleModerateItem(item.item_id, "restore"),
                                                        "Restore Item",
                                                        `Restore "${item.item_title}" to public view?`
                                                    )
                                                }
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                Restore
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600"
                                            onClick={() =>
                                                confirmAction(
                                                    () => handleModerateItem(item.item_id, "delete"),
                                                    "Delete Item",
                                                    `Permanently delete "${item.item_title}"? This action cannot be undone.`
                                                )
                                            }
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
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
