"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import Image from "next/image"
import { X } from "lucide-react"
import { useState, useCallback, useRef, useEffect } from "react"
import { useDrag } from "@use-gesture/react"

interface ImageViewerProps {
    src: string
    alt: string
    children: React.ReactNode
}

export function ImageViewer({ src, alt, children }: ImageViewerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isZoomed, setIsZoomed] = useState(false)
    const [dragY, setDragY] = useState(0)

    // Used to distinguish between a single click (close) and double click (zoom)
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open) {
            // Reset states slightly after the fade-out animation begins
            setTimeout(() => {
                setIsZoomed(false)
                setDragY(0)
            }, 200)
        }
    }, [])

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
        }
    }, [])

    // Bi-directional swipe to dismiss
    const bind = useDrag(
        ({ down, movement: [, my], velocity: [, vy] }) => {
            if (isZoomed) return

            const absY = Math.abs(my)

            if (!down) {
                // If dragged more than 100px or flicked hard, close it
                if (absY > 100 || Math.abs(vy) > 0.5) {
                    handleOpenChange(false)
                } else {
                    setDragY(0) // Snap back to center
                }
            } else {
                setDragY(my) // Track drag up or down
            }
        },
        {
            axis: "y",
            filterTaps: true, // Crucial: prevents drag from triggering clicks
        }
    )

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
            <DialogPrimitive.Trigger asChild>
                <div className="w-full cursor-zoom-in">
                    {children}
                </div>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                {/* Separate the Radix overlay from the visual background. 
                  This allows us to fade the background dynamically during drag without breaking Radix. 
                */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity duration-200"
                        style={{
                            opacity: dragY ? Math.max(0, 1 - Math.abs(dragY) / 300) : 1,
                        }}
                    />
                </DialogPrimitive.Overlay>

                {/* Added Tailwind animate-in/animate-out for professional scaling and fading 
                */}
                <DialogPrimitive.Content
                    className="fixed inset-0 z-50 flex items-center justify-center outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
                >
                    <DialogPrimitive.Title className="sr-only">
                        Image Viewer - {alt}
                    </DialogPrimitive.Title>

                    <DialogPrimitive.Description className="sr-only">
                        Fullscreen image viewer
                    </DialogPrimitive.Description>

                    <div className="absolute top-4 right-4 z-20">
                        <DialogPrimitive.Close className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white hover:text-black">
                            <X className="h-4 w-4" />
                        </DialogPrimitive.Close>
                    </div>

                    {/* Drag Wrapper: Handles the Y-axis movement during a swipe.
                    */}
                    <div
                        {...bind()}
                        className="relative h-full w-full touch-none"
                        style={{
                            transform: `translateY(${dragY}px)`,
                            transition: dragY === 0 ? "transform 300ms cubic-bezier(0.2, 0, 0.2, 1)" : "none",
                        }}
                        onClick={(e) => {
                            e.stopPropagation()

                            if (clickTimeoutRef.current) {
                                // Double Tap detected
                                clearTimeout(clickTimeoutRef.current)
                                clickTimeoutRef.current = null
                                setIsZoomed((z) => !z)
                            } else {
                                // Single Tap detected
                                clickTimeoutRef.current = setTimeout(() => {
                                    clickTimeoutRef.current = null
                                    if (!isZoomed) {
                                        handleOpenChange(false)
                                    }
                                }, 250) // 250ms double-tap window
                            }
                        }}
                    >
                        {/* Image Element: Handles the zoom scale. Separating this from the drag 
                          transform prevents CSS animation conflicts.
                        */}
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            priority
                            draggable={false}
                            sizes="(max-width: 768px) 100vw, 90vw"
                            className="object-contain"
                            style={{
                                transform: `scale(${isZoomed ? 2 : 1})`,
                                transition: "transform 300ms cubic-bezier(0.2, 0, 0.2, 1)",
                                cursor: isZoomed ? "zoom-out" : "zoom-in",
                                willChange: "transform",
                            }}
                        />
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}