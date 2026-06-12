import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Resolution } from "@/types/resolutions";

interface ClaimDescriptionProps {
    resolution: Resolution;
    borderClass?: string;
}

export function ClaimDescription({ resolution }: ClaimDescriptionProps) {
    return (
        <Card className={`p-4 sm:p-6 border-3 border-t border-r bg-muted/20 shadow-sm`}>
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                {resolution.description}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
                Submitted {formatDistanceToNow(new Date(resolution.created_at), {
                    addSuffix: true,
                })}
            </p>
        </Card>
    );
}
