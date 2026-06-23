"use client";

import { SectionWrapper } from "./section-wrapper";

const steps = [
  { label: "Claimant", desc: "A user finds a matching item and submits a claim with identifying details" },
  { label: "Ownership Description", desc: "The claimant describes the item — color, brand, unique marks, or circumstances of loss" },
  { label: "Finder Review", desc: "The finder reviews the claim against the item they found to verify accuracy" },
  { label: "Approval", desc: "If the details match, the finder approves the claim" },
  { label: "Contact Sharing", desc: "Contact information is revealed and both parties coordinate the return" },
];

export function ClaimVerificationSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <SectionWrapper>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-4 block">
                  Verification
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-4">
                  Verify Ownership Before Contact
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Claimants provide identifying information about the lost item. Finders review ownership claims before
                  revealing any contact details.
                </p>
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-8">
                {steps.map((step, i) => (
                  <div key={step.label} className="relative pl-16">
                    <div className="absolute left-4 top-1 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center">
                      <span className="text-xs font-bold text-foreground/60">{i + 1}</span>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-base font-semibold text-foreground mb-1">{step.label}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
