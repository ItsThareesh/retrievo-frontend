import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ItemsLoadingSkeleton() {
    return (
        <>
            {/* Search and Filter Section Skeleton */}
            <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center mb-8">
                <div className="relative w-full md:flex-1">
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Skeleton className="h-10 w-full md:w-[180px]" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="w-full">
                <div className="flex w-full max-w-md mx-auto mb-8 gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                </div>

                {/* Grid of Item Card Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="p-0">
                                {/* Image Skeleton */}
                                <Skeleton className="w-full h-48" />

                                {/* Content Skeleton */}
                                <div className="p-4 space-y-3">
                                    {/* Badge Skeleton */}
                                    <Skeleton className="h-5 w-20" />

                                    {/* Title Skeleton */}
                                    <Skeleton className="h-6 w-3/4" />

                                    {/* Description Skeleton */}
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>

                                    {/* Location & Date Skeleton */}
                                    <div className="space-y-2 pt-2">
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
