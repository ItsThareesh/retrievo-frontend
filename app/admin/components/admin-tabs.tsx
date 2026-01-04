"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "overview";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("tab", value);
        router.push(`?${params.toString()}`);
    };

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="claims">Claims</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
