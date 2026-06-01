import { Item } from "@/types/item";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { EyeOff, MapPin, Calendar, ShieldAlert, Trash2, ArrowUpRight } from "lucide-react";
import { LOCATION_MAP } from "@/lib/constants/locations";
import { formatDateString } from "@/lib/date-formatting";

interface ItemSummaryProps {
    item: Item | null;
}

export function ItemSummary({ item }: ItemSummaryProps) {
    if (!item) return null;

    if (item.deleted) {
        return (
            <Card className="overflow-hidden shadow-sm">
                <div className="border-b bg-muted/40 px-4 py-3 sm:px-6 flex justify-between items-center">
                    <h2 className="text-base font-semibold">Item Summary</h2>
                    <Badge variant="destructive" className="flex items-center gap-1 uppercase text-[10px]">
                        <Trash2 className="h-3 w-3" />
                        Deleted Item
                    </Badge>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                        <Trash2 className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Item Deleted</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        This item has been deleted and is no longer available for viewing or interaction.
                    </p>
                </div>
            </Card>
        );
    }

    const isHidden = item.hidden;

    return (
        <Card className="overflow-hidden shadow-sm">
            <div className="border-b px-4 py-3 sm:px-6 flex justify-between items-center">
                <h2 className="text-base font-semibold">Item Summary</h2>
                <div className="flex gap-2">
                    {isHidden && (
                        <Badge variant="destructive" className="flex items-center gap-1 uppercase text-[10px]">
                            <ShieldAlert className="h-3 w-3" />
                            Hidden Item
                        </Badge>
                    )}
                </div>
            </div>
            <div className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Item Image */}
                    <div className="shrink-0">
                        <div className="relative w-full md:w-40 lg:w-56 aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center border">
                            { item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 160px, 224px"
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
                                {isHidden ? (
                                    <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
                                ) : (
                                    <Link
                                        href={`/items/${item.id}`}
                                        className="flex items-center gap-1 group"
                                    >
                                        <h3 className="text-xl font-bold leading-tight group-hover:opacity-80 transition-opacity">
                                            {item.title}
                                        </h3>
                                        <ArrowUpRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:opacity-80" />
                                    </Link>
                                )}
                                <Badge variant="default" className="capitalize">
                                    {item.type}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>
                        
                        {isHidden && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2.5 text-destructive text-sm mt-2">
                                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-[11px] uppercase tracking-wider">Hidden Reason</span>
                                    {item.hidden_reason && (
                                        <span className="font-medium mt-0.5 capitalize">{item.hidden_reason.replace(/_/g, ' ')}</span>
                                    )}
                                </div>
                            </div>
                        )}

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
