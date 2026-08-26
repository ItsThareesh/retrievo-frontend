import { clientMutate } from "@/lib/client-fetch";

/** POST: Create a new Lost or Found Item */
export function postLostFoundItem(formData: FormData, token?: string) {
    return clientMutate('/items/create', token, { method: "POST", body: formData });
}

/** PATCH: Update item's details */
export function updateItem(itemId: string, data: Record<string, any>, token?: string) {
    return clientMutate(`/items/${itemId}`, token, { method: "PATCH", body: JSON.stringify(data) });
}

/** DELETE: Delete an item */
export function deleteItem(itemId: string, token?: string) {
    return clientMutate(`/items/${itemId}`, token, { method: "DELETE" });
}

/** POST: Flag Item */
export function flagItem(itemId: string, reason: string, token?: string) {
    return clientMutate(`/items/${itemId}/flag`, token, { method: "POST", body: JSON.stringify({ reason }) });
}
