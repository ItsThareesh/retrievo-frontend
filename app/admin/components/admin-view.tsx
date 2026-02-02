"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { OverviewTab } from "./overview-tab";
import { ResolutionsTab } from "./resolutions-tab";
import { UsersTab } from "./users-tab";
import { ReportsTab } from "./reports-tab";

export function AdminView({ initialTab }: { initialTab: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync activeTab with URL when user navigates with browser back/forward
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "overview";
        setActiveTab(tabFromUrl);
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        // Update URL using Next.js router for proper navigation
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "resolutions" && <ResolutionsTab />}
                {activeTab === "users" && <UsersTab />}
                {activeTab === "reports" && <ReportsTab />}
            </Tabs>
        </div>
    );
}
