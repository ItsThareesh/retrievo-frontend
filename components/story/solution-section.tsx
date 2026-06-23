"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";
import { useId, useRef } from "react";

const benefits = [
  "Report lost and found items in seconds",
  "Browse all reports in one place",
  "Verify ownership before sharing contact",
  "Protect your privacy with visibility controls",
  "Resolve claims faster with structured workflows",
];

export function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const noiseId = useId();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [0.95, 1.05]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={sectionRef} id="solution" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-center">
          <SectionWrapper>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-emerald-600/70 dark:text-emerald-400/70 mb-4 block">
                  The Solution
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent text-balance pb-0.5">
                  A Dedicated Place For Lost &amp; Found
                </h2>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                        &#10003;
                      </span>
                    </span>
                    <span className="text-base md:text-lg text-foreground/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <motion.div style={{ scale: parallaxScale, y: parallaxY }} className="relative w-full">
              <div className="relative bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-4">
                  <div className="flex items-center gap-1.5 w-12 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 flex justify-center min-w-0">
                    <div className="h-6 bg-background/80 rounded-md w-full max-w-md border border-border/50 flex items-center justify-center px-3 text-xs text-muted-foreground/60">
                      retrievo.dev/items
                    </div>
                  </div>
                  <div className="w-12 shrink-0" />
                </div>
                <div className="relative aspect-[3024/1888] w-full bg-card">
                  <Image
                    src="/browse-page.png"
                    alt="Browse lost and found items"
                    fill
                    className="object-cover object-top scale-[1.002]"
                    priority
                    unoptimized
                  />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'overlay', opacity: 0.04 }}>
                    <filter id={`solution-noise-${noiseId}`}>
                      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter={`url(#solution-noise-${noiseId})`} />
                  </svg>
                </div>
              </div>
            </motion.div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
