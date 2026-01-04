import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/item';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

interface ItemCardProps {
    item: Item;
    type: 'lost' | 'found';
}

export function ItemCard({ item, type }: ItemCardProps) {
    return (
        <Link href={`/items/${item.id}`} className="block h-full">
  <Card className="group relative overflow-hidden flex flex-col h-full border-muted transition-all hover:shadow-lg cursor-pointer">
    
    <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
      <img
        src={item.image}
        alt={item.title}
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Badge
        className={`absolute top-3 right-3 shadow-sm ${
          type === 'lost'
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-amber-500 hover:bg-amber-600 text-white'
        }`}
      >
        {type === 'lost' ? 'Lost' : 'Found'}
      </Badge>
    </div>

    <CardHeader className="p-5 pb-2 space-y-1">
      <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
        {item.title}
      </h3>
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
      <Button
        variant="outline"
        className="w-full pointer-events-none"
      >
        View Details
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>
    </CardFooter>

  </Card>
</Link>

    );
}
