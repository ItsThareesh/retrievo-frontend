import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function OverviewSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent className="px-6 pb-5">
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader className="px-6 py-6">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="space-y-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 rounded-lg border">
                                <Skeleton className="h-5 w-5 rounded-full mt-1" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function ClaimsSkeleton() {
    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <TableHead key={i} className="px-4 py-4">
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="px-4 py-5"><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell className="px-4 py-5">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-8 w-16" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function UsersSkeleton() {
    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: 7 }).map((_, i) => (
                                <TableHead key={i} className="px-4 py-4">
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="px-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-4 w-8" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-4 w-8" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-4 w-8" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-8 w-20" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function ItemsSkeleton() {
    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <TableHead key={i} className="px-4 py-4">
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="px-4 py-5">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-5 w-8" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell className="px-4 py-5"><Skeleton className="h-8 w-20" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function ActivitySkeleton() {
    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <div className="space-y-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 rounded-lg border">
                            <Skeleton className="h-5 w-5 rounded-full mt-1" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
