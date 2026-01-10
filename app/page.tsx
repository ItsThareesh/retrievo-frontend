"use client";

import { useEffect } from "react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Home() {
  
  useEffect(() => {
    const glow = document.getElementById("scrollGlow");
    if (!glow) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const factor = Math.min(scrollY / 600, 1);

          glow.style.height = `${600 - factor * 500}px`;
          glow.style.opacity = `${1 - factor * 0.5}`;

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center py-26 px-4 text-center overflow-hidden ">
        <div className="max-w-4xl space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 flex justify-center flex-col items-center">
          {/* <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-4">
            New: Community Rewards Program
          </div> */}

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            Lost something? <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Let&apos;s find it together.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Retrievo connects people who lost items with kind souls who found them.
            Simple, fast, and community-driven recovery.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center pt-8 w-4/5 md:w-full">
            <Button asChild size="lg" className="h-14 px-8 text-lg gap-2 hover:shadow-xl transition-all hover:-translate-y-1 bg-red-600 dark:bg-red-700 hover:bg-red-500  text-white border-0">
              <Link href="/report?type=lost">
                <AlertCircle className="w-5 h-5" />
                I Lost Something
              </Link>
            </Button>

            <Button asChild size="lg" className="h-14 px-8 text-lg gap-2 hover:shadow-xl transition-all hover:-translate-y-1 bg-green-600 hover:bg-green-500 dark:bg-green-700 text-white border-0">
              <Link href="/report?type=found">
                <CheckCircle2 className="w-5 h-5" />
                I Found Something
              </Link>
            </Button>
          </div>

          <div className="pt-4">
            <Button asChild variant="link" className="text-muted-foreground hover:text-primary gap-1">
              <Link href="/items">
                Browse all items <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        {/*Glow element with animation */}
        <div
          id="scrollGlow"
          className="
            pointer-events-none
            absolute bottom-0 left-1/2 -translate-x-1/2
            w-[120%] h-[600px]
            origin-bottom
            dark:bg-[radial-gradient(ellipse_at_bottom,rgba(93,96,241,0.35),transparent_50%)]
            [mask-image:linear-gradient(to_top,black,transparent)]
            blur-[100px] opacity-100
          "
        ></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="group p-8 rounded-2xl bg-popover border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Report Lost Items</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create a detailed report with photos, location, and description to alert the community instantly.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-popover border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Report Found Items</h3>
              <p className="text-muted-foreground leading-relaxed">
                Found something? Post it here to help it find its way back to its rightful owner.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-popover border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our platform helps match lost items with found reports based on location, date, and category.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div >
  );
}
