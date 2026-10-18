"use client"

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsPwa } from "@/lib/hooks/use-is-pwa";

export function BrandLink() {
    const isPwa = useIsPwa();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Landing page: stay there (or /items in the PWA, standalone can't "self").
    // Every page lands on browse instead of the marketing story.
    const href = pathname === "/" ? (isPwa ? "/items" : "/") : "/items";

    const content = (
        <>
            <Image src="/lighthouse.svg" alt="Retrievo" width={30} height={30} className="rounded-lg" unoptimized />
            <span className="text-2xl">Retrievo</span>
        </>
    );

    if (!mounted) {
        return (
            <span className="flex items-center gap-2 font-bold text-xl text-primary">
                {content}
            </span>
        );
    }

    return (
        <Link
            href={href}
            className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity"
        >
            {content}
        </Link>
    );
}
