"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Trash2, Calendar, MapPin, Flag, Share2, User, Pencil, X } from "lucide-react";
import { updateItem, deleteItem, createResolution } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ImageViewer } from "@/components/image-viewer";
import { Textarea } from "@/components/ui/textarea";
import { Item } from "@/types/item";
import { Session } from "next-auth";
import Link from "next/link";
import { toast } from "sonner";
import { User as UserType } from "@/types/user";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface ItemEditableProps {
    item: Item;
    reporter: UserType;
    claim_status: "none" | "pending" | "approved";
    session: Session | null;
}

export default function ItemEditable({ item, reporter, claim_status, session }: ItemEditableProps) {
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isClaiming, setIsClaiming] = useState(false)
    const [claimText, setClaimText] = useState("")
    const [isSubmittingClaim, setIsSubmittingClaim] = useState(false)

    const [myClaimStatus, setMyClaimStatus] = useState(claim_status);

    const [formData, setFormData] = useState({
        title: item.title ?? "",
        location: item.location ?? "",
        description: item.description ?? "",
        category: item.category ?? "",
        visibility: item.visibility ?? "public",
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
    });

    const canEdit = !!session && reporter.public_id === session.user?.public_id;
    const canClaim = item.type === "found" && myClaimStatus === "none" && !canEdit;

    async function handleSave() {
        setIsSaving(true);

        // Calculate diff - only send changed fields
        const updates: Record<string, any> = {};
        let hasChanges = false;

        for (const key of Object.keys(formData) as (keyof typeof formData)[]) {
            const newValue = formData[key];

            const oldValue = key === "date"
                ? new Date(item.date).toISOString().slice(0, 10)
                : item[key] ?? "";

            if (newValue !== oldValue) {
                updates[key] =
                    key === "date" ? new Date(newValue).toISOString() : newValue;
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            setIsEditing(false);
            setIsSaving(false);
            return;
        }

        const res = await updateItem(item.id, updates);

        if (res.ok) {
            toast.success("Item updated successfully");
            setIsEditing(false);
            router.refresh();
        } else {
            toast.error("Failed to update item");
        }

        setIsSaving(false);
    }

    function handleCancel() {
        setFormData({
            title: item.title ?? "",
            location: item.location ?? "",
            description: item.description ?? "",
            category: item.category ?? "",
            visibility: item.visibility ?? "public",
            date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
        });
        setIsEditing(false);
    };

    async function handleDelete() {
        const res = await deleteItem(item.id);

        if (res.ok) {
            toast.success("Item deleted successfully");
            router.push("/items");
        } else {
            toast.error("Failed to delete item");
        }

        setIsDeleting(false);
    }

    function mapClaimStatusToText(status: string) {
        switch (status) {
            case "pending":
                return "Claim Pending";
            case "approved":
                return "Claim Approved";
            case "rejected":
                return "Claim Rejected";
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image */}
                <div className="lg:col-span-2 space-y-6">
                    <ImageViewer src={item.image} alt={item.title}>
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted border shadow-sm group">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 flex flex-row gap-2 p-2 rounded-lg">
                                <Badge
                                    className={`text-lg px-4 py-1.5 shadow-md text-white ${item.type === "lost"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-emerald-500 hover:bg-emerald-600"
                                        }`}
                                >
                                    {item.type === "lost" ? "Lost" : "Found"}
                                </Badge>

                                {claim_status !== "none" && (
                                    <Badge
                                        className="text-lg px-4 py-1.5 shadow-md bg-amber-500 text-white hover:bg-amber-600"
                                    >
                                        {mapClaimStatusToText(myClaimStatus)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </ImageViewer>

                    <div>
                        <h3 className="text-lg font-semibold mb-3">Description</h3>

                        <Card className={cn(
                            "group transition-all duration-200",
                            isEditing && "ring-2 ring-primary/20 shadow-sm"
                        )}>
                            <CardContent className="p-6">
                                {isEditing ? (
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={6}
                                        className="resize-none text-sm leading-relaxed border-2 focus-visible:ring-2"
                                        disabled={isSaving}
                                        placeholder="Describe the item in detail..."
                                    />
                                ) : (
                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed break-words">
                                        {formData.description || "No description provided."}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Details & Actions */}
                <div className="space-y-6">
                    <div>
                        {/* Title with Three-Dot Menu */}
                        <div className="mb-2">
                            <div className="flex items-start justify-between gap-3">
                                {isEditing ? (
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="text-3xl font-bold h-auto py-2 flex-1 border-2 focus-visible:ring-2"
                                        disabled={isSaving}
                                        placeholder="Item title"
                                    />
                                ) : (
                                    <h1 className="text-3xl font-bold leading-tight flex-1 break-words">
                                        {formData.title}
                                    </h1>
                                )}

                                {canEdit && !isEditing && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 hover:bg-muted transition-colors"
                                            >
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit item
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => setIsDeleting(true)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete item
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex gap-2 my-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="shadow-sm"
                                    >
                                        {isSaving ? "Saving..." : "Save changes"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Metadata row: Posted date, Category, Visibility */}
                        <div className={cn(
                            "flex flex-wrap items-center gap-2 text-muted-foreground mb-6 p-2 -ml-2 rounded-lg transition-colors",
                            isEditing && "bg-muted/30"
                        )}>
                            <span className="text-sm">
                                Posted on {new Date(item.created_at).toLocaleDateString("en-GB").replace(/\//g, "-")}
                            </span>
                            <span>•</span>

                            {/* Category Badge */}
                            <div className="group relative">
                                {isEditing ? (
                                    <Select
                                        onValueChange={(v) => setFormData({ ...formData, category: v })}
                                        value={formData.category}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger className="h-8 w-44 border-2">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="electronics">Electronics</SelectItem>
                                            <SelectItem value="clothing">Clothing</SelectItem>
                                            <SelectItem value="bags">Bags</SelectItem>
                                            <SelectItem value="keys-wallets">Keys & Wallets</SelectItem>
                                            <SelectItem value="documents">Documents</SelectItem>
                                            <SelectItem value="others">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge variant="outline" className="font-normal inline-flex items-center gap-1.5">
                                        <span>{formData.category}</span>
                                    </Badge>
                                )}
                            </div>

                            {/* Visibility Badge */}
                            <div className="group relative">
                                {isEditing ? (
                                    <Select
                                        onValueChange={(v) => setFormData({ ...formData, visibility: v as "public" | "boys" | "girls" })}
                                        value={formData.visibility}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger className="h-8 w-36 border-2">
                                            <SelectValue placeholder="Visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public</SelectItem>
                                            {session?.user.hostel === "boys" ? (
                                                <SelectItem value="boys">Boys Only</SelectItem>
                                            ) : (
                                                <SelectItem value="girls">Girls Only</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge variant="outline" className="font-normal inline-flex items-center gap-1.5">
                                        <span>
                                            {formData.visibility}
                                            {['boys', 'girls'].includes(formData.visibility) ? ' only' : ''}
                                        </span>
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Detail Cards */}
                        <div className="space-y-4 mb-6">
                            {/* Location */}
                            <div className={cn(
                                "group flex items-start gap-3 p-3 rounded-lg bg-muted/30 border transition-all duration-200",
                                isEditing && "ring-2 ring-primary/20 bg-muted/50"
                            )}>
                                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm mb-1">Location</p>
                                    {isEditing ? (
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="text-sm mt-1"
                                            disabled={isSaving}
                                            placeholder="Where was it lost/found?"
                                        />
                                    ) : (
                                        <p className="text-muted-foreground text-sm break-words">
                                            {formData.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Date */}
                            <div className={cn(
                                "group flex items-start gap-3 p-3 rounded-lg bg-muted/30 border transition-all duration-200",
                                isEditing && "ring-2 ring-primary/20 bg-muted/50"
                            )}>
                                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm mb-1">
                                        Date {item.type === "lost" ? "Lost" : "Found"}
                                    </p>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            min={new Date("2000-01-01").toISOString().slice(0, 10)}
                                            max={new Date().toISOString().slice(0, 10)}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="text-sm mt-1"
                                            disabled={isSaving}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            {new Date(formData.date).toLocaleDateString("en-GB").replace(/\//g, "-")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Reported by */}
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                                <User className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Reported by</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={reporter.image} />
                                            <AvatarFallback>
                                                {reporter.name?.[0] ?? "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        {session && reporter.public_id === session.user.public_id ? (
                                            <div className="flex items-center gap-2">
                                                <p className="text-muted-foreground text-sm">
                                                    {reporter.name}
                                                </p>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                                                    You
                                                </span>
                                            </div>
                                        ) : (
                                            <Link href={`/profile/${reporter.public_id}`}>
                                                <p className="hover:underline text-muted-foreground text-sm cursor-pointer">
                                                    {reporter.name}
                                                </p>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {canClaim ? (
                            <Button
                                size="lg"
                                className="w-full h-12 text-lg shadow-sm mb-6"
                                onClick={() => {
                                    if (!session) {
                                        router.push(`/auth/signin?callbackUrl=/items/${item.id}`)
                                        return
                                    }
                                    setIsClaiming(true)
                                }}
                            >
                                This is Mine!
                            </Button>
                        ) : null}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-muted-foreground py-3"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-muted-foreground hover:text-destructive py-3"
                            >
                                <Flag className="w-4 h-4 mr-2" />
                                Report
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your item
                                    and remove it from our servers.
                                </AlertDialogDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => setIsDeleting(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel asChild>
                            <Button variant="outline">
                                Cancel
                            </Button>
                        </AlertDialogCancel>

                        <AlertDialogAction
                            className="text-white bg-red-500 hover:bg-red-600"
                            onClick={handleDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete permanently
                            {/* </Button> */}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isClaiming} onOpenChange={setIsClaiming}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Claim this item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Describe details that prove this item belongs to you.
                            These details will be shared only with the finder.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <Textarea
                        value={claimText}
                        onChange={(e) => setClaimText(e.target.value)}
                        placeholder="Describe details that prove this item is yours (marks, contents, damage, when you lost it, etc.). Minimum 20 characters."
                        className="min-h-[120px] resize-none mt-4"
                        disabled={isSubmittingClaim}
                    />

                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel asChild>
                            <Button variant="outline" disabled={isSubmittingClaim}>
                                Cancel
                            </Button>
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={claimText.trim().length < 20 || isSubmittingClaim}
                            onClick={async () => {
                                try {
                                    setIsSubmittingClaim(true)

                                    const res = await createResolution(item.id, claimText)

                                    if (res.ok) {
                                        toast.success("Claim sent to finder for verification")
                                        setMyClaimStatus("pending");
                                        setIsClaiming(false)
                                        setClaimText("")
                                    } else if (res.status == 409) {
                                        toast.error("You have already submitted a claim for this item.")
                                    } else {
                                        toast.error("Failed to submit claim. Please try again.")
                                    }
                                } catch {
                                    toast.error("Failed to submit claim. Please try again.")
                                } finally {
                                    setIsSubmittingClaim(false)
                                }
                            }}
                        >
                            Submit claim
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}