"use client";

import { Check, Info, AlertOctagon, X } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

const mockNotifications = [
  {
    icon: "info" as const,
    title: "New Claim Submitted",
    message: "A user claims they lost the Blue Water Bottle you found.",
    time: "2 minutes ago",
    is_read: false,
  },
  {
    icon: "success" as const,
    title: "Claim Approved",
    message: "Your claim for the Black Wallet was approved. Contact is now shared.",
    time: "1 hour ago",
    is_read: false,
  },
  {
    icon: "warning" as const,
    title: "Potential Match Found",
    message: "A newly reported found item may match your lost item.",
    time: "3 hours ago",
    is_read: true,
  },
  {
    icon: "success" as const,
    title: "Resolution Completed",
    message: "The item has been successfully returned to its owner.",
    time: "1 day ago",
    is_read: true,
  },
];

function NotificationIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "success":
      return (
        <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
          <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        </div>
      );
    case "error":
      return (
        <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30">
          <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
        </div>
      );
    case "warning":
      return (
        <div className="rounded-full bg-orange-200 p-1.5 dark:bg-orange-900/40">
          <AlertOctagon className="h-3.5 w-3.5 text-orange-700 dark:text-orange-300" />
        </div>
      );
    case "info":
    default:
      return (
        <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/30">
          <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        </div>
      );
  }
}

export function NotificationsSection() {
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
                      retrievo.dev
                    </div>
                  </div>
                  <div className="w-12 shrink-0" />
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {mockNotifications.map((notif, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                          !notif.is_read ? "bg-muted/30" : ""
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <NotificationIcon icon={notif.icon} />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm font-medium leading-none truncate ${
                                !notif.is_read ? "text-foreground" : "text-foreground/60"
                              }`}
                            >
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="shrink-0 self-center">
                            <span className="h-2 w-2 rounded-full bg-primary block ring-2 ring-background" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-foreground/60 to-foreground/40 bg-clip-text text-transparent mb-4 block">
                  Notifications
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent text-balance pb-0.5 mb-4">
                  Stay Updated Automatically
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Real-time notifications keep everyone in the loop throughout the resolution process.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Someone claims an item you found",
                  "Your claim is approved by the finder",
                  "A newly reported item matches your lost report",
                  "The resolution status changes",
                ].map((update) => (
                  <div key={update} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                        &#8594;
                      </span>
                    </div>
                    <span className="text-base text-foreground/80">{update}</span>
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
