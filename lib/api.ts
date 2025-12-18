// Custom Error for Unauthorized Access
export class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

// Helper function to safely parse JSON
async function safeJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

// POST: Lost or Found Item
export async function postLostFoundItem(
    formData: FormData,
    token?: string
) {
    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/items/`

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (res.status === 401) throw new UnauthorizedError();

        if (!res.ok) {
            console.error("postLostFoundItem failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("postLostFoundItem error:", err);
        return { ok: false, error: String(err) };
    }
}

// GET: All Items
export async function fetchAllItems(token?: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/items/all`, {
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

// GET: Single Item by ID and Type along with Reporter Info
export async function fetchItem(itemId: string, token?: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/items/${itemId}`, {
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

// GET: All Items for a Specific User
export async function fetchAllUserItems(token?: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/my-items`, {
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
export const fetchUserProfile = async (user_id?: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${user_id}`);

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

// PATCH: Update single item fields
export async function updateItem(itemId: string, data: Record<string, any>, token?: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/items/${itemId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });

        if (res.status === 401) throw new UnauthorizedError();

        if (!res.ok) {
            console.error("updateItem failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("updateItem error:", err);
        return { ok: false, error: String(err) };
    }
}

// DELETE: Delete an item
export async function deleteItem(itemId: string, token?: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/items/${itemId}`, {
            method: "DELETE",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (res.status === 401) throw new UnauthorizedError();

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

// POST: Set User Hostel
export const setHostel = async (hostel: string, token?: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/set-hostel/${hostel}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
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