import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ItemCardSkeleton({ index = 0 }: { index?: number }) {
    return (
        <Card
            className="overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms`, animationDuration: "400ms" }}
        >
            <CardContent className="p-0">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ItemsLoadMoreSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in-0 duration-500">
            {Array.from({ length: 4 }).map((_, index) => (
                <ItemCardSkeleton key={index} index={index} />
            ))}
        </div>
    );
}

export function ItemsGridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in-0 duration-500">
            {Array.from({ length: 12 }).map((_, index) => (
                <ItemCardSkeleton key={index} index={index} />
            ))}
        </div>
    );
}
