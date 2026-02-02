"use client"

import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import Image from "next/image"

interface ImageViewerProps {
    src: string
    alt: string
    children: React.ReactNode
}

export function ImageViewer({ src, alt, children }: ImageViewerProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-zoom-in w-full">
                    {children}
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center" showCloseButton={false}>
                <DialogTitle className="sr-only">Image Viewer</DialogTitle>

                <div
                    className="relative inline-flex items-center justify-center overflow-hidden"
                    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                >
                    <DialogClose className="absolute top-3 right-3 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors will-change-transform" aria-label="Close image viewer">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </DialogClose>

                    <Image
                        src={src}
                        alt={alt}
                        width={800}
                        height={600}
                        unoptimized
                        loading="eager"
                        decoding="async"
                        style={{ maxWidth: 'min(800px,90vw)', maxHeight: 'min(600px,85vh)', transform: 'translateZ(0)' }}
                        className="w-auto h-auto rounded-md shadow-lg"
                    />
                </div>
            </DialogContent>
        </Dialog >
    )
}