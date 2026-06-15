"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Package, Flag, Users, TrendingUp, TrendingDown,
    CheckCircle, XCircle, AlertTriangle, Clock, ArrowRight, Ban,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { OverviewSkeleton } from "./skeletons";
import type { OverviewStats, ActivityItem } from "@/types/admin";
import { clientFetch } from "@/lib/client-fetch";

function TrendIndicator({ current, previous, suffix }: { current: number; previous: number; suffix?: string }) {
    if (previous === 0 && current === 0) {
        return <span className="text-sm text-muted-foreground">No activity</span>;
    }

    if (previous === 0 && current > 0) {
        return (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                New{suffix ? ` ${suffix}` : ""}
            </span>
        );
    }

    if (current === 0 && previous > 0) {
        return (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                No activity{suffix ? ` ${suffix}` : ""}
            </span>
        );
    }

    if (current > previous) {
        return (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                +{Math.round(((current - previous) / previous) * 100)}%
            </span>
        );
    }

    if (current < previous) {
        return (
            <span className="flex items-center gap-1 text-sm text-red-600">
                <TrendingDown className="h-3.5 w-3.5" />
                -{Math.round(((previous - current) / previous) * 100)}%
            </span>
        );
    }

    return <span className="text-sm text-muted-foreground">No change</span>;
}

function NumericTrend({ current, previous }: { current: number; previous: number }) {
    const diff = current - previous;
    if (diff === 0) return <span className="text-xs text-muted-foreground">0</span>;
    if (diff > 0) return <span className="text-xs text-emerald-600">+{diff}</span>;
    return <span className="text-xs text-red-600">{diff}</span>;
}

function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    subline,
    accent,
}: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: React.ReactNode;
    subline?: string;
    accent?: "warning" | "default";
}) {
    return (
        <Card className={accent === "warning" && value > 0 ? "border-amber-400/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${accent === "warning" && value > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                <div className="mt-1.5 flex items-center gap-2">
                    {trend}
                    {subline && <span className="text-xs text-muted-foreground">{subline}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

function ClaimsFlowCard({ stats }: { stats: OverviewStats }) {
    const rows = [
        {
            label: "Completed",
            icon: CheckCircle,
            iconClass: "text-emerald-600",
            thisMonth: stats.claims_completed_this_month,
            lastMonth: stats.claims_completed_last_month,
        },
        {
            label: "Unsuccessful",
            icon: XCircle,
            iconClass: "text-red-600",
            thisMonth: stats.claims_unsuccessful_this_month,
            lastMonth: stats.claims_unsuccessful_last_month,
        },
        {
            label: "Invalidated",
            icon: Ban,
            iconClass: "text-amber-600",
            thisMonth: stats.claims_invalidated_this_month,
            lastMonth: stats.claims_invalidated_last_month,
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-base">Claims Monthly Flow</CardTitle>
                <CardDescription>Terminal resolutions by month</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_60px_60px_72px] gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-3">
                        <span>Status</span>
                        <span className="text-right">This</span>
                        <span className="text-right">Last</span>
                        <span className="text-right">Trend</span>
                    </div>
                    {rows.map((r) => (
                        <div
                            key={r.label}
                            className="grid grid-cols-[1fr_60px_60px_72px] gap-4 items-center rounded-lg px-3 py-3.5 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <r.icon className={`h-4 w-4 ${r.iconClass}`} />
                                {r.label}
                            </div>
                            <span className="text-right text-sm font-bold tabular-nums">{r.thisMonth}</span>
                            <span className="text-right text-sm tabular-nums text-muted-foreground">{r.lastMonth}</span>
                            <div className="flex justify-end">
                                <TrendIndicator current={r.thisMonth} previous={r.lastMonth} />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ActiveClaimsCard({ stats }: { stats: OverviewStats }) {
    const items = [
        { label: "Pending", value: stats.claims_pending, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Return Initiated", value: stats.claims_return_initiated, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Approved", value: stats.claims_approved, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Pending Review", value: stats.claims_pending_admin_review, color: "text-red-600", bg: "bg-red-50" },
    ];
    const total = items.reduce((s, i) => s + i.value, 0);

    return (
        <Card>
            <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-base">Active Claims Snapshot</CardTitle>
                <CardDescription>Claims currently in flight</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`h-2.5 w-2.5 rounded-full ${item.color.replace("text-", "bg-")}`} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <span className="text-sm font-bold tabular-nums">{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="border-t pt-4 mt-4 px-3 flex items-center justify-between">
                        <span className="text-sm font-semibold">Total Active</span>
                        <span className="text-base font-bold tabular-nums">{total.toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    resolution_approved: CheckCircle,
    resolution_completed: CheckCircle,
    resolution_rejected: XCircle,
    resolution_invalidated: Ban,
    resolution_pending: Clock,
    resolution_return_initiated: ArrowRight,
    report_filed: Flag,
    item_auto_hidden: AlertTriangle,
};

const activityIconColors: Record<string, string> = {
    resolution_approved: "text-emerald-600",
    resolution_completed: "text-emerald-600",
    resolution_rejected: "text-red-600",
    resolution_invalidated: "text-amber-600",
    resolution_pending: "text-amber-600",
    resolution_return_initiated: "text-blue-600",
    report_filed: "text-orange-600",
    item_auto_hidden: "text-red-600",
};

export function OverviewTab() {
    const { data: session } = useSession();
    const token = session?.backendToken;

    const { data: stats, isLoading: statsLoading } = useSWR(
        token ? ["stats", token] : null,
        ([, t]) => clientFetch<OverviewStats>("/admin/stats", t),
    );
    const { data: activity, isLoading: activityLoading } = useSWR(
        token ? ["activity", 10, token] : null,
        ([, , t]) => clientFetch<ActivityItem[]>(`/admin/activity?limit=10`, t),
    );

    if (statsLoading || activityLoading) {
        return <OverviewSkeleton />;
    }

    if (!stats) {
        return <div className="text-center text-muted-foreground py-12">Failed to load stats</div>;
    }

    return (
        <div className="space-y-6">
            {/* Row 1: KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Items"
                    value={stats.total_items}
                    icon={Package}
                    trend={<TrendIndicator current={stats.items_this_month} previous={stats.items_last_month} />}
                    subline={`${stats.items_this_month} posted this month`}
                />
                <StatCard
                    title="Active Reports"
                    value={stats.active_reports}
                    icon={Flag}
                    trend={<TrendIndicator current={stats.reports_this_month} previous={stats.reports_last_month} />}
                    subline={`${stats.reports_this_month} reports this month`}
                />
                <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    subline={`${stats.users_this_month} joined this month`}
                />
                <StatCard
                    title="Pending Review"
                    value={stats.claims_pending_admin_review}
                    icon={AlertTriangle}
                    accent="warning"
                    subline={stats.claims_pending_admin_review > 0 ? "Needs attention" : "All clear"}
                />
            </div>

            {/* Row 2: Claims */}
            <div className="grid gap-4 lg:grid-cols-2">
                <ClaimsFlowCard stats={stats} />
                <ActiveClaimsCard stats={stats} />
            </div>

            {/* Row 3: Recent Activity */}
            <Card>
                <CardHeader className="px-5 pt-5 pb-3">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription>Latest platform actions and events</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="space-y-1">
                        {(activity || []).length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No recent activity</div>
                        ) : (
                            (activity || []).slice(0, 8).map((item) => {
                                const Icon = activityIcons[item.type] || Clock;
                                const color = activityIconColors[item.type] || "text-muted-foreground";
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-3.5 rounded-lg px-3 py-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">{item.description}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
