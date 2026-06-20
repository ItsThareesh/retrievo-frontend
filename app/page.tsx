"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { FeaturesSection, FAQSection, Glow, Footer } from "@/components/landing-page";

export default function Home() {

  const heroAnimations = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes dropIn { 0% { opacity: 0; transform: translateY(-120px); } 60% { opacity: 1; transform: translateY(12px); } 80% { transform: translateY(-6px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); filter: blur(10px); } to { opacity: 1; transform: translateY(0); filter: blur(0px); } }
  `;

  return (
    <>
      <style>{heroAnimations}</style>
      <div className="flex flex-col">

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)] px-4 text-center overflow-hidden">
          <div className="max-w-4xl space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 flex justify-center flex-col items-center pb-8 md:pb-0">

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">

              {/* First line */}
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <span className="animate-[fadeIn_0.6s_ease-out_forwards] opacity-0">
                  Lost something
                </span>
                {/* Dropping Question Mark */}
                <span className="inline-block text-primary opacity-0 animate-[dropIn_0.9s_cubic-bezier(0.22,1,0.6,1)_0.5s_forwards]">?</span>
              </div>

              {/* Second line */}
              <div className="mt-2 opacity-0 animate-[fadeUp_1s_ease-out_1.0s_forwards]">
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Let&apos;s find it together
                </span>
              </div>

            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Retrievo connects people who lost items with kind souls who found them.
              Simple, fast, and community-driven recovery.
            </p>

            {/* Lost and Found Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-8 w-4/5 md:w-full">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg gap-2 bg-popover/60 backdrop-blur-sm border-border/50 text-foreground shadow-sm hover:bg-red-600/10 hover:border-red-600/30 hover:text-red-600 hover:shadow-md transition-all hover:-translate-y-1 rounded-xl animate-[fadeIn_0.6s_ease-out_1.8s_forwards] opacity-0"
              >
                <Link href="/report?type=lost">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  I Lost Something
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg gap-2 bg-popover/60 backdrop-blur-sm border-border/50 text-foreground shadow-sm hover:bg-green-600/10 hover:border-green-600/30 hover:text-green-600 hover:shadow-md transition-all hover:-translate-y-1 rounded-xl animate-[fadeIn_0.6s_ease-out_2.0s_forwards] opacity-0"
              >
                <Link href="/report?type=found">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  I Found Something
                </Link>
              </Button>
            </div>

            <div className="pt-4">
              <Button asChild variant="link" className="text-muted-foreground hover:text-primary gap-1 group animate-[fadeIn_0.6s_ease-out_2.2s_forwards] opacity-0">
                <Link href="/items">
                  Browse all items <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Glow element */}
          <Glow />

          {/* Soft fade: blends hero glow into Features below */}
          {/* <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent via-background/10 to-background pointer-events-none z-10" /> */}
        </section>

        <FeaturesSection />
        <FAQSection />
        <Footer />
      </div>
    </>
  );
}