import { notFound, redirect } from "next/navigation";
import { getStats } from "@/lib/api/admin";
import { AdminView } from "./components/admin-view";
import { auth } from "@/auth";

// Force dynamic rendering for admin dashboard
export const dynamic = "force-dynamic";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const session = await auth();

    const isAuthenticated =
        !!session?.user && Date.now() < (session?.expires_at ?? 0) && session.user.role === "admin";

    // Check authentication
    if (!isAuthenticated) {
        redirect('/auth/signin?callbackUrl=/admin');
    }

    // Check admin access by trying to fetch stats
    // If this fails with 401/403, the API client should handle redirection or we catch it here
    try {
        await getStats();
    } catch (error) {
        console.error("Admin access check failed:", error);
        return notFound();
    }

    const resolvedSearchParams = await searchParams;
    const selectedTab = resolvedSearchParams.tab || "overview";

    return (
        <div className="container mx-auto py-10 px-6 max-w-7xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Platform management and moderation control center
                </p>
            </div>

            <AdminView initialTab={selectedTab} />
        </div>
    );
}
