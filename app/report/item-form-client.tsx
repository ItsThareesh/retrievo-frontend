"use client"

import { useState } from 'react';
import { Combobox } from '@/components/ui/combo-box';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { postLostFoundItem } from '@/lib/api/authenticated-api';
import { signIn } from "next-auth/react";
import type { Session } from 'next-auth';
import { ImageViewer } from '@/components/image-viewer';
import { toast } from 'sonner';
import { LOCATION_MAP } from '../../lib/constants/locations';
import { compressImage } from '@/lib/utils/img-compressor';


const formSchema = z.object({
    title: z
        .string()
        .min(2, "Title must be at least 2 characters.")
        .max(20, "Title must be at most 20 characters."),

    description: z
        .string()
        .min(20, "Description must be at least 20 characters.")
        .max(280, "Description must be at most 280 characters."),

    category: z
        .string()
        .min(1, "Category is required")
        .max(12, "Category must be at most 12 characters."), // 12 characters to accommodate "keys-wallets"

    location: z // Validate location via ENUM in the form
        .string()
        .min(2, "Location is required")
        .max(30, "Location must be at most 30 characters."),

    image: z
        .instanceof(File, { message: "Image is required." })
        .refine((file) => file.size <= 1 * 1024 * 1024, {
            message: "Compressed image must be under 1MB. Please choose a smaller image.",
        })
        .refine(
            (file) => ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(file.type),
            { message: "Only JPG, PNG, WebP, or HEIC images are allowed." }
        ),

    date: z.date({ message: "A date is required." }),
    visibility: z.enum(["public", "boys", "girls"]),
    item_type: z.enum(["lost", "found"]),
});

interface ItemFormClientProps {
    session: Session;
    type: "lost" | "found";
}

export function ItemFormClient({ session, type }: ItemFormClientProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            visibility: "public",
            category: "",
            item_type: type,
        },
    });

    const groupedLocations = (() => {
        const groups: Record<string, { value: string; label: string }[]> = {};

        Object.entries(LOCATION_MAP).forEach(([key, { label, category }]) => {
            if (!groups[category]) groups[category] = [];
            groups[category].push({ value: key, label });
        });

        // Apply constraint for hostels
        if (groups["Hostels"]) {
            groups["Hostels"] = groups["Hostels"].filter(item => {
                if (item.value === "lh" || item.value === "mlh") {
                    return session.user.hostel !== "boys";
                }
                return true;
            });
        }

        return Object.entries(groups).map(([category, items]) => ({ category, items }));
    })();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);

            const formData = new FormData();

            Object.entries(values).forEach(([key, val]) => {
                if (val instanceof Date) {
                    formData.append(key, val.toISOString());
                } else {
                    formData.append(key, val as any);
                }
            });

            const res = await postLostFoundItem(formData);

            if (res.status === 401) {
                router.push(`/auth/signin?callbackUrl=/report?type=${type}`);
                return;
            }

            if (res.status === 429) {
                toast.error("You have reached your monthly limit for reporting items. Please try again later.");
                return;
            }

            if (res.status === 400) {
                toast.error("Image upload failed. The image may be too large or invalid. Please try a different image.");
                return;
            }

            if (!res.ok) {
                toast.error("Failed to submit item. Please try again.");
                return;
            }

            toast.success("Item reported successfully!");

            router.push(`/items/${res.data}`);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Report {form.getValues("item_type") === 'lost' ? 'Lost' : 'Found'} Item
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Please provide as much detail as possible to help us connect the item with its owner.
                </p>
            </div>

            <Card>
                <CardContent className="p-6 sm:p-8">
                    {renderItemForm()}
                </CardContent>
            </Card>
        </div >
    );

    function renderItemForm() {
        return <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Blue Jansport Backpack" {...field} className="h-11" disabled={isSubmitting} />
                                </FormControl>
                                <FormDescription>
                                    A short, descriptive title for the item.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="col-span-1">
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="electronics">Electronics</SelectItem>
                                        <SelectItem value="clothing">Clothing</SelectItem>
                                        <SelectItem value="bags">Bags</SelectItem>
                                        <SelectItem value="keys-wallets">Keys & Wallets</SelectItem>
                                        <SelectItem value="documents">Documents</SelectItem>
                                        <SelectItem value="others">Others</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField
                        control={form.control}
                        name="item_type"
                        render={({ field }) => (
                            <FormItem className="col-span-1">
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 w-full">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="lost">Lost</SelectItem>
                                        <SelectItem value="found">Found</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                            <FormItem className="col-span-1">
                                <FormLabel>Visibility</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 w-full">
                                            <SelectValue placeholder="Select visibility" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        {session.user.hostel === "boys" ? (
                                            <SelectItem value="boys">Boys Only</SelectItem>
                                        ) : (
                                            <SelectItem value="girls">Girls Only</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Location</FormLabel>
                                <Popover>
                                    <FormControl>
                                        <Combobox
                                            groups={groupedLocations}
                                            disabled={isSubmitting}
                                            // Pass the form's value directly
                                            value={field.value}
                                            // Pass the form's updater directly to 'onChange'
                                            onChange={field.onChange} />
                                    </FormControl>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />

                    <FormField
                        // TODO: Date picker component should close upon selection
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="col-span-1 flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover modal={true}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                disabled={isSubmitting}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal h-11",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date > new Date() ||
                                                date < new Date("2025-12-23")} />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />

                </div>


                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Mention where it was found or its general appearance. Avoid sharing unique identifying details."
                                    className="resize-none min-h-[120px]"
                                    disabled={isSubmitting}
                                    {...field} />
                            </FormControl>

                            <FormDescription>
                                Keep identifying details private so the rightful owner can confirm it's theirs.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem className="space-y-4">
                            <FormLabel>Image</FormLabel>

                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors relative">
                                {!preview ? (
                                    <>
                                        {isCompressing ? (
                                            <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
                                        ) : (
                                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                        )}
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {isCompressing ? "Compressing image..." : "Click to upload an image"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {isCompressing ? "Please wait" : "JPG, PNG, WebP, HEIC (will be compressed to under 1MB)"}
                                        </p>

                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isCompressing || isSubmitting}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0] ?? null;

                                                if (!file) {
                                                    field.onChange(null);
                                                    setPreview(null);
                                                    return;
                                                }

                                                if (file.size > 10 * 1024 * 1024) {
                                                    toast.error("Original image must be under 10MB. Please choose a smaller image.");
                                                    e.target.value = ""; // Reset file input
                                                    return;
                                                }

                                                setIsCompressing(true);
                                                try {
                                                    // Compress the image to under 1MB
                                                    const compressedFile = await compressImage(file);

                                                    // Verify compressed size
                                                    if (compressedFile.size > 1 * 1024 * 1024) {
                                                        toast.error("Unable to compress image under 1MB. Please choose a smaller or simpler image.");
                                                        e.target.value = "";
                                                        return;
                                                    }

                                                    field.onChange(compressedFile);

                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setPreview(reader.result as string);
                                                    reader.readAsDataURL(compressedFile);
                                                } catch (error) {
                                                    console.error("Compression error:", error);
                                                    toast.error("Failed to compress image. Please try a different image.");
                                                    e.target.value = "";
                                                } finally {
                                                    setIsCompressing(false);
                                                }
                                            }}
                                        />
                                    </>
                                ) : (
                                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border">
                                        <ImageViewer src={preview} alt="Preview">
                                            <Image
                                                src={preview}
                                                alt="Preview"
                                                fill
                                                unoptimized
                                                className="object-cover" />
                                        </ImageViewer>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            disabled={isSubmitting}
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full cursor-pointer z-10"
                                            onClick={() => {
                                                setPreview(null);
                                                field.onChange(null);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <FormMessage />
                        </FormItem>
                    )} />
                <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-lg cursor-pointer"
                    disabled={isSubmitting || isCompressing}
                >
                    {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {isSubmitting ? "Reporting..." : "Report"}
                </Button>
            </form>
        </Form>;
    }
}