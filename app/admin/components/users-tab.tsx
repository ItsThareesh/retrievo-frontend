"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUsers } from "@/lib/api/admin";
import { UsersTable } from "./users-table";
import useSWR from "swr";
import { UsersSkeleton } from "./skeletons";
import { fetchData } from "@/lib/utils/swrHelper";

export function UsersTab() {
    const { data: users, isLoading, mutate } = useSWR(['users', 50, 0], () => fetchData(() => getUsers(50, 0)));

    if (isLoading) {
        return <UsersSkeleton />;
    }

    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <CardTitle>User Management</CardTitle>
                <CardDescription>Monitor and moderate platform users</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <UsersTable users={users || []} onUpdate={mutate} />
            </CardContent>
        </Card>
    );
}
