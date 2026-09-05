"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import {
    usePullToRefresh,
    PTR_RING_SIZE,
    PTR_RING_STROKE,
    PTR_RING_RADIUS,
    PTR_RING_CIRCUMFERENCE,
} from "./use-pull-to-refresh";
import { useSWRConfig } from "swr";
import { useIsPwa } from "@/lib/hooks/use-is-pwa";

const THRESHOLD = 80;

type PtrRefreshHandler = () => Promise<unknown>;

const PtrRegistryContext = createContext<{
    register: (handler: PtrRefreshHandler) => () => void;
} | null>(null);

export function usePtrRefreshHandler(handler: PtrRefreshHandler) {
    const registry = useContext(PtrRegistryContext);
    useEffect(() => {
        if (!registry) return;
        return registry.register(handler);
    }, [registry, handler]);
}

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh?: () => Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
    const { mutate } = useSWRConfig();
    // Custom pull-to-refresh is PWA-only: mobile/desktop browsers keep
    // their native pull behavior, and our touch interception stays off.
    const isPwa = useIsPwa();
    const handlersRef = useRef(new Set<PtrRefreshHandler>());

    const register = useCallback((handler: PtrRefreshHandler) => {
        handlersRef.current.add(handler);
        return () => {
            handlersRef.current.delete(handler);
        };
    }, []);

    const registry = useMemo(() => ({ register }), [register]);

    const handleRefresh = useCallback(async () => {
        if (onRefresh) {
            await onRefresh();
            return;
        }
        await Promise.allSettled([
            mutate(() => true, undefined, { revalidate: true }),
            ...[...handlersRef.current].map((handler) => handler()),
        ]);
    }, [onRefresh, mutate]);

    const { pullDistance, isRefreshing, isDragging, containerRef } = usePullToRefresh({
        onRefresh: handleRefresh,
        threshold: THRESHOLD,
        disabled: !isPwa,
    });

    const progress = Math.min(pullDistance / THRESHOLD, 1);
    const indicatorHeight = isRefreshing ? THRESHOLD : pullDistance;
    const showIndicator = pullDistance > 0 || isRefreshing;
    const ringOpacity = isRefreshing ? 1 : Math.min(1, progress * 2.5);
    const ringScale = isRefreshing ? 1 : 0.6 + 0.4 * progress;
    const arcLength = isRefreshing
        ? PTR_RING_CIRCUMFERENCE * 0.75
        : PTR_RING_CIRCUMFERENCE * Math.max(progress, 0.04);

    return (
        <PtrRegistryContext.Provider value={registry}>
            <div ref={containerRef} className="relative flex-1 min-h-0">
                <div
                    aria-hidden={!showIndicator}
                    className="flex items-center justify-center overflow-hidden"
                    style={{
                        height: `${showIndicator ? indicatorHeight : 0}px`,
                        transition: isDragging ? "none" : "height 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
                    }}
                >
                    <div
                        className="flex h-8 w-8 items-center justify-center"
                        style={{ opacity: ringOpacity, transform: `scale(${ringScale})` }}
                    >
                        <svg
                            width={PTR_RING_SIZE}
                            height={PTR_RING_SIZE}
                            viewBox={`0 0 ${PTR_RING_SIZE} ${PTR_RING_SIZE}`}
                            className={isRefreshing ? "animate-spin text-primary" : "text-primary"}
                            style={{ animationDuration: isRefreshing ? "0.9s" : undefined }}
                            role="status"
                            aria-label={isRefreshing ? "Refreshing" : "Pull to refresh"}
                        >
                            <circle
                                cx={PTR_RING_SIZE / 2}
                                cy={PTR_RING_SIZE / 2}
                                r={PTR_RING_RADIUS}
                                fill="none"
                                stroke="currentColor"
                                strokeOpacity={0.18}
                                strokeWidth={PTR_RING_STROKE}
                            />
                            <circle
                                cx={PTR_RING_SIZE / 2}
                                cy={PTR_RING_SIZE / 2}
                                r={PTR_RING_RADIUS}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={PTR_RING_STROKE}
                                strokeLinecap="round"
                                strokeDasharray={`${arcLength} ${PTR_RING_CIRCUMFERENCE}`}
                                transform={`rotate(-90 ${PTR_RING_SIZE / 2} ${PTR_RING_SIZE / 2})`}
                            />
                        </svg>
                    </div>
                </div>
                <div className={isRefreshing ? "opacity-50 pointer-events-none" : ""}>
                    {children}
                </div>
            </div>
        </PtrRegistryContext.Provider>
    );
}
