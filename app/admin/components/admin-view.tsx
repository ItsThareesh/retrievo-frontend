"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { OverviewTab } from "./overview-tab";
import { ResolutionsTab } from "./resolutions-tab";
import { UsersTab } from "./users-tab";
import { ReportsTab } from "./reports-tab";

export function AdminView({ initialTab }: { initialTab: string }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const searchParams = useSearchParams();

    // Sync state with URL without triggering server navigation for every click
    // We use window.history.replaceState to update the URL silently
    const handleTabChange = (value: string) => {
        setActiveTab(value);

        // Update URL for shareability without triggering a Next.js server navigation
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        window.history.pushState(null, "", `?${params.toString()}`);
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
