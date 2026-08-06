"use server";

import { authFetch, APIError } from "./helpers";
import { OnboardingPayload, ContactPayload } from "@/types/user";

/** POST: Onboarding Completion */
export async function updateOnboarding(payload: OnboardingPayload) {
    try {
        const res = await authFetch('/profile/complete-onboarding', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error("updateOnboarding failed:", res.status);
            return { ok: false, status: res.status };
        }

        const data = await res.json();

        return {
            ok: true,
            access_token: data.access_token as string,
            expires_at: data.expires_at as number,
        };
    } catch (err) {
        if (err instanceof APIError) throw err;

        console.error("updateOnboarding error:", err);
        return { ok: false, error: String(err) };
    }
}

/** PATCH: Update contact details (phone / Instagram) */
export async function updateContact(payload: ContactPayload) {
    try {
        const res = await authFetch('/profile/contact', {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error("updateContact failed:", res.status);
            return { ok: false, status: res.status };
        }

        const data = await res.json();

        return {
            ok: true,
            phone: data.phone as string | null,
            instagramId: data.instagramId as string | null,
        };
    } catch (err) {
        if (err instanceof APIError) throw err;

        console.error("updateContact error:", err);
        return { ok: false, error: String(err) };
    }
}