import { auth } from "@/auth";
import { getClaimForReview } from "@/lib/api/client";
import { redirect } from "next/navigation";
import { FinderReviewContent } from "./finder_review_content";

export default async function FinderReviewPage({ params }: { params: Promise<{ id: string }>; }) {
    const session = await auth();

    const isAuthenticated =
        !!session?.user && Date.now() < (session?.expires_at ?? 0);

    if (!isAuthenticated) {
        redirect('/auth/signin?callbackUrl=/items/' + (await params).id + '/review-claim');
    }

    if (!session?.user.phone) {
        redirect(`/profile?reason=phone_required`);
    }

    const { id: itemId } = await params;

    // Fetch the claim for this item - checks current status regardless of notification timestamp
    const res = await getClaimForReview(itemId);

    if (!res.ok || !res.data.resolution) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">No Pending Claims</h1>
                    <p className="text-muted-foreground mb-6">
                        There are no pending claims for this item, or you already reviewed and resolved it.
                    </p>
                    <a
                        href="/items"
                        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                    >
                        Back to Items
                    </a>
                </div>
            </div>
        );
    }

    const { resolution: claim, item } = res.data;

    // If claim is already resolved, show appropriate message
    if (claim.status !== "pending") {
        const isApproved = claim.status === "approved";

        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold mb-2">
                        {isApproved ? "Claim Already Approved" : "Claim Already Resolved"}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                        {isApproved
                            ? "You have already approved this claim. The claimant has been notified and can now contact you."
                            : "This claim has already been reviewed and resolved."}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Status: <span className="font-medium capitalize">{claim.status}</span>
                        {claim.decided_at && (
                            <span className="block mt-1">
                                Resolved on {new Date(claim.decided_at).toLocaleDateString()}
                            </span>
                        )}
                    </p>
                    <a
                        href="/items"
                        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                    >
                        Back to Items
                    </a>
                </div>
            </div>
        );
    }

    // Claim is still pending - show review interface
    return (
        <FinderReviewContent
            claim={claim}
            item={item}
        />
    );
}
