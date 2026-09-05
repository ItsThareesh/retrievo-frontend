"use client"

import { useState, useEffect, useRef } from "react";

export const PTR_RING_SIZE = 32;
export const PTR_RING_STROKE = 3;
export const PTR_RING_RADIUS = (PTR_RING_SIZE - PTR_RING_STROKE) / 2;
export const PTR_RING_CIRCUMFERENCE = 2 * Math.PI * PTR_RING_RADIUS;

const SETTLE_MS = 320;
const SETTLE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    maxPull?: number;
}

interface UsePullToRefreshReturn {
    isRefreshing: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
    spinnerRef: React.RefObject<HTMLDivElement | null>;
    arcRef: React.RefObject<SVGCircleElement | null>;
}

export function usePullToRefresh({
    onRefresh,
    threshold = 80,
    maxPull = 150,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const spinnerRef = useRef<HTMLDivElement | null>(null);
    const arcRef = useRef<SVGCircleElement | null>(null);

    const startYRef = useRef(0);
    const trackingRef = useRef(false);
    const refreshingRef = useRef(false);
    const distanceRef = useRef(0);
    const pendingRef = useRef(0);
    const rafRef = useRef(0);
    const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onRefreshRef = useRef(onRefresh);
    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        const C = PTR_RING_CIRCUMFERENCE;

        const clearSettleTimer = () => {
            if (settleTimerRef.current !== null) {
                clearTimeout(settleTimerRef.current);
                settleTimerRef.current = null;
            }
        };

        // Compositor-only paint: transform + opacity + dasharray.
        // Never touches React state, so dragging renders nothing.
        const paint = (d: number) => {
            distanceRef.current = d;
            const content = contentRef.current;
            const spinner = spinnerRef.current;
            const arc = arcRef.current;
            if (content) {
                content.style.transform = d > 0 ? `translate3d(0, ${d}px, 0)` : "";
            }
            if (spinner) {
                const p = Math.min(d / threshold, 1);
                spinner.style.opacity = d > 0 ? String(Math.min(1, p * 2.5)) : "0";
                spinner.style.transform = `scale(${0.6 + 0.4 * p})`;
            }
            if (arc) {
                const len = C * Math.max(Math.min(d / threshold, 1), 0.04);
                arc.setAttribute("stroke-dasharray", `${len} ${C}`);
            }
        };

        const schedulePaint = (d: number) => {
            pendingRef.current = d;
            if (rafRef.current !== 0) return;
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = 0;
                paint(pendingRef.current);
            });
        };

        // Animate content to `to`, then strip inline styles so
        // fixed/sticky descendants behave normally at rest.
        const settle = (to: number, spinnerVisible: boolean, done?: () => void) => {
            clearSettleTimer();
            if (rafRef.current !== 0) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = 0;
            }
            const content = contentRef.current;
            const spinner = spinnerRef.current;
            if (content) {
                content.style.transition = `transform ${SETTLE_MS}ms ${SETTLE_EASING}`;
                content.style.transform = to > 0 ? `translate3d(0, ${to}px, 0)` : "";
            }
            if (spinner) {
                spinner.style.transition = `opacity ${SETTLE_MS}ms ease-out, transform ${SETTLE_MS}ms ${SETTLE_EASING}`;
                spinner.style.opacity = spinnerVisible ? "1" : "0";
                spinner.style.transform = spinnerVisible ? "scale(1)" : "scale(0.6)";
            }
            distanceRef.current = to;
            pendingRef.current = to;
            settleTimerRef.current = setTimeout(() => {
                settleTimerRef.current = null;
                if (content) {
                    content.style.transition = "";
                    content.style.transform = "";
                    content.style.willChange = "";
                }
                if (spinner) {
                    spinner.style.transition = "";
                    if (!spinnerVisible) {
                        spinner.style.opacity = "0";
                        spinner.style.transform = "";
                    }
                }
                done?.();
            }, SETTLE_MS + 30);
        };

        const isAtTop = () => {
            const el = containerRef.current;
            if (el && el.scrollTop > 0) return false;
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

        const handleTouchStart = (e: TouchEvent) => {
            if (refreshingRef.current || e.touches.length > 1) {
                trackingRef.current = false;
                return;
            }
            if (!isAtTop()) {
                trackingRef.current = false;
                return;
            }
            // Grabbed mid-settle: stop the snap-back, track from here.
            clearSettleTimer();
            trackingRef.current = true;
            startYRef.current = e.touches[0].clientY;
            const content = contentRef.current;
            if (content) {
                content.style.transition = "none";
                content.style.willChange = "transform";
            }
            const spinner = spinnerRef.current;
            if (spinner) spinner.style.transition = "none";
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (refreshingRef.current || !trackingRef.current) return;
            if (e.touches.length > 1) {
                trackingRef.current = false;
                settle(0, false);
                return;
            }
            const diff = e.touches[0].clientY - startYRef.current;
            if (diff <= 0) {
                if (distanceRef.current !== 0) schedulePaint(0);
                return;
            }
            if (!isAtTop()) return;
            e.preventDefault();
            // Progressive resistance: easy off the top, increasingly heavy,
            // asymptoting at maxPull. Reaching `threshold` takes ~170px of
            // finger travel with the defaults (80 / 150).
            const dampened = maxPull * (1 - Math.exp(-diff / (maxPull * 1.5)));
            const wasBelow = distanceRef.current < threshold;
            schedulePaint(dampened);
            if (wasBelow && dampened >= threshold) vibrate();
        };

        const cancelTracking = () => {
            trackingRef.current = false;
            if (!refreshingRef.current) settle(0, false);
        };

        const handleTouchEnd = async () => {
            if (refreshingRef.current || !trackingRef.current) return;
            trackingRef.current = false;
            if (pendingRef.current < threshold && distanceRef.current < threshold) {
                settle(0, false);
                return;
            }
            refreshingRef.current = true;
            setIsRefreshing(true);
            const arc = arcRef.current;
            if (arc) arc.setAttribute("stroke-dasharray", `${C * 0.75} ${C}`);
            settle(threshold, true);
            try {
                await onRefreshRef.current();
            } finally {
                settle(0, false, () => {
                    refreshingRef.current = false;
                    setIsRefreshing(false);
                });
            }
        };

        const el = containerRef.current;
        if (!el) return;
        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchmove", handleTouchMove, { passive: false });
        el.addEventListener("touchend", handleTouchEnd, { passive: true });
        el.addEventListener("touchcancel", cancelTracking, { passive: true });

        return () => {
            clearSettleTimer();
            if (rafRef.current !== 0) cancelAnimationFrame(rafRef.current);
            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchmove", handleTouchMove);
            el.removeEventListener("touchend", handleTouchEnd);
            el.removeEventListener("touchcancel", cancelTracking);
        };
    }, [threshold, maxPull]);

    return { isRefreshing, containerRef, contentRef, spinnerRef, arcRef };
}
