import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/items';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

interface ItemCardProps {
    item: Item;
    type: 'lost' | 'found';
}

export function ItemCard({ item, type }: ItemCardProps) {
    return (
        <Card className="group overflow-hidden flex flex-col h-full border-muted transition-all hover:shadow-lg">
            <div className="relative aspect-4/3 w-full overflow-hidden bg-muted group">
                <img
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Badge
                    className={`absolute top-3 right-3 shadow-sm ${type === 'lost'
                        ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-600'
                        : 'bg-green-500/90 hover:bg-green-600 text-white border-green-600'
                        }`}
                >
                    {type === 'lost' ? 'Lost' : 'Found'}
                </Badge>
            </div>
            <CardHeader className="p-5 pb-2 space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                    </h3>
                </div>
                <Badge variant="secondary" className="w-fit font-normal text-xs">
                    {item.category}
                </Badge>
            </CardHeader>
            <CardContent className="p-5 pt-2 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10 leading-relaxed">
                    {item.description}
                </p>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary/70" />
                        <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary/70" />
                        <span className="line-clamp-1">{item.location}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-5 pt-0">
                <Button asChild className="w-full group/btn" variant="outline">
                    <Link
                        href={`/items/${item.id}/${type}`}
                        className="flex items-center justify-center gap-2"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
