import { safeJson, UnauthorizedError } from "./helpers";

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL;

// GET: All Items
export async function fetchAllItems(token?: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/items/all`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) {
            console.error("fetchAllItems failed:", res.status);
            return {
                ok: false,
                data: { items: [] },
                status: res.status,
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("fetchAllItems error:", err);

        return {
            ok: false,
            data: { items: [] },
            error: String(err),
        };
    }
}

// GET: Single Item by ID along with Reporter Info and Claim Status
export async function fetchItem(itemId: string, token?: string) {
    try {
        const res = await fetch(
            `${BACKEND_URL}/items/${itemId}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

// GET: All Items for a Current User
export async function fetchAllUserItems(token?: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/profile/items`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) throw new UnauthorizedError();

        if (!res.ok) {
            console.error("fetchAllUserItems failed:", res.status);
            return {
                ok: false,
                data: { lost_items: [], found_items: [] },
                status: res.status,
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("fetchAllUserItems error:", err);
        return {
            ok: false,
            data: { lost_items: [], found_items: [] },
            error: String(err),
        };
    }
}

// GET: User Profile Information
export async function fetchUserProfile(public_id: string, token?: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/profile/${public_id}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        if (!res.ok) {
            console.error("fetchUserProfile failed:", res.status);
            return {
                ok: false,
                data: {
                    user: null,
                    lost_items: [],
                    found_items: [],
                },
                status: res.status,
            }
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("fetchUserProfile error:", err);
        return { ok: false, data: null, error: String(err) };
    }
}

export async function getNotificationsCount(token?: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/notifications/count`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            console.error("getNotificationsCount failed:", res.status);
            return {
                ok: false, data: { count: 0 }, status: res.status
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("getNotificationsCount error:", err);
        return { ok: false, data: { count: 0 }, error: String(err) };
    }
}
