"use client"

import { SWRConfig } from 'swr';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { ReactNode } from 'react';

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                revalidateOnReconnect: true,
                shouldRetryOnError: false,
                onError: (error: any) => {
                    if (error?.code === 'USER_BANNED') {
                        toast.error("Account Suspended", {
                            description: "Your account has been banned.",
                        });
                        setTimeout(() => signOut({ callbackUrl: '/auth/error?error=UserBanned' }), 1500);
                    }
                },
            }}
        >
            {children}
        </SWRConfig>
    );
}
