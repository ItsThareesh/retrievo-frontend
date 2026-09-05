"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Loader2, Search } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useIsPwa } from "@/lib/hooks/use-is-pwa";
import { useState } from "react";

export default function SignInContent() {
    const searchParams = useSearchParams();
    const isPwa = useIsPwa();
    const error = searchParams.get("error");
    const callbackUrl = searchParams.get("callbackUrl") || (isPwa ? "/items" : "/");
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const visibleError = authError ?? error;

    // redirect:false first so failures surface on the card instead of dying
    // silently (notably inside the standalone PWA webview). Success navigates
    // manually to the provider URL; only fall back to the classic redirect
    // flow when no URL comes back.
    async function handleSignIn() {
        if (isSigningIn) return;
        setIsSigningIn(true);
        setAuthError(null);
        try {
            // next-auth performs bare fetches with no timeout of its own; a
            // hanging request would otherwise leave the card on its spinner
            // forever with no feedback.
            const timeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Sign-in timed out")), 20000)
            );
            const res = await Promise.race([
                signIn("google", { callbackUrl, redirect: false }),
                timeout,
            ]);
            if (res?.error) {
                setAuthError(res.error);
                setIsSigningIn(false);
                return;
            }
            if (res?.url) {
                window.location.assign(res.url);
                return;
            }
            await signIn("google", { callbackUrl });
        } catch {
            setAuthError("SignInFailed");
            setIsSigningIn(false);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-muted/30" />

            <Card className="w-5/6 max-w-md shadow-xl ring-1 ring-black/5 dark:ring-white/10 border-muted/60 animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="text-center space-y-4 pb-2 pt-8">
                    <div className="mx-auto bg-primary/10 p-4 rounded-2xl w-fit mb-2 ring-1 ring-primary/20 shadow-sm">
                        <Search className="w-8 h-8 text-primary" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
                        <CardDescription className="text-base">
                            Sign in to Retrievo to report lost or found items
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 p-8 pt-4">
                    {visibleError && (
                        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-center gap-3 border border-destructive/20 animate-in slide-in-from-top-2 text-center justify-center">
                            <span className="font-medium">Authentication failed. Please try again.</span>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full h-14 text-base font-medium relative cursor-pointer hover:bg-muted/50 transition-all hover:border-primary/50 hover:shadow-sm"
                        disabled={isSigningIn}
                        onClick={handleSignIn}
                    >
                        {isSigningIn ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Chrome className="mr-3 h-5 w-5" aria-hidden="true" />
                        )}
                        {isSigningIn ? "Signing in..." : "Continue with Google"}
                    </Button>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pb-8 text-center">
                    <div className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                        <Link href="/items" className="hover:text-primary hover:underline transition-colors inline-flex items-center gap-1">
                            Return to Browse Items
                        </Link>
                    </div>
                    <p className="text-xs text-muted-foreground/60 px-8 py-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
