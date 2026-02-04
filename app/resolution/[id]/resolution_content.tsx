"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Clock,
    AlertTriangle,
    CheckCircle2,
    X,
    LucideIcon,
} from "lucide-react";

import { Resolution, FinderContact, Viewer, AllowedAction } from "@/types/resolutions";
import { Item } from "@/types/item";
import {
    approveClaim,
    rejectClaim,
    completeResolution,
    invalidateResolution,
} from "@/lib/api/authenticated-api";

import { ActionButtons } from "./components/action-buttons";
import { RejectionDialog } from "./components/rejection-dialog";
import { ClaimDescription } from "./components/claim-description";
import { ItemSummary } from "./components/item-summary";
import { StatusAlert } from "./components/status-alert";
import { FinderContactCard } from "./components/finder-contact";
import { ThemeKey, THEMES } from "./theme";


/* STATUS UI MAP */

type ResolutionStatus = Resolution["status"];
type ViewerRole = Viewer["role"];

interface StatusUIConfig {
    theme: ThemeKey;
    title: string;
    subtitle: string;
    cardTitle?: string;
    cardBody?: string;
    Icon?: LucideIcon;
    showStatusCard?: boolean;
}

type StatusUIMap = {
    [S in ResolutionStatus]: {
        [R in ViewerRole]: StatusUIConfig;
    };
};

const STATUS_UI = {
    pending: {
        owner: {
            theme: "blue",
            title: "Claim Submitted",
            subtitle: "Your claim is being reviewed by the finder.",
            cardTitle: "Awaiting Finder's Review",
            cardBody: "The person who found this item is reviewing your claim.",
            Icon: Clock,
        },
        finder: {
            theme: "amber",
            title: "Review Claim",
            subtitle: "Someone is claiming this item.",
            cardTitle: "Action Required",
            cardBody: "Review the claimant's description and approve if it matches.",
            Icon: AlertTriangle,
        },
        admin: {
            theme: "blue",
            title: "Pending Claim",
            subtitle: "A claim is awaiting finder review.",
            cardTitle: "System Status",
            cardBody: "No action required from administrators.",
            Icon: Clock,
        },
    },

    approved: {
        owner: {
            theme: "green",
            title: "Claim Approved",
            subtitle: "The finder approved your claim.",
            cardTitle: "Ready to Collect",
            cardBody: "Contact the finder to arrange collection.",
            Icon: CheckCircle2,
        },
        finder: {
            theme: "green",
            title: "Claim Approved",
            subtitle: "You approved this claim.",
            cardTitle: "Awaiting Collection",
            cardBody: "The owner will contact you.",
            Icon: CheckCircle2,
        },
        admin: {
            theme: "green",
            title: "Claim Approved",
            subtitle: "Claim successfully approved by finder.",
            cardTitle: "Audit Info",
            cardBody: "Monitor until completion.",
            Icon: CheckCircle2,
        },
    },

    return_initiated: {
        owner: {
            theme: "cyan",
            title: "Return Requested",
            subtitle: "A finder believes they have your item.",
            cardTitle: "Action Required",
            cardBody: "Verify the return and confirm if correct.",
            Icon: CheckCircle2,
        },
        finder: {
            theme: "cyan",
            title: "Return Initiated",
            subtitle: "Waiting for owner confirmation.",
            cardTitle: "Pending Owner Action",
            cardBody: "You will be notified once the owner responds.",
            Icon: Clock,
        },
        admin: {
            theme: "cyan",
            title: "Return Initiated",
            subtitle: "Finder initiated a return.",
            cardTitle: "System Status",
            cardBody: "No admin action required.",
            Icon: Clock,
        },
    },

    completed: {
        owner: {
            theme: "green",
            title: "Item Returned",
            subtitle: "You successfully received your item.",
            showStatusCard: false,
        },
        finder: {
            theme: "green",
            title: "Return Completed",
            subtitle: "The owner confirmed receipt.",
            showStatusCard: false,
        },
        admin: {
            theme: "green",
            title: "Resolution Completed",
            subtitle: "This resolution is fully closed.",
            showStatusCard: false,
        },
    },

    invalidated: {
        owner: {
            theme: "amber",
            title: "Marked as Mismatched",
            subtitle: "You marked the return as mismatched.",
            showStatusCard: false,
        },
        finder: {
            theme: "amber",
            title: "Mismatch Reported",
            subtitle: "The owner reported the item did not match.",
            showStatusCard: false,
        },
        admin: {
            theme: "amber",
            title: "Resolution Invalidated",
            subtitle: "The owner invalidated the return.",
            showStatusCard: false,
        },
    },

    rejected: {
        owner: {
            theme: "orange",
            title: "Claim Not Approved",
            subtitle: "The finder rejected your claim.",
            cardTitle: "Claim Rejected",
            cardBody: "The finder decided not to approve the claim.",
            Icon: X,
        },
        finder: {
            theme: "orange",
            title: "Claim Rejected",
            subtitle: "You rejected this claim.",
            cardTitle: "No Further Action",
            cardBody: "This claim is now closed.",
            Icon: X,
        },
        admin: {
            theme: "orange",
            title: "Claim Rejected",
            subtitle: "Finder rejected the claim.",
            cardTitle: "System Status",
            cardBody: "No admin action required.",
            Icon: X,
        },
    },
} as const satisfies StatusUIMap;


