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
                    className="w-full sm:flex-1 p-2 bg-green-800 dark:bg-lime-700 dark:hover:bg-lime-600 cursor-pointer text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                    <ThumbsUp className="shrink-0 h-5 w-5 mr-2" />
                    Approve Claim
                </Button>
            )}
            {allowedActions.includes("reject") && (
                <Button
                    onClick={() => onAction("reject")}
                    disabled={loading}
                    size="lg"
                    className="w-full sm:flex-1 p-2 bg-red-800 dark:bg-red-700 dark:hover:bg-red-600 cursor-pointer text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                    <ThumbsDown className="shrink-0 h-5 w-5 mr-2" />
                    Reject Claim
                </Button>
            )}
            {allowedActions.includes("complete") && (
                <Button
                    onClick={() => onAction("complete")}
                    disabled={loading}
                    size="lg"
                    className="w-full sm:flex-1 p-2 cursor-pointer bg-teal-600 dark:bg-teal-600 hover:bg-teal-500 hover:dark:bg-teal-500 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                    <CheckCheck className="shrink-0 h-5 w-5 mr-2" />
                    Mark as Completed
                </Button>
            )}
            {allowedActions.includes("fail") && (
                <Button
                    onClick={() => onAction("fail")}
                    disabled={loading}
                    size="lg"
                    className="w-full sm:flex-1 p-2 cursor-pointer bg-red-700 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-500 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                    <X className="shrink-0 h-5 w-5 mr-2" />
                    Item Doesn't Match
                </Button>
            )}
        </div>
    );
}
