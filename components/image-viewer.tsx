"use client"

import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

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
            <DialogContent className="max-w-[95vw] max-h-[95vh] min-w-[60vw] min-h-[60vh] w-auto h-auto p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden" showCloseButton={false}>
                <DialogTitle className="sr-only">Image Viewer</DialogTitle>
                <div className="relative flex items-center justify-center w-full h-full">
                    <DialogClose className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors cursor-pointer">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </DialogClose>

                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
