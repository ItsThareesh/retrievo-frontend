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
} from "@/lib/api/client-invoked";

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
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2, X, Clock, Mail, Phone, ThumbsUp, ThumbsDown, CheckCheck, AlertTriangle, LucideIcon } from "lucide-react";

import { Resolution, FinderContact, Viewer, AllowedAction } from "@/types/resolutions";
import { Item } from "@/types/item";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LOCATION_MAP } from "@/lib/constants/locations";
import { approveClaim, rejectClaim, completeResolution, invalidateResolution } from "@/lib/api/client-invoked";

// 1. Unified Theme Configuration
const THEMES = {
  blue: {
    gradient: "from-blue-500 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500",
    cardBg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    textTitle: "text-blue-600 dark:text-blue-300",
    textMain: "text-blue-900 dark:text-blue-50",
    textSub: "text-blue-800 dark:text-blue-100",
    icon: "text-blue-600 dark:text-blue-400",
    contactBox: "bg-background dark:bg-blue-900/20",
    contactBorder: "border-blue-200 dark:border-blue-700",
    buttonBg: "bg-amber-600 dark:bg-amber-400 dark:text-black",
    border:"border-l-4 border-l-blue-600"
  },
  amber: {
    gradient: "from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400",
    cardBg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    textTitle: "text-amber-600 dark:text-amber-300",
    textMain: "text-amber-900 dark:text-amber-50",
    textSub: "text-amber-800 dark:text-amber-100",
    icon: "text-amber-600 dark:text-amber-400",
    contactBox: "bg-background dark:bg-amber-900/20",
    contactBorder: "border-amber-200 dark:border-amber-700",
    buttonBg: "bg-amber-600 dark:bg-amber-400 dark:text-black",
    border:"border-l-4 border-l-amber-600"
  },
  green: {
    gradient: "from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400",
    cardBg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    textTitle: "text-green-600 dark:text-green-300",
    textMain: "text-green-900 dark:text-green-50",
    textSub: "text-green-800 dark:text-green-100",
    icon: "text-green-600 dark:text-green-400",
    contactBox: "bg-background dark:bg-green-900/20",
    contactBorder: "border-green-200 dark:border-green-700",
    buttonBg: "bg-green-600 dark:bg-green-400 dark:text-black",
    border:"border-l-4 border-l-green-600"
  },
  cyan: {
    gradient: "from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400",
    cardBg: "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800",
    textTitle: "text-cyan-600 dark:text-cyan-300",
    textMain: "text-cyan-900 dark:text-cyan-50",
    textSub: "text-cyan-800 dark:text-cyan-100",
    icon: "text-cyan-600 dark:text-cyan-400",
    contactBox: "bg-background dark:bg-cyan-900/20",
    contactBorder: "border-cyan-200 dark:border-cyan-700",
    buttonBg: "bg-cyan-600 dark:bg-cyan-400 dark:text-black",
    border:"border-l-4 border-l-cyan-600"
  },
  orange: {
    gradient: "text-red-600",
    cardBg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    textTitle: "text-orange-600 dark:text-orange-300",
    textMain: "text-orange-900 dark:text-orange-50",
    textSub: "text-orange-800 dark:text-orange-100",
    icon: "text-orange-600 dark:text-orange-400",
    contactBox: "bg-background dark:bg-orange-900/20",
    contactBorder: "border-orange-200 dark:border-orange-700",
    buttonBg: "bg-orange-600 dark:bg-orange-400 dark:text-black",
    border:"border-l-4 border-l-orange-600"
  }
};

type ThemeKey = keyof typeof THEMES;

interface ResolutionStatusContentProps {
  resolution: Resolution;
  item: Item;
  finderContact: FinderContact | null;
  viewer: Viewer;
  allowedActions: AllowedAction[];
}

