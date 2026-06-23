"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
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
        <section className="relative flex flex-col items-center justify-start min-h-[calc(100dvh-4rem)] px-4 text-center overflow-hidden">
          <div className="max-w-4xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center pt-28 md:pt-36">

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">

              {/* First line */}
              <div className="flex justify-center items-center gap-3 flex-wrap">
                <span className="animate-[fadeIn_0.6s_ease-out_forwards] opacity-0">
                  Lost something
                </span>
                {/* Dropping Question Mark */}
                <span className="inline-block text-primary opacity-0 animate-[dropIn_0.9s_cubic-bezier(0.22,1,0.6,1)_0.5s_forwards]">?</span>
              </div>

              {/* Second line */}
              <div className="mt-4 opacity-0 animate-[fadeUp_1s_ease-out_1.0s_forwards]">
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Let&apos;s find it together
                </span>
              </div>

            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-10 mb-8">
              Lost something on campus? Retrievo connects finders with owners
              through smart matching and community-powered reports.
            </p>

            <div className="flex flex-row gap-5 mt-10 animate-[fadeIn_0.6s_ease-out_2.2s_forwards] opacity-0">
              <Button asChild variant="outline" className="h-14 px-8 text-lg gap-2 bg-popover/40 backdrop-blur-sm border-border/50 shadow-sm hover:bg-accent hover:text-foreground transition-all rounded-xl">
                <Link href="/items">
                  Browse Items <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 px-8 text-lg gap-2 bg-popover/40 backdrop-blur-sm border-border/50 shadow-sm hover:bg-accent hover:text-foreground transition-all rounded-xl">
                <Link href="/story">
                  <Play className="w-5 h-5" /> See How It Works
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