import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RejectionDialogProps {
    open: boolean;
    loading: boolean;
    reason: string;
    onReasonChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export function RejectionDialog({
    open,
    loading,
    reason,
    onReasonChange,
    onConfirm,
    onCancel
}: RejectionDialogProps) {
    if (!open) return null;

    return (
        <Card className="p-4 sm:p-6 border-2 border-orange-500 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Reject Claim</h2>
            <p className="text-sm text-muted-foreground mb-4">
                Please provide a reason for rejecting this claim. This will be shared with the claimant.
            </p>
            <textarea
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Explain why this claim doesn't match the item..."
                className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading}
            />
            <div className="flex gap-3 mt-4">
                <Button
                    onClick={onConfirm}
                    disabled={loading || (reason.trim().length < 20)}
                    variant="destructive"
                >
                    Confirm Rejection
                </Button>
                <Button
                    onClick={onCancel}
                    disabled={loading}
                    variant="outline"
                >
                    Cancel
                </Button>
            </div>
        </Card>
    );
}
