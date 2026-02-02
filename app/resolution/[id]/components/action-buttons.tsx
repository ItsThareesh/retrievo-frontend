import { AllowedAction } from "@/types/resolutions";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, CheckCheck, X } from "lucide-react";

interface ActionButtonsProps {
    allowedActions: AllowedAction[];
    loading: boolean;
    onAction: (action: AllowedAction) => void;
}

export function ActionButtons({ allowedActions, loading, onAction }: ActionButtonsProps) {
    if (allowedActions.length === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {allowedActions.includes("approve") && (
                <Button
                    onClick={() => onAction("approve")}
                    disabled={loading}
                    size="lg"
                    className="p-2 flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                    <ThumbsUp className="h-5 w-5 mr-2" />
                    Approve Claim
                </Button>
            )}
            {allowedActions.includes("reject") && (
                <Button
                    onClick={() => onAction("reject")}
                    disabled={loading}
                    size="lg"
                    variant="destructive"
                    className="p-2 flex-1 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                    <ThumbsDown className="h-5 w-5 mr-2" />
                    Reject Claim
                </Button>
            )}
            {allowedActions.includes("complete") && (
                <Button
                    onClick={() => onAction("complete")}
                    disabled={loading}
                    size="lg"
                    className="p-2 flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 dark:from-teal-500 dark:to-cyan-500 dark:hover:from-teal-600 dark:hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                    <CheckCheck className="h-5 w-5 mr-2" />
                    Mark as Completed
                </Button>
            )}
            {allowedActions.includes("invalidate") && (
                <Button
                    onClick={() => onAction("invalidate")}
                    disabled={loading}
                    size="lg"
                    variant="outline"
                    className="p-2 flex-1 border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-600 dark:hover:border-amber-400 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                    <X className="h-5 w-5 mr-2" />
                    Item Doesn't Match
                </Button>
            )}
        </div>
    );
}
