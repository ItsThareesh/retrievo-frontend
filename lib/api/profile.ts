"use server";

import { authFetch, safeJson, UnauthorizedError } from "./helpers";
import { OnboardingPayload } from "@/types/user";

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

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("updateOnboarding error:", err);
        return { ok: false, error: String(err) };
    }
}