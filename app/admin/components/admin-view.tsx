"use client";

import { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { OverviewTab } from "./overview-tab";
import { ResolutionsTab } from "./resolutions-tab";
import { UsersTab } from "./users-tab";
import { ReportsTab } from "./reports-tab";
import { CustodyLog } from "./custody-log";
import { UserRole } from "@/types/user";

type Tab = "overview" | "resolutions" | "custody" | "users" | "reports";

const ADMIN_TABS: readonly Tab[] = ["overview", "resolutions", "users", "reports", "custody"];
const OFFICER_TABS: readonly Tab[] = ["overview", "custody", "users"];

function isValidTab(value: string, tabs: readonly Tab[]): value is Tab {
    return (tabs as readonly string[]).includes(value);
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
 *
 * Security officers get the same panel except that the Resolutions tab is
 * replaced by the Custody Log: they cannot act on resolutions and bypass
 * that system entirely, so resolutions stay admin-only. Admins get all
 * four standard tabs plus the Custody Log as a fifth (cross-check surface:
 * custody items, held or returned, in case of moderation disputes).
 */
export function AdminView({ role }: { role: UserRole }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const isAdmin = role === "admin";
    const roleTabs = isAdmin ? ADMIN_TABS : OFFICER_TABS;

    const rawTab = searchParams.get("tab") ?? "overview";
    // A tab outside the caller's role set (e.g. ?tab=resolutions for an
    // officer) falls back to Overview instead of silently rendering it.
    const activeTab: Tab = isValidTab(rawTab, roleTabs) ? (rawTab as Tab) : "overview";

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

    const tabsList = (
        <TabsList className={`grid w-full ${isAdmin ? "grid-cols-5" : "grid-cols-3"} lg:w-auto lg:inline-grid`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isAdmin ? (
                <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
            ) : (
                <TabsTrigger value="custody">Custody Log</TabsTrigger>
            )}
            <TabsTrigger value="users">Users</TabsTrigger>
            {isAdmin && <TabsTrigger value="reports">Flagged Posts</TabsTrigger>}
            {isAdmin && <TabsTrigger value="custody">Custody Log</TabsTrigger>}
        </TabsList>
    );

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            {tabsList}

            <TabsContent value="overview"><OverviewTab /></TabsContent>
            <TabsContent value="custody"><CustodyLog /></TabsContent>
            <TabsContent value="resolutions"><ResolutionsTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="reports"><ReportsTab /></TabsContent>
        </Tabs>
    );
}
