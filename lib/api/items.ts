"use server";

import { authFetch, publicFetch, safeJson, UnauthorizedError } from "./helpers";
import { auth } from "@/lib/auth";
import { Item } from "@/types/item";
import { onItemCreated, onItemDeleted, onItemUpdated } from "../utils/cacheController";

// GET: Single Item by ID along with Reporter Info and Claim Status
export async function fetchItem(itemId: string, token?: string) {
    try {
        const res = await publicFetch(
            `/items/${itemId}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            next: {
                revalidate: 120, // Cache for 120 seconds
                tags: [`item-${itemId}`], // Tag for cache invalidation
            }
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

        const session = await auth();
        const public_id = session!.user.public_id; // Must be authenticated to post, so session and public_id are guaranteed to exist

        await onItemCreated(result.visibility, public_id); // Handle cache updates on item creation

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

        const session = await auth();
        const public_id = session!.user.public_id; // Must be authenticated to update, so session and public_id are guaranteed to exist

        await onItemUpdated(
            itemId,
            public_id,
            {
                visibility_changed: result.visibility_changed,
                display_fields_changed: result.display_fields_changed,
                old_visibility: result.old_visibility,
                new_visibility: result.new_visibility
            }
        ); // Handle cache updates on item update based on what changed

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

        const result = await safeJson(res);

        const session = await auth();
        const public_id = session!.user.public_id; // Must be authenticated to delete, so session and public_id are guaranteed to exist
        await onItemDeleted(itemId, public_id, result.visibility); // Handle cache updates on item deletion

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("deleteItem error:", err);
        return { ok: false, error: String(err) };
    }
}

/** POST: Report Item */
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
        if (err instanceof UnauthorizedError) throw err;

        console.error("reportItem error:", err);
        return { ok: false, error: String(err) };
    }
}

export interface PaginatedItemsData {
    items: Item[];
    page: number;
    limit: number;
    has_more: boolean;
}

/**
 * GET: Paginated Items (supports search, category, and type filters)
 * Default feed pages (no search/category filters) are cached via the
 * native Next.js fetch cache with a 120s TTL, tagged per segment for
 * on-demand revalidation via revalidateTag("items-{segment}", "max").
 * 
 * All default pages are cached so infinite scroll
 * hits the cache for every page until the tag is invalidated.
 * Search and filtered queries always bypass cache (cache: "no-store")
 * to guarantee fresh results.
*/
export async function getPaginatedItems(
    segment: "public" | "boys" | "girls",
    queryString: string = "",
) {
    try {
        const url = queryString
            ? `/items/all?segment=${segment}&${queryString}`
            : `/items/all?segment=${segment}&page=1&limit=12`;

        const hasFilters =
            queryString.includes("search=") ||
            queryString.includes("category=");

        const res = await publicFetch(
            url,
            hasFilters
                ? { cache: "no-store" }
                : { next: { revalidate: 120, tags: [`feed-${segment}`] } },
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
                page: data.page,
                limit: data.limit,
                has_more: data.has_more,
            },
        };
    } catch (err) {
        console.error("getPaginatedItems error:", err);
        return { ok: false, error: String(err) };
    }
}