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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChevronDown, Trash2, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface SubmitClaimDialogProps {
    mode: "claim" | "return";
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    text: string;
    setText: Dispatch<SetStateAction<string>>;
    isSubmitting: boolean;
    onSubmit: () => Promise<void>;
}

export function SubmitClaimDialog({
    mode,
    isOpen,
    setIsOpen,
    text,
    setText,
    isSubmitting,
    onSubmit,
}: SubmitClaimDialogProps) {
    const isClaim = mode === "claim";

    const ui = {
        title: isClaim ? "Claim this item" : "Return this item",
        description: isClaim
            ? "Describe details that prove this item belongs to you. These details will be shared only with the finder."
            : "Describe where and how you found this item. This will be shared with the owner.",
        placeholder: isClaim
            ? "Marks, contents, damage, when you lost it, etc."
            : "Where you found it, condition, time, identifying details",
        submitText: isClaim ? "Submit Claim" : "Initiate Return",
        minLength: 20,
        maxLength: 280,
    };

    const trimmed = text.trim();
    const isInvalid =
        trimmed.length < ui.minLength ||
        trimmed.length > ui.maxLength;

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{ui.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {ui.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={ui.placeholder}
                    className="min-h-[120px] resize-none mt-4"
                    disabled={isSubmitting}
                />

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
                        disabled={isInvalid || isSubmitting}
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