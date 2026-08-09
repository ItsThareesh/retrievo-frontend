import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { auth } from "@/lib/auth";
import { NavbarAuth } from './navbar-auth';

export async function Navbar() {
    const session = await auth();

    const isAuthenticated = !!session?.backendToken;

    return (
        <nav className="sticky top-0 z-50 w-full border-b dark:border-black/50 shadow-md shadow-grey-400/10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-10 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity">
                    <Image src="/favicon.ico" alt="Retrievo" width={30} height={30} className="rounded-lg" unoptimized />
                    <span>Retrievo</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/items" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Browse Items
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button asChild size="sm" className="gap-2">
                            <Link href="/report">
                                <PlusCircle className="w-4 h-4" />
                                Report Item
                            </Link>
                        </Button>
                    </div>
                </div>

                <NavbarAuth initialSession={session} initialAuthenticated={isAuthenticated} />
            </div>
        </nav>
    );
}