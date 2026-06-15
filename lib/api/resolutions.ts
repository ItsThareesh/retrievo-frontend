"use server";

import { authFetch, safeJson, UnauthorizedError } from "./helpers";

/** POST: Create a resolution (claim/return) */
export async function createResolution(
    lostItemId: string | null,
    foundItemId: string | null,
    description: string | null,
) {
    try {
        const body: Record<string, string> = {};
        if (lostItemId) body.lost_item_id = lostItemId;
        if (foundItemId) body.found_item_id = foundItemId;
        if (description) body.description = description;

        const res = await authFetch('/resolutions/create', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await safeJson(res);
            console.error("createResolution failed:", res.status);
            return { ok: false, status: res.status, detail: errorData.detail };
        }        

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("createResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

/** POST: Approve a resolution */
export async function approveResolution(claimId: string, itemId: string) {
    try {
        const res = await authFetch(`/resolutions/${claimId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("approveResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("approveResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

/** POST: Reject a resolution with a reason */
export async function rejectResolution(resolutionID: string, rejectionReason: string, itemId: string) {
    try {
        const res = await authFetch(`/resolutions/${resolutionID}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rejection_reason: rejectionReason }),
        });

        if (!res.ok) {
            console.error("rejectResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("rejectResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

/** POST: Complete a resolution */
export async function completeResolution(resolutionId: string) {
    try {
        const res = await authFetch(`/resolutions/${resolutionId}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("completeResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("completeResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

/** POST: Fail a resolution */
export async function failResolution(resolutionId: string, itemId: string) {
    try {
        const res = await authFetch(`/resolutions/${resolutionId}/fail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("failResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("failResolution error:", err);
        return { ok: false, error: String(err) };
    }
}