"use client";

import { SectionWrapper } from "./section-wrapper";

const impacts = [
  {
    title: "Students",
    desc: "Recover belongings faster with a centralized platform. No more scrolling through endless group chats or posting in multiple places.",
    stat: "Faster recovery",
    emoji: "\u{1F393}",
  },
  {
    title: "Finders",
    desc: "Return items with less effort. Post what you found, review claims, and connect with the rightful owner — all in one place.",
    stat: "Less effort",
    emoji: "\u{1F91D}",
  },
  {
    title: "Campus Community",
    desc: "Reduce clutter in communication channels and improve visibility. A shared platform means nothing falls through the cracks.",
    stat: "Better visibility",
    emoji: "\u{1F3EB}",
  },
];

export function ImpactSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-4 block">
              Impact
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
              Why It Matters
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {impacts.map((item, i) => (
            <SectionWrapper key={item.title} delay={i * 0.15}>
              <div className="group relative h-full">
                <div className="relative bg-card border border-border rounded-2xl p-8 h-full flex flex-col gap-5 hover:shadow-lg transition-all duration-300">
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-3 mt-auto border-t border-border">
                    <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40">
                      {item.stat}
                    </span>
                  </div>
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
