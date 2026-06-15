"use server";

import { authFetch, safeJson, UnauthorizedError } from "./helpers";

/** POST: Create a new Lost or Found Item */
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

        const result = await safeJson(res);

        return { ok: true, data: result };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("postLostFoundItem error:", err);
        return { ok: false, error: String(err) };
    }
}

/** PATCH: Update item's details */
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

        const result = await safeJson(res);

        return { ok: true, data: result };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("updateItem error:", err);
        return { ok: false, error: String(err) };
    }
}

/** DELETE: Delete an item */
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

/** POST: Flag Item */
export async function flagItem(itemId: string, reason: string) {
    try {
        const res = await authFetch(`/items/${itemId}/flag`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
        });

        if (!res.ok) {
            console.error("flagItem failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("flagItem error:", err);
        return { ok: false, error: String(err) };
    }
}