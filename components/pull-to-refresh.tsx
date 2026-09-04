"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { usePullToRefresh } from "./use-pull-to-refresh";
import { useSWRConfig } from "swr";
import { ChevronDown } from "lucide-react";

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

    const { pullDistance, isRefreshing, containerRef } = usePullToRefresh({
        onRefresh: handleRefresh,
        threshold: THRESHOLD,
    });

    const rotation = Math.min((pullDistance / THRESHOLD) * 360, 360);
    const indicatorHeight = isRefreshing ? THRESHOLD : pullDistance;
    const showIndicator = pullDistance > 0 || isRefreshing;

    return (
        <PtrRegistryContext.Provider value={registry}>
            <div ref={containerRef} className="relative flex-1 min-h-0">
                <div
                    aria-hidden={!showIndicator}
                    className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
                    style={{ height: `${showIndicator ? indicatorHeight : 0}px` }}
                >
                    <ChevronDown
                        className={`h-6 w-6 transition-colors duration-200 ${
                            isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"
                        }`}
                        style={{ transform: isRefreshing ? undefined : `rotate(${rotation}deg)` }}
                    />
                </div>
                <div className={isRefreshing ? "opacity-50 pointer-events-none" : ""}>
                    {children}
                </div>
            </div>
        </PtrRegistryContext.Provider>
    );
}
