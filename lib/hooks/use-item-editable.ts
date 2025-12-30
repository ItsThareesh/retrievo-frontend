import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Item } from "@/types/item";
import { Session } from "next-auth";
import { User as UserType } from "@/types/user";
import { updateItem, createResolution, deleteItem } from "@/lib/api/client";
import { validateForm } from "@/lib/utils/validation";

interface UseItemEditableProps {
    item: Item;
    reporter: UserType;
    claim_status: "none" | "pending" | "approved";
    session: Session | null;
}

export function useItemEditable({ item, reporter, claim_status, session }: UseItemEditableProps) {
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

            const oldValue = key === "date" ?
                new Date(item.date).toISOString().slice(0, 10) : item[key] ?? "";

            if (newValue !== oldValue) {
                updates[key] =
                    key === "date" ? new Date(newValue).toISOString() : newValue;
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
                toast.success("Share sheet opened");
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied to clipboard");
            }
        } catch (err) {
            toast.error("Failed to share link");
        }
    }

    return {
        isEditing,
        setIsEditing,
        isDeleting,
        setIsDeleting,
        isSaving,
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
        handleShare
    };
}
