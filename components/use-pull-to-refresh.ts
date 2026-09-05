"use client"

import { useState, useEffect, useRef } from "react";

export const PTR_RING_SIZE = 32;
export const PTR_RING_STROKE = 3;
export const PTR_RING_RADIUS = (PTR_RING_SIZE - PTR_RING_STROKE) / 2;
export const PTR_RING_CIRCUMFERENCE = 2 * Math.PI * PTR_RING_RADIUS;

// Finger must travel this far down before the gesture counts as a pull.
// Anything less is tap jitter: claiming it (preventDefault) makes iOS
// treat the tap as a scroll and silently swallow the click.
const PULL_SLOP = 10;

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    maxPull?: number;
    disabled?: boolean;
}

interface UsePullToRefreshReturn {
    pullDistance: number;
    isRefreshing: boolean;
    isDragging: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export function usePullToRefresh({
    onRefresh,
    threshold = 80,
    maxPull = 150,
    disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const pullDistanceRef = useRef(0);
    const startYRef = useRef(0);
    const startXRef = useRef(0);
    const trackingRef = useRef(false);
    const committedRef = useRef(false);
    const refreshingRef = useRef(false);
    const onRefreshRef = useRef(onRefresh);
    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        if (disabled) return;
        const el = containerRef.current;
        if (!el) return;

        const isAtTop = () => {
            if (el.scrollTop > 0) return false;
            const doc = document.scrollingElement;
            if (doc && doc.scrollTop > 0) return false;
            return window.scrollY <= 0;
        };

        const vibrate = () => {
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                try {
                    navigator.vibrate(10);
                } catch {
                    // Haptics unavailable - visual feedback still applies
                }
            }
        };

        const reset = () => {
            trackingRef.current = false;
            committedRef.current = false;
            setIsDragging(false);
            setPullDistance(0);
            pullDistanceRef.current = 0;
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
            committedRef.current = false;
            startYRef.current = e.touches[0].clientY;
            startXRef.current = e.touches[0].clientX;
            setIsDragging(true);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (refreshingRef.current || !trackingRef.current) return;
            if (e.touches.length > 1) {
                reset();
                return;
            }
            const diff = e.touches[0].clientY - startYRef.current;
            const dx = e.touches[0].clientX - startXRef.current;
            if (!committedRef.current) {
                // Horizontal swipe - not a pull, hand the gesture back.
                if (Math.abs(dx) > PULL_SLOP && Math.abs(dx) > Math.abs(diff)) {
                    trackingRef.current = false;
                    setIsDragging(false);
                    return;
                }
                // Below the slop: tap jitter or an upward scroll. Touch
                // nothing so the browser synthesizes click / scrolls freely.
                if (diff < PULL_SLOP) {
                    if (diff <= 0 && pullDistanceRef.current !== 0) {
                        setPullDistance(0);
                        pullDistanceRef.current = 0;
                    }
                    return;
                }
                committedRef.current = true;
            }
            if (diff <= 0) {
                if (pullDistanceRef.current !== 0) {
                    setPullDistance(0);
                    pullDistanceRef.current = 0;
                }
                return;
            }
            if (!isAtTop()) return;
            e.preventDefault();
            // Progressive resistance: easy off the top, increasingly heavy,
            // asymptoting at maxPull. Reaching `threshold` takes ~170px of
            // finger travel with the defaults (80 / 150).
            const dampened = maxPull * (1 - Math.exp(-diff / (maxPull * 1.5)));
            const wasBelow = pullDistanceRef.current < threshold;
            setPullDistance(dampened);
            pullDistanceRef.current = dampened;
            if (wasBelow && dampened >= threshold) vibrate();
        };

        const handleTouchEnd = async () => {
            if (refreshingRef.current || !trackingRef.current) return;
            trackingRef.current = false;
            committedRef.current = false;
            setIsDragging(false);
            if (pullDistanceRef.current < threshold) {
                setPullDistance(0);
                pullDistanceRef.current = 0;
                return;
            }
            refreshingRef.current = true;
            setIsRefreshing(true);
            try {
                await onRefreshRef.current();
            } finally {
                refreshingRef.current = false;
                setIsRefreshing(false);
                setPullDistance(0);
                pullDistanceRef.current = 0;
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
    }, [threshold, maxPull, disabled]);

    return { pullDistance, isRefreshing, isDragging, containerRef };
}
