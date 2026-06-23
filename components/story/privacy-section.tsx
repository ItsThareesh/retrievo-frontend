"use client";

import { SectionWrapper } from "./section-wrapper";

export function PrivacySection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-foreground/60 to-foreground/40 bg-clip-text text-transparent mb-4 block">
              Privacy
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent text-balance pb-0.5">
              Privacy First by Design
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <SectionWrapper>
            <div className="relative group">
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                <div className="h-12 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 flex items-center px-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                      Before Approval
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Blue Water Bottle</p>
                    <p className="text-xs text-muted-foreground/60">Lost near Library &bull; 2 days ago</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <span className="text-sm font-mono text-muted-foreground/40 line-through">+91 XXXXX XXXXX</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm font-mono text-muted-foreground/40 line-through">j***@nitc.ac.in</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Instagram</span>
                      <span className="text-sm font-mono text-muted-foreground/40 line-through">---@john_doe</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-red-500/70">
                    <span>&#x26A0;</span>
                    <span>Hidden until claim is approved</span>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="relative group">
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                <div className="h-12 bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/20 flex items-center px-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      After Approval
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Blue Water Bottle</p>
                    <p className="text-xs text-muted-foreground/60">Lost near Library &bull; 2 days ago</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-900/20">
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <span className="text-sm font-medium text-foreground">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-900/20">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm font-medium text-foreground">john@nitc.ac.in</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-900/20">
                      <span className="text-sm text-muted-foreground">Instagram</span>
                      <span className="text-sm font-medium text-foreground">@john_doe</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                    <span>&#x2713;</span>
                    <span>Contact shared after successful claim</span>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>

        <SectionWrapper delay={0.3}>
          <div className="max-w-2xl mx-auto text-center mt-12">
            <p className="text-base text-muted-foreground leading-relaxed">
              Personal details remain hidden until a claim is approved. Users control exactly when and with whom their information is shared.
            </p>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
