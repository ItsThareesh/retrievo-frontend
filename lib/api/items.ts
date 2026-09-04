import { clientFetch } from "@/lib/client-fetch";

/** GET: Item feed (paginated) */
export function getItems(cursor: string | null, search: string, category: string, type: string, token?: string) {
    const params = new URLSearchParams({ limit: "16" });
    if (cursor) params.set("cursor", cursor);
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (type !== "all") params.set("item_type", type);

    return clientFetch(`/items/all?${params}`, token);
}

/** GET: Single item with reporter info */
export function getItem(itemId: string, token?: string) {
    return clientFetch(`/items/${itemId}`, token);
}

/** POST: Create a new Lost or Found Item */
export function postLostFoundItem(formData: FormData, token?: string) {
    return clientFetch('/items/create', token, { method: "POST", body: formData, timeout: 30000 }); // Image upload can take time, so we set a longer timeout
}

/** PATCH: Update item's details */
export function updateItem(itemId: string, data: Record<string, any>, token?: string) {
    return clientFetch(`/items/${itemId}`, token, { method: "PATCH", body: JSON.stringify(data) });
}

/** DELETE: Delete an item */
export function deleteItem(itemId: string, token?: string, reason?: string) {
    const path = reason ? `/items/${itemId}?reason=${encodeURIComponent(reason)}` : `/items/${itemId}`;
    return clientFetch(path, token, { method: "DELETE" });
}

/** POST: Flag Item */
export function flagItem(itemId: string, reason: string, token?: string) {
    return clientFetch(`/items/${itemId}/flag`, token, { method: "POST", body: JSON.stringify({ reason }) });
}
