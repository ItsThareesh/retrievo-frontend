"use server"

import { auth } from "@/auth";
import { authFetch, publicFetch, safeJson, UnauthorizedError } from "./helpers";
import { Item } from "@/types/item";

// GET: Paginated Items (works with or without authentication)
export async function getPaginatedItems(queryString: string = '') {
    try {
        const session = await auth();
        const token = session?.backendToken;

        const url = queryString ? `/items/all?${queryString}` : '/items/all?page=1&limit=12';

        const res = await publicFetch(url, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            console.error("getPaginatedItems failed:", res.status);
            return { ok: false, status: res.status };
        }

        const data = await safeJson(res);
        return {
            ok: true,
            data: {
                items: data.items as Item[],
                page: data.page,
                limit: data.limit,
                has_more: data.has_more
            }
        };
    } catch (err) {
        console.error("getPaginatedItems error:", err);
        return { ok: false, error: String(err) };
    }
}

// GET: All Items for Current User (requires authentication)
export async function getUserItems() {
    try {
        const res = await authFetch(`/profile/items`, { cache: 'no-store' });

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
                found_items: data.found_items as Item[]
            }
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

        const res = await publicFetch(
            `/profile/${public_id}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: 'no-store',
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
                found_items: data.found_items as Item[]
            }
        };
    } catch (err) {
        console.error("getUserProfile error:", err);
        return { ok: false, error: String(err) };
    }
}