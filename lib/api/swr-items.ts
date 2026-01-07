"use server"

import { auth } from "@/auth";
import { safeJson, UnauthorizedError } from "./helpers";
import { Item } from "@/types/item";

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL;

// GET: Paginated Items (works with or without authentication)
export async function getPaginatedItems(page: number = 1, limit: number = 12) {
    try {
        const session = await auth();
        const token = session?.backendToken;

        const res = await fetch(`${BACKEND_URL}/items/all?page=${page}&limit=${limit}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
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
        const session = await auth();

        if (!session?.backendToken) {
            throw new UnauthorizedError();
        }

        const res = await fetch(`${BACKEND_URL}/profile/items`, {
            headers: { Authorization: `Bearer ${session.backendToken}` },
        });

        if (res.status === 401) throw new UnauthorizedError();

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

        const res = await fetch(`${BACKEND_URL}/profile/${public_id}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
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