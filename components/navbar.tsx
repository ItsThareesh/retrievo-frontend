import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MOCK_USER } from '@/lib/mock-data';
import { Search, PlusCircle } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                        <Search className="w-5 h-5" strokeWidth={3} />
                    </div>
                    <span>Retrievo</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/items" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Browse Items
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <Link href="/lost/new">Report Lost</Link>
                        </Button>
                        <Button asChild size="sm" className="gap-2">
                            <Link href="/found/new">
                                <PlusCircle className="w-4 h-4" />
                                Report Found
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/profile">
                        <Avatar className="h-9 w-9 border-2 border-background ring-2 ring-muted hover:ring-primary transition-all">
                            <AvatarImage src={MOCK_USER.avatar} alt={MOCK_USER.name} />
                            <AvatarFallback>AJ</AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>
        </nav>
    );
}