import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SWRProvider } from "./swr-provider";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Retrievo - Lost & Found",
  description: "Find what you lost, return what you found.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <SWRProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </SWRProvider>
        </ThemeProvider>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
