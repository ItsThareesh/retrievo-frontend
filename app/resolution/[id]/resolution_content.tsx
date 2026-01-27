"use client";

import { Resolution, FinderContact, Viewer, AllowedAction } from "@/types/resolutions";
import { Item } from "@/types/item";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Clock, Mail, Phone, ThumbsUp, ThumbsDown, CheckCheck, AlertTriangle, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { LOCATION_MAP } from "@/lib/constants/locations";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    approveClaim,
    rejectClaim,
    completeResolution,
    invalidateResolution,
} from "@/lib/api/client-invoked";

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

    const handleAction = async (action: AllowedAction) => {
        // Reject needs a dialog + reason
        if (action === "reject") {
            setShowRejectDialog(true);
            return;
        }

        setLoading(true);
        try {
            let res;

            switch (action) {
                case "approve":
                    res = await approveClaim(resolution.id);
                    break;

                case "complete":
                    res = await completeResolution(resolution.id);
                    break;

                case "invalidate":
                    res = await invalidateResolution(resolution.id);
                    break;

                default:
                    toast.error("Invalid action");
                    return;
            }

            if (!res?.ok) {
                toast.error("Action failed. Please try again.");
                return;
            }

            router.refresh();
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        const reason = rejectionReason.trim();

        if (reason.length < 20) {
            toast.error("Rejection reason must be at least 20 characters");
            return;
        }

        if (reason.length > 280) {
            toast.error("Rejection reason cannot exceed 280 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await rejectClaim(resolution.id, reason);

            if (!res.ok) {
                toast.error("Failed to reject claim. Please try again.");
                return;
            }

            setShowRejectDialog(false);
            setRejectionReason("");
            router.refresh();
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-6 sm:py-8 lg:py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                    {resolution.status === "pending" && (
                        <>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
                                {viewer.role === "finder" ? "Review Claim" : "Claim Submitted"}
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg px-2">
                                {viewer.role === "finder"
                                    ? "Someone is claiming this item. Please review their description and decide if it matches."
                                    : "Your claim is being reviewed by the finder."
                                }
                            </p>
                        </>
                    )}

                    {resolution.status === "approved" && (
                        <>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                                {viewer.role === "owner" ? "Claim Approved" : "Claim Approved"}
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg px-2">
                                {viewer.role === "owner"
                                    ? "The finder has approved your claim. Contact them to arrange collection."
                                    : "You approved this claim. The owner will contact you to collect the item."
                                }
                            </p>
                        </>
                    )}

                    {resolution.status === "return_initiated" && (
                        <>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                                {viewer.role === "owner" ? "Return Requested" : "Return Initiated"}
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg px-2">
                                {viewer.role === "owner"
                                    ? "A finder believes they have your item and wants to return it."
                                    : "You initiated a return for this item. Waiting for the owner to confirm."
                                }
                            </p>
                        </>
                    )}

                    {resolution.status === "completed" && (
                        <>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">Item Returned</h1>
                            <p className="text-muted-foreground text-base sm:text-lg px-2">
                                This item has been successfully marked as returned.
                            </p>
                        </>
                    )}

                    {resolution.status === "invalidated" && (
                        <>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                                {viewer.role === "owner" ? "Marked as Mismatched" : "Owner Reported Mismatch"}
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg px-2">
                                {viewer.role === "owner"
                                    ? "You marked this return as mismatched."
                                    : "The owner reported that the item didn't match."
                                }
                            </p>
                        </>
                    )}

                    {resolution.status === "rejected" && (
                        <>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-red-600">
                                {viewer.role === "owner" ? "Claim Not Approved" : "Claim Rejected"}
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg px-2">
                                {viewer.role === "owner"
                                    ? "The finder was unable to approve your claim."
                                    : "You rejected this claim."
                                }
                            </p>
                        </>
                    )}
                </div>

                {/* Status Cards */}
                {resolution.status === "pending" && viewer.role === "owner" && (
                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-50 mb-2">
                                    Awaiting Finder's Review
                                </h3>
                                <p className="text-sm text-blue-800 dark:text-blue-100 mb-3">
                                    The person who found this item is reviewing your claim. This usually takes 1-2 days.
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-200">
                                    You'll receive a notification when they make a decision. If approved, the finder's contact details will be revealed so you can arrange to collect your item.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {resolution.status === "pending" && viewer.role === "finder" && (
                    <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-900 dark:text-amber-50 mb-2">
                                    Action Required
                                </h3>
                                <p className="text-sm text-amber-800 dark:text-amber-100 mb-3">
                                    Review the claimant's description below. If it matches your found item, approve the claim to share your contact details.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {(resolution.status === "approved" || resolution.status === "return_initiated") && viewer.role === "owner" && (
                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-900 dark:text-green-50 mb-2">
                                    Ready to Collect
                                </h3>
                                <p className="text-sm text-green-800 dark:text-green-100 mb-3">
                                    Contact the finder below to arrange collection. After you've collected your item, please mark the return as complete.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {finderContact && (
                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-900 dark:text-green-50 mb-2">
                                    Finder's Contact Details
                                </h3>
                                <p className="text-sm text-green-800 dark:text-green-100 mb-4">
                                    Please reach out to arrange a time and place to collect your item.
                                </p>

                                {/* Contact Card */}
                                <div className="bg-white dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-semibold text-green-900 dark:text-green-50">
                                                {finderContact.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <Link
                                                href={`mailto:${finderContact.email}`}
                                                className="text-sm text-green-900 dark:text-green-100 hover:underline"
                                            >
                                                {finderContact.email}
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <Link
                                                href={`tel:${finderContact.phone}`}
                                                className="text-sm text-green-900 dark:text-green-100 hover:underline"
                                            >
                                                {finderContact.phone}
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-green-700 dark:text-green-200 mt-3">
                                    Be respectful and coordinate a safe, public meeting place.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {resolution.status === "rejected" && (
                    <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <X className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                            <div className="w-full">
                                <h3 className="font-semibold text-orange-900 dark:text-orange-50 mb-2">
                                    Claim Not Approved
                                </h3>
                                <p className="text-sm text-orange-800 dark:text-orange-100 mb-3">
                                    The finder has decided not to approve this claim.
                                </p>
                                {resolution.rejection_reason && (
                                    <div className="bg-orange-100 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-700 rounded-md p-3">
                                        <p className="text-xs font-medium text-orange-900 dark:text-orange-100 mb-1">
                                            Reason provided:
                                        </p>
                                        <p className="text-sm text-orange-800 dark:text-orange-200 whitespace-pre-wrap">
                                            {resolution.rejection_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Action Buttons */}
                {allowedActions.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        {allowedActions.includes("approve") && (
                            <Button
                                onClick={() => handleAction("approve")}
                                disabled={loading}
                                size="lg"
                                className="p-2 flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                            >
                                <ThumbsUp className="h-5 w-5 mr-2" />
                                Approve Claim
                            </Button>
                        )}
                        {allowedActions.includes("reject") && (
                            <Button
                                onClick={() => setShowRejectDialog(true)}
                                disabled={loading}
                                size="lg"
                                variant="destructive"
                                className="p-2 flex-1 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                            >
                                <ThumbsDown className="h-5 w-5 mr-2" />
                                Reject Claim
                            </Button>
                        )}
                        {allowedActions.includes("complete") && (
                            <Button
                                onClick={() => handleAction("complete")}
                                disabled={loading}
                                size="lg"
                                className="p-2 flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 dark:from-teal-500 dark:to-cyan-500 dark:hover:from-teal-600 dark:hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                            >
                                <CheckCheck className="h-5 w-5 mr-2" />
                                Mark as Returned
                            </Button>
                        )}
                        {allowedActions.includes("invalidate") && (
                            <Button
                                onClick={() => handleAction("invalidate")}
                                disabled={loading}
                                size="lg"
                                variant="outline"
                                className="p-2 flex-1 border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-600 dark:hover:border-amber-400 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                            >
                                <X className="h-5 w-5 mr-2" />
                                Item Doesn't Match
                            </Button>
                        )}
                    </div>
                )}

                {/* Rejection Dialog */}
                {showRejectDialog && (
                    <Card className="p-4 sm:p-6 border-2 border-orange-500 shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Reject Claim</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Please provide a reason for rejecting this claim. This will be shared with the claimant.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Explain why this claim doesn't match the item..."
                            className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                            disabled={loading}
                        />
                        <div className="flex gap-3 mt-4">
                            <Button
                                onClick={handleReject}
                                disabled={loading || (rejectionReason.trim().length < 20)}
                                variant="destructive"
                            >
                                Confirm Rejection
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowRejectDialog(false);
                                    setRejectionReason("");
                                }}
                                disabled={loading}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Claim Description Card */}
                <Card className="p-4 sm:p-6 border-l-4 border-l-teal-500 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3">Description</h2>
                    <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                        {resolution.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                        Submitted {formatDistanceToNow(new Date(resolution.created_at), {
                            addSuffix: true,
                        })}
                    </p>
                </Card>

                {/* Item Summary */}
                {item && (
                    <Card className="p-4 sm:p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">
                            Item Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Item Image */}

                            <div className="md:col-span-1">
                                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-muted-foreground text-center">
                                            <EyeOff className="h-7 w-7 mb-1.5" />
                                            <span className="text-xs">Restricted image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Item Info */}
                            <div className={item.image ? "md:col-span-2" : "col-span-1"}>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.description}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Location
                                        </p>
                                        <p className="text-sm font-medium">{LOCATION_MAP[item.location]?.label}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Found On
                                        </p>
                                        <p className="text-sm font-medium">
                                            {new Date(item.date).toLocaleDateString("en-GB").replace(/\//g, "-")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
