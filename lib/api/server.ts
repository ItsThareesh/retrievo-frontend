import { publicFetch, safeJson } from "./helpers";

// GET: Single Item by ID along with Reporter Info and Claim Status
export async function fetchItem(itemId: string, token?: string) {
    try {
        const res = await publicFetch(
            `/items/${itemId}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
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
