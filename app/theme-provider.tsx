'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode, useEffect } from 'react';

export function ThemeProvider({ children }: { children: ReactNode;[key: string]: any; }) {
  useEffect(() => {
    // Enables :active styles on iOS Safari, which otherwise ignores them
    // unless the document has a touch event listener attached.
    document.addEventListener('touchstart', () => {}, { passive: true });
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
