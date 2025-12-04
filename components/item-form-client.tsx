"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { redirect, useRouter } from 'next/navigation';
import { postLostFoundItem, UnauthorizedError } from '@/lib/api';
import { signIn } from "next-auth/react";
import type { Session } from 'next-auth';

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    category: z.string({
        message: "Please select a category.",
    }),
    date: z.date({
        message: "A date is required.",
    }),
    location: z.string().min(2, {
        message: "Location must be at least 2 characters.",
    }),
    image: z.any()
});

interface ItemFormClientProps {
    type: 'lost' | 'found';
    session: Session;
}

export function ItemFormClient({ type, session }: ItemFormClientProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!type) return;

        try {
            setIsSubmitting(true);

            // Prepare form-data
            const formData = new FormData();
            Object.entries(values).forEach(([key, val]) => {
                if (val instanceof Date) {
                    formData.append(key, val.toISOString());
                } else {
                    formData.append(key, val as any);
                }
            });

            const res = await postLostFoundItem(type, formData, session.backendToken);

            if (res.ok === false) {
                throw new Error(`Failed to submit item. Status: ${res.status}`);
            }

            redirect("/items");

        } catch (error) {
            if (error instanceof UnauthorizedError) {
                redirect(`/auth/signin?callbackUrl=/${type}/new`);
            }

            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setPreview(null);
    };

    if (!session?.user) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4">
                <div className="text-center">
                    <p className="mb-4">Please sign in to report items.</p>
                    <Button onClick={() => signIn("google")}>
                        Sign In with Google
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Report {type === 'lost' ? 'Lost' : 'Found'} Item
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Please provide as much detail as possible to help us connect the item with its owner.
                </p>
            </div>

            <Card>
                <CardContent className="p-6 sm:p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="col-span-1 md:col-span-2">
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Blue Jansport Backpack" {...field} className="h-11" />
                                            </FormControl>
                                            <FormDescription>
                                                A short, descriptive title for the item.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem className="col-span-1">
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 w-full">
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="electronics">Electronics</SelectItem>
                                                    <SelectItem value="clothing">Clothing</SelectItem>
                                                    <SelectItem value="bags">Bags</SelectItem>
                                                    <SelectItem value="keys & wallets">Keys & Wallets</SelectItem>
                                                    <SelectItem value="documents">Documents</SelectItem>
                                                    <SelectItem value="others">Others</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="col-span-1 flex flex-col">
                                            <FormLabel>Date {type === "lost" ? "Lost" : "Found"}</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
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
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("2000-01-01")
                                                        }
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem className="col-span-1 md:col-span-2">
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Central Park, near the fountain" {...field} className="h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="col-span-1 md:col-span-2">
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Provide as much detail as possible (color, size, distinguishing marks, etc.)"
                                                    className="resize-none min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormLabel>Image</FormLabel>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
                                    {!preview ? (
                                        <>
                                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground font-medium">Click to upload an image</p>
                                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </>
                                    ) : (
                                        <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                                onClick={removeImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-12 text-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Report"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}