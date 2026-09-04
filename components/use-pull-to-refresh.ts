"use client"

import { useState, useCallback, useRef } from "react";

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    maxPull?: number;
}

interface UsePullToRefreshReturn {
    pullDistance: number;
    isRefreshing: boolean;
    isPulling: boolean;
    pullProps: {
        onTouchStart: (e: React.TouchEvent) => void;
        onTouchMove: (e: React.TouchEvent) => void;
        onTouchEnd: (e: React.TouchEvent) => void;
        style?: React.CSSProperties;
    };
}

export function usePullToRefresh({
    onRefresh,
    threshold = 80,
    maxPull = 150,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const pullDistanceRef = useRef(0);

    const startY = useRef(0);
    const currentY = useRef(0);
    const isAtTop = useRef(true);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (isRefreshing) return;
        const touch = e.touches[0];
        startY.current = touch.clientY;
        isAtTop.current = window.scrollY === 0;
        setIsPulling(true);
    }, [isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isRefreshing || !isPulling) return;
        const touch = e.touches[0];
        currentY.current = touch.clientY;
        const diff = Math.max(0, currentY.current - startY.current);

        if (diff > 0 && isAtTop.current && window.scrollY === 0) {
            e.preventDefault();
            const dampened = Math.min(diff * 0.5, maxPull);
            setPullDistance(dampened);
            pullDistanceRef.current = dampened;
        }
    }, [isRefreshing, isPulling, maxPull]);

    const handleTouchEnd = useCallback(async () => {
        if (isRefreshing) return;
        setIsPulling(false);

        if (pullDistanceRef.current >= threshold) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
                pullDistanceRef.current = 0;
            }
        } else {
            setPullDistance(0);
            pullDistanceRef.current = 0;
        }
    }, [isRefreshing, threshold, onRefresh]);

    const isDragging = isPulling && pullDistance > 0 && !isRefreshing;

    return {
        pullDistance,
        isRefreshing,
        isPulling,
        pullProps: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
            style: isDragging ? { touchAction: "none" as const } : undefined,
        },
    };
}