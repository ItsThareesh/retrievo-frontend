"use server";

import { authFetch, publicFetch, safeJson, UnauthorizedError } from "./helpers";
import { auth } from "@/lib/auth";
import { Item } from "@/types/item";

// GET: Single Item by ID along with Reporter Info and Claim Status
export async function fetchItem(itemId: string, token?: string) {
    try {
        const res = await publicFetch(
            `/items/${itemId}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(token ? { cache: "no-store" } : {}),
        });

        if (!res.ok) {
            console.error("fetchItem failed:", res.status);
            return { ok: false, data: null, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("fetchItem error:", err);
        return { ok: false, data: null, error: String(err) };
    }
}

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

export interface PaginatedItemsData {
    items: Item[];
    cursor: string | null;
    has_more: boolean;
}

/**
 * GET: Paginated Items (supports search, category, type filters, and cursor).
 * Visibility is enforced server-side by backend identity checks.
 *
 * Authenticated calls use cache: "no-store" to prevent Next.js Data Cache
 * from leaking hostel-filtered responses across users. Unauthenticated calls
 * are cacheable since public data is not user-specific.
*/
export async function getPaginatedItems(
    queryString: string = "",
) {
    try {
        const session = await auth();
        const token = session?.backendToken;

        const url = queryString
            ? `/items/all?${queryString}`
            : `/items/all?limit=12`;

        const res = await publicFetch(
            url,
            {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                ...(token ? { cache: "no-store" } : {}),
            },
        );

        if (!res.ok) {
            console.error("getPaginatedItems failed:", res.status);
            return { ok: false, status: res.status };
        }

        const data = await safeJson(res);
        if (!data) {
            return { ok: false, status: 500 };
        }

        return {
            ok: true,
            data: {
                items: data.items as Item[],
                cursor: data.cursor,
                has_more: data.has_more,
            },
        };
    } catch (err) {
        console.error("getPaginatedItems error:", err);
        return { ok: false, error: String(err) };
    }
}