"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"

export function SignInButton({ session }: { session: any }) {
    return (
        <div className="flex items-center gap-4" >
            {
                session?.user ? (
                    <UserMenu user={session.user} />
                ) : (
                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                    >
                        Sign In
                    </Button>
                )
            }
        </div >
    )
};