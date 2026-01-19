"use server";

import { authFetch, safeJson, UnauthorizedError } from "./helpers";

// POST: Lost or Found Item
export async function postLostFoundItem(formData: FormData) {
    try {
        const res = await authFetch('/items/create', {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            console.error("postLostFoundItem failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("postLostFoundItem error:", err);
        return { ok: false, error: String(err) };
    }
}

// PATCH: Update single item fields
export async function updateItem(itemId: string, data: Record<string, any>) {
    try {
        const res = await authFetch(`/items/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            console.error("updateItem failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("updateItem error:", err);
        return { ok: false, error: String(err) };
    }
}

// DELETE: Delete an item
export async function deleteItem(itemId: string) {
    try {
        const res = await authFetch(`/items/${itemId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            console.error("deleteItem failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("deleteItem error:", err);
        return { ok: false, error: String(err) };
    }
}

// POST: Set User Hostel
export async function setHostel(hostel: string) {
    try {
        const res = await authFetch('/profile/set-hostel', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hostel }),
        });

        if (!res.ok) {
            console.error("setHostel failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        console.error("setHostel error:", err);
        return { ok: false, error: String(err) };
    }
}

// POST: Set User Phone Number
export async function setPhoneNumber(phone: string) {
    try {
        const res = await authFetch('/profile/set-phone', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
        });

        if (!res.ok) {
            console.error("setPhoneNumber failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        console.error("setPhoneNumber error:", err);
        return { ok: false, error: String(err) };
    }
}

// POST: Create a resolution (claim) for a found item
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

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("createResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function getNotificationsCount() {
    try {
        const res = await authFetch('/notifications/count');

        if (!res.ok) {
            console.error("getNotificationsCount failed:", res.status);
            return {
                ok: false, data: { count: 0 }, status: res.status
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("getNotificationsCount error:", err);
        return {
            ok: false, data: { count: 0 }, error: String(err)
        };
    }
}

export async function getNotifications() {
    try {
        const res = await authFetch(
            '/notifications/all',
            { next: { revalidate: 120 } } // Cache for 2 minutes
        );

        if (!res.ok) {
            console.error("getNotifications failed:", res.status);
            return {
                ok: false, data: { notifications: [] }, status: res.status
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("getNotifications error:", err);
        return {
            ok: false, data: { notifications: [] }, error: String(err)
        };
    };
}

export async function readNotification(notificationId: string) {
    try {
        const res = await authFetch(`/notifications/${notificationId}/mark-read`, {
            method: "POST",
        });

        if (!res.ok) {
            console.error("readNotification failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        console.error("readNotification error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function readAllNotifications() {
    try {
        const res = await authFetch(`/notifications/mark-all-read`, {
            method: "POST",
        });

        if (!res.ok) {
            console.error("readAllNotifications failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        console.error("readAllNotifications error:", err);
        return { ok: false, error: String(err) };
    }
}

// GET: Fetch current resolution status by ID (both for owner and finder)
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

// POST: Approve a claim
export async function approveClaim(claimId: string) {
    try {
        const res = await authFetch(`/resolutions/${claimId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("approveClaim failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("approveClaim error:", err);
        return { ok: false, error: String(err) };
    }
}

// POST: Reject a claim
export async function rejectClaim(resolutionID: string, rejectionReason: string) {
    try {
        const res = await authFetch(`/resolutions/${resolutionID}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rejection_reason: rejectionReason }),
        });

        if (!res.ok) {
            console.error("rejectClaim failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("rejectClaim error:", err);
        return { ok: false, error: String(err) };
    }
}

// POST: Complete a resolution
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

// POST: Invalidate a resolution
export async function invalidateResolution(resolutionId: string) {
    try {
        const res = await authFetch(`/resolutions/${resolutionId}/invalidate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("invalidateResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("invalidateResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function reportItem(itemId: string, reason: string) {
    try {
        const res = await authFetch(`/items/${itemId}/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
        });

        if (!res.ok) {
            console.error("reportItem failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        console.error("reportItem error:", err);
        return { ok: false, error: String(err) };
    }
}