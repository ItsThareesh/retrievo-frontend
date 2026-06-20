"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    Clock,
    AlertTriangle,
    CheckCircle2,
    X,
    LucideIcon,
    ArrowUpRight,
    ShieldAlert,
    Trash2
} from "lucide-react";

import { Resolution, FinderContact, Viewer, AllowedAction, LinkedItem } from "@/types/resolutions";
import { Item } from "@/types/item";
import {
    approveResolution,
    rejectResolution,
    completeResolution,
    failResolution,
} from "@/lib/api/resolutions";
import { clientFetch, APIError } from "@/lib/client-fetch";

import { ActionButtons } from "./components/action-buttons";
import { RejectionDialog } from "./components/rejection-dialog";
import { ClaimDescription } from "./components/claim-description";
import { ItemSummary } from "./components/item-summary";
import { StatusAlert } from "./components/status-alert";
import { FinderContactCard } from "./components/finder-contact";
import { ThemeKey, THEMES } from "./theme";
import { formatDateString } from "@/lib/date-formatting";
import { LOCATION_MAP } from "@/lib/constants/locations";
import { ResolutionDetailSkeleton } from "@/app/items/items-loading-skeleton";


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
            theme: "blue",
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
            theme: "emerald",
            title: "Item Returned",
            subtitle: "You successfully received your item.",
            showStatusCard: false,
        },
        finder: {
            theme: "emerald",
            title: "Return Completed",
            subtitle: "The owner confirmed receipt.",
            showStatusCard: false,
        },
        admin: {
            theme: "emerald",
            title: "Resolution Completed",
            subtitle: "This resolution is fully closed.",
            showStatusCard: false,
        },
    },

    failed: {
        owner: {
            theme: "darkRed",
            title: "Marked as Mismatched",
            subtitle: "You marked the return as mismatched.",
            showStatusCard: false,
        },
        finder: {
            theme: "darkRed",
            title: "Mismatch Reported",
            subtitle: "The owner reported the item did not match.",
            showStatusCard: false,
        },
        admin: {
            theme: "darkRed",
            title: "Resolution Invalidated",
            subtitle: "The owner failed the return.",
            showStatusCard: false,
        },
    },

    rejected: {
        owner: {
            theme: "red",
            title: "Claim Not Approved",
            subtitle: "The finder rejected your claim.",
            cardTitle: "Claim Rejected",
            cardBody: "The finder decided not to approve the claim.",
            Icon: X,
        },
        finder: {
            theme: "red",
            title: "Claim Rejected",
            subtitle: "You rejected this claim.",
            cardTitle: "No Further Action",
            cardBody: "This claim is now closed.",
            Icon: X,
        },
        admin: {
            theme: "red",
            title: "Claim Rejected",
            subtitle: "Finder rejected the claim.",
            cardTitle: "System Status",
            cardBody: "No admin action required.",
            Icon: X,
        },
    },

    invalidated: {
        owner: {
            theme: "orange",
            title: "Resolution Invalidated",
            subtitle: "This resolution has been invalidated.",
            cardTitle: "Resolution Invalidated",
            cardBody: "This resolution has been invalidated because the item is no longer available.",
            Icon: X,
        },
        finder: {
            theme: "orange",
            title: "Resolution Invalidated",
            subtitle: "This resolution has been invalidated.",
            cardTitle: "Resolution Invalidated",
            cardBody: "This resolution has been invalidated because the item is no longer available.",
            Icon: X,
        },
        admin: {
            theme: "orange",
            title: "Resolution Invalidated",
            subtitle: "This resolution has been invalidated.",
            cardTitle: "Resolution Invalidated",
            cardBody: "This resolution has been invalidated because the item is no longer available.",
            Icon: X,
        },
    },
    expired: {
        owner: {
            theme: "amber",
            title: "Resolution Expired",
            subtitle: "This resolution has expired.",
            cardTitle: "Resolution Expired",
            cardBody: "This resolution has expired due to inactivity and is no longer valid.",
            Icon: X,
        },
        finder: {
            theme: "amber",
            title: "Resolution Expired",
            subtitle: "This resolution has expired.",
            cardTitle: "Resolution Expired",
            cardBody: "This resolution has expired due to inactivity and is no longer valid.",
            Icon: X,
        },
        admin: {
            theme: "amber",
            title: "Resolution Expired",
            subtitle: "This resolution has expired.",
            cardTitle: "Resolution Expired",
            cardBody: "This resolution has expired due to inactivity and is no longer valid.",
            Icon: X,
        },
        
    },
    pending_admin_review: {
        owner: {
            theme: "purple",
            title: "Awaiting Admin Review",
            subtitle: "This resolution is awaiting administrative review.",
            cardTitle: "Awaiting Admin Review",
            cardBody: "This resolution has been inactive for an extended period and is currently being reviewed by an administrator. It may be reactivated or marked as expired.",
            Icon: ShieldAlert,
        },
        finder: {
            theme: "purple",
            title: "Awaiting Admin Review",
            subtitle: "This resolution is awaiting administrative review.",
            cardTitle: "Awaiting Admin Review",
            cardBody: "This resolution has been inactive for an extended period and is now under administrative review. An administrator may reactivate it or allow it to expire.",
            Icon: ShieldAlert,
        },
        admin: {
            theme: "purple",
            title: "Review Required",
            subtitle: "Administrative action is required.",
            cardTitle: "Resolution Pending Review",
            cardBody: "No activity has been recorded for this resolution within the review period. You may reactivate the resolution if it is still relevant or mark it as expired.",
            Icon: ShieldAlert,
        },
        
    }
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


