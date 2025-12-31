import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
                    <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
                    <p className="text-muted-foreground">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/items">
                        <Button variant="outline">
                            <Search className="w-4 h-4 mr-2" />
                            Browse Items
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
