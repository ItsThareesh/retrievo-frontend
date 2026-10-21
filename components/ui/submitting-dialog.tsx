"use client"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type SubmittingPhase = "loading" | "done";

const RING = 2 * Math.PI * 42;

interface SubmittingDialogProps {
    open: boolean;
    phase: SubmittingPhase;
}

export function SubmittingDialog({ open, phase }: SubmittingDialogProps) {
    const done = phase === "done";

    return (
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                className="max-w-xs p-8 text-center"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogTitle className="sr-only">
                    {done ? "Report submitted" : "Submitting report"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Please wait while your report is being submitted.
                </DialogDescription>

                <style>{`
                    @keyframes submitting-pop {
                        0% { transform: scale(0.4); opacity: 0; }
                        70% { transform: scale(1.08); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes submitting-draw {
                        from { stroke-dashoffset: 1; }
                        to { stroke-dashoffset: 0; }
                    }
                    @keyframes submitting-fade-up {
                        from { opacity: 0; transform: translateY(6px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .submitting-pop {
                        transform-box: fill-box;
                        transform-origin: center;
                        animation: submitting-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.35) both;
                    }
                    .submitting-check {
                        stroke-dasharray: 1;
                        stroke-dashoffset: 1;
                        animation: submitting-draw 0.35s ease-out 0.3s forwards;
                    }
                    .submitting-text {
                        animation: submitting-fade-up 0.3s ease-out 0.35s both;
                    }
                `}</style>

                <div className="flex flex-col items-center gap-5">
                    <svg viewBox="0 0 100 100" fill="none" className="h-28 w-28">
                        <circle
                            cx="50" cy="50" r="42"
                            strokeWidth="5"
                            className="stroke-muted"
                        />
                        {done ? (
                            <circle
                                cx="50" cy="50" r="42"
                                fill="currentColor"
                                className="submitting-pop text-emerald-500"
                            />
                        ) : (
                            <g className="origin-center animate-spin" style={{ transformBox: "fill-box" }}>
                                <circle
                                    cx="50" cy="50" r="42"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeDasharray={`${RING * 0.25} ${RING}`}
                                    className="stroke-primary"
                                />
                            </g>
                        )}
                        {done && (
                            <path
                                d="M34 52 L45.5 63 L67 40"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                stroke="white"
                                pathLength={1}
                                className="submitting-check"
                            />
                        )}
                    </svg>

                    <div className="space-y-1">
                        <p
                            className={cn(
                                "text-sm font-medium",
                                done ? "submitting-text text-emerald-600 dark:text-emerald-400" : "text-foreground"
                            )}
                        >
                            {done ? "Reported successfully!" : "Submitting your report..."}
                        </p>
                        {!done && (
                            <p className="text-xs text-muted-foreground">
                                This may take a few seconds
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
