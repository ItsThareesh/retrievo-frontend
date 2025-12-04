export class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

async function safeJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export async function postLostFoundItem(
    type: "lost" | "found",
    formData: FormData,
    token?: string
) {
    const endpoint =
        type === "lost"
            ? "http://127.0.0.1:8000/lost-item/"
            : "http://127.0.0.1:8000/found-item/";

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