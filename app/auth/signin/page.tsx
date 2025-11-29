'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function SignInPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    return (
        <Suspense fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <Card className="w-full max-w-md shadow-lg border-muted/60">
                    <CardHeader className="text-center p-8">
                        <CardTitle>Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        }>
            <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-muted/30" />

                <Card className="w-full max-w-md shadow-2xl border-muted/60 animate-in fade-in zoom-in-95 duration-500">
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
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-center gap-3 border border-destructive/20 animate-in slide-in-from-top-2">
                                <span className="font-medium">Authentication failed. Please try again.</span>
                            </div>
                        )}

                        <div className="grid gap-4">
                            <Button
                                variant="outline"
                                className="w-full h-14 text-base font-medium relative cursor-pointer hover:bg-muted/50 transition-all hover:border-primary/50 hover:shadow-sm"
                                onClick={() => signIn('google', { callbackUrl })}
                            >
                                <svg className="mr-3 h-5 w-5 absolute left-6" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pb-8 text-center">
                        <div className="text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-primary hover:underline transition-colors inline-flex items-center gap-1">
                                Return to Home
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground/60 px-8">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </Suspense>
    );
}
