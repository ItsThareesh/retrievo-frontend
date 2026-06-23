"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";

const emailCards = [
  {
    subject: "Claim Approved",
    preview: "Your ownership claim for the black calculator has been approved.",
    tag: "Claim",
    time: "2 hours ago",
    delay: 0,
  },
  {
    subject: "Potential Match Found",
    preview: "A recently reported found item may match your lost item.",
    tag: "Match",
    time: "5 hours ago",
    delay: 0.15,
  },
  {
    subject: "New Claim Received",
    preview: "Someone has submitted a claim for your found item.",
    tag: "Claim",
    time: "1 day ago",
    delay: 0.3,
  },
];

const benefits = [
  "No need to constantly check the app",
  "Immediate awareness of claim activity",
  "Faster communication between finders and claimants",
  "Higher likelihood of successful recoveries",
];

export function EmailNotificationsSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <SectionWrapper>
            <div className="relative">
              <div className="relative bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="h-12 bg-muted/50 border-b border-border flex items-center px-4 gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 flex items-center justify-center min-w-0">
                    <div className="h-6 bg-background/80 rounded-md w-full max-w-md border border-border/50 flex items-center justify-center px-3 text-xs text-muted-foreground/60">
                      mail.google.com
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">3</span>
                  </div>
                </div>

                <div className="p-4 md:p-5 space-y-2">
                  <div className="flex items-center justify-between px-2 py-2 border-b border-border">
                    <span className="text-xs font-semibold text-foreground/60">Inbox</span>
                    <span className="text-[10px] text-muted-foreground/40">Sorted by newest</span>
                  </div>

                  <div className="space-y-1.5">
                    {emailCards.map((card) => (
                      <motion.div
                        key={card.subject}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: card.delay, ease: [0.25, 0.1, 0.25, 1] }}
                        className="p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow cursor-default"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px]">&#x2709;</span>
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              Retrievo
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              card.tag === "Claim"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            }`}
                          >
                            {card.tag}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground ml-8">{card.subject}</p>
                        <p className="text-xs text-muted-foreground/70 ml-8 mt-0.5 line-clamp-1">
                          {card.preview}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40 ml-8 mt-1">{card.time}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-4 block">
                  Email Notifications
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-4">
                  Never Miss an Update
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Retrievo delivers important updates directly to users through email, ensuring they stay informed even
                  when they are not actively using the platform.
                </p>
              </div>

              <div className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
                        &#10003;
                      </span>
                    </span>
                    <span className="text-sm text-foreground/80">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="relative bg-muted/30 border border-border rounded-xl p-5">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                    <span className="text-sm font-semibold text-foreground">Retrievo</span>
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
                    <span className="text-xs text-amber-700 dark:text-amber-300">&#x2709; Email</span>
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30">
                    <span className="text-xs text-emerald-700 dark:text-emerald-300">User Action</span>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
