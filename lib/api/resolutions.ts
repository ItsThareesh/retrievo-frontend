"use server";

import { authFetch, safeJson, UnauthorizedError } from "./helpers";
import { onResolutionCompleted, onResolutionIntermediateStateChanged, onResolutionInvalidated } from "../utils/cacheController";
import { item_visibility, item_type } from "@/types/item";

/** POST: Create a resolution (claim) for a found item */
export async function createResolution(itemId: string, description: string) {
    try {
        const res = await authFetch('/resolutions/create', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: itemId, description: description }),
        });

        if (!res.ok) {
            console.error("createResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        onResolutionIntermediateStateChanged(itemId);

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("createResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

/** GET: Fetch current resolution status by ID (both for owner and finder) */
export async function getResolutionStatus(resolutionId: string) {
    try {
        const res = await authFetch(`/resolutions/${resolutionId}`);

        if (!res.ok) {
            return { ok: false, data: null, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getResolutionStatus error:", err);
        return { ok: false, data: null, error: String(err) };
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

        await onResolutionIntermediateStateChanged(itemId); // Revalidate the cache since the resolution state has changed (pending -> approved)

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

        await onResolutionIntermediateStateChanged(itemId); // Revalidate the cache since the resolution state has changed (pending -> rejected)

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("rejectResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

/** POST: Complete a resolution */
export async function completeResolution(
    resolutionId: string,
    itemId: string,
    item_type: item_type,
    visibility: item_visibility,
) {
    try {
        const res = await authFetch(`/resolutions/${resolutionId}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("completeResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        const result = await safeJson(res);

        await onResolutionCompleted(
            itemId,
            result.owner_public_id,
            item_type,
            visibility
        ); // Revalidate the cache since the resolution is now completed

        return { ok: true, data: result };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("completeResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

/** POST: Invalidate a resolution */
export async function invalidateResolution(resolutionId: string, itemId: string) {
    try {
        const res = await authFetch(`/resolutions/${resolutionId}/invalidate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("invalidateResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        await onResolutionInvalidated(itemId); // Revalidate the cache since the resolution is now invalidated

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("invalidateResolution error:", err);
        return { ok: false, error: String(err) };
    }
}