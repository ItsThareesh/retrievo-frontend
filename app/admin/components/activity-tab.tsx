"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Flag, AlertTriangle } from "lucide-react";
import { getActivity } from "@/lib/api/admin";
import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";
import { ActivitySkeleton } from "./skeletons";
import { fetchData } from "@/lib/utils/swrHelper";

export function ActivityTab() {
    const { data: activity, isLoading } = useSWR(['activity', 50], () => fetchData(() => getActivity(50)));

    if (isLoading) {
        return <ActivitySkeleton />;
    }

    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Comprehensive platform activity log</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <div className="space-y-5">
                    {(activity || []).map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-4 p-5 rounded-lg border bg-card"
                        >
                            <div className="mt-1">
                                {item.type === "claim_approved" && (
                                    <div className="p-2 rounded-full bg-green-100">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                )}
                                {item.type === "claim_rejected" && (
                                    <div className="p-2 rounded-full bg-red-100">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                )}
                                {item.type === "claim_pending" && (
                                    <div className="p-2 rounded-full bg-yellow-100">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                )}
                                {item.type === "report_filed" && (
                                    <div className="p-2 rounded-full bg-orange-100">
                                        <Flag className="h-5 w-5 text-orange-600" />
                                    </div>
                                )}
                                {item.type === "item_auto_hidden" && (
                                    <div className="p-2 rounded-full bg-red-100">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{item.description}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                                {item.type.replace("_", " ")}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
