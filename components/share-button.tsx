"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps
    extends React.ComponentProps<typeof Button> {
    url: string;
    title?: string;
    text?: string;
}

export function ShareButton({
    url,
    title,
    text,
    children,
    ...props
}: ShareButtonProps) {
    async function onShare() {
        const shareData = { title, text, url };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return;
            }
        } catch (err: unknown) {
            // User dismissed the native share sheet — nothing to do.
            if (err instanceof DOMException && err.name === "AbortError") return;
        }

        // Fallback for browsers without the Web Share API: copy a single
        // plain-text link. writeText only sets the text flavor, so it never
        // produces the double-link pasteboard issue some macOS apps hit.
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard");
        } catch {
            toast.error("Couldn't share this link");
        }
    }

    return (
        <Button onClick={onShare} {...props}>
            {children ?? (
                <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </>
            )}
        </Button>
    );
}
