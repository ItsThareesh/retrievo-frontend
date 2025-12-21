import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';
import { auth } from "@/auth";
import { LoginButton } from './login-button';
import { NotificationsDropdown } from './notifications-dropdown';
import { getNotificationsCount } from '@/lib/api/server';

export async function Navbar() {
    const session = await auth();

    let unreadCount = 0;

    if (session?.backendToken) {
        const res = await getNotificationsCount(session?.backendToken);
        unreadCount = res.data.count;
    }

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
                        <Button asChild size="sm" className="gap-2">
                            <Link href="/report">
                                <PlusCircle className="w-4 h-4" />
                                Report Item
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex md:hidden items-center gap-8">
                    <Button asChild size="sm" className="gap-2">
                        <Link href="/report">
                            <PlusCircle className="w-4 h-4" />
                            Report Item
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    {session?.user && <NotificationsDropdown count={unreadCount} />}
                    <LoginButton session={session} />
                </div>
            </div>
        </nav>
    );
}