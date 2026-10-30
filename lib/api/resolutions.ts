import { clientFetch } from "@/lib/client-fetch";

/** GET: Resolution detail (with item, viewer, actions) */
export function getResolution(resolutionId: string, token?: string) {
    return clientFetch(`/resolutions/${resolutionId}`, token);
}

/** GET: Items linkable to a resolution (claim/return) */
export function getLinkableItems(itemId: string, token?: string) {
    return clientFetch(`/resolutions/linkable-items/${itemId}`, token);
}

/** POST: Create a resolution (claim/return, multipart with optional claim photo) */
export function createResolution(
    lostItemId: string | null,
    foundItemId: string | null,
    description: string | null,
    photo: File | null,
    token?: string,
) {
    const body = new FormData();
    if (lostItemId) body.append("lost_item_id", lostItemId);
    if (foundItemId) body.append("found_item_id", foundItemId);
    if (description) body.append("description", description);
    if (photo) body.append("photo", photo);

    // Image upload can take time, so we set a longer timeout
    return clientFetch('/resolutions/create', token, { method: "POST", body, timeout: 30000 });
}

/** POST: Attach or replace a resolution's claim photo (claimant only, while active) */
export function uploadResolutionPhoto(resolutionId: string, photo: File, token?: string) {
    const body = new FormData();
    body.append("photo", photo);

    return clientFetch(`/resolutions/${resolutionId}/photo`, token, {
        method: "POST",
        body,
        timeout: 30000,
    });
}

/** DELETE: Remove a resolution's claim photo (claimant only, while active) */
export function deleteResolutionPhoto(resolutionId: string, token?: string) {
    return clientFetch(`/resolutions/${resolutionId}/photo`, token, { method: "DELETE" });
}

/** PATCH: Update the claimant's claim description (shared edit budget applies) */
export function updateClaimDescription(resolutionId: string, description: string | null, token?: string) {
    return clientFetch(`/resolutions/${resolutionId}`, token, {
        method: "PATCH",
        body: JSON.stringify({ description }),
    });
}

/** POST: Approve a resolution */
export function approveResolution(claimId: string, itemId: string, token?: string) {
    return clientFetch(`/resolutions/${claimId}/approve`, token, { method: "POST" });
}

/** POST: Reject a resolution with a reason */
export function rejectResolution(resolutionID: string, rejectionReason: string, itemId: string, token?: string) {
    return clientFetch(`/resolutions/${resolutionID}/reject`, token, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
}

/** POST: Complete a resolution */
export function completeResolution(resolutionId: string, token?: string) {
    return clientFetch(`/resolutions/${resolutionId}/complete`, token, { method: "POST" });
}

/** POST: Fail a resolution */
export function failResolution(resolutionId: string, itemId: string, token?: string) {
    return clientFetch(`/resolutions/${resolutionId}/fail`, token, { method: "POST" });
}
