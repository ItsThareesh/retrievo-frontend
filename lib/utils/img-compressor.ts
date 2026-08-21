const isHeic = (file: File) =>
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)

// Safari and all iOS browsers (WebKit) can decode HEIC natively via <img>/canvas,
// whereas Blink/Gecko (Chrome, Firefox, Edge) cannot and require a WASM decoder (heic-to).
let nativeHeicSupport: boolean | null = null
async function browserSupportsNativeHeic(): Promise<boolean> {
    if (nativeHeicSupport !== null) return nativeHeicSupport
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        nativeHeicSupport = false
        return false
    }
    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isWebKit = /applewebkit/i.test(ua)
    const isBlinkChromium = /chrome|chromium|edg|opr/i.test(ua)
    // Desktop Chrome/Edge/Opera (Blink) can't decode HEIC; Safari + iOS browsers can.
    nativeHeicSupport = isWebKit && !(isBlinkChromium && !isIOS)
    return nativeHeicSupport
}

export const compressImage = async (file: File): Promise<File> => {
    if (isHeic(file)) {
        if (typeof window === "undefined") {
            throw new Error("HEIC conversion can only run in the browser")
        }

        // On WebKit, decode HEIC natively (avoids the WASM decoder's
        // "format not supported" errors on some HEIC variants).
        if (await browserSupportsNativeHeic()) {
            return compressToWebP(file)
        }

        // Non-WebKit browsers need a WASM HEIC decoder (heic-to) to decode first.
        const { heicTo } = await import("heic-to/next")

        const convertedBlob = await heicTo({
            blob: file,
            type: "image/jpeg",
            quality: 0.9,
        })

        file = new File(
            [convertedBlob],
            file.name.replace(/\.(heic|heif)$/i, ".jpg"),
            { type: "image/jpeg" }
        )
    }

    return compressToWebP(file)
}

const MAX_FILE_SIZE = 0.8 * 1024 * 1024; // 0.8MB (buffer: backend image limit is 1MB and Traefik caps the whole request body at 1MB)
const INITIAL_MAX_DIMENSION = 1024;
const MIN_MAX_DIMENSION = 640;
const INITIAL_QUALITY = 0.8;
const MIN_QUALITY = 0.4;

// Some browsers (notably older iOS Safari) can decode HEIC but cannot ENCODE
// WebP via canvas.toBlob. In that case the browser silently falls back to PNG,
// which is far larger and blows the upload limit. Detect support and fall back
// to JPEG (universally encodable) when needed.
let _supportsWebpEncode: boolean | null = null;
function supportsWebpEncode(): boolean {
    if (_supportsWebpEncode !== null) return _supportsWebpEncode;
    if (typeof document === "undefined") {
        _supportsWebpEncode = false;
        return false;
    }
    try {
        const c = document.createElement("canvas");
        c.width = 1;
        c.height = 1;
        _supportsWebpEncode = c.toDataURL("image/webp").startsWith("data:image/webp");
        return _supportsWebpEncode;
    } catch {
        _supportsWebpEncode = false;
        return false;
    }
}

export const compressToWebP = async (file: File): Promise<File> => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas not supported");

    const objectUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Invalid image"));
        img.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);

    const originalWidth = img.width;
    const originalHeight = img.height;

    const useWebp = supportsWebpEncode();
    const mime = useWebp ? "image/webp" : "image/jpeg";
    const extension = useWebp ? ".webp" : ".jpg";

    let maxDimension = INITIAL_MAX_DIMENSION;
    let quality = INITIAL_QUALITY;

    const compress = async (
        width: number,
        height: number,
        quality: number
    ): Promise<Blob> => {
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) reject(new Error("Compression failed"));
                    else resolve(blob);
                },
                mime,
                quality
            );
        });
    };

    while (maxDimension >= MIN_MAX_DIMENSION) {
        const scale = Math.min(
            maxDimension / originalWidth,
            maxDimension / originalHeight,
            1
        );

        const width = Math.round(originalWidth * scale);
        const height = Math.round(originalHeight * scale);

        quality = INITIAL_QUALITY;

        while (quality >= MIN_QUALITY) {
            const blob = await compress(width, height, quality);

            if (blob.size <= MAX_FILE_SIZE) {
                return new File(
                    [blob],
                    file.name.replace(/\.[^/.]+$/, extension),
                    {
                        type: mime,
                        lastModified: Date.now(),
                    }
                );
            }

            quality -= 0.1;
        }

        maxDimension -= 128;
    }

    throw new Error("Unable to compress image under 1MB");
};