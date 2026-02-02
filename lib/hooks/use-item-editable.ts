import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Item } from "@/types/item";
import { Session } from "next-auth";
import { User as UserType } from "@/types/user";
import { updateItem, createResolution, deleteItem, reportItem } from "@/lib/api/client-invoked";
import { validateForm } from "@/lib/utils/validation";
import { reasons_map } from "../constants/report-reasons";
import { ResolutionStatus } from "@/types/resolutions";

interface UseItemEditableProps {
    item: Item;
    reporter: UserType;
    resolution_status: ResolutionStatus | "none";
    session: Session | null;
}

export function useItemEditable({ item, reporter, resolution_status, session }: UseItemEditableProps) {
    const router = useRouter();

    const [reason, setReason] = useState("fake");

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isReporting, setIsReporting] = useState(false);

    const [isClaiming, setIsClaiming] = useState(false);
    const [claimText, setClaimText] = useState("");
    const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

    const [resolutionStatus, setResolutionStatus] = useState(resolution_status);

    const [formData, setFormData] = useState({
        title: item.title ?? "",
        location: item.location ?? "",
        description: item.description ?? "",
        category: item.category ?? "",
        visibility: item.visibility ?? "public",
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
    });

    const isLoggedIn = !!session;
    const isReporter = reporter.public_id === session?.user?.public_id;
    const isFoundItem = item.type === "found";
    const isLostItem = item.type === "lost";
    const hasResolution = resolutionStatus !== "none";

    // Determine permissions
    const canEdit = isLoggedIn && isReporter && !hasResolution;

    const canClaim = isLoggedIn && isFoundItem && !isReporter && !hasResolution;
    const canReturn = isLoggedIn && isLostItem && !isReporter && !hasResolution;

    async function handleSave() {
        setIsSaving(true);

        const validation = validateForm(formData);

        if (!validation.valid) {
            toast.error(validation.message);
            setIsSaving(false);
            return;
        }

        // Calculate diff - only send changed fields
        const updates: Record<string, any> = {};
        let hasChanges = false;

        for (const key of Object.keys(formData) as (keyof typeof formData)[]) {
            const newValue = formData[key];

            if (key === "date") {
                if (!newValue) continue;

                const newDate = new Date(newValue).toISOString().slice(0, 10);
                const oldDate = new Date(item.date).toISOString().slice(0, 10);

                if (newDate !== oldDate) {
                    updates.date = new Date(newValue).toISOString();
                    hasChanges = true;
                }

                continue;
            }

            const oldValue = item[key] ?? "";

            if (newValue !== oldValue) {
                updates[key] = newValue;
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            setIsEditing(false);
            setIsSaving(false);
            return;
        }

        const res = await updateItem(item.id, updates);

        if (res.ok) {
            toast.success("Item updated successfully.");
            setIsEditing(false);

            toast.error("Unable to update the item. Please try again later.");
        }

        setIsSaving(false);
    }


    function handleCancel() {
        setFormData({
            title: item.title ?? "",
            location: item.location ?? "",
            description: item.description ?? "",
            category: item.category ?? "",
            visibility: item.visibility ?? "public",
            date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
        });
        setIsEditing(false);
    }

    async function handleDelete() {
        const res = await deleteItem(item.id);

        if (res.ok) {
            toast.success("Item deleted successfully");

            router.push("/items");
        } else {
            toast.error("Failed to delete item");
        }
        setIsDeleting(false);
    }

    function validateResolutionInput(text: string): string | null {
        const len = text.trim().length;

        if (len < 20) return "Claim description must be at least 20 characters long.";
        if (len > 280) return "Claim description must be at most 280 characters long.";

        return null;
    }

    async function handleResolutionSubmit(item: Item) {
        const error = validateResolutionInput(claimText);
        if (error) {
            toast.error(error);
            return;
        }

        setIsSubmittingResolution(true);

        try {
            const res = await createResolution(item.id, claimText);

            if (!res.ok) {
                if (res.status === 409) {
                    toast.error("You have already submitted a resolution for this item.");
                } else {
                    toast.error("Failed to submit request. Please try again.");
                }
                return;
            }

            // Success handling
            if (item.type === "found") {
                toast.success("Claim sent to finder for verification");
                setResolutionStatus("pending");
            } else {
                toast.success("Return initiation request sent to owner");
                setResolutionStatus("return_initiated");
            }

            // Shared cleanup
            setIsClaiming(false);
            setClaimText("");
        } catch {
            toast.error("Failed to submit request. Please try again.");
        } finally {
            setIsSubmittingResolution(false);
        }
    }

    async function handleShare() {
        const shareUrl = `${window.location.origin}/items/${item.id}`;
        const shareData = {
            title: item.title,
            text: `Check out this ${item.type} item`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied to clipboard");
            }
        } catch (err: any) {
            // User cancelled, then silently ignore
            if (err?.name === "AbortError") return;

            // Real failure
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard");
        }
    }

    async function handleReport() {
        setIsReporting(true);

        try {
            const res = await reportItem(item.id, reason);

            if (res.ok) {
                toast.success("Item reported successfully");
            } else {
                if (res.status === 409) {
                    toast.error("You have already reported this item");
                } else if (res.status === 400) {
                    toast.error("Cannot self-report your own item post");
                } else {
                    toast.error("Failed to report item");
                }
            }
        } finally {
            setIsReporting(false);
            setReason("");
        }
    }

    return {
        reason,
        setReason,
        reasons_map,

        isEditing,
        setIsEditing,
        isDeleting,
        setIsDeleting,
        isSaving,
        isReporting,
        setIsReporting,
        isClaiming,
        setIsClaiming,
        claimText,
        setClaimText,

        isSubmittingResolution,
        resolutionStatus,

        formData,
        setFormData,

        canEdit,
        canClaim,
        canReturn,

        handleSave,
        handleCancel,
        handleDelete,
        handleResolutionSubmit,
        handleShare,
        handleReport
    };
}
