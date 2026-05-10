import { Item } from "@/types/item";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { EyeOff, MapPin, Calendar } from "lucide-react";
import { LOCATION_MAP } from "@/lib/constants/locations";
import { formatDateString } from "@/lib/date-formatting";

interface ItemSummaryProps {
    item: Item | null;
}

export function ItemSummary({ item }: ItemSummaryProps) {
    if (!item) return null;
    
    console.log(item.image);

    return (
        <Card className="overflow-hidden shadow-sm">
            <div className="border-b bg-muted/40 px-4 py-3 sm:px-6">
                <h2 className="text-base font-semibold">Item Summary</h2>
            </div>
            <div className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Item Image */}
                    <div className="shrink-0">
                        <div className="relative w-full md:w-48 lg:w-56 aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center border">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground text-center p-4">
                                    <EyeOff className="h-8 w-8 mb-2 opacity-50" />
                                    <span className="text-xs font-medium">No image available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
                                <Badge variant={item.type === "lost" ? "destructive" : "default"} className="capitalize">
                                    {item.type}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Location</span>
                                    <span className="font-medium text-foreground">{LOCATION_MAP[item.location]?.label || "Unknown Location"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{item.type === "lost" ? "Lost On" : "Found On"}</span>
                                    <span className="font-medium text-foreground">{formatDateString(item.date)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