function resolveStatusUI(
    resolution: Resolution,
    viewer: Viewer
): StatusUIConfig {
    return {
        showStatusCard: true,
        ...STATUS_UI[resolution.status][viewer.role],
    };
}


interface Props {
    resolution: Resolution;
    item: Item;
    finderContact: FinderContact | null;
    viewer: Viewer;
    allowedActions: AllowedAction[];
}

export function ResolutionStatusContent({
    resolution,
    item,
    finderContact,
    viewer,
    allowedActions,
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const config = useMemo(
        () => resolveStatusUI(resolution, viewer),
        [resolution.status, viewer.role]
    );

    const theme = THEMES[config.theme as ThemeKey];

    const handleAction = async (action: AllowedAction) => {
        if (action === "reject") {
            setShowRejectDialog(true);
            return;
        }

        setLoading(true);
        try {
            const res =
                action === "approve"
                    ? await approveClaim(resolution.id)
                    : action === "complete"
                        ? await completeResolution(resolution.id)
                        : await invalidateResolution(resolution.id);

            if (!res?.ok) throw new Error();
            router.refresh();
        } catch {
            toast.error("Action failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        const reason = rejectionReason.trim();
        if (reason.length < 20 || reason.length > 280) {
            toast.error("Rejection reason must be 20-280 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await rejectClaim(resolution.id, reason);
            if (!res.ok) throw new Error();
            router.refresh();
            setShowRejectDialog(false);
            setRejectionReason("");
        } catch {
            toast.error("Failed to reject claim.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <header className="text-center">
                    <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                        {config.title}
                    </h1>
                    <p className="text-muted-foreground">{config.subtitle}</p>
                </header>

                {/* Status */}
                {
                    config.showStatusCard &&
                    config.cardTitle &&
                    config.cardBody &&
                    config.Icon && (
                        <StatusAlert
                            title={config.cardTitle}
                            body={config.cardBody}
                            icon={config.Icon}
                            theme={theme}
                        />
                    )}

                {finderContact && (
                    <FinderContactCard contact={finderContact} theme={theme} />
                )}

                <ActionButtons
                    allowedActions={allowedActions}
                    loading={loading}
                    onAction={handleAction}
                />

                <RejectionDialog
                    open={showRejectDialog}
                    loading={loading}
                    reason={rejectionReason}
                    onReasonChange={setRejectionReason}
                    onConfirm={handleReject}
                    onCancel={() => setShowRejectDialog(false)}
                />

                <ClaimDescription resolution={resolution} borderClass={theme.border} />
                <ItemSummary item={item} />
            </div>
        </div>
    );
}