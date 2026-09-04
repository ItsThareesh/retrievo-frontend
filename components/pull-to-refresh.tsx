"use client"

import { usePullToRefresh } from "./use-pull-to-refresh";
import { useSWRConfig } from "swr";
import { ChevronDown } from "lucide-react";

const THRESHOLD = 80;

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh?: () => Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
    const { mutate } = useSWRConfig();

    const handleRefresh = onRefresh ?? (async () => {
        await mutate((key) => typeof key === "string", { revalidate: true });
    });

    const { pullDistance, isRefreshing, pullProps } = usePullToRefresh({
        onRefresh: handleRefresh,
        threshold: THRESHOLD,
    });

    const rotation = Math.min((pullDistance / THRESHOLD) * 360, 360);
    const indicatorHeight = isRefreshing ? THRESHOLD : pullDistance;
    const showIndicator = pullDistance > 0 || isRefreshing;

    return (
        <div
            className="relative flex-1 overflow-y-auto touch-y-auto"
            {...pullProps}
        >
            <div
                className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
                style={{ height: `${showIndicator ? indicatorHeight : 0}px` }}
            >
                <ChevronDown
                    className={`h-6 w-6 text-muted-foreground transition-colors duration-200 ${
                        isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"
                    }`}
                    style={{ transform: isRefreshing ? undefined : `rotate(${rotation}deg)` }}
                />
            </div>
            <div className={isRefreshing ? "opacity-50 pointer-events-none" : ""}>
                {children}
            </div>
        </div>
    );
}