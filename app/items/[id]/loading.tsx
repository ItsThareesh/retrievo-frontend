import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
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
        </div>
    )
}
