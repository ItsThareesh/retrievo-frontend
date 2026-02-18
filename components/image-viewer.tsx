"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import Image from "next/image"
import { X } from "lucide-react"
import { useState, useCallback } from "react"

interface ImageViewerProps {
    src: string;
    alt: string;
    children: React.ReactNode;
}

export function ImageViewer({ src, alt, children }: ImageViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) setIsZoomed(false);
        setIsOpen(open);
    }, []);

    const toggleZoom = useCallback(() => setIsZoomed((z) => !z), []);

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
            <DialogPrimitive.Trigger asChild>
                <div className="cursor-zoom-in w-full">{children}</div>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-150" />

                <DialogPrimitive.Content
                    className="fixed inset-0 z-50 flex items-center justify-center data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-150 outline-none"
                    style={{ contain: "layout style paint" }}
                >
                    <DialogPrimitive.Title className="sr-only">Image Viewer - {alt}</DialogPrimitive.Title>
                    <DialogPrimitive.Description className="sr-only">
                        Fullscreen image viewer. Click image to zoom. Press escape to close.
                    </DialogPrimitive.Description>

                    <div className="absolute top-4 right-4 z-10">
                        <DialogPrimitive.Close className="grid place-items-center rounded-full w-9 h-9 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-black transition-colors duration-150">
                            <X className="h-4 w-4" />
                        </DialogPrimitive.Close>
                    </div>

                    <div className="relative w-[90vw] h-[88dvh]">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 90vw"
                            priority
                            draggable={false}
                            onClick={toggleZoom}
                            style={{
                                objectFit: "contain",
                                transform: isZoomed ? "translateZ(0) scale(1.7)" : "translateZ(0) scale(1)",
                                cursor: isZoomed ? "zoom-out" : "zoom-in",
                                transition: "transform 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                willChange: "transform",
                            }}
                        />
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}