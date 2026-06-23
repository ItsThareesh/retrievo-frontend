"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";

const problems = [
  "Cluttered inboxes",
  "Lost messages in group chats",
  "Found items with no easy way to locate the owner",
  "Important reports buried under unrelated conversations",
  "No centralized record of lost and found items",
  "Privacy concerns when sharing personal contact details",
];

const chatMessages = [
  "Anyone seen my wallet?",
  "Found a keychain near the library",
  "I lost my calculator 🥲",
  "Check the mess group",
  "No, I didn't see it",
  "Who lost an ID card?",
  "Can you send the photo again?",
  "I think it's in the admin office",
  "Found! Check the lost and found",
  "I posted in the hostel group too",
];

export function ProblemSection() {
  return (
    <section id="problem" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-8">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-destructive/70 mb-4 block">
              The Problem
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
              Lost &amp; Found Shouldn&apos;t Be This Hard
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <SectionWrapper className="space-y-4">
            {problems.map((problem, i) => (
              <motion.div
                key={problem}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-3 group"
              >
                <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive text-sm font-bold">&times;</span>
                </span>
                <span className="text-base md:text-lg text-foreground/80">{problem}</span>
              </motion.div>
            ))}
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="relative">
              <div className="relative bg-card border border-border rounded-2xl p-6 shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Campus Chats &mdash; 47 unread
                  </span>
                  <div className="ml-auto bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">
                    47
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-hidden relative">
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent z-10" />
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className={`flex items-start gap-2 ${
                        i % 3 === 0 ? "opacity-60" : i % 3 === 1 ? "opacity-40" : ""
                      } ${i < chatMessages.length - 2 ? "" : "opacity-30"}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground/60">
                            User {i + 1}
                          </span>
                          <span className="text-[10px] text-muted-foreground/40">
                            {10 + i * 3}m ago
                          </span>
                        </div>
                        <p className="text-sm text-foreground/70">{msg}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.8, type: "spring" }}
                className="absolute -top-3 -right-3 w-12 h-12 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center"
              >
                <span className="text-destructive font-bold text-lg">!</span>
              </motion.div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
