import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { auth } from "@/lib/auth";
import { NavbarAuth } from './navbar-auth';
import { BrandLink } from './brand-link';

export async function Navbar() {
    const session = await auth();

    const isAuthenticated = !!session?.backendToken;

    return (
        <nav className="sticky top-0 z-50 w-full border-b dark:border-black/50 shadow-md shadow-grey-400/10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 pt-[env(safe-area-inset-top)]">
            <div className="container mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
                <BrandLink />

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