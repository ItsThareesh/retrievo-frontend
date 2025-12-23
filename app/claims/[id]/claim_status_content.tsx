"use client";

import { Claim, FinderContact } from "@/types/claim";
import { Item } from "@/types/item";
import { Card } from "@/components/ui/card";
import { CheckCircle2, X, Clock, Mail, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClaimStatusContentProps {
    claim: Claim;
    item: Item;
    finderContact: FinderContact | null;
}

export function ClaimStatusContent({ claim, item, finderContact }: ClaimStatusContentProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    {claim.status === "pending" && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Claim Submitted</h1>
                            <p className="text-muted-foreground">
                                Your claim is being reviewed by the finder. You'll be notified once they make a decision.
                            </p>
                        </>
                    )}
                    {claim.status === "approved" && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Claim Approved!</h1>
                            <p className="text-muted-foreground">
                                Great news! The finder has approved your claim. Contact details are shown below.
                            </p>
                        </>
                    )}
                    {claim.status === "rejected" && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Claim Not Approved</h1>
                            <p className="text-muted-foreground">
                                The finder was unable to approve your claim at this time.
                            </p>
                        </>
                    )}
                </div>

                {/* Status Cards */}
                {claim.status === "pending" && (
                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 p-6 mb-6">
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

                {claim.status === "approved" && finderContact && (
                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-6 mb-6">
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
                                        {/* <Avatar className="h-12 w-12">
                                            <AvatarImage src={finderContact.image} alt={finderContact.name} />
                                            <AvatarFallback className="bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100">
                                                {finderContact.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar> */}
                                        <div>
                                            <p className="font-semibold text-green-900 dark:text-green-50">
                                                {finderContact.name}
                                            </p>
                                            {/* <p className="text-xs text-green-700 dark:text-green-200">
                                                Item Finder
                                            </p> */}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <a
                                                href={`mailto:${finderContact.email}`}
                                                className="text-sm text-green-900 dark:text-green-100 hover:underline"
                                            >
                                                {finderContact.email}
                                            </a>
                                        </div>

                                        {finderContact.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <a
                                                    href={`tel:${finderContact.phone}`}
                                                    className="text-sm text-green-900 dark:text-green-100 hover:underline"
                                                >
                                                    {finderContact.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-green-700 dark:text-green-200 mt-3">
                                    Be respectful and coordinate a safe, public meeting place.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {claim.status === "rejected" && (
                    <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <X className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                            <div className="w-full">
                                <h3 className="font-semibold text-orange-900 dark:text-orange-50 mb-2">
                                    Claim Not Approved
                                </h3>
                                <p className="text-sm text-orange-800 dark:text-orange-100 mb-3">
                                    The finder has decided not to approve this claim.
                                </p>
                                {claim.rejection_reason && (
                                    <div className="bg-orange-100 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-700 rounded-md p-3">
                                        <p className="text-xs font-medium text-orange-900 dark:text-orange-100 mb-1">
                                            Reason provided:
                                        </p>
                                        <p className="text-sm text-orange-800 dark:text-orange-200 whitespace-pre-wrap">
                                            {claim.rejection_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Claim Description Card */}
                <Card className="p-6 mb-6 border-l-4 border-l-blue-500">
                    <h2 className="text-lg font-semibold mb-3">Your Description</h2>
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
                {item && (
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
                                        <p className="text-muted-foreground">{item.description}</p>
                                    </div>

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
                    </Card>
                )}
            </div>
        </div>
    );
}