interface ResolutionData {
    resolution: Resolution;
    item: Item;
    finder_contact: FinderContact | null;
    viewer: Viewer;
    allowed_actions: AllowedAction[];
    linked_item: LinkedItem | null;
}

export default function ClaimStatusPage() {
    const params = useParams();
    const resolutionId = params.id as string;
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.backendToken;

    const [resolution, setResolution] = useState<Resolution | null>(null);
    const [item, setItem] = useState<Item | null>(null);
    const [finderContact, setFinderContact] = useState<FinderContact | null>(null);
    const [viewer, setViewer] = useState<Viewer | null>(null);
    const [allowedActions, setAllowedActions] = useState<AllowedAction[]>([]);
    const [linkedItem, setLinkedItem] = useState<LinkedItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!resolutionId) return;
        if (sessionStatus === "loading") return;

        setIsLoading(true);
        setFetchError(null);
        clientFetch<ResolutionData>(`/resolutions/${resolutionId}`, token)
            .then((data) => {
                setResolution(data.resolution);
                setItem(data.item);
                setFinderContact(data.finder_contact);
                setViewer(data.viewer);
                setAllowedActions(data.allowed_actions);
                setLinkedItem(data.linked_item);
                setIsLoading(false);
            })
            .catch((err) => {
                if (err instanceof APIError && err.status === 404) {
                    setFetchError("not_found");
                } else {
                    setFetchError("unknown");
                }
                setIsLoading(false);
            });
    }, [resolutionId, token, sessionStatus, refreshKey]);

    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const config = useMemo(
        () => resolution && viewer ? resolveStatusUI(resolution, viewer) : null,
        [resolution?.status, viewer?.role]
    );

    const theme = config ? THEMES[config.theme as ThemeKey] : null;

    if (sessionStatus === "unauthenticated") {
        return <SignInRedirect resolutionId={resolutionId} />;
    }

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <ResolutionDetailSkeleton />
                </div>
            </div>
        );
    }

    if (fetchError === "not_found") {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Claim Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        This claim does not exist or you don't have permission to view it.
                    </p>
                    <a href="/items" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                        Back to Items
                    </a>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p className="text-muted-foreground mb-6">Failed to load resolution details.</p>
                    <a href="/items" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                        Back to Items
                    </a>
                </div>
            </div>
        );
    }

    if (!resolution || !item || !viewer || !config || !theme) return null;

    const resId = resolution.id;
    const itemId = item.id;

    async function handleAction(action: AllowedAction) {
        if (action === "reject") {
            setShowRejectDialog(true);
            return;
        }

        setActionLoading(true);
        try {
            const result = action === "approve"
                ? await approveResolution(resId, itemId)
                : action === "complete"
                    ? await completeResolution(resId)
                    : await failResolution(resId, itemId);

            if (!result?.ok) throw new Error();
        } catch (err) {
            toast.error("Action failed. Please try again.");
            setActionLoading(false);
            return;
        }

        setRefreshKey(k => k + 1);
        setActionLoading(false);
    }

    async function handleReject() {
        const reason = rejectionReason.trim();
        if (reason.length < 20 || reason.length > 280) {
            toast.error("Rejection reason must be 20-280 characters");
            return;
        }

        setActionLoading(true);
        try {
            const result = await rejectResolution(resId, reason, itemId);
            if (!result.ok) throw new Error();
            setShowRejectDialog(false);
            setRejectionReason("");
        } catch (err) {
            toast.error("Failed to reject claim.");
            setActionLoading(false);
            return;
        }

        setRefreshKey(k => k + 1);
        setActionLoading(false);
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <header className="text-center">
                    <h1 className={`
                        text-3xl font-bold
                        bg-gradient-to-t ${theme.gradient}
                        bg-clip-text text-transparent
                        inline-block
                        will-change-transform
                    `}>
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

                {resolution.description && <ClaimDescription resolution={resolution} />}

                <ActionButtons
                    allowedActions={allowedActions}
                    loading={actionLoading}
                    onAction={handleAction}
                />

                <RejectionDialog
                    open={showRejectDialog}
                    loading={actionLoading}
                    reason={rejectionReason}
                    onReasonChange={setRejectionReason}
                    onConfirm={handleReject}
                    onCancel={() => setShowRejectDialog(false)}
                />
                
                {/* TODO: Display contents of `failure_reason` or `rejection_reason` or `invalidated_reason` for the user
                If it's the finder, show `failure` reason
                If it's the owner, show `rejection` reason
                Both users can see `invalidated` reason if appropriate */}
                
                <ItemSummary item={item} />

                {linkedItem && (
                    <div className={`rounded-lg border ${theme.border} p-4 space-y-2`}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                Linked {linkedItem.type === "lost" ? "Lost" : "Found"} Item
                            </h3>
                            <div className="flex gap-2">
                                {linkedItem.hidden && !linkedItem.deleted && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                                        <ShieldAlert className="h-3 w-3" />
                                        Hidden Item
                                    </span>
                                )}
                                {linkedItem.deleted && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                                        <Trash2 className="h-3 w-3" />
                                        Deleted Item
                                    </span>
                                )}
                            </div>
                        </div>

                        {linkedItem.deleted ? (
                            <div className="flex flex-col items-center justify-center text-center py-6 bg-muted/30 rounded-md border border-dashed mt-2">
                                <Trash2 className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                                <span className="text-sm font-medium text-foreground">Item Deleted</span>
                                <span className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">This linked item has been deleted and is no longer available.</span>
                            </div>
                        ) : (
                            <>
                                <a
                                    href={`/items/${linkedItem.id}`}
                                    className={`block ${linkedItem.hidden ? 'pointer-events-none' : ''}`}
                                    onClick={(e) => linkedItem.hidden && e.preventDefault()}
                                >
                                    <div className="flex items-center gap-1 mt-2 group">
                                        <p className={`font-medium ${linkedItem.hidden ? '' : 'group-hover:opacity-80'} transition-opacity`}>
                                            {linkedItem.title}
                                        </p>
                                        {!linkedItem.hidden && <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:opacity-80 transition-opacity" />}
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                        {linkedItem.category && <span>{linkedItem.category}</span>}
                                        {linkedItem.location && <span>{LOCATION_MAP[linkedItem.location]?.label || "Unknown Location"}</span>}
                                        {linkedItem.date && (
                                            <span>{formatDateString(linkedItem.date)}</span>
                                        )}
                                    </div>
                                </a>
                                
                                {linkedItem.hidden && linkedItem.hidden_reason && (
                                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2.5 text-destructive text-sm mt-3">
                                        <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-[11px] uppercase tracking-wider">Hidden Reason</span>
                                            <span className="font-medium mt-0.5 capitalize">{linkedItem.hidden_reason.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function SignInRedirect({ resolutionId }: { resolutionId: string }) {
    const router = useRouter();

    useEffect(() => {
        router.push(`/auth/signin?callbackUrl=/resolution/${resolutionId}`);
    }, [router, resolutionId]);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <ResolutionDetailSkeleton />
        </div>
    );
}
