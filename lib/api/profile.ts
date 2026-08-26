import { clientFetch } from "@/lib/client-fetch";
import { OnboardingPayload, ContactPayload } from "@/types/user";

/** GET: Current user's items */
export function getMyItems(token?: string) {
    return clientFetch('/profile/items', token);
}

/** GET: Public profile of a user with their items */
export function getUserProfile(userId: string, token?: string) {
    return clientFetch(`/profile/${userId}`, token);
}

/** POST: Onboarding Completion (returns fresh access_token) */
export function updateOnboarding(payload: OnboardingPayload, token?: string) {
    return clientFetch<{ access_token: string; expires_at: number }>('/profile/complete-onboarding', token, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/** PATCH: Update contact details (phone / Instagram) */
export function updateContact(payload: ContactPayload, token?: string) {
    return clientFetch('/profile/contact', token, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}
