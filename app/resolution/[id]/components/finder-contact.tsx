import { Card } from "@/components/ui/card";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import { FinderContact } from "@/types/resolutions";
import Link from "next/link";

export function FinderContactCard({ contact, theme }: { contact: FinderContact, theme: any }) {
    if (!contact) return null;

    return (
        <Card className={`${theme.cardBg} p-4 sm:p-6 shadow-sm`}>
            <div className="flex items-start gap-3">
                <CheckCircle2 className={`h-5 w-5 ${theme.icon} shrink-0 mt-0.5`} />
                <div className="flex-1">
                    <h3 className={`font-semibold ${theme.textMain} mb-2`}>
                        Finder's Contact Details
                    </h3>
                    <p className={`text-sm ${theme.textSub} mb-4`}>
                        Please reach out to arrange a time and place to collect your item.
                    </p>

                    {/* Contact Card */}
                    <div className={`${theme.contactBox} border ${theme.contactBorder} rounded-lg p-4 space-y-3`}>
                        <div className="flex items-center gap-3">
                            <div>
                                <p className={`font-semibold ${theme.textMain}`}>
                                    {contact.name}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className={`h-4 w-4 ${theme.icon}`} />
                                <Link
                                    href={`mailto:${contact.email}`}
                                    className={`text-sm ${theme.textMain} hover:underline`}
                                >
                                    {contact.email}
                                </Link>
                            </div>

                            <div className="flex items-center gap-2">
                                <Phone className={`h-4 w-4 ${theme.icon}`} />
                                <Link
                                    href={`tel:${contact.phone}`}
                                    className={`text-sm ${theme.textMain} hover:underline`}
                                >
                                    {contact.phone}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <p className={`text-xs ${theme.textSub} mt-3`}>
                        Be respectful and coordinate a safe, public meeting place.
                    </p>
                </div>
            </div>
        </Card>
    );
}
