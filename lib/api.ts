export async function fetchLostItems() {
    const res = await fetch("http://127.0.0.1:8000/lost-items/");
    if (!res.ok) throw new Error("Failed to fetch lost items");
    return res.json();
}

export async function fetchFoundItems() {
    const res = await fetch("http://127.0.0.1:8000/found-items/");
    if (!res.ok) throw new Error("Failed to fetch found items");
    return res.json();
}

export async function postLostFoundItem(type: "lost" | "found", formData: FormData, token?: string) {
    const endpoint =
        type === "lost"
            ? "http://127.0.0.1:8000/lost-items/"
            : "http://127.0.0.1:8000/found-items/";

    try {
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
            };
        }

        const data = await response.json();

        return { status: response.status, ok: true, data };
    } catch (err) {
        console.error("Network error:", err);
        return { status: 0, ok: false, error: 'Network Error' };
    }
}