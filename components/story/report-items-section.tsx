"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Upload, X } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combo-box";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LOCATION_MAP } from "@/lib/constants/locations";
import type { Session } from "next-auth";

const displayFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  location: z.string(),
  visibility: z.enum(["public", "boys", "girls"]),
  item_type: z.enum(["lost", "found"]),
  date: z.date(),
  image: z.instanceof(File).optional(),
});

type DisplayFormValues = z.infer<typeof displayFormSchema>;

const steps = [
  { number: 1, label: "Capture Details", desc: "Photo, description, and a clear title" },
  { number: 2, label: "Set Context", desc: "Location, date, and audience visibility" },
  { number: 3, label: "Publish", desc: "Go live on the community feed instantly" },
];

const mockSession = {
  user: { hostel: "boys" },
} as unknown as Session;

const groupedLocations = (() => {
  const groups: Record<string, { value: string; label: string }[]> = {};
  Object.entries(LOCATION_MAP).forEach(([key, { label, category }]) => {
    if (!groups[category]) groups[category] = [];
    groups[category].push({ value: key, label });
  });
  if (groups["Hostels"]) {
    groups["Hostels"] = groups["Hostels"].filter((item) => {
      if (item.value === "lh" || item.value === "mlh") {
        return mockSession?.user?.hostel !== "boys";
      }
      return true;
    });
  }
  return Object.entries(groups).map(([category, items]) => ({ category, items }));
})();

export function ReportItemsSection() {
  const [preview] = useState<string | null>(null);
  const [isSubmitting] = useState(false);
  const [isCompressing] = useState(false);
  const [calenderOpen, setCalendarOpen] = useState(false);

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      title: "Blue Jansport Backpack",
      description:
        "Left near the library entrance on the second floor. Has a small keychain and a calculator in the front pocket.",
      category: "bags",
      location: "elhc",
      visibility: "public",
      item_type: "lost",
      date: new Date("2026-06-20"),
    },
  });

  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <SectionWrapper>
            <div className="relative">
              <div className="relative bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-4">
                  <div className="flex items-center gap-1.5 w-12 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 flex justify-center min-w-0">
                    <div className="h-6 bg-background/80 rounded-md w-full max-w-md border border-border/50 flex items-center justify-center px-3 text-xs text-muted-foreground/60 truncate">
                      retrievo.dev/report
                    </div>
                  </div>
                  <div className="w-12 shrink-0" />
                </div>

                <div className="p-3 md:p-5 pointer-events-none overflow-hidden">
                  <Card className="shadow-none border-border/60 min-w-0">
                    <CardContent className="p-4 sm:p-6 min-w-0">
                      <Form {...form}>
                        <form
                          onSubmit={(e) => e.preventDefault()}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem className="col-span-1 md:col-span-2 min-w-0">
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. Blue Jansport Backpack"
                                      {...field}
                                      className="h-10 text-sm"
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem className="col-span-1 min-w-0">
                                  <FormLabel>Category</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isSubmitting}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 w-full cursor-pointer">
                                        <SelectValue placeholder="Select a category" className="truncate" />
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
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="item_type"
                              render={({ field }) => (
                                <FormItem className="col-span-1 min-w-0">
                                  <FormLabel>Type</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isSubmitting}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 w-full cursor-pointer">
                                        <SelectValue placeholder="Select type" className="truncate" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="lost">Lost</SelectItem>
                                      <SelectItem value="found">Found</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                            <FormField
                              control={form.control}
                              name="visibility"
                              render={({ field }) => (
                                <FormItem className="col-span-1 min-w-0">
                                  <FormLabel>Visibility</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isSubmitting}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 w-full cursor-pointer">
                                        <SelectValue placeholder="Select visibility" className="truncate" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="public">Public</SelectItem>
                                      <SelectItem value="boys">Boys Only</SelectItem>
                                      <SelectItem value="girls">Girls Only</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem className="flex flex-col min-w-0">
                                  <FormLabel>Location</FormLabel>
                                  <Popover>
                                    <FormControl>
                                      <Combobox
                                        groups={groupedLocations}
                                        disabled={isSubmitting}
                                        value={field.value}
                                        onChange={field.onChange}
                                      />
                                    </FormControl>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="col-span-1 flex flex-col min-w-0">
                                  <FormLabel>Date</FormLabel>
                                  <Popover
                                    modal={true}
                                    open={calenderOpen}
                                    onOpenChange={setCalendarOpen}
                                  >
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          disabled={isSubmitting}
                                          className="w-full pl-3 text-left font-normal h-10 cursor-pointer truncate"
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                          field.onChange(date);
                                          setCalendarOpen(false);
                                        }}
                                        disabled={(date) =>
                                          date > new Date() ||
                                          date < new Date("2025-12-23")
                                        }
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem className="min-w-0">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Mention where it was found or its general appearance. Avoid sharing unique identifying details."
                                    className="resize-none min-h-[90px] text-sm"
                                    disabled={isSubmitting}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="image"
                            render={() => (
                              <FormItem className="space-y-3">
                                <FormLabel>Image</FormLabel>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-muted/30 relative">
                                  {!preview ? (
                                    <>
                                      {isCompressing ? (
                                        <Loader2 className="h-8 w-8 text-muted-foreground mb-1.5 animate-spin" />
                                      ) : (
                                        <Upload className="h-8 w-8 text-muted-foreground mb-1.5" />
                                      )}
                                      <p className="text-xs text-muted-foreground font-medium">
                                        {isCompressing
                                          ? "Compressing image..."
                                          : "Click to upload an image"}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                        JPG, PNG, WebP, HEIC (compressed to under 1MB)
                                      </p>

                                    </>
                                  ) : (
                                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border">
                                      <div className="absolute inset-0 bg-muted" />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        disabled
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            size="lg"
                            className="w-full h-11"
                          >
                            Report
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-4">
                  Report an Item in Seconds
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A streamlined form gets the important details captured quickly. No clutter, no confusion.
                </p>
              </div>

              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-foreground/60">{step.number}</span>
                      </div>
                      {step.number < steps.length && (
                        <div className="w-px flex-1 bg-border my-2" />
                      )}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-lg font-semibold text-foreground">{step.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
