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
    const endpoint = "http://127.0.0.1:8000/items/"

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
export async function fetchAllItems() {
    try {
        const res = await fetch("http://127.0.0.1:8000/items/all");

        if (!res.ok) {
            console.error("fetchAllItems failed:", res.status);
            return {
                ok: false,
                data: { lost_items: [], found_items: [] },
                status: res.status,
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("fetchAllItems error:", err);

        return {
            ok: false,
            data: { lost_items: [], found_items: [] },
            error: String(err),
        };
    }
}

// GET: Single Item by ID and Type along with Reporter Info
export async function fetchItem(itemId: string, itemType: string) {
    try {
        const res = await fetch(
            `http://127.0.0.1:8000/items/${itemId}/${itemType}`
        );

        if (!res.ok) {
            console.error("fetchItem failed:", res.status);
            return null;
        }

        return await safeJson(res);
    } catch (err) {
        console.error("fetchItem error:", err);
        return null;
    }
}

// GET: All Items for a Specific User
export async function fetchAllUserItems(token?: string) {
    try {
        const res = await fetch("http://127.0.0.1:8000/profile/my-items", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) throw new UnauthorizedError();

        if (!res.ok) {
            console.error("fetchAllUserItems failed:", res.status);
            return {
                ok: false,
                data: { found_items: [], lost_items: [] },
                status: res.status,
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("fetchAllUserItems error:", err);
        return {
            ok: false,
            data: { found_items: [], lost_items: [] },
            error: String(err),
        };
    }
}

// GET: Found Items by Category for a Specific User
export async function fetchFoundUserItems(
    lostItemCategory: string,
    token?: string
) {
    const VALID_CATEGORIES = [
        "electronics",
        "clothing",
        "bags",
        "keys_wallets",
        "documents",
        "others",
    ];

    if (!VALID_CATEGORIES.includes(lostItemCategory)) {
        console.error("Invalid category:", lostItemCategory);
        return [];
    }

    try {
        const res = await fetch(
            `http://127.0.0.1:8000/profile/found-items?category=${lostItemCategory}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (res.status === 401) throw new UnauthorizedError();

        if (!res.ok) {
            console.error("fetchFoundUserItems failed:", res.status);
            return [];
        }

        return await safeJson(res);
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;

        console.error("fetchFoundUserItems error:", err);
        return [];
    }
}

// GET: User Profile Information
export const fetchUserProfile = async (user_id?: string) => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/profile/${user_id}`);

        if (!res.ok) {
            console.error("fetchUserProfile failed:", res.status);
            return null;
        }

        return await safeJson(res);
    } catch (err) {
        console.error("fetchUserProfile error:", err);
        return null;
    }
}
