import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ItemCardSkeleton({ index = 0 }: { index?: number }) {
    return (
        <Card className="overflow-hidden">
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <ItemCardSkeleton key={index} index={index} />
            ))}
        </div>
    );
}

export function ItemDetailSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-6 flex gap-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-32" />
                </div>
            </div>
        </div>
    );
}

export function ResolutionDetailSkeleton() {
    return (
        <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <header className="text-center">
                    <Skeleton className="h-8 w-56 mx-auto" />
                    <Skeleton className="h-5 w-72 mx-auto mt-2" />
                </header>

                {/* Status Alert */}
                <Card className="p-4 sm:p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 shrink-0 mt-0.5 rounded" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </Card>

                {/* Claim Description */}
                <Card className="p-4 sm:p-6 bg-muted/20 shadow-sm">
                    <Skeleton className="h-6 w-28 mb-3" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <Skeleton className="h-3 w-36 mt-4" />
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Skeleton className="h-12 w-full sm:flex-1" />
                    <Skeleton className="h-12 w-full sm:flex-1" />
                </div>

                {/* Item Summary */}
                <Card className="overflow-hidden shadow-sm">
                    <div className="border-b px-4 py-3 sm:px-6">
                        <Skeleton className="h-5 w-28" />
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <Skeleton className="w-full md:w-40 lg:w-56 aspect-square rounded-lg shrink-0" />
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <Skeleton className="h-7 w-3/4" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-14" />
                                            <Skeleton className="h-4 w-28" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-14" />
                                            <Skeleton className="h-4 w-28" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Linked Item Section */}
                <div className="rounded-lg border p-4 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-48" />
                    <div className="flex gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ItemsGridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
                <ItemCardSkeleton key={index} index={index} />
            ))}
        </div>
    );
}
