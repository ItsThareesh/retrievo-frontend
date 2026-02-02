export interface User {
    name: string;
    email: string;
    image: string;
    public_id: string;
    created_at: string;
    hostel?: string;
    phone?: string;
}

export interface OnboardingPayload {
    hostel: string;
    phone: string | null;
    instagramId: string | null;
}