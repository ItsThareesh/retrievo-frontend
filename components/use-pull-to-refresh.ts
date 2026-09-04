"use client"

import { useState, useEffect, useRef } from "react";

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    maxPull?: number;
}

interface UsePullToRefreshReturn {
    pullDistance: number;
    isRefreshing: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export function usePullToRefresh({
    onRefresh,
    threshold = 80,
    maxPull = 150,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const pullDistanceRef = useRef(0);
    const startYRef = useRef(0);
    const trackingRef = useRef(false);
    const refreshingRef = useRef(false);
    const onRefreshRef = useRef(onRefresh);
    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const isAtTop = () => {
            if (el.scrollTop > 0) return false;
            const doc = document.scrollingElement;
            if (doc && doc.scrollTop > 0) return false;
            return window.scrollY <= 0;
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (refreshingRef.current || e.touches.length > 1) {
                trackingRef.current = false;
                return;
            }
            if (!isAtTop()) {
                trackingRef.current = false;
                return;
            }
            trackingRef.current = true;
            startYRef.current = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (refreshingRef.current || !trackingRef.current) return;
            if (e.touches.length > 1) {
                trackingRef.current = false;
                setPullDistance(0);
                pullDistanceRef.current = 0;
                return;
            }
            const diff = e.touches[0].clientY - startYRef.current;
            if (diff <= 0) {
                if (pullDistanceRef.current !== 0) {
                    setPullDistance(0);
                    pullDistanceRef.current = 0;
                }
                return;
            }
            if (!isAtTop()) return;
            e.preventDefault();
            const dampened = Math.min(diff * 0.5, maxPull);
            setPullDistance(dampened);
            pullDistanceRef.current = dampened;
        };

        const reset = () => {
            trackingRef.current = false;
            setPullDistance(0);
            pullDistanceRef.current = 0;
        };

        const handleTouchEnd = async () => {
            if (refreshingRef.current || !trackingRef.current) return;
            trackingRef.current = false;
            if (pullDistanceRef.current < threshold) {
                reset();
                return;
            }
            refreshingRef.current = true;
            setIsRefreshing(true);
            try {
                await onRefreshRef.current();
            } finally {
                refreshingRef.current = false;
                setIsRefreshing(false);
                reset();
            }
        };

        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchmove", handleTouchMove, { passive: false });
        el.addEventListener("touchend", handleTouchEnd, { passive: true });
        el.addEventListener("touchcancel", reset, { passive: true });

        return () => {
            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchmove", handleTouchMove);
            el.removeEventListener("touchend", handleTouchEnd);
            el.removeEventListener("touchcancel", reset);
        };
    }, [threshold, maxPull]);

    return { pullDistance, isRefreshing, containerRef };
}
