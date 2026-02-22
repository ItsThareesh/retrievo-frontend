"use server"

import { auth } from "@/lib/auth";
import { authFetch, publicFetch, safeJson, UnauthorizedError } from "./helpers";
import { Item } from "@/types/item";

export interface PaginatedItemsData {
    items: Item[];
    page: number;
    limit: number;
    has_more: boolean;
}

// GET: Paginated Items (supports search, category, and type filters)
//
// Default feed pages (no search/category filters) are cached via the
// native Next.js fetch cache with a 120s TTL, tagged per segment for
// on-demand revalidation via revalidateTag("items-{segment}", "max").
// ALL default pages are cached — not just page 1 — so infinite scroll
// hits the cache for every page until the tag is invalidated.
//
// Search and filtered queries always bypass cache (cache: "no-store")
// to guarantee fresh results.
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