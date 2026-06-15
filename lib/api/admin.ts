"use server";

import {
    ModerateUserRequest,
    ModerateItemRequest,
} from "@/types/admin";
import { authFetch, safeJson, UnauthorizedError } from "./helpers";

export async function moderateUser(userId: number, request: ModerateUserRequest) {
    try {
        const res = await authFetch(`/admin/users/${userId}/moderate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });

        if (!res.ok) {
            console.error("moderateUser failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("moderateUser error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function moderateItem(itemId: string, request: ModerateItemRequest) {
    try {
        const res = await authFetch(`/admin/items/${itemId}/moderate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });

        if (!res.ok) {
            console.error("moderateItem failed:", res.status);
            try {
                const errorData = await res.json();
                return { ok: false, status: res.status, errorData };
            } catch (e) {
                return { ok: false, status: res.status };
            }
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("moderateItem error:", err);
        return { ok: false, error: String(err) };
    }
}
