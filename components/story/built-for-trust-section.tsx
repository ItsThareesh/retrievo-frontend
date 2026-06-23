"use client";

import { SectionWrapper } from "./section-wrapper";
import { Shield, Eye, CheckCircle, Users } from "lucide-react";

const cards = [
  {
    icon: Users,
    title: "Verified Users",
    desc: "Only authenticated campus users can participate. No bots, no outsiders, no spam.",
  },
  {
    icon: Eye,
    title: "Privacy Controls",
    desc: "Users control the visibility of their personal information at every step.",
  },
  {
    icon: CheckCircle,
    title: "Ownership Verification",
    desc: "Claims require the claimant to describe the item before contact is shared.",
  },
  {
    icon: Shield,
    title: "Community Driven",
    desc: "The platform grows stronger with every resolved claim. Trust is built through participation.",
  },
];

export function BuiltForTrustSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-4 block">
              Trust
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
              Designed Around Community Trust
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {cards.map((card, i) => (
            <SectionWrapper key={card.title} delay={i * 0.1}>
              <div className="group relative h-full">
                <div className="relative bg-card border border-border rounded-xl p-6 h-full flex flex-col gap-4 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-foreground/60" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
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
