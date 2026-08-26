"use client"

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { handleBanError } from '@/lib/ban-handler';

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                revalidateOnReconnect: true,
                shouldRetryOnError: false,
                onError: handleBanError,
            }}
        >
            {children}
        </SWRConfig>
    );
}
