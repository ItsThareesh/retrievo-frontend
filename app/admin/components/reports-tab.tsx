"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Flag, ExternalLink, ChevronDown, ChevronUp, Eye, EyeOff, AlertTriangle, Trash2 } from "lucide-react";
import { getReportedItems, moderateItem } from "@/lib/api/admin";
import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";
import { ActivitySkeleton } from "./skeletons";
import { fetchData } from "@/lib/utils/swrHelper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReportedItemDetail } from "@/types/admin";

function ReportedItemCard({
    item,
    isExpanded,
    onToggleExpand,
    onModerate
}: {
    item: ReportedItemDetail;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onModerate: (item: ReportedItemDetail, action: "hide" | "restore" | "delete") => void;
}) {
    const router = useRouter();

    return (
        <div className="rounded-lg border bg-card overflow-x-auto">
            <div className="min-w-[36rem] p-5">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 mt-1">
                        <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => router.push(`/items/${item.id}`)}
                                    className="font-semibold text-base hover:underline flex items-center gap-2 group"
                                >
                                    <span className="truncate">{item.title}</span>
                                    <ExternalLink className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-muted-foreground">
                                        by {item.owner_name}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 select-none">
                                <Badge variant="destructive" className="gap-1">
                                    <Flag className="h-3 w-3" />
                                    {item.report_count} {item.report_count === 1 ? 'report' : 'reports'}
                                </Badge>
                                <Badge>
                                    {item.visibility.charAt(0).toUpperCase() + item.visibility.slice(1)}
                                </Badge>
                                {item.is_hidden && (
                                    <Badge variant="secondary" className="gap-1">
                                        <EyeOff className="h-3 w-3" />
                                        Hidden
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {item.is_hidden && item.hidden_reason && (
                            <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm mb-3">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-medium">Hidden: </span>
                                    <span className="text-muted-foreground">
                                        {item.hidden_reason.replace(/_/g, '-')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onToggleExpand(item.id)}
                                className="gap-2"
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Hide Reports
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        View Reports
                                    </>
                                )}
                            </Button>

                            {item.is_hidden ? (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => onModerate(item, "restore")}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Restore
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onModerate(item, "hide")}
                                    className="gap-2"
                                >
                                    <EyeOff className="h-4 w-4" />
                                    Hide Item
                                </Button>
                            )}

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onModerate(item, "delete")}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Item
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t px-5 py-4 bg-muted/20">
                    <h4 className="font-semibold text-sm mb-3">Reports ({item.reports.length})</h4>
                    <div className="space-y-3">
                        {item.reports.map((report) => (
                            <div
                                key={report.id}
                                className="flex items-start gap-3 p-3 rounded-md bg-card border"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">
                                            {report.reporter_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">Reason:</span> {report.reason}
                                    </p>
                                </div>
                                <Badge
                                    variant={report.status === "pending" ? "secondary" : "outline"}
                                    className="shrink-0 capitalize"
                                >
                                    {report.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function ReportsTab() {
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        view: "confirm_action" | "force_warning";
        itemId: string;
        action: "hide" | "delete" | "restore";
        warningMessage: string;
        isLoading: boolean;
    }>({
        isOpen: false,
        view: "confirm_action",
        itemId: "",
        action: "delete",
        warningMessage: "",
        isLoading: false,
    });
    const { data: reportedItems, isLoading, mutate } = useSWR(['reported-items', 50], () => fetchData(() => getReportedItems(50)));

    const toggleExpanded = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const handleModerateItem = async (itemId: string, action: "hide" | "restore" | "delete", force: boolean = false) => {
        if (modalConfig.isOpen) {
            setModalConfig(prev => ({ ...prev, isLoading: true }));
        }

        const result = await moderateItem(itemId, { action, force }) as any;

        console.log(result);

        if (result.ok) {
            const actionText = action === "hide" ? "hidden" : action === "restore" ? "restored" : "deleted";
            toast.success(`Item ${actionText} successfully`);
            mutate();
            setModalConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
        } else {
            if (
                result.status === 409 &&
                result.errorData?.detail?.code === "ACTIVE_RESOLUTIONS_EXIST"
            ) {
                setModalConfig({
                    isOpen: true,
                    view: "force_warning",
                    itemId,
                    action,
                    warningMessage: result.errorData.detail.message,
                    isLoading: false,
                });
            } else {
                toast.error(result.errorData?.detail || `Failed to ${action} item`);
                setModalConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
            }
        }
    };

    const handleActionClick = (item: ReportedItemDetail, action: "hide" | "restore" | "delete") => {
        if (action === "restore") {
            handleModerateItem(item.id, action);
        } else {
            setModalConfig({
                isOpen: true,
                view: "confirm_action",
                itemId: item.id,
                action: action,
                warningMessage: "",
                isLoading: false
            });
        }
    };

    if (isLoading) {
        return <ActivitySkeleton />;
    }

    return (
        <>
            <Card>
                <CardHeader className="px-6 py-6">
                    <CardTitle>Reported Items</CardTitle>
                    <CardDescription>Review and moderate reported content</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="space-y-4">
                        {(!reportedItems || reportedItems.length === 0) ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Flag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No reported items</p>
                            </div>
                        ) : (
                            reportedItems.map((item) => (
                                <ReportedItemCard
                                    key={item.id}
                                    item={item}
                                    isExpanded={expandedItems.has(item.id)}
                                    onToggleExpand={toggleExpanded}
                                    onModerate={handleActionClick}
                                />
                            ))
                        )}
                    </div>
                </CardContent>
            </Card >

            <AlertDialog
                open={modalConfig.isOpen}
                onOpenChange={(open) => {
                    if (!open && !modalConfig.isLoading) {
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                    }
                }}
            >
                <AlertDialogContent>
                    {modalConfig.view === "confirm_action" ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="capitalize">{modalConfig.action} Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {modalConfig.action === "delete"
                                        ? "This will permanently delete the item. This action cannot be undone."
                                        : "This will hide the item from public view. Are you sure you want to proceed?"}
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="flex justify-end gap-3 mt-4">
                                <AlertDialogCancel disabled={modalConfig.isLoading}>Cancel</AlertDialogCancel>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleModerateItem(modalConfig.itemId, modalConfig.action)}
                                    disabled={modalConfig.isLoading}
                                    className="capitalize"
                                >
                                    {modalConfig.isLoading ? "Processing..." : modalConfig.action}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-5 w-5" />
                                    Warning: Active Resolutions Exist
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-base text-foreground mt-2">
                                    {modalConfig.warningMessage}
                                </AlertDialogDescription>
                                <AlertDialogDescription className="mt-4 font-medium text-destructive">
                                    Are you sure you want to force {modalConfig.action} this item? This will invalidate all active claims.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="flex justify-end gap-3 mt-4">
                                <AlertDialogCancel disabled={modalConfig.isLoading}>Cancel</AlertDialogCancel>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleModerateItem(modalConfig.itemId, modalConfig.action, true)}
                                    disabled={modalConfig.isLoading}
                                    className="font-medium capitalize"
                                >
                                    {modalConfig.isLoading ? "Processing..." : `${modalConfig.action} and Invalidate`}
                                </Button>
                            </div>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}