import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function UserProfileLoading() {
    return (
        <div className="container mx-auto px-4 md:px-10 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* User Sidebar Skeleton */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="sticky top-24">
                        <Card className="overflow-hidden border-muted shadow-sm">
                            <div className="h-24 bg-muted/50"></div>
                            <CardHeader className="text-center -mt-12 relative z-10">
                                <div className="mx-auto mb-4 p-1 bg-background rounded-full w-fit">
                                    <Skeleton className="w-24 h-24 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                                <Skeleton className="h-4 w-48 mx-auto" />
                                <CardContent className="space-y-2 m-2 pb-4">
                                    <Skeleton className="h-4 w-40 mx-auto" />
                                </CardContent>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton className="h-9 w-32" />
                    </div>

                    {/* Tabs Skeleton */}
                    <div className="w-full">
                        <div className="flex w-full max-w-md mx-auto mb-8 gap-2">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 flex-1" />
                        </div>

                        {/* Grid of Item Card Skeletons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
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
                </div>
            </div>
        </div>
    );
}
