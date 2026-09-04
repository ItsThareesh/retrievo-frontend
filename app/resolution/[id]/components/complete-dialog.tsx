import { Button } from "@/components/ui/button";
import { CheckCheck, X } from "lucide-react";
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

interface CompleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    loading: boolean;
    lostTitle: string | null;
}

export function CompleteDialog({
    open,
    onOpenChange,
    onConfirm,
    loading,
    lostTitle,
}: CompleteDialogProps) {
    return <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <AlertDialogTitle>Mark as completed?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {lostTitle
                                ? <>This will close the resolution and take down your lost post &ldquo;{lostTitle}&rdquo;. This is final &mdash; no further actions will be possible. You can still view this resolution afterwards.</>
                                : <>This will close the resolution. This is final &mdash; no further actions will be possible. You can still view it afterwards.</>}
                        </AlertDialogDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => onOpenChange(false)}
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
                    className="text-white bg-teal-600 hover:bg-teal-500"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? "Completing..." : <><CheckCheck className="mr-2 h-4 w-4" /> Mark as Completed</>}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>;
}
