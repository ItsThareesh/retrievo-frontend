"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, Flag, Users, TrendingUp, TrendingDown } from "lucide-react";
import { getStats, getActivity } from "@/lib/api/admin";
import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";
import { OverviewSkeleton } from "./skeletons";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { fetchData } from "@/lib/utils/swrHelper";

function getTrendIndicator(current: number, previous: number) {
    if (previous === 0 && current === 0) {
        return <span className="text-sm text-muted-foreground">No activity</span>;
    }

    if (previous === 0 && current > 0) {
        return (
            <span className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                New
            </span>
        );
    }

    if (current === 0 && previous > 0) {
        return (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                No activity yet
            </span>
        );
    }

    if (current > previous) {
        return (
            <span className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                +{Math.round(((current - previous) / previous) * 100)}%
            </span>
        );
    }

    if (current < previous) {
        return (
            <span className="flex items-center gap-1 text-sm text-red-600">
                <TrendingDown className="h-4 w-4" />
                -{Math.round(((previous - current) / previous) * 100)}%
            </span>
        );
    }

    return <span className="text-sm text-muted-foreground">No change</span>;
}

export function OverviewTab() {
    const { data: stats, isLoading: statsLoading } = useSWR('stats', () => fetchData(() => getStats()));
    const { data: activity, isLoading: activityLoading } = useSWR(['activity', 10], () => fetchData(() => getActivity(10)));

    if (statsLoading || activityLoading) {
        return <OverviewSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Items
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold">{stats?.total_items || 0}</div>
                        <div className="mt-1">
                            {getTrendIndicator(
                                stats?.items_this_month || 0,
                                stats?.items_last_month || 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.items_this_month || 0} posted this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Claims
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold">{stats?.claims_pending || 0}</div>
                        <p className="text-xs text-muted-foreground mt-3">
                            {stats?.claims_approved_this_month || 0} approved,{" "}
                            {stats?.claims_rejected_this_month || 0} rejected this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Reports
                        </CardTitle>
                        <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="pb-2">
                            <div className="text-2xl font-bold">{stats?.active_reports || 0}</div>
                            <div className="mt-1">
                                {getTrendIndicator(
                                    stats?.reports_this_month || 0,
                                    stats?.reports_last_month || 0
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats?.reports_this_month || 0} reports this month
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold p-2">{stats?.total_users || 0}</div>
                        <p className="text-xs text-muted-foreground mt-3">
                            {stats?.users_this_month || 0} joined this month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Preview */}
            <Card>
                <CardHeader className="px-6 py-6">
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest platform actions and events</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="space-y-3">
                        {(activity || []).length === 0 ? (
                            <div className="text-center text-muted-foreground py-4">
                                No recent activity
                            </div>
                        ) : (
                            (activity || []).slice(0, 8).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 py-4 border-b last:border-0 last:pb-0"
                                >
                                    <div className="mt-1">
                                        {item.type === "claim_approved" && (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        )}
                                        {item.type === "claim_rejected" && (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        {item.type === "claim_pending" && (
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                        )}
                                        {item.type === "report_filed" && (
                                            <Flag className="h-5 w-5 text-orange-600" />
                                        )}
                                        {item.type === "item_auto_hidden" && (
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">{item.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            )))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
