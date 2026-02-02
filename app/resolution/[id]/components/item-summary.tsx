import { Item } from "@/types/item";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { EyeOff } from "lucide-react";
import { LOCATION_MAP } from "@/lib/constants/locations";

interface ItemSummaryProps {
    item: Item | null;
}

export function ItemSummary({ item }: ItemSummaryProps) {
    if (!item) return null;

    return (
        <Card className="p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
                Item Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Item Image */}
                <div className="md:col-span-1">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {item.image ? (
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground text-center">
                                <EyeOff className="h-7 w-7 mb-1.5" />
                                <span className="text-xs">Restricted image</span>
                            </div>
                        )}
                    </div>
                </div>

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
                            <p className="text-sm font-medium">{LOCATION_MAP[item.location]?.label}</p>
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
    );
}
