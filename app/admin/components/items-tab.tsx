"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getReportedItems } from "@/lib/api/admin";
import { ItemsTable } from "./items-table";
import useSWR from "swr";
import { ItemsSkeleton } from "./skeletons";
import { fetchData } from "@/lib/utils/swrHelper";

export function ItemsTab() {
    const { data: items, isLoading } = useSWR(['items', 50, 0], () => fetchData(() => getReportedItems(50, 0)));

    if (isLoading) {
        return <ItemsSkeleton />;
    }

    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <CardTitle>Reported Items</CardTitle>
                <CardDescription>Review and moderate flagged content</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <ItemsTable items={items || []} />
            </CardContent>
        </Card>
    );
}
