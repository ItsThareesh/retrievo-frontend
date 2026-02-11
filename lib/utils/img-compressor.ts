const isHeic = (file: File) =>
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)

export const compressImage = async (file: File): Promise<File> => {
    let inputFile = file

    // Convert HEIC/HEIF first (browser-only)
    if (isHeic(file)) {
        if (typeof window === "undefined") {
            throw new Error("HEIC conversion can only run in the browser")
        }

        const heic2any = (await import("heic2any")).default

        const convertedBlob = (await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
        })) as Blob

        inputFile = new File(
            [convertedBlob],
            file.name.replace(/\.(heic|heif)$/i, ".jpg"),
            { type: "image/jpeg" }
        )
    }

    return compressToWebP(inputFile)
}

const MAX_FILE_SIZE = 0.9 * 1024 * 1024; // 0.9MB (keep some buffer for metadata so that it's under 1MB)
const INITIAL_MAX_DIMENSION = 1024;
const MIN_MAX_DIMENSION = 640;
const INITIAL_QUALITY = 0.8;
const MIN_QUALITY = 0.4;

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
                "image/webp",
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
                    file.name.replace(/\.[^/.]+$/, ".webp"),
                    {
                        type: "image/webp",
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