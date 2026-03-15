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
import { ChevronDown, Trash2, X, Link2, FileText, MapPin, Calendar, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { LinkableItem } from "@/types/resolutions";
import { formatDateString } from "@/lib/date-formatting";

interface SubmitClaimDialogProps {
    mode: "claim" | "return";
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    text: string;
    setText: Dispatch<SetStateAction<string>>;
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
    isSubmitting,
    onSubmit,
    linkableItems,
    isLoadingLinkableItems,
    linkedItemId,
    setLinkedItemId,
}: SubmitClaimDialogProps) {
    const isClaim = mode === "claim";
    const [activeTab, setActiveTab] = useState<string>("link");

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

    const trimmed = text.trim();
    const hasValidDescription =
        trimmed.length >= ui.minLength && trimmed.length <= ui.maxLength;
    const hasLinkedItem = linkedItemId !== null;

    // Submit enabled when: linked item selected OR valid description
    const canSubmit = hasLinkedItem || hasValidDescription;

    const hasLinkableItems = linkableItems.length > 0;
    const showTabs = hasLinkableItems || isLoadingLinkableItems;

    // Skip nudge: on Describe tab, linkable items exist, but none selected
    const showSkipNudge =
        showTabs && activeTab === "describe" && hasLinkableItems && !hasLinkedItem;

    const describeContent = (
        <div className="space-y-2">
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={ui.placeholder}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
            />
            {showSkipNudge && (
                <p className="text-xs text-muted-foreground">
                    Your posted item will stay in the feed until it expires. Please consider linking it to increase chances of a successful match!
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

                {showTabs ? (
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="mt-4"
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

                        <TabsContent value="link">
                            {isLoadingLinkableItems ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
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
                                                type="radio"
                                                name="linkable-item"
                                                value={li.id}
                                                checked={linkedItemId === li.id}
                                                onChange={() => setLinkedItemId(li.id)}
                                                className="mt-0.5 accent-primary"
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
                                                            {li.location}
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
                            )}
                        </TabsContent>

                        <TabsContent value="describe">
                            {describeContent}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="mt-4">
                        {describeContent}
                    </div>
                )}

                <AlertDialogFooter className="mt-6">
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
                        className="w-full flex items-center justify-between font-normal text-left"
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
                >
                    Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                    disabled={reason === ''}
                    className="shadow-sm"
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
    handleDelete: () => Promise<void>;
}

export function DeleteConfirmationDialog({
    isDeleting,
    setIsDeleting,
    handleDelete
}: DeleteConfirmationDialogProps) {
    return <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your item
                            and remove it from our servers.
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
            <AlertDialogFooter className="mt-6">
                <AlertDialogCancel asChild>
                    <Button variant="outline">
                        Cancel
                    </Button>
                </AlertDialogCancel>

                <AlertDialogAction
                    className="text-white bg-red-500 hover:bg-red-600"
                    onClick={handleDelete}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete permanently
                    {/* </Button> */}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>;
}