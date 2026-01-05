"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"
import { Session } from "next-auth"

type LoginButtonProps = {
    session: Session | null;
    isAuthenticated: boolean;
};

export function LoginButton({ session, isAuthenticated }: LoginButtonProps) {
    return (
        <div className="flex items-center gap-4" >
            {
                isAuthenticated ? (
                    <UserMenu
                        user={{
                            name: session?.user?.name ?? null,
                            email: session?.user?.email ?? null,
                            image: session?.user?.image ?? null,
                            role: session?.user?.role ?? null,
                        }}
                    />
                ) : (
                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                        onClick={() => signIn("google", { callbackUrl: "/profile" })}
                    >
                        Login
                    </Button>
                )
            }
        </div >
    )
};