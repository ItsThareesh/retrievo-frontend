"use client";

import { motion } from "framer-motion";

export function FinalSection() {
  return (
    <section className="py-32 md:py-48 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.04) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-3xl mx-auto text-center space-y-10"
        >
          <div className="space-y-4">
            <h2 className="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent pb-0.5">
              Retrievo
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent pb-0.5">
              Ready to Help Someone Find What Matters?
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto text-balance">
              A dedicated, privacy-first lost and found platform for campus communities.
            </p>
          </div>

          <p className="text-xs text-muted-foreground/40 pt-8">
            Built for the NIT Calicut community &bull; Privacy first &bull; Open source
          </p>
        </motion.div>
      </div>
    </section>
  );
}
