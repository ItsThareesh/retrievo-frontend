"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useId, useRef } from "react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const noiseId = useId();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [0.92, 1.08]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.06) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-10">
        <div className="max-w-3xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-4"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mt-16 text-balance">
              <span className="block">Lost Less.</span>
              <span className="block text-primary/80">Found Faster.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
              A privacy-first lost and found platform built for the NIT Calicut community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#solution"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all"
            >
              Explore Product
              <ArrowDown className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full"
        >
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
                    retrievo.dev
                  </div>
                </div>
                <div className="w-12 shrink-0" />
              </div>
              <div className="relative aspect-[3023/1732] w-full bg-card">
                <Image
                  src="/landing.png"
                  alt="Retrievo landing page"
                  fill
                  className="object-cover object-top scale-[1.002]"
                  priority
                  unoptimized
                />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'overlay', opacity: 0.04 }}>
                  <filter id={`hero-noise-${noiseId}`}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                  </filter>
                  <rect width="100%" height="100%" filter={`url(#hero-noise-${noiseId})`} />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a
          href="#problem"
          className="flex flex-col items-center gap-1 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        >
          <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
