"use client";

import { SectionWrapper } from "./section-wrapper";

const frontend = ["Next.js", "TypeScript", "Tailwind CSS"];
const backend = ["FastAPI", "Redis"];
const database = ["PostgreSQL"];
const storage = ["Cloudflare R2"];
const infrastructure = ["Docker", "GitHub Actions"];

function PillGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/50">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1.5 text-sm bg-card border border-border rounded-full text-foreground/80 font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechArchitectureSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6 md:px-8">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-foreground/60 to-foreground/40 bg-clip-text text-transparent mb-4 block">
              Technology
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent text-balance pb-0.5">
              What Powers Retrievo
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
              Built to deliver a fast, reliable, and privacy-conscious experience for the campus community.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.1}>
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="flex items-center gap-3 mb-10">
                <div className="flex -space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-muted-foreground/50 font-mono">architecture</span>
              </div>

              <div className="grid gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <PillGroup label="Frontend" items={frontend} />
                    <PillGroup label="Backend" items={backend} />
                  </div>
                  <div className="space-y-6">
                    <PillGroup label="Database" items={database} />
                    <PillGroup label="Storage" items={storage} />
                  </div>
                </div>

                <div>
                  <PillGroup label="Infrastructure" items={infrastructure} />
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground/50">
                  <span>Frontend</span>
                  <div className="flex-1 mx-4 h-px bg-border relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/40 to-muted-foreground/20" />
                  </div>
                  <span>Backend API</span>
                  <div className="flex-1 mx-4 h-px bg-border relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/40 to-muted-foreground/20" />
                  </div>
                  <span>Storage</span>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
