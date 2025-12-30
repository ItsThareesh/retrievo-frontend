'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';

interface UserMenuProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } | null;
}

export function UserMenu({ user }: UserMenuProps) {
    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 border-2 border-background ring-2 ring-muted hover:ring-primary transition-all cursor-pointer">
                    {user?.image && user?.name && <AvatarImage src={user?.image} alt={user?.name} />}
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => signOut({
                        callbackUrl: '/',
                        redirect: true
                    })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
