import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { ImageViewer } from "@/components/image-viewer";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { compressImage } from "@/lib/utils/img-compressor";
import { Pencil, Trash2, Loader2, ImagePlus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Resolution, MAX_CLAIM_EDITS } from "@/types/resolutions";
import {
    uploadResolutionPhoto,
    deleteResolutionPhoto,
    updateClaimDescription,
} from "@/lib/api/resolutions";
import { APIError } from "@/lib/api-error";
import { handleBanError } from "@/lib/ban-handler";
import { cn } from "@/lib/utils";

interface ClaimDescriptionProps {
    resolution: Resolution;
    viewerRole: string;
    token?: string;
    /** Called after a successful edit — the parent refreshes the resolution */
    onEdited: () => void;
}

export function ClaimDescription({ resolution, viewerRole, token, onEdited }: ClaimDescriptionProps) {
    // Claimant-only edits, deciding window only, shared budget (backend syncs:
    // `pending` / `return_initiated`, MAX_CLAIM_EDITS = 5 across description + photo)
    const isClaimant =
        (resolution.type === "owner_initiated" && viewerRole === "owner") ||
        (resolution.type === "finder_initiated" && viewerRole === "finder");
    const isDecidingWindow =
        resolution.status === "pending" || resolution.status === "return_initiated";
    const editsRemaining = MAX_CLAIM_EDITS - (resolution.content_edit_count ?? 0);
    const canEdit = isClaimant && isDecidingWindow && editsRemaining > 0;

    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);

    const [isCompressing, setIsCompressing] = useState(false);
    const [photoBusy, setPhotoBusy] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    const claimPhotoLabel =
        resolution.type === "owner_initiated"
            ? "Owner's evidence photo"
            : "Finder's proof-of-possession photo";

    async function saveDescription() {
        const clean = draft.trim();
        const clearing = clean.length === 0;
        const dualItem = !!(resolution.lost_item_id && resolution.found_item_id);

        if (clearing && !dualItem) {
            toast.error("Description is required when no counterpart item is linked");
            return;
        }
        if (!clearing && (clean.length < 20 || clean.length > 280)) {
            toast.error("Description must be 20-280 characters long.");
            return;
        }

        setSaving(true);
        try {
            await updateClaimDescription(resolution.id, clearing ? null : clean, token);
            setEditing(false);
            toast.success("Claim updated.");
            onEdited();
        } catch (err) {
            if (handleBanError(err)) return;
            toast.error(
                err instanceof APIError && err.message
                    ? err.message
                    : "Failed to update the claim. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        e.target.value = "";
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Original image must be under 10MB. Please choose a smaller image.");
            return;
        }

        setIsCompressing(true);
        try {
            const compressed = await compressImage(file);
            if (compressed.size > 1 * 1024 * 1024) {
                toast.error("Unable to compress image under 1MB. Please choose a smaller or simpler image.");
                return;
            }

            setPhotoBusy(true);
            await uploadResolutionPhoto(resolution.id, compressed, token);
            toast.success(
                resolution.claim_photo ? "Claim photo replaced." : "Claim photo attached."
            );
            onEdited();
        } catch (err) {
            if (handleBanError(err)) return;
            toast.error(
                err instanceof APIError && err.message
                    ? err.message
                    : "Failed to attach the photo. Please try again."
            );
        } finally {
            setIsCompressing(false);
            setPhotoBusy(false);
        }
    }

    async function handleRemovePhoto() {
        setShowRemoveConfirm(false);
        setPhotoBusy(true);
        try {
            await deleteResolutionPhoto(resolution.id, token);
            toast.success("Claim photo removed.");
            onEdited();
        } catch (err) {
            if (handleBanError(err)) return;
            toast.error(
                err instanceof APIError && err.message
                    ? err.message
                    : "Failed to remove the photo. Please try again."
            );
        } finally {
            setPhotoBusy(false);
        }
    }

    return (
        <Card className={`p-4 sm:p-6 border-3 border-t border-r bg-muted/20 shadow-sm`}>
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">Claim details</h2>
                {canEdit && !editing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer shrink-0 h-8"
                        disabled={photoBusy || isCompressing}
                        onClick={() => {
                            setDraft(resolution.description ?? "");
                            setEditing(true);
                        }}
                    >
                        <Pencil className="size-3.5" />
                        Edit
                    </Button>
                )}
            </div>

            {editing ? (
                <div className="space-y-2">
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Describe details that prove your claim — marks, contents, damage, when you lost it, etc."
                        className="min-h-[120px] text-sm resize-none"
                        maxLength={280}
                        disabled={saving}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{draft.trim().length}/280</span>
                        <span className={cn(editsRemaining <= 1 && "text-destructive font-medium")}>
                            {editsRemaining} of {MAX_CLAIM_EDITS} claim edits left
                            <span className="text-muted-foreground/60"> (description + photo)</span>
                        </span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            disabled={saving}
                            onClick={() => setEditing(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="cursor-pointer"
                            disabled={saving}
                            onClick={saveDescription}
                        >
                            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                        </Button>
                    </div>
                </div>
            ) : (
                resolution.description ? (
                    <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                        {resolution.description}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        No description provided.
                    </p>
                )
            )}

            {/* Claimant evidence photo — see plan-claim-photos.md */}
            {resolution.claim_photo || canEdit ? (
                <div className="mt-4 pt-4 border-t">
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                        {claimPhotoLabel}
                    </Label>

                    {resolution.claim_photo ? (
                        <div className={cn("relative w-full aspect-video max-h-[300px] rounded-lg overflow-hidden border", (photoBusy || isCompressing) && "opacity-60")}>
                            <ImageViewer src={resolution.claim_photo} alt={claimPhotoLabel}>
                                <div className="absolute inset-0">
                                    <Image
                                        src={resolution.claim_photo}
                                        alt={claimPhotoLabel}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 448px"
                                        className="object-cover" />
                                </div>
                            </ImageViewer>
                            {photoBusy && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/40 z-10">
                                    <Loader2 className="size-6 animate-spin text-foreground" />
                                </div>
                            )}
                        </div>
                    ) : canEdit && (
                        <Button
                            type="button"
                            variant="outline"
                            className="relative flex w-full items-center gap-3 px-4 py-6 cursor-pointer hover:bg-muted/50"
                            disabled={photoBusy || isCompressing}
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/60">
                                {photoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4 text-muted-foreground" />}
                            </span>
                            <span className="text-left">
                                <span className="block text-sm font-medium">
                                    {resolution.type === "owner_initiated"
                                        ? "Add your evidence photo"
                                        : "Add a proof-of-possession photo"}
                                </span>
                                <span className="block text-xs text-muted-foreground/70">Take a photo or choose from gallery</span>
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={photoBusy || isCompressing}
                                onChange={handlePhotoSelect}
                            />
                        </Button>
                    )}

                    {canEdit && resolution.claim_photo && (
                        <div className="flex items-center gap-2 mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="relative cursor-pointer"
                                disabled={photoBusy || isCompressing}
                            >
                                <ImagePlus className="size-3.5" />
                                {isCompressing ? "Compressing..." : "Replace"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={photoBusy || isCompressing}
                                    onChange={handlePhotoSelect}
                                />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer text-destructive hover:text-destructive"
                                disabled={photoBusy || isCompressing}
                                onClick={() => setShowRemoveConfirm(true)}
                            >
                                <Trash2 className="size-3.5 mr-1.5" />
                                Remove
                            </Button>
                        </div>
                    )}

                    {canEdit && (
                        <p className="text-xs text-muted-foreground/60 mt-2">
                            {resolution.type === "owner_initiated"
                                ? "Anything that shows it's yours — an old shot of you with it, a close-up of distinguishing marks, etc."
                                : "A quick shot of you with the item in hand is the clearest proof."}
                        </p>
                    )}
                </div>
            ) : null}

            <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(resolution.created_at), {
                        addSuffix: true,
                    })}
                </p>
                {canEdit && (
                    <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                        <Clock className="size-3" />
                        {editsRemaining} of {MAX_CLAIM_EDITS} claim edits left
                    </p>
                )}
            </div>

            <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove the claim photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This uses one of your {MAX_CLAIM_EDITS} claim edits and the photo cannot be
                            recovered. You can re-add a different photo while the claim is still being
                            reviewed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="text-white bg-red-500/85 hover:bg-red-600/85 cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemovePhoto();
                            }}
                        >
                            Remove photo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