export function ResolutionStatusContent({ resolution, item, finderContact, viewer, allowedActions }: ResolutionStatusContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const getStatusContent = () => {
    const isOwner = viewer.role === "owner";
    
    let config = {
      theme: "blue" as ThemeKey,
      title: "",
      subtitle: "",
      cardTitle: "",
      cardBody: "",
      Icon: Clock as LucideIcon,
      showStatusCard: true
    };

    switch (resolution.status) {
      case "pending":
        if (isOwner) {
          config = { ...config, theme: "blue", title: "Claim Submitted", subtitle: "Your claim is being reviewed by the finder.", cardTitle: "Awaiting Finder's Review", cardBody: "The person who found this item is reviewing your claim. This usually takes 1-2 days.", Icon: Clock };
        } else {
          config = { ...config, theme: "amber", title: "Review Claim", subtitle: "Someone is claiming this item. Please review their description.", cardTitle: "Action Required", cardBody: "Review the claimant's description below. If it matches your found item, approve the claim.", Icon: AlertTriangle };
        }
        break;
      case "approved":
        config = { ...config, theme: "green", title: "Claim Approved", subtitle: isOwner ? "The finder approved your claim. Contact them to arrange collection." : "You approved this claim. The owner will contact you.", cardTitle: "Ready to Collect", cardBody: "Contact the finder below to arrange collection. Mark as complete once done.", Icon: CheckCircle2 };
        break;
      case "return_initiated":
        config = { ...config, theme: "cyan", title: isOwner ? "Return Requested" : "Return Initiated", subtitle: isOwner ? "A finder believes they have your item." : "You initiated a return. Waiting for owner confirmation.", cardTitle: "Ready to Collect", cardBody: "Contact the finder to arrange collection.", Icon: CheckCircle2 };
        break;
      case "completed":
        config = { ...config, theme: "green", title: "Item Returned", subtitle: "This item has been successfully marked as returned.", showStatusCard: false };
        break;
      case "invalidated":
        config = { ...config, theme: "amber", title: isOwner ? "Marked as Mismatched" : "Owner Reported Mismatch", subtitle: isOwner ? "You marked this return as mismatched." : "The owner reported that the item didn't match.", showStatusCard: false };
        break;
      case "rejected":
        config = { ...config, theme: "orange", title: isOwner ? "Claim Not Approved" : "Claim Rejected", subtitle: isOwner ? "The finder was unable to approve your claim." : "You rejected this claim.", cardTitle: "Claim Not Approved", cardBody: "The finder has decided not to approve this claim.", Icon: X };
        break;
    }
    return config;
  };

  const ui = getStatusContent();
  const themeStyles = THEMES[ui.theme];

  const executeApiCall = async (fn: () => Promise<any>, successMsg?: string) => {
    setLoading(true);
    try {
      const res = await fn();
      if (!res?.ok) throw new Error();
      if (successMsg) toast.success(successMsg);
      router.refresh();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: AllowedAction) => {
    if (action === "reject") return setShowRejectDialog(true);
    
    const actions = {
      approve: () => executeApiCall(() => approveClaim(resolution.id)),
      complete: () => executeApiCall(() => completeResolution(resolution.id)),
      invalidate: () => executeApiCall(() => invalidateResolution(resolution.id)),
    };
    actions[action as keyof typeof actions]?.();
  };

<<<<<<< HEAD
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
=======
  const handleRejectConfirm = async () => {
    if (rejectionReason.length < 20 || rejectionReason.length > 280) {
      return toast.error("Reason must be between 20 and 280 characters");
    }
    await executeApiCall(() => rejectClaim(resolution.id, rejectionReason));
    setShowRejectDialog(false);
    setRejectionReason("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className={`text-3xl lg:text-4xl font-bold mb-3 bg-clip-text ${themeStyles.gradient} ${ui.theme === 'orange' ? '!text-red-600' : ''} ${themeStyles.textTitle}`}>
            {ui.title}
          </h1>
          <p className="text-muted-foreground text-lg px-2">{ui.subtitle}</p>
        </div>

        {/* Dynamic Status Card */}
        {ui.showStatusCard && (
          <Card className={`p-6 shadow-sm ${themeStyles.cardBg}`}>
            <div className="flex items-start gap-3">
              <ui.Icon className={`h-5 w-5 shrink-0 mt-0.5 ${themeStyles.icon}`} />
              <div className="w-full">
                <h3 className={`font-semibold mb-2 ${themeStyles.textMain}`}>{ui.cardTitle}</h3>
                <p className={`text-sm ${themeStyles.textSub}`}>{ui.cardBody}</p>
                {resolution.rejection_reason && (
                  <div className="bg-orange-100 dark:bg-orange-900/50 border border-orange-300 rounded-md p-3 mt-3">
                    <p className="text-xs font-medium text-orange-900 dark:text-orange-100 mb-1">Reason provided:</p>
                    <p className="text-sm text-orange-800 dark:text-orange-200 whitespace-pre-wrap">{resolution.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Finder Contact (Now Dynamic: Matches Theme) */}
        {finderContact && (
          <Card className={`p-6 shadow-sm ${themeStyles.contactBox}`}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${themeStyles.icon}`} />
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${themeStyles.textMain}`}>Finder's Contact Details</h3>
                <p className={`text-sm mb-4 ${themeStyles.textSub}`}>Please reach out to arrange a time and place to collect your item.</p>
                
                <div className={`border rounded-lg p-4 space-y-3 ${themeStyles.contactBox} ${themeStyles.contactBorder}`}>
                  <p className={`font-semibold ${themeStyles.textMain}`}>{finderContact.name}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Mail className={`h-4 w-4 ${themeStyles.icon}`} />
                        <Link href={`mailto:${finderContact.email}`} className={`text-sm hover:underline ${themeStyles.textMain}`}>{finderContact.email}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className={`h-4 w-4 ${themeStyles.icon}`} />
                        <Link href={`tel:${finderContact.phone}`} className={`text-sm hover:underline ${themeStyles.textMain}`}>{finderContact.phone}</Link>
                    </div>
                  </div>
                </div>

                <p className={`text-xs mt-3 opacity-80 ${themeStyles.textSub}`}>Be respectful and coordinate a safe, public meeting place.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {allowedActions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {allowedActions.includes("approve") && (
              <Button onClick={() => handleAction("approve")} disabled={loading} size="lg" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md cursor-pointer">
                <ThumbsUp className="h-5 w-5 mr-2" /> Approve Claim
              </Button>
            )}
            {allowedActions.includes("reject") && (
              <Button onClick={() => handleAction("reject")} disabled={loading} size="lg" variant="destructive" className="flex-1 shadow-md cursor-pointer">
                <ThumbsDown className="h-5 w-5 mr-2" /> Reject Claim
              </Button>
            )}
            {allowedActions.includes("complete") && (
              <Button onClick={() => handleAction("complete")} disabled={loading} size="lg" className={`flex-1 text-white shadow-md ${themeStyles.buttonBg} hover:${themeStyles.buttonBg} cursor-pointer`}>
                <CheckCheck className={`h-5 w-5 mr-2`} /> Mark as Returned
              </Button>
            )}
            {allowedActions.includes("invalidate") && (
              <Button onClick={() => handleAction("invalidate")} disabled={loading} size="lg" variant="outline" className="flex-1 border-red-500 text-red-600 hover:bg-white hover:text-red-700 cursor-pointer">
                <X className="h-5 w-5 mr-2" /> Item Doesn't Match
              </Button>
            )}
          </div>
        )}

        {/* Dialogs & Item Info */}
        {showRejectDialog && (
          <Card className="p-6 border-2 border-orange-500 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Reject Claim</h2>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this claim doesn't match..." className="w-full min-h-[100px] p-3 border rounded-md resize-none" disabled={loading} />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleRejectConfirm} disabled={loading || rejectionReason.trim().length < 20} variant="destructive">Confirm</Button>
              <Button onClick={() => { setShowRejectDialog(false); setRejectionReason(""); }} variant="outline">Cancel</Button>
            </div>
          </Card>
        )}

        <Card className={`p-6 ${themeStyles.border} shadow-sm`}>
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="whitespace-pre-wrap">{resolution.description}</p>
          <p className="text-xs text-muted-foreground mt-4">Submitted {formatDistanceToNow(new Date(resolution.created_at), { addSuffix: true })}</p>
        </Card>

        {item && (
          <Card className="p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Item Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {item.image && (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
              )}
              <div className={item.image ? "md:col-span-2" : "col-span-1"}>
                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                <p className="text-muted-foreground mb-3">{item.description}</p>
                <div className="grid gap-2">
                  <div><p className="text-xs font-medium uppercase text-muted-foreground">Location</p><p className="text-sm">{LOCATION_MAP[item.location]?.label}</p></div>
                  <div><p className="text-xs font-medium uppercase text-muted-foreground">Found On</p><p className="text-sm">{new Date(item.date).toLocaleDateString("en-GB").replace(/\//g, "-")}</p></div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
>>>>>>> 62e1460 (Resolutions page is now polished and code is concise)
}