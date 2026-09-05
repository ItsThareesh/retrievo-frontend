"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Plus } from "lucide-react";

// Portalled to document.body so it stays outside the pull-to-refresh
// content wrapper: translating that subtree re-anchors position:fixed
// descendants, which made the FAB ride along with the pull and snap back.
export function ReportFab() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <Link
            href="/report"
            aria-label="Report an item"
            className="fixed right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
            <Plus className="size-6" />
        </Link>,
        document.body
    );
}
