"use server";

import { Item } from "@/types/item";
import { authFetch, publicFetch, safeJson, UnauthorizedError } from "./helpers";

// GET: All Items for Current User (requires authentication)
export async function getUserItems() {
    try {
        const res = await authFetch(
            "/profile/items",
            { cache: "no-store" }
        );

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

// GET: User Profile (public, segment-based visibility — cached like /items/all)
export async function getUserProfile(
    publicID: string,
    segment: "public" | "boys" | "girls" = "public",
) {
    try {
        const res = await publicFetch(
            `/profile/${publicID}?segment=${segment}`,
            { next: { revalidate: 120, tags: [`profile-${publicID}-${segment}`] } },
        );

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