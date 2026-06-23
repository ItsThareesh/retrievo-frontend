"use client";

import { SectionWrapper } from "./section-wrapper";

export function MatchingEngineSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-4 block">
              Matching Engine
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
              Helping Lost Items Find Their Owners
            </h2>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.15}>
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-card border border-border rounded-2xl p-8 md:p-12 lg:p-16 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_60%)] pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-0">
                {/* Input */}
                <div className="w-full lg:w-[280px] rounded-xl border border-border/60 bg-muted/20 p-6 lg:p-7 flex flex-col lg:shrink-0">
                  <div className="text-[11px] lg:text-xs font-semibold tracking-widest uppercase text-muted-foreground/40 mb-3 lg:mb-4">
                    Input
                  </div>
                  <div className="flex flex-col gap-3 lg:gap-3">
                    <div className="text-sm font-semibold text-foreground/80">Lost Item Report</div>
                    <div className="space-y-1.5">
                      {["Title & Description", "Category", "Location", "Date"].map((field) => (
                        <div
                          key={field}
                          className="text-sm text-muted-foreground/60 border border-border/40 rounded-lg px-3 py-2 bg-muted/10"
                        >
                          {field}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                <div className="flex items-center justify-center shrink-0">
                  <span className="text-muted-foreground/20 text-xl block lg:hidden">&#8595;</span>
                  <span className="text-muted-foreground/20 text-xl hidden lg:block px-4">&#8594;</span>
                </div>

                {/* Processing Pipeline */}
                <div className="w-full lg:w-[380px] rounded-xl border border-border/60 bg-muted/20 p-6 lg:p-7 flex flex-col lg:shrink-0">
                  <div className="text-[11px] lg:text-xs font-semibold tracking-widest uppercase text-muted-foreground/40 mb-3 lg:mb-4">
                    Processing Pipeline
                  </div>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    {[
                      { label: "NLP", desc: "Title & description\nsemantic matching" },
                      { label: "Location", desc: "Campus proximity\n& zone check" },
                      { label: "Category", desc: "Item type\nclassification" },
                      { label: "Date", desc: "Time decay\nweighting" },
                    ].map((mod) => (
                      <div
                        key={mod.label}
                        className="rounded-lg border border-border/50 bg-muted/10 p-3 lg:p-4 text-center"
                      >
                        <div className="text-sm font-bold text-foreground/80">{mod.label}</div>
                        <div className="text-xs text-muted-foreground/50 mt-1 leading-relaxed whitespace-pre-line">
                          {mod.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 lg:mt-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-4 lg:px-5 py-1.5 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.25)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Weighted Scoring Engine
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                <div className="flex items-center justify-center shrink-0">
                  <span className="text-muted-foreground/20 text-xl block lg:hidden">&#8595;</span>
                  <span className="text-muted-foreground/20 text-xl hidden lg:block px-4">&#8594;</span>
                </div>

                {/* Output */}
                <div className="w-full lg:w-[280px] rounded-xl border border-border/60 bg-muted/20 p-6 lg:p-7 flex flex-col lg:shrink-0">
                  <div className="text-[11px] lg:text-xs font-semibold tracking-widest uppercase text-muted-foreground/40 mb-3 lg:mb-4">
                    Output
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    {[
                      { label: "High", pct: "92%", color: "text-emerald-500" },
                      { label: "Medium", pct: "78%", color: "text-amber-500" },
                      { label: "Low", pct: "45%", color: "text-muted-foreground/50" },
                    ].map((match) => (
                      <div
                        key={match.label}
                        className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 px-3 lg:px-4 py-2.5 lg:py-3"
                      >
                        <span className="text-sm text-muted-foreground/70">{match.label}</span>
                        <span className={`text-sm font-bold ${match.color}`}>{match.pct}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 lg:mt-3 text-xs text-center text-muted-foreground/40">
                    Ranked candidates
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-10 max-w-2xl mx-auto leading-relaxed">
              Retrievo compares categories, keywords, descriptions, dates, and locations to surface the most relevant
              matches, reducing the manual effort of finding lost items.
            </p>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
