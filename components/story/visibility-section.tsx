"use client";

import { useState } from "react";
import { SectionWrapper } from "./section-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Visibility = "public" | "boys" | "girls";

const visibilityLabels: Record<Visibility, string> = {
  public: "Entire Campus",
  boys: "Boys Hostels",
  girls: "Girls Hostels",
};

export function VisibilitySection() {
  const [visibility, setVisibility] = useState<Visibility>("public");

  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <SectionWrapper>
            <div className="relative">
              <div className="relative bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-4">
                  <div className="flex items-center gap-1.5 w-12 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 flex justify-center min-w-0">
                    <div className="h-6 bg-background/80 rounded-md w-full max-w-md border border-border/50 flex items-center justify-center px-3 text-xs text-muted-foreground/60">
                      retrievo.dev/report
                    </div>
                  </div>
                  <div className="w-12 shrink-0" />
                </div>
                <div className="p-4 md:p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Report Item</p>
                      <p className="text-xs text-muted-foreground/60">Black Hoodie</p>
                    </div>
                    <div className="h-8 px-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-xs font-medium text-red-500">
                      Lost
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                      Visibility
                    </p>

                    <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
                      <SelectTrigger className="w-full h-11 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public" className="cursor-pointer">
                          <span>Public</span>
                        </SelectItem>
                        <SelectItem value="boys" className="cursor-pointer">
                          <span>Boys Only</span>
                        </SelectItem>
                        <SelectItem value="girls" className="cursor-pointer">
                          <span>Girls Only</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground/50">Your report will be visible to</span>
                      <span className="font-medium text-foreground/80">{visibilityLabels[visibility]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-4 block">
                  Visibility Controls
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-4">
                  Not Everything Needs To Be Public
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose exactly who sees your lost item report — from the entire campus down to your hostel.
                One toggle is all it takes.
              </p>

              <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-xl overflow-hidden">
                <div className="py-4 px-3 text-center">
                  <p className="text-xs font-semibold text-foreground/80">Public</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Everyone on campus</p>
                </div>
                <div className="py-4 px-3 text-center bg-muted/10">
                  <p className="text-xs font-semibold text-foreground/80">Boys Only</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Boys hostel residents</p>
                </div>
                <div className="py-4 px-3 text-center">
                  <p className="text-xs font-semibold text-foreground/80">Girls Only</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Girls hostel residents</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-sm text-foreground/80">Set visibility per report - not per profile</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-sm text-foreground/80">Personal items stay within your community</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-sm text-foreground/80">Change visibility anytime</span>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
