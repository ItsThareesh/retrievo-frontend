"use client";

import { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { OverviewTab } from "./overview-tab";
import { ResolutionsTab } from "./resolutions-tab";
import { UsersTab } from "./users-tab";
import { ReportsTab } from "./reports-tab";

const VALID_TABS = ["overview", "resolutions", "users", "reports"] as const;
type Tab = (typeof VALID_TABS)[number];

function isValidTab(value: string): value is Tab {
    return VALID_TABS.includes(value as Tab);
}

/**
 * AdminView owns all tab state.
 *
 * Tab identity lives in the URL (?tab=...) so that:
 *  - deep links work out of the box
 *  - browser back/forward navigates tabs
 *
 * useSearchParams() reads the current value synchronously on the client,
 * so there is no server round-trip when the user switches tabs.
 * router.replace() performs a client-side shallow update — the Server
 * Component (page.tsx) is NOT re-executed.
 */
export function AdminView() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const rawTab = searchParams.get("tab") ?? "overview";
    const activeTab: Tab = isValidTab(rawTab) ? rawTab : "overview";

    const handleTabChange = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", value);
            // replace keeps a single history entry per tab; use push if you
            // want every click to be a separate back-stack entry.
            router.replace(`?${params.toString()}`, { scroll: false });
        },
        [router, searchParams],
    );

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><OverviewTab /></TabsContent>
            <TabsContent value="resolutions"><ResolutionsTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="reports"><ReportsTab /></TabsContent>
        </Tabs>
    );
}
