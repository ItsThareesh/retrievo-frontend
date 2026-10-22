export interface User {
    name: string;
    email: string;
    image: string | null;
    public_id: string;
    created_at: string;
    hostel?: string;
    phone?: string;
}

export type UserRole = "student" | "staff" | "admin" | "security_officer";

export interface OnboardingPayload {
    hostel?: string;
    phone: string | null;
    instagramId: string | null;
}

export interface ContactPayload {
    phone?: string | null;
    instagramId?: string | null;
}

export interface NotificationPreferences {
    email?: boolean;
    push?: boolean;
}