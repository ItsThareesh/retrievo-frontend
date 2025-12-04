'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorMap: Record<string, {
        title: string;
        message: string;
        icon: typeof AlertCircle;
        actionButton?: {
            label: string;
            href: string;
            variant?: "default" | "outline" | "destructive";
        }
    }> = {
        Configuration: {
            title: "Configuration Error",
            message: "There is a problem with the server configuration. Our team has been notified.",
            icon: AlertCircle,
        },
        AccessDenied: {
            title: "Access Denied",
            message: "Only NITC email addresses (@nitc.ac.in) are allowed to sign in. Please use your institutional email.",
            icon: AlertCircle,
            actionButton: {
                label: "Try Different Account",
                href: "/auth/signin",
                variant: "outline"
            }
        },
        Verification: {
            title: "Verification Error",
            message: "The sign in link is no longer valid. It may have been used already or expired.",
            icon: AlertCircle,
            actionButton: {
                label: "Sign In Again",
                href: "/auth/signin",
                variant: "outline"
            }
        },
        BackendAuthFailed: {
            title: "Server Connection Failed",
            message: "Failed to connect to our authentication service. This is usually temporary.",
            icon: WifiOff,
            actionButton: {
                label: "Try Again",
                href: "/auth/signin",
                variant: "outline"
            }
        },
        NoEmail: {
            title: "Email Required",
            message: "Your Google account doesn't have a public email address. Please ensure your email is visible.",
            icon: AlertCircle,
            actionButton: {
                label: "Try Different Account",
                href: "/auth/signin",
                variant: "outline"
            }
        },
        NetworkError: {
            title: "Network Error",
            message: "Unable to connect to authentication servers. Please check your internet connection.",
            icon: Wifi,
            actionButton: {
                label: "Retry Connection",
                href: "/auth/signin",
                variant: "outline"
            }
        },
        OAuthSignin: {
            title: "Sign In Failed",
            message: "There was an error with Google authentication. Please try signing in again.",
            icon: AlertCircle,
            actionButton: {
                label: "Try Again",
                href: "/auth/signin",
                variant: "outline"
            }
        },
        MissingIdToken: {
            title: "Missing ID Token",
            message: "Required authentication information is missing. Please try signing in again.",
            icon: AlertCircle,
            actionButton: {
                label: "Try Again",
                href: "/auth/signin",
                variant: "outline"
            }
        },
        Default: {
            title: "Authentication Error",
            message: "An unexpected error occurred while trying to sign you in. Please try again.",
            icon: AlertCircle,
            actionButton: {
                label: "Try Again",
                href: "/auth/signin",
                variant: "outline"
            }
        }
    };

    const errorInfo = errorMap[error as string] || errorMap.Default;
    const IconComponent = errorInfo.icon;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-muted/30" />

            <Card className="w-full max-w-md shadow-2xl border-destructive/20 animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="text-center space-y-4 pb-2 pt-8">
                    <div className="mx-auto bg-destructive/10 p-4 rounded-2xl w-fit mb-2 ring-1 ring-destructive/20 shadow-sm">
                        <IconComponent className="w-10 h-10 text-destructive" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
                            {errorInfo.title}
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                            {errorInfo.message}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="text-center text-muted-foreground text-sm p-8 pt-2 pb-6">
                    {error && (
                        <div className="text-xs font-mono bg-muted/50 px-3 py-2 rounded border mb-4 inline-block">
                            Error Code: {String(error).replace(/[<>]/g, '')}
                        </div>
                    )}
                    <p>If this problem persists, please contact support.</p>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 p-8 pt-0">
                    {errorInfo.actionButton && (
                        <Button
                            variant={errorInfo.actionButton.variant || "outline"}
                            className="w-full h-12 text-base font-medium cursor-pointer transition-all hover:shadow-sm"
                            asChild
                        >
                            <Link href={errorInfo.actionButton.href}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {errorInfo.actionButton.label}
                            </Link>
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        className="w-full h-12 text-base font-medium cursor-pointer hover:bg-muted transition-all"
                        asChild
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Return to Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function AuthErrorPage() {
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
            <AuthErrorContent />
        </Suspense>
    );
}