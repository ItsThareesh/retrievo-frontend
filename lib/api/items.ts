"use server";

import { authFetch, publicFetch, safeJson, UnauthorizedError } from "./helpers";
import { updateTag } from "next/cache";
import { revalidateFeedByVisibility } from "../utils/revalidateFeed";
import { Item } from "@/types/item";
import { auth } from "../auth";

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
        revalidateFeedByVisibility(result.visibility); // Revalidate the feed based on the item's visibility

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

        updateTag(`item-${itemId}`); // Invalidate cache for this item

        // If visibility changed, we need to revalidate all the relevant feeds
        // If only display fields of item-card (title, date, location) are changed, then we only need to
        // revalidate the feed of the old visibility to reflect changes on the next revalidation cycle
        if (result.visibility_changed) {
            revalidateFeedByVisibility(result.old_visibility);
            revalidateFeedByVisibility(result.new_visibility);
        } else if (result.display_fields_changed) {
            revalidateFeedByVisibility(result.old_visibility);
        }

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

        updateTag(`item-${itemId}`); // Invalidate cache for this item

        revalidateFeedByVisibility(result.visibility); // Revalidate the feed based on the item's visibility

        return { ok: true };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("deleteItem error:", err);
        return { ok: false, error: String(err) };
    }
}

/* 
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
*/

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
 * ALL default pages are cached so infinite scroll
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
                : { next: { revalidate: 120, tags: [`items-${segment}`] } },
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

// GET: All Items for Current User (requires authentication)
export async function getUserItems() {
    try {
        const res = await authFetch("/profile/items", { cache: "no-store" });

        if (!res.ok) {
            console.error("getUserItems failed:", res.status);
            return {
                ok: false,
                data: { lost_items: [], found_items: [] },
                status: res.status,
            };
        }

        const data = await safeJson(res);

        return {
            ok: true,
            data: {
                lost_items: data.lost_items as Item[],
                found_items: data.found_items as Item[],
            },
        };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getUserItems error:", err);
        return { ok: false, error: String(err) };
    }
}

// GET: User Profile (works with or without authentication)
export async function getUserProfile(public_id: string) {
    try {
        const session = await auth();
        const token = session?.backendToken;

        const res = await publicFetch(`/profile/${public_id}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("getUserProfile failed:", res.status);
            return { ok: false, status: res.status };
        }

        const data = await safeJson(res);

        return {
            ok: true,
            data: {
                user: data.user,
                lost_items: data.lost_items as Item[],
                found_items: data.found_items as Item[],
            },
        };
    } catch (err) {
        console.error("getUserProfile error:", err);
        return { ok: false, error: String(err) };
    }
}