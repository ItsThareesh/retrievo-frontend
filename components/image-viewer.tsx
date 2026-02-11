"use client"

import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { X, ZoomIn, ZoomOut } from "lucide-react"
import { useState, useCallback, useEffect } from "react"

interface ImageViewerProps {
    src: string
    alt: string
    children: React.ReactNode
}

interface ImageDimensions {
    width: number
    height: number
    aspectRatio: number
}

export function ImageViewer({ src, alt, children }: ImageViewerProps) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null)
    const [isZoomed, setIsZoomed] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement
        const dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight
        }
        setImageDimensions(dimensions)
        setImageLoaded(true)
    }, [])

    // Calculate optimal display dimensions
    const getOptimalDimensions = useCallback(() => {
        if (!imageDimensions) return { width: 'auto', height: 'auto' }

        const maxWidth = window.innerWidth * 0.9
        const maxHeight = window.innerHeight * 0.85
        const { aspectRatio } = imageDimensions

        let width, height

        // For landscape images (wider than tall)
        if (aspectRatio > 1) {
            width = Math.min(maxWidth, imageDimensions.width)
            height = width / aspectRatio

            // If height exceeds max, recalculate based on height
            if (height > maxHeight) {
                height = maxHeight
                width = height * aspectRatio
            }
        }
        // For portrait images (taller than wide) or square
        else {
            height = Math.min(maxHeight, imageDimensions.height)
            width = height * aspectRatio

            // If width exceeds max, recalculate based on width
            if (width > maxWidth) {
                width = maxWidth
                height = width / aspectRatio
            }
        }

        return {
            width: Math.round(width),
            height: Math.round(height),
        }
    }, [imageDimensions])

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen])

    const optimalDims = getOptimalDimensions()
    const zoomScale = isZoomed ? 1.5 : 1

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div
                    className="cursor-zoom-in w-full"
                    onClick={() => setIsOpen(true)}
                >
                    {children}
                </div>
            </DialogTrigger>
            <DialogContent
                className="max-w-[100vw] max-h-[100vh] p-0 bg-black/95 border-none shadow-none flex items-center justify-center backdrop-blur-sm"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Image Viewer - {alt}</DialogTitle>

                <div className="relative flex items-center justify-center">
                    {/* Controls */}
                    <div className="absolute top-4 right-4 z-50 flex gap-2">
                        <button
                            onClick={() => setIsZoomed(!isZoomed)}
                            className="rounded-full bg-black/70 p-3 text-white hover:bg-white hover:text-black transition-all duration-200 backdrop-blur-sm"
                        >
                            {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                        </button>
                        <DialogClose className="rounded-full bg-black/70 p-3 text-white hover:bg-white hover:text-black transition-all duration-200 backdrop-blur-sm">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </div>

                    {/* Image Container */}
                    <div
                        className="relative duration-500 ease-out overflow-hidden rounded-lg"
                        style={{
                            width: optimalDims.width,
                            height: optimalDims.height,
                        }}
                    >
                        <img
                            src={src}
                            alt={alt}
                            onLoad={handleImageLoad}
                            className={`
                                transition-transform duration-200 ease-out
                                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                                ${imageDimensions ? 'shadow-2xl' : ''}
                            `}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transform: `scale(${zoomScale})`,
                                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                                willChange: 'transform'
                            }}
                            onClick={() => setIsZoomed(!isZoomed)}
                        />

                        {/* Loading State */}
                        {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                                    <span className="text-white text-sm font-medium">Loading image...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}