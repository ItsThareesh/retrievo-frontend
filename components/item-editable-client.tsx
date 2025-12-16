"use client"

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pencil, Calendar, MapPin, Check, X, Flag, Share2, User } from "lucide-react";
import { updateItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Item } from "@/types/item";
import { Session } from "next-auth";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { ImageViewer } from "./image-viewer";
import { Textarea } from "./ui/textarea";
import { User as UserType } from "@/types/user";

interface ItemEditableProps {
    item: Item;
    reporter: UserType;
    session: Session | null;
}

export default function ItemEditable({ item, reporter, session }: ItemEditableProps) {
    const [fields, setFields] = useState({
        title: item.title ?? "",
        location: item.location ?? "",
        description: item.description ?? "",
        category: item.category ?? "",
        visibility: item.visibility ?? "public",
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
    });

    const [editingField, setEditingField] = useState<keyof typeof fields | null>(null);
    const [loading, setLoading] = useState(false);

    const canEdit = !!session && reporter.public_id === session.user?.public_id;
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Focus input when entering edit mode
    useEffect(() => {
        if (editingField && inputRef.current) {
            inputRef.current.focus();
            if (inputRef.current instanceof HTMLInputElement) {
                inputRef.current.select();
            }
        }
    }, [editingField]);

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!editingField) return;

            if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
            } else if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                saveField(editingField);
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [editingField, fields]);

    async function saveField(field: keyof typeof fields) {
        const currentValue = fields[field];
        const originalValue =
            field === "date"
                ? item.date
                    ? new Date(item.date).toISOString().slice(0, 10)
                    : ""
                : (item[field as keyof Item] ?? "");

        if (currentValue === originalValue) {
            setEditingField(null);
            return;
        }

        try {
            setLoading(true);

            const payload: any = {};
            payload[field] =
                field === "date"
                    ? new Date(fields.date).toISOString()
                    : currentValue;

            const res = await updateItem(item.id, payload, session?.backendToken);

            if (!res.ok) {
                toast.error("Update failed. Please try again.");
                return;
            }

            // optimistic local sync
            item[field] = payload[field];

            toast.success("Updated successfully");
            setEditingField(null);
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function cancelEdit() {
        setFields({
            title: item.title ?? "",
            location: item.location ?? "",
            description: item.description ?? "",
            category: item.category ?? "",
            visibility: item.visibility ?? "public",
            date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
        });
        setEditingField(null);
    }

    // Reusable edit button component
    const EditButton = ({
        fieldName,
        className = ""
    }: {
        fieldName: keyof typeof fields;
        className?: string;
    }) => {
        if (!canEdit || editingField) return null;

        return (
            <button
                aria-label={`Edit ${fieldName}`}
                onClick={() => setEditingField(fieldName)}
                className={cn(
                    "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                    "transition-opacity duration-150",
                    "text-muted-foreground hover:text-foreground",
                    "rounded p-1 -m-1",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    className
                )}
            >
                <Pencil className="w-3.5 h-3.5" />
            </button>
        );
    };

    // Action buttons for save/cancel
    const EditActions = ({ fieldName }: { fieldName: keyof typeof fields }) => (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                onClick={() => saveField(fieldName)}
                disabled={loading}
                className="h-8"
            >
                <Check className="w-3.5 h-3.5 mr-1" />
                {loading ? "Saving..." : "Save"}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                disabled={loading}
                className="h-8"
            >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancel
            </Button>
        </div>
    );

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
                            <div className="absolute top-4 left-4">
                                <Badge
                                    className={`text-lg px-4 py-1.5 shadow-md text-white ${item.type === "lost"
                                        ? "bg-red-500 hover:bg-red-600 border-red-600"
                                        : "bg-emerald-500 hover:bg-emerald-600 border-emerald-600"
                                        }`}
                                >
                                    {item.type === "lost" ? "Lost" : "Found"}
                                </Badge>
                            </div>
                        </div>
                    </ImageViewer>

                    <div className="hidden lg:block">
                        <h3 className="text-lg font-semibold mb-3">Description</h3>

                        <Card
                            className={cn(
                                "group transition-colors",
                                editingField === "description" && "ring-2 ring-ring"
                            )}
                        >
                            <CardContent className="p-6">
                                {editingField === "description" ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                                            value={fields.description}
                                            onChange={(e) =>
                                                setFields({ ...fields, description: e.target.value })
                                            }
                                            rows={6}
                                            className="resize-none text-sm leading-relaxed"
                                            disabled={loading}
                                        />

                                        <EditActions fieldName="description" />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                            {fields.description || "No description provided."}
                                        </p>

                                        <div className="absolute top-0 right-0">
                                            <EditButton fieldName="description" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Details & Actions */}
                <div className="space-y-6">
                    <div>
                        {/* Title */}
                        <div className="mb-2">
                            {editingField === "title" ? (
                                <div className="space-y-2">
                                    <Input
                                        ref={inputRef as React.RefObject<HTMLInputElement>}
                                        value={fields.title}
                                        onChange={(e) => setFields({ ...fields, title: e.target.value })}
                                        className="text-3xl font-bold h-auto py-2"
                                        disabled={loading}
                                    />
                                    <EditActions fieldName="title" />
                                </div>
                            ) : (
                                <div className="group relative inline-flex items-center gap-2">
                                    <h1 className="text-3xl font-bold leading-tight">
                                        {fields.title}
                                    </h1>
                                    <EditButton fieldName="title" />
                                </div>
                            )}
                        </div>

                        {/* Metadata row: Posted date, Category, Visibility */}
                        <div className="flex flex-wrap items-center gap-2 text-muted-foreground mb-6">
                            <span className="text-sm">
                                Posted on {new Date(item.date).toLocaleDateString("en-GB").replace(/\//g, "-")}
                            </span>
                            <span>•</span>

                            {/* Category Badge */}
                            <div className="group relative">
                                {editingField === "category" ? (
                                    <div className="flex items-center gap-2">
                                        <Select
                                            onValueChange={(v) => setFields({ ...fields, category: v })}
                                            value={fields.category}
                                            disabled={loading}
                                        >
                                            <SelectTrigger className="h-8 w-44">
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
                                        <EditActions fieldName="category" />
                                    </div>
                                ) : (
                                    <Badge variant="outline" className="font-normal inline-flex items-center gap-1.5">
                                        <span>{fields.category}</span>
                                        <EditButton fieldName="category" className="opacity-0 group-hover:opacity-100" />
                                    </Badge>
                                )}
                            </div>

                            {/* Visibility Badge */}
                            <div className="group relative">
                                {editingField === "visibility" ? (
                                    <div className="flex items-center gap-2">
                                        <Select
                                            onValueChange={(v) => setFields({ ...fields, visibility: v as "public" | "boys" | "girls" })}
                                            value={fields.visibility}
                                            disabled={loading}
                                        >
                                            <SelectTrigger className="h-8 w-36">
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
                                        <EditActions fieldName="visibility" />
                                    </div>
                                ) : (
                                    <Badge variant="outline" className="font-normal inline-flex items-center gap-1.5">
                                        <span>
                                            {fields.visibility}
                                            {['boys', 'girls'].includes(fields.visibility) ? ' only' : ''}
                                        </span>
                                        <EditButton fieldName="visibility" className="opacity-0 group-hover:opacity-100" />
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Detail Cards */}
                        <div className="space-y-4 mb-6">
                            {/* Location */}
                            <div className={cn(
                                "group flex items-start gap-3 p-3 rounded-lg bg-muted/30 border transition-colors",
                                editingField === "location" && "ring-2 ring-ring"
                            )}>
                                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-sm">Location</p>
                                        {!editingField && <EditButton fieldName="location" />}
                                    </div>
                                    {editingField === "location" ? (
                                        <div className="space-y-2">
                                            <Input
                                                ref={inputRef as React.RefObject<HTMLInputElement>}
                                                value={fields.location}
                                                onChange={(e) => setFields({ ...fields, location: e.target.value })}
                                                className="text-sm"
                                                disabled={loading}
                                            />
                                            <EditActions fieldName="location" />
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm wrap-break-word">
                                            {fields.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Date */}
                            <div className={cn(
                                "group flex items-start gap-3 p-3 rounded-lg bg-muted/30 border transition-colors",
                                editingField === "date" && "ring-2 ring-ring"
                            )}>
                                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-sm">
                                            Date {item.type === "lost" ? "Lost" : "Found"}
                                        </p>
                                        {!editingField && <EditButton fieldName="date" />}
                                    </div>
                                    {editingField === "date" ? (
                                        <div className="space-y-2">
                                            <Input
                                                ref={inputRef as React.RefObject<HTMLInputElement>}
                                                type="date"
                                                value={fields.date}
                                                min={new Date("2000-01-01").toISOString().slice(0, 10)}
                                                max={new Date().toISOString().slice(0, 10)}
                                                onChange={(e) => setFields({ ...fields, date: e.target.value })}
                                                className="text-sm"
                                                disabled={loading}
                                            />
                                            <EditActions fieldName="date" />
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            {new Date(fields.date).toLocaleDateString("en-GB").replace(/\//g, "-")}
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
                        {item.type === "found" ? (
                            <Button size="lg" className="w-full h-12 text-lg shadow-sm mb-6">
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
        </div>
    );
}