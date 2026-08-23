import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SWRProvider } from "./swr-provider";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { SessionProvider } from 'next-auth/react';
import pwaAssets from "@/lib/pwa-assets.generated.json";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cssPixels = (value: number) => Number(value.toFixed(2));

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://retrievo.dev"
  ),
  title: "Retrievo - Lost & Found",
  description: "Find what you lost, return what you found.",
  icons: {
    icon: [
      { url: "/lighthouse.svg", type: "image/svg+xml" },
      { url: "/icons/manifest-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: pwaAssets.appleTouchIcon.src,
  },
  openGraph: {
    type: "website",
    siteName: "Retrievo",
    title: "Retrievo - Lost & Found",
    description: "Find what you lost, return what you found.",
    images: [
      {
        // ?v= busts X/Facebook's aggressive per-URL card cache
        url: "/og-image.png?v=2",
        width: 1200,
        height: 630,
        alt: "Retrievo brand logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Retrievo - Lost & Found",
    description: "Find what you lost, return what you found.",
    images: ["/og-image.png?v=2"],
  },
  appleWebApp: {
    capable: true,
    title: "Retrievo",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {pwaAssets.splash.map(({ src, width, height, scaleFactor }) => (
          <link
            key={src}
            rel="apple-touch-startup-image"
            href={src}
            media={`(device-width: ${cssPixels(width / scaleFactor)}px) and (device-height: ${cssPixels(height / scaleFactor)}px) and (-webkit-device-pixel-ratio: ${scaleFactor}) and (orientation: portrait)`}
          />
        ))}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <SessionProvider>
          <ThemeProvider>
            <SWRProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Toaster />
            </SWRProvider>
          </ThemeProvider>
        </SessionProvider>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
