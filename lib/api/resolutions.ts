import { clientFetch, clientMutate } from "@/lib/client-fetch";

/** GET: Resolution detail (with item, viewer, actions) */
export function getResolution(resolutionId: string, token?: string) {
    return clientFetch(`/resolutions/${resolutionId}`, token);
}

/** GET: Items linkable to a resolution (claim/return) */
export function getLinkableItems(itemId: string, token?: string) {
    return clientFetch(`/resolutions/linkable-items/${itemId}`, token);
}

/** POST: Create a resolution (claim/return) */
export function createResolution(
    lostItemId: string | null,
    foundItemId: string | null,
    description: string | null,
    token?: string,
) {
    const body: Record<string, string> = {};
    if (lostItemId) body.lost_item_id = lostItemId;
    if (foundItemId) body.found_item_id = foundItemId;
    if (description) body.description = description;

    return clientMutate('/resolutions/create', token, { method: "POST", body: JSON.stringify(body) });
}

/** POST: Approve a resolution */
export function approveResolution(claimId: string, itemId: string, token?: string) {
    return clientMutate(`/resolutions/${claimId}/approve`, token, { method: "POST" });
}

/** POST: Reject a resolution with a reason */
export function rejectResolution(resolutionID: string, rejectionReason: string, itemId: string, token?: string) {
    return clientMutate(`/resolutions/${resolutionID}/reject`, token, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
}

/** POST: Complete a resolution */
export function completeResolution(resolutionId: string, token?: string) {
    return clientMutate(`/resolutions/${resolutionId}/complete`, token, { method: "POST" });
}

/** POST: Fail a resolution */
export function failResolution(resolutionId: string, itemId: string, token?: string) {
    return clientMutate(`/resolutions/${resolutionId}/fail`, token, { method: "POST" });
}
