import { auth } from "@/auth";
import { getResolutionStatus } from "@/lib/api/authenticated-api";
import { notFound, redirect } from "next/navigation";
import { ResolutionStatusContent } from "./resolution_content";
import Link from "next/link";
import { needsOnboarding } from "@/lib/utils/needsOnboarding";

export default async function ClaimStatusPage({ params }: { params: Promise<{ id: string }>; }) {
    const session = await auth();
    const { id } = await params;

    const isAuthenticated =
        !!session?.user && Date.now() < (session?.expires_at ?? 0);

    // Check authentication
    if (!isAuthenticated) {
        redirect(`/auth/signin?callbackUrl=/resolution/${id}`);
    }

    // Check if user needs onboarding
    if (needsOnboarding(session)) {
        redirect('/onboarding');
    }

    // Fetch resolution status
    const res = await getResolutionStatus(id);

    if (!res.ok) {
        if (res.status === 404) {
            return (
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Claim Not Found</h1>
                        <p className="text-muted-foreground mb-6">
                            This claim does not exist or you don't have permission to view it.
                        </p>
                        <Link
                            href="/items"
                            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                        >
                            Back to Items
                        </Link>
                    </div>
                </div>
            );
        }

        if (res.status === 403) return notFound();
    }

    return (
        <ResolutionStatusContent
            resolution={res.data.resolution}
            item={res.data.item}
            finderContact={res.data.finder_contact}
            viewer={res.data.viewer}
            allowedActions={res.data.allowed_actions}
        />
    );
}