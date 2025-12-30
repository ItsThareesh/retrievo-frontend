"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Claim } from "@/types/claim";
import { approveClaim, rejectClaim } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Item } from "@/types/item";

interface FinderReviewContentProps {
    claim: Claim;
    item: Item;
}

export function FinderReviewContent({ claim, item }: FinderReviewContentProps) {
    const router = useRouter();

    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showContactDetails, setShowContactDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleApprove() {
        setIsProcessing(true);
        setError(null);

        const result = await approveClaim(claim.id);

        if (!result.ok) {
            setError(
                result.error === "Claim already resolved"
                    ? "This claim has already been resolved."
                    : "Failed to approve claim. Please try again."
            );
            setIsProcessing(false);
            return;
        }

        // Show contact details after approval
        setShowContactDetails(true);
        setShowApproveConfirm(false);
    }

    async function handleReject() {
        const reason = rejectionReason.trim();

        if (reason.length < 20) {
            setError("Rejection reason must be at least 20 characters.");
            return;
        }

        if (reason.length > 280) {
            setError("Rejection reason must be at most 280 characters.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        const res = await rejectClaim(claim.id, reason);

        if (!res.ok) {
            if (res.status === 422) {
                setError("Rejection reason must be between 20 and 280 characters.");
            } else {
                setError("Failed to reject claim.");
            }
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false);
        setShowRejectForm(false);
        setRejectionReason("");

        // Redirect after success
        router.push("/items");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Review Claim</h1>
                    <p className="text-muted-foreground">
                        Someone has claimed your found item. Review their description and decide. Your contact details will be shared with them if approved.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <Card className="bg-destructive/10 border-destructive/30 text-destructive p-4 mb-6">
                        <p className="font-medium">{error}</p>
                    </Card>
                )}

                {/* Contact Details Shared Confirmation */}
                {showContactDetails && (
                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <div>
                                <h2 className="font-semibold text-green-900 dark:text-green-50 mb-2">
                                    Claim Approved!
                                </h2>
                                <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-md p-3">
                                    <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">
                                        Details shared with claimant:
                                    </p>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        Your email and phone number (from your profile)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Claim Description Card */}
                <Card className="p-6 mb-6 border-l-4 border-l-blue-500">
                    <h2 className="text-lg font-semibold mb-3">Claimant's Description</h2>
                    <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                        {claim.claim_description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                        Submitted {formatDistanceToNow(new Date(claim.created_at), {
                            addSuffix: true,
                        })}
                    </p>
                </Card>

                {/* Item Summary */}
                <Card className="p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Found Item Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Item Image */}
                        {item.image && (
                            <div className="md:col-span-1">
                                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Item Info */}
                        <div className={item.image ? "md:col-span-2" : "col-span-1"}>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Location
                                        </p>
                                        <p className="text-sm font-medium">{item.location}</p>
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
                    </div>
                </Card>

                {/* Decision Section */}
                {!showContactDetails && (
                    <div className="space-y-4">
                        {!showRejectForm ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={() => setShowApproveConfirm(true)}
                                    disabled={isProcessing}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-11 font-medium"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Accept Claim
                                </Button>

                                <Button
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={isProcessing}
                                    variant="outline"
                                    className="flex-1 h-11 font-medium"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject Claim
                                </Button>
                            </div>
                        ) : (
                            <Card className="p-6 bg-muted/30">
                                <h3 className="font-semibold mb-4">Why are you rejecting this claim?</h3>

                                <Textarea
                                    placeholder="Provide a brief reason for rejection (visible to the claimant)..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="mb-4 resize-none"
                                    rows={4}
                                />

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleReject}
                                        disabled={rejectionReason.trim().length < 20 || isProcessing}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        {isProcessing ? "Submitting..." : "Submit Rejection"}
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setShowRejectForm(false);
                                            setRejectionReason("");
                                        }}
                                        disabled={isProcessing}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Approval Confirmation Dialog */}
                <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
                    <AlertDialogContent className="max-w-sm">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Accept This Claim?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Once you accept, your contact details will be shared with the claimant and this
                                decision cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-100">
                            Your email will be shared with the claimant so they can contact you to arrange the handover.
                        </div>
                        <div className="flex justify-end gap-3">
                            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isProcessing ? "Processing..." : "Yes, Accept Claim"}
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
