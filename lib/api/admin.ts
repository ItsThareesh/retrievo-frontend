"use server"

import {
    OverviewStats,
    ActivityItem,
    ClaimDetail,
    UserDetail,
    ReportedItemDetail,
    ModerateUserRequest,
    ModerateItemRequest,
} from "@/types/admin";
import { authFetch, safeJson, UnauthorizedError } from "./helpers";

export async function getStats() {
    try {
        const res = await authFetch("/admin/stats");

        if (!res.ok) {
            console.error("getStats failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) as OverviewStats }
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("updateItem error:", err);
        return { ok: false, error: String(err) };
    }
};

export async function getActivity(limit = 20) {
    try {
        const res = await authFetch(`/admin/activity?limit=${limit}`);

        if (!res.ok) {
            console.error("getActivity failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) as ActivityItem[] }
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getActivity error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function getClaims(status?: string, limit = 50, skip = 0) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());

    try {
        const res = await authFetch(`/admin/claims?${params}`);

        if (!res.ok) {
            console.error("getClaims failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) as ClaimDetail[] }
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getClaims error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function getUsers(limit = 50, skip = 0) {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());

    try {
        const res = await authFetch(`/admin/users?${params}`);

        if (!res.ok) {
            console.error("getUsers failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) as UserDetail[] }
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getUsers error:", err);
        return { ok: false, error: String(err) };
    }
}

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

export async function getReportedItems(limit = 50, skip = 0) {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());

    try {
        const res = await authFetch(`/admin/reported-items?${params}`);

        if (!res.ok) {
            console.error("getReportedItems failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) as ReportedItemDetail[] };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("getReportedItems error:", err);
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
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("moderateItem error:", err);
        return { ok: false, error: String(err) };
    }
}
