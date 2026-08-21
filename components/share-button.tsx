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

        // On browsers/devices with the Web Share API (iOS, Android, macOS
        // Safari/Chrome), use the native share sheet and let the OS handle
        // copying. Never writing the clipboard ourselves here avoids a
        // double copy — the sheet already places the link on the pasteboard.
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err: unknown) {
                // User dismissed the sheet (AbortError) or it failed — either
                // way we don't fall back to clipboard to prevent duplicate links.
            }
            return;
        }

        // Fallback for browsers without the Web Share API: copy the
        // descriptive text together with the link as a single string, so
        // pasting into a compose box (e.g. Twitter) keeps the caption.
        try {
            await navigator.clipboard.writeText(text ? `${text}\n${url}` : url);
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
