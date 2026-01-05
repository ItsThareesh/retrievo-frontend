import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Item } from "@/types/item";
import { Session } from "next-auth";
import { User as UserType } from "@/types/user";
import { updateItem, createResolution, deleteItem, reportItem } from "@/lib/api/client";
import { validateForm } from "@/lib/utils/validation";

interface UseItemEditableProps {
    item: Item;
    reporter: UserType;
    claim_status: "none" | "pending" | "approved";
    session: Session | null;
}

export function useItemEditable({ item, reporter, claim_status, session }: UseItemEditableProps) {
    const router = useRouter();

    const reasons_map = [
        { value: "spam", label: "Spam post" },
        { value: "harassment", label: "Harassment or bullying" },
        { value: "inappropriate", label: "Inappropriate content" },
        { value: "fake", label: "Fake information" },
        { value: "other", label: "Other" },
    ]

    const [reason, setReason] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isReporting, setIsReporting] = useState(false);

    const [isClaiming, setIsClaiming] = useState(false);
    const [claimText, setClaimText] = useState("");
    const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

    const [myClaimStatus, setMyClaimStatus] = useState(claim_status);

    const [formData, setFormData] = useState({
        title: item.title ?? "",
        location: item.location ?? "",
        description: item.description ?? "",
        category: item.category ?? "",
        visibility: item.visibility ?? "public",
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
    });

    const canEdit = !!session && reporter.public_id === session.user?.public_id;
    const canClaim = item.type === "found" && myClaimStatus === "none" && !canEdit;

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
            toast.success("Item updated successfully");
            setIsEditing(false);
        } else {
            toast.error("Failed to update item");
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

    async function handleClaimSubmit() {
        try {
            if (claimText.trim().length < 20) {
                toast.error("Claim description must be at least 20 characters long.");
                return;
            } else if (claimText.trim().length > 280) {
                toast.error("Claim description must be at most 280 characters long.");
                return;
            }

            setIsSubmittingClaim(true);

            const res = await createResolution(item.id, claimText);

            if (res.ok) {
                toast.success("Claim sent to finder for verification");
                setMyClaimStatus("pending");
                setIsClaiming(false);
                setClaimText("");
            } else if (res.status == 409) {
                toast.error("You have already submitted a claim for this item.");
            } else {
                toast.error("Failed to submit claim. Please try again.");
            }
        } catch {
            toast.error("Failed to submit claim. Please try again.");
        } finally {
            setIsSubmittingClaim(false);
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
                    toast.error("Cannot self-report reason");
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
        isSubmittingClaim,
        myClaimStatus,

        formData,
        setFormData,
        canEdit,
        canClaim,

        handleSave,
        handleCancel,
        handleDelete,
        handleClaimSubmit,
        handleShare,
        handleReport
    };
}
