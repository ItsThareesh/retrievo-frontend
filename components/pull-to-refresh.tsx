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

    const { isRefreshing, containerRef, contentRef, spinnerRef, arcRef } = usePullToRefresh({
        onRefresh: handleRefresh,
        threshold: 80,
    });

    return (
        <PtrRegistryContext.Provider value={registry}>
            <div ref={containerRef} className="relative flex-1 min-h-0">
                <div
                    ref={spinnerRef}
                    aria-hidden={!isRefreshing}
                    className="pointer-events-none fixed left-0 right-0 z-40 flex justify-center opacity-0"
                    style={{ top: "calc(env(safe-area-inset-top) + 4.5rem)" }}
                >
                    <div className="rounded-full bg-background/80 p-1.5 shadow-md ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
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
                                ref={arcRef}
                                cx={PTR_RING_SIZE / 2}
                                cy={PTR_RING_SIZE / 2}
                                r={PTR_RING_RADIUS}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={PTR_RING_STROKE}
                                strokeLinecap="round"
                                strokeDasharray={`0 ${PTR_RING_CIRCUMFERENCE}`}
                                transform={`rotate(-90 ${PTR_RING_SIZE / 2} ${PTR_RING_SIZE / 2})`}
                            />
                        </svg>
                    </div>
                </div>
                <div ref={contentRef} className={isRefreshing ? "opacity-50 pointer-events-none" : ""}>
                    {children}
                </div>
            </div>
        </PtrRegistryContext.Provider>
    );
}
