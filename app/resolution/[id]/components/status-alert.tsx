import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatusAlertProps {
    title: string;
    body: string;
    icon: LucideIcon;
    theme: any;
}

export function StatusAlert({ title, body, icon: Icon, theme }: StatusAlertProps) {
    if (!title) return null; // Should not happen if checking showStatusCard

    return (
        <Card className={`${theme.cardBg} p-4 sm:p-6 shadow-sm`}>
            <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${theme.icon} shrink-0 mt-0.5`} />
                <div className="flex-1">
                    <h3 className={`font-semibold ${theme.textMain} mb-2`}>
                        {title}
                    </h3>
                    <p className={`text-sm ${theme.textSub} mb-3`}>
                        {body}
                    </p>
                    {theme.rejectionReason && (
                        <div className="bg-orange-100 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-700 rounded-md p-3 mt-3">
                            <p className="text-xs font-medium text-orange-900 dark:text-orange-100 mb-1">
                                Reason provided:
                            </p>
                            <p className="text-sm text-orange-800 dark:text-orange-200 whitespace-pre-wrap">
                                {theme.rejectionReason}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
