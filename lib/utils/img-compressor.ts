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

export const compressToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
        }

        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let { width, height } = img;
            const maxDimension = 1280;

            if (width > maxDimension || height > maxDimension) {
                const scale = Math.min(
                    maxDimension / width,
                    maxDimension / height
                );
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("WebP encoding failed"));
                        return;
                    }

                    if (blob.size > 1024 * 1024) {
                        reject(new Error("Image still larger than 1MB"));
                        return;
                    }

                    resolve(
                        new File(
                            [blob],
                            file.name.replace(/\.[^/.]+$/, ".webp"),
                            {
                                type: "image/webp",
                                lastModified: Date.now(),
                            }
                        )
                    );
                },
                "image/webp",
                0.75
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Invalid image file"));
        };

        img.src = objectUrl;
    });
};