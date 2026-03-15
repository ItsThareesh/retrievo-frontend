"use server";

import { authFetch, safeJson, UnauthorizedError } from "./helpers";
import { onResolutionCompleted, onResolutionIntermediateStateChanged, onResolutionInvalidated } from "../utils/cacheController";
import { item_visibility, item_type } from "@/types/item";
import { LinkableItem } from "@/types/resolutions";

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
            console.error("createResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        // Revalidate the cache since a new resolution is now pending against the found item and/or lost item
        if (foundItemId) await onResolutionIntermediateStateChanged(foundItemId);
        if (lostItemId) await onResolutionIntermediateStateChanged(lostItemId);

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("createResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

/** GET: Fetch linkable items for the counterpart radio buttons */
export async function getLinkableItems(itemId: string): Promise<LinkableItem[]> {
    try {
        const res = await authFetch(`/resolutions/linkable-items?item_id=${encodeURIComponent(itemId)}`);

        if (!res.ok) {
            console.error("getLinkableItems failed:", res.status);
            return [];
        }

        return await safeJson(res);
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getLinkableItems error:", err);
        return [];
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

        const result = await safeJson(res);

        // Revalidate the cache since the resolution state has changed (pending -> approved)
        if (result.found_item_id) {
            await onResolutionIntermediateStateChanged(result.found_item_id);
        }
        if (result.lost_item_id) {
            await onResolutionIntermediateStateChanged(result.lost_item_id);
        }

        return { ok: true, data: result };
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

        const result = await safeJson(res);

        // Revalidate the cache since the resolution state has changed (pending -> rejected)
        if (result.found_item_id) {
            await onResolutionIntermediateStateChanged(result.found_item_id);
        }
        if (result.lost_item_id) {
            await onResolutionIntermediateStateChanged(result.lost_item_id);
        }

        return { ok: true };
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

        const result = await safeJson(res);

        if (result.lost_item_id) {
            onResolutionCompleted(
                result.lost_item_id,
                result.owner_public_id,
                "lost",
                result.lost_item_visibility,
            )
        }

        if (result.found_item_id) {
            // Revalidate the cache since the resolution state has changed (approved -> completed)
            onResolutionCompleted(
                result.found_item_id,
                result.finder_public_id,
                "found",
                result.found_item_visibility,
            )
        }

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

        const result = await safeJson(res);

        // Revalidate the cache since the resolution is now invalidated
        if (result.lost_item_id) {
            onResolutionInvalidated(result.lost_item_id);
        }
        if (result.found_item_id) {
            onResolutionInvalidated(result.found_item_id);
        }

        return { ok: true, data: result };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("invalidateResolution error:", err);
        return { ok: false, error: String(err) };
    }
}