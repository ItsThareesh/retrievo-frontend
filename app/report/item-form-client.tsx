"use client"

import { useState } from 'react';
import { Combobox } from '@/components/ui/combo-box';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, MapPin, Upload, X } from 'lucide-react';
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
import { postLostFoundItem } from '@/lib/api/items';
import { signIn } from "next-auth/react";
import type { Session } from 'next-auth';
import { ImageViewer } from '@/components/image-viewer';
import { toast } from 'sonner';
import { LOCATION_MAP } from '../../lib/constants/locations';
import { compressImage } from '@/lib/utils/img-compressor';
import { useBanHandler } from '@/lib/hooks/use-ban-handler';


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
    const [calenderOpen, setCalendarOpen] = useState(false);
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

    const { handleBanError } = useBanHandler();

    async function getActualFileSize(file: File): Promise<number> {
        // iOS Safari reports `file.size` as the decoded bitmap size (width * height * 4)
        // for HEIC/HEIF photos picked from the library, not the real encoded file size.
        // A 6.6MB HEIC can report as 40MB+ and falsely trip the size limit.
        // Read the actual bytes to get the true on-disk size.
        if (file.type === "image/heic" || file.type === "image/heif") {
            try {
                return (await file.arrayBuffer()).byteLength;
            } catch {
                return file.size;
            }
        }
        return file.size;
    }

    function handleFileSelect(field: any) {
        return async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] ?? null;

            if (!file) {
                field.onChange(null);
                setPreview(null);
                return;
            }

            const actualSize = await getActualFileSize(file);
            if (actualSize > 10 * 1024 * 1024) {
                toast.error("Original image must be under 10MB. Please choose a smaller image.");
                e.target.value = "";
                return;
            }

            setIsCompressing(true);
            try {
                const compressedFile = await compressImage(file);

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
        };
    }

    const groupedLocations = (() => {
        const groups: Record<string, { value: string; label: string }[]> = {};

        Object.entries(LOCATION_MAP).forEach(([key, { label, category }]) => {
            if (!groups[category]) groups[category] = [];
            groups[category].push({ value: key, label });
        });

        //* Comment restrictions for now
        // Apply constraint for hostels
        // if (groups["Hostels"]) {
        //     groups["Hostels"] = groups["Hostels"].filter(item => {
        //         if (item.value === "lh" || item.value === "mlh") {
        //             return session?.user?.hostel !== "boys";
        //         } else if (item.value === '')
        //         return true;
        //     });
        // }

        return Object.entries(groups).map(([category, items]) => ({ category, items }));
    })();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let res: Awaited<ReturnType<typeof postLostFoundItem>>;

        try {
            setIsSubmitting(true);

            const formData = new FormData();

            Object.entries(values).forEach(([key, val]) => {
                if (val instanceof Date) {
                    // Send as YYYY-MM-DD date string (backend expects date, not datetime)
                    const year = val.getFullYear();
                    const month = String(val.getMonth() + 1).padStart(2, '0');
                    const day = String(val.getDate()).padStart(2, '0');
                    formData.append(key, `${year}-${month}-${day}`);
                } else {
                    formData.append(key, val as any);
                }
            });

            res = await postLostFoundItem(formData, session?.backendToken);

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
        } catch (error) {
            if (handleBanError(error)) return;
            console.error(error);
            toast.error("Something went wrong. Please try again.");
            return;
        }
        finally {
            setIsSubmitting(false);
        }

        // Redirects to the newly created item page only after successful submission
        router.push(`/items/${res.data.item_id}`);
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-1 md:px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Report Item
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto px-1">
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
                                    <Input placeholder="e.g. Blue Jansport Backpack" {...field} className="h-11 text-sm" disabled={isSubmitting} />
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
                                        <SelectTrigger className="h-11 w-full cursor-pointer">
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
                                        <SelectTrigger className="h-11 w-full cursor-pointer">
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
                                        <SelectTrigger className="h-11 w-full cursor-pointer">
                                            <SelectValue placeholder="Select visibility" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        {session?.user?.hostel === "boys" ? (
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
                                            onChange={(value: string) => {
                                                field.onChange(value);
                                                if (value === "other") {
                                                    toast.custom(
                                                        () => (
                                                            <div className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-border bg-popover px-4 py-3.5 text-popover-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                                    <MapPin className="size-5" />
                                                                </span>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-semibold leading-none">
                                                                        Location set to &quot;Other&quot;
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Items here aren&apos;t auto-matched. Mention the specific spot in the description so others can find it.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ),
                                                        { duration: 6500 }
                                                    );
                                                }
                                            }} />
                                    </FormControl>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />

                    <FormField
                        // TODO: Date picker component should close upon selection - Done
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="col-span-1 flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover modal={true} open={calenderOpen} onOpenChange={setCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                disabled={isSubmitting}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal h-9 cursor-pointer",
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
                                            onSelect={(date) =>{field.onChange(date), setCalendarOpen(false)}}
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
                                    className="resize-none min-h-[120px] text-sm"
                                    disabled={isSubmitting}
                                    {...field} 
                                />
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

                            {isCompressing ? (
                                <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
                                    <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
                                    <p className="text-sm text-muted-foreground font-medium">Compressing image...</p>
                                    <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                                </div>
                            ) : preview ? (
                                <div className="relative w-full aspect-video max-h-[480px] rounded-lg overflow-hidden border">
                                    <ImageViewer src={preview} alt="Preview">
                                        <div className="absolute inset-0">
                                            <Image
                                                src={preview}
                                                alt="Preview"
                                                fill
                                                sizes="(max-width: 768px) 100vw, 448px"
                                                className="object-cover" />
                                        </div>
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
                            ) : (
                                <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="relative flex w-full items-center gap-4 px-4 py-14 cursor-pointer hover:bg-muted/50"
                                    disabled={isSubmitting}
                                >
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted/60">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </span>
                                    <span className="text-left">
                                        <span className="block text-sm font-medium">Add a photo</span>
                                        <span className="block text-xs text-muted-foreground/70">Take a photo or choose from gallery</span>
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isSubmitting}
                                        onChange={handleFileSelect(field)}
                                    />
                                </Button>
                                <p className="text-xs text-muted-foreground/60 text-center mt-1">Supports JPG, PNG, WebP, HEIC &middot; Auto-compressed under 1MB</p>
                            </>
                            )}

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