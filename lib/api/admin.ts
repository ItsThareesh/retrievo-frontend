import { ModerateUserRequest, ModerateItemRequest } from "@/types/admin";
import { clientMutate } from "@/lib/client-fetch";

export function moderateUser(userId: number, request: ModerateUserRequest, token?: string) {
    return clientMutate(`/admin/users/${userId}/moderate`, token, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export function moderateItem(itemId: string, request: ModerateItemRequest, token?: string) {
    return clientMutate(`/admin/items/${itemId}/moderate`, token, {
        method: "POST",
        body: JSON.stringify(request),
    });
}
