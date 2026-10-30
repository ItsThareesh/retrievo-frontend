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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/utils/img-compressor";
import { toast } from "sonner";
import { ChevronDown, Trash2, X, Link2, FileText, MapPin, Calendar, Loader2, ImagePlus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { LinkableItem } from "@/types/resolutions";
import { item_type } from "@/types/item";
import { formatDateString } from "@/lib/date-formatting";
import { LOCATION_MAP } from "@/lib/constants/locations";
import { delete_reasons_map } from "@/lib/constants/delete-reasons";

interface SubmitClaimDialogProps {
    mode: "claim" | "return";
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    text: string;
    setText: Dispatch<SetStateAction<string>>;
    photo: File | null;
    setPhoto: Dispatch<SetStateAction<File | null>>;
    isSubmitting: boolean;
    onSubmit: () => Promise<void>;
    linkableItems: LinkableItem[];
    isLoadingLinkableItems: boolean;
    linkedItemId: string | null;
    setLinkedItemId: Dispatch<SetStateAction<string | null>>;
}

export function SubmitClaimDialog({
    mode,
    isOpen,
    setIsOpen,
    text,
    setText,
    photo,
    setPhoto,
    isSubmitting,
    onSubmit,
    linkableItems,
    isLoadingLinkableItems,
    linkedItemId,
    setLinkedItemId,
}: SubmitClaimDialogProps) {
    const isClaim = mode === "claim";
    const [activeTab, setActiveTab] = useState<string>("link");
    const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

    const ui = {
        title: isClaim ? "Claim this item" : "Return this item",
        description: isClaim
            ? "Link your posted item or describe details that prove this item belongs to you."
            : "Link the item you found or describe where and how you found it.",
        placeholder: isClaim
            ? "Marks, contents, damage, when you lost it, etc."
            : "Where you found it, condition, time, identifying details",
        submitText: isClaim ? "Submit Claim" : "Initiate Return",
        minLength: 20,
        maxLength: 280,
    };

    async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;

        if (!file) return;

        // Reset the input so choosing the same file again re-triggers onChange
        e.target.value = "";

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Original image must be under 10MB. Please choose a smaller image.");
            return;
        }

        setIsCompressingPhoto(true);
        try {
            const compressed = await compressImage(file);

            if (compressed.size > 1 * 1024 * 1024) {
                toast.error("Unable to compress image under 1MB. Please choose a smaller or simpler image.");
                return;
            }

            setPhoto(compressed);
        } catch (error) {
            console.error("Claim photo compression error:", error);
            toast.error("Failed to compress image. Please try a different image.");
        } finally {
            setIsCompressingPhoto(false);
        }
    }

    function clearPhoto() {
        setPhoto(null);
    }

    const trimmed = text.trim();
    const hasValidDescription =
        trimmed.length >= ui.minLength && trimmed.length <= ui.maxLength;
    const hasLinkedItem = linkedItemId !== null;

    // Submit enabled when: linked item selected OR valid description
    const canSubmit = hasLinkedItem || hasValidDescription;

    const hasLinkableItems = linkableItems.length > 0;

    // Skip nudge: on Describe tab, linkable items exist, but none selected
    const showSkipNudge =
        activeTab === "describe" && hasLinkableItems && !hasLinkedItem;

    // Claimant evidence photo (optional) — lives inside the Describe step:
    // describing always offers it, the Link tab stays list-only (a linked
    // post documents its evidence on its own). Link selection is a toggle, so
    // users can still change their mind. The counterparty sees the photo on
    // the claim notification page: `owner_initiated` → owner's pre-loss
    // evidence, `finder_initiated` → finder's proof of possession.
    const photoSection = (
        <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground block">
                {isClaim ? "Evidence photo (optional)" : "Proof-of-possession photo (optional)"}
            </Label>
            {isCompressingPhoto ? (
                <div className="flex items-center gap-3 px-3 h-12 border rounded-lg bg-muted/30">
                    <Loader2 className="size-4 shrink-0 text-muted-foreground animate-spin" />
                    <span className="text-sm text-muted-foreground flex-1 min-w-0 truncate">Compressing image…</span>
                </div>
            ) : photo ? (
                <div className="flex items-center gap-3 px-3 h-12 border rounded-lg">
                    <ImagePlus className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm flex-1 min-w-0 truncate">{photo.name}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isSubmitting}
                        aria-label="Remove photo"
                        className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                        onClick={clearPhoto}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    className="relative flex w-full items-center justify-center gap-3 px-4 h-12 cursor-pointer hover:bg-muted/50"
                    disabled={isSubmitting}
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/60">
                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <span className="text-sm font-medium">Add a photo</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isSubmitting}
                        onChange={handlePhotoSelect}
                    />
                </Button>
            )}
            <p className="text-xs text-muted-foreground/60">
                {isClaim
                    ? "Optional. Anything that shows it's yours — an old shot of you with it, a close-up of distinguishing marks, etc."
                    : "Optional. A quick shot of you with the item in hand is the clearest proof."}
            </p>
        </div>
    );

    const describeContent = (
        <div className="space-y-3">
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={ui.placeholder}
                className="min-h-[80px] text-sm resize-none"
                disabled={isSubmitting}
            />
            {showSkipNudge && (
                <p className="text-xs text-muted-foreground">
                    Your post stays in the feed either way — linking it just backs this claim with your actual post, photo and details included.
                </p>
            )}
            {photoSection}
        </div>
    );

    const linkContent = (
        <div className="min-h-[120px]">
            {isLoadingLinkableItems ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
            ) : hasLinkableItems ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {linkableItems.map((li) => (
                        <Label
                            key={li.id}
                            className={cn(
                                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                                linkedItemId === li.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:bg-muted/50"
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={linkedItemId === li.id}
                                onChange={() =>
                                    setLinkedItemId(linkedItemId === li.id ? null : li.id)
                                }
                                aria-label={linkedItemId === li.id ? `Unlink ${li.title}` : `Link ${li.title}`}
                                className="mt-0.5 size-4 shrink-0 accent-primary rounded-full cursor-pointer"
                                disabled={isSubmitting}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                    {li.title}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    {li.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="size-3" />
                                            {LOCATION_MAP[li.location]?.label || "Unknown Location"}
                                        </span>
                                    )}
                                    {li.date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {formatDateString(li.date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Label>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                    No items available to link.
                </p>
            )}
        </div>
    );

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{ui.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {ui.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="link" className="flex-1 gap-1.5">
                            <Link2 className="size-3.5" />
                            Link Item
                        </TabsTrigger>
                        <TabsTrigger value="describe" className="flex-1 gap-1.5">
                            <FileText className="size-3.5" />
                            Describe
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="pt-3">
                        {linkContent}
                    </TabsContent>

                    <TabsContent value="describe" className="pt-3">
                        {describeContent}
                    </TabsContent>
                </Tabs>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button
                            variant="outline"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={!canSubmit || isSubmitting}
                        onClick={onSubmit}
                    >
                        {ui.submitText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface ReportDialogProps {
    isReporting: boolean;
    setIsReporting: Dispatch<SetStateAction<boolean>>;
    reason: string;
    reasons_map: { value: string; label: string }[];
    setReason: Dispatch<SetStateAction<string>>;
    handleReport: () => Promise<void>;
}

export function ReportDialog({
    isReporting,
    setIsReporting,
    reason,
    reasons_map,
    setReason,
    handleReport
}: ReportDialogProps) {
    return <AlertDialog open={isReporting} onOpenChange={setIsReporting}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Report</AlertDialogTitle>
                <AlertDialogDescription>
                    Please select a reason for reporting.
                </AlertDialogDescription>
            </AlertDialogHeader>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full flex items-center justify-between font-normal text-left cursor-pointer"
                    >
                        <span
                            className={cn(
                                "truncate",
                                !reason && "text-muted-foreground"
                            )}
                        >
                            {reasons_map.find(r => r.value === reason)?.label || "Select a reason..."}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-[200px]">
                    {reasons_map.map((item) => (
                        <DropdownMenuItem
                            key={item.value}
                            onSelect={() => setReason(item.value)}
                            className="w-full cursor-pointer justify-start"
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/*Close & Submit Buttons */}
            <AlertDialogFooter>
                <AlertDialogCancel
                    onClick={() => setReason("")}
                    className="cursor-pointer"
                >
                    Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                    disabled={reason === ''}
                    className="shadow-sm cursor-pointer"
                    onClick={handleReport}
                >
                    Submit
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>;
}

interface DeleteConfirmationDialogProps {
    isDeleting: boolean;
    setIsDeleting: Dispatch<SetStateAction<boolean>>;
    handleDelete: (closeReason?: string) => Promise<void>;
    isProcessingDelete: boolean;
    itemType?: item_type;
}

export function DeleteConfirmationDialog({
    isDeleting,
    setIsDeleting,
    handleDelete,
    isProcessingDelete,
    itemType,
}: DeleteConfirmationDialogProps) {
    const [closeReason, setCloseReason] = useState<string | null>(null);
    const visibleReasons = itemType === "found"
        ? delete_reasons_map.filter((r) => r.value !== "found_it_myself")
        : delete_reasons_map;

    return <AlertDialog open={isDeleting} onOpenChange={(open) => {
        setIsDeleting(open);
        if (!open) setCloseReason(null);
    }}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove your post.
                        </AlertDialogDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setIsDeleting(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </AlertDialogHeader>
            <div className="space-y-2 py-1">
                {visibleReasons.map((r) => (
                    <Label
                        key={r.value}
                        className={cn(
                            "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                            closeReason === r.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                        )}
                    >
                        <input
                            type="radio"
                            name="delete-close-reason"
                            value={r.value}
                            checked={closeReason === r.value}
                            onChange={() => setCloseReason(closeReason === r.value ? null : r.value)}
                            className="accent-primary"
                            disabled={isProcessingDelete}
                        />
                        <span className="text-sm font-medium">{r.label}</span>
                    </Label>
                ))}
            </div>
            <AlertDialogFooter className="mt-6">
                <AlertDialogCancel asChild>
                    <Button variant="outline">
                        Cancel
                    </Button>
                </AlertDialogCancel>

                <AlertDialogAction
                    className="text-white bg-red-500/85 hover:bg-red-600/85"
                    onClick={() => handleDelete(closeReason ?? undefined)}
                    disabled={isProcessingDelete}
                >
                    {isProcessingDelete ? "Deleting..." : <><Trash2 className="mr-2 h-4 w-4" /> Delete permanently</>}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>;
}
