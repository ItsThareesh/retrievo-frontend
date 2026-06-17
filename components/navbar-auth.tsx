"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { NotificationsDropdown } from "./notifications-dropdown"
import { UserMenu } from "./user-menu"
import type { Session } from "next-auth"

type NavbarAuthProps = {
    initialSession: Session | null;
    initialAuthenticated: boolean;
};

export function NavbarAuth({ initialSession, initialAuthenticated }: NavbarAuthProps) {
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const effectiveSession = mounted ? session : initialSession;

    const isAuthenticated = mounted
        ? status === "authenticated" && !!effectiveSession?.backendToken
        : initialAuthenticated;

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-4">
                <NotificationsDropdown />
                <UserMenu
                    user={{
                        name: effectiveSession?.user?.name ?? null,
                        email: effectiveSession?.user?.email ?? null,
                        image: effectiveSession?.user?.image ?? null,
                        role: effectiveSession?.user?.role ?? null,
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                disabled={isSigningIn}
                onClick={() => {
                    if (isSigningIn) return;
                    setIsSigningIn(true);
                    signIn("google", { callbackUrl: "/onboarding" });
                }}
            >
                {isSigningIn ? "Signing in..." : "Login"}
            </Button>
        </div>
    );
}
