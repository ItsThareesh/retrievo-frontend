import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, User, Share2, Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Item } from '@/types/items';

export default async function ItemPageContent({ formattedItem }: { formattedItem: Item }) {
    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted border shadow-sm group">
                        <img
                            src={formattedItem.image}
                            alt={formattedItem.title}
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                            <Badge
                                className={`text-lg px-4 py-1.5 shadow-md ${formattedItem.type === 'lost'
                                    ? 'bg-red-500 hover:bg-red-600 border-red-600'
                                    : 'bg-green-500 hover:bg-green-600 border-green-600'
                                    }`}
                            >
                                {formattedItem.type === 'lost' ? 'Lost' : 'Found'}
                            </Badge>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {formattedItem.description}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Details & Actions */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 leading-tight">{formattedItem.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mb-6">
                            <span className="text-sm">Posted on {formattedItem.date}</span>
                            <span>•</span>
                            <Badge variant="outline" className="font-normal">{formattedItem.category}</Badge>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Location</p>
                                    <p className="text-muted-foreground text-sm">{formattedItem.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Date {formattedItem.type === 'lost' ? 'Lost' : 'Found'}</p>
                                    <p className="text-muted-foreground text-sm">{formattedItem.date}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                                <User className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Reported by</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={formattedItem.reporter_picture} alt={formattedItem.reporter_name} />
                                            <AvatarFallback className="text-[10px]">
                                                {formattedItem.reporter_name?.[0] ?? "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="text-muted-foreground text-sm">{formattedItem.reporter_name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {formattedItem.type === 'lost' ? (
                                <Button size="lg" className="w-full h-12 text-lg shadow-sm" asChild>
                                    <Link href={`/items/${formattedItem.id}/match/${formattedItem.category}`}>
                                        I Found This!
                                    </Link>
                                </Button>
                            ) : (
                                <Button size="lg" className="w-full h-12 text-lg shadow-sm">
                                    This is Mine!
                                </Button>
                            )}
                            <Button size="lg" variant="outline" className="w-full h-12">
                                Contact {formattedItem.type === 'lost' ? 'Owner' : 'Finder'}
                            </Button>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-destructive">
                                    <Flag className="w-4 h-4 mr-2" />
                                    Report
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:hidden">
                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {formattedItem.description}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}