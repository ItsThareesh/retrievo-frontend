import { auth } from "@/auth";
import { getResolutionStatus } from "@/lib/api/client";
import { redirect } from "next/navigation";
import { ClaimStatusContent } from "./claim_status_content";

export default async function ClaimStatusPage({ params }: { params: Promise<{ id: string }>; }) {
    const session = await auth();

    if (!session) {
        redirect('/auth/signin?callbackUrl=/claims/' + (await params).id);
    }

    const { id } = await params;

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
        if (res.status === 403) {
            return (
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                        <p className="text-muted-foreground mb-6">
                            You don't have permission to view this claim.
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
    }

    return (
        <ClaimStatusContent
            claim={res.data.resolution}
            item={res.data.item}
            finderContact={res.data.finder_contact}
        />
    );
}