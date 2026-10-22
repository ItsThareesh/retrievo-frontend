import { ModerateUserRequest, ModerateItemRequest, UserDetail, UserRole, ResolutionDetail, ActivityItem, ReportedItemDetail, CustodyLogEntry } from "@/types/admin";
import { clientFetch } from "@/lib/client-fetch";

/** GET: Platform stats for the overview tab */
export function getStats(token?: string) {
    return clientFetch("/admin/stats", token);
}

/** GET: Recent admin-relevant activity */
export function getActivity(token?: string) {
    return clientFetch<ActivityItem[]>("/admin/activity?limit=10", token);
}

/** GET: Users (paginated, optionally filtered by search) */
export function getUsers(search: string, skip: number, limit: number, token?: string) {
    const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
    if (search) params.set("search", search);

    return clientFetch<UserDetail[]>(`/admin/users?${params}`, token);
}

/** GET: Reported items */
export function getReportedItems(token?: string) {
    return clientFetch<ReportedItemDetail[]>("/admin/reported-items?limit=50", token);
}

/** GET: Security-office custody log (items currently held + returned) */
export function getCustodyLog(token?: string) {
    return clientFetch<CustodyLogEntry[]>("/admin/custody-log?limit=100", token);
}

/** GET: Resolutions (paginated, optionally filtered by search + status) */
export function getAdminResolutions(search: string, status: string, skip: number, limit: number, token?: string) {
    const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);

    return clientFetch<ResolutionDetail[]>(`/admin/resolutions?${params}`, token);
}

/** POST: Warn / ban / unban a user */
export function moderateUser(userId: number, request: ModerateUserRequest, token?: string) {
    return clientFetch(`/admin/users/${userId}/moderate`, token, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/** POST: Change a user's role (student / staff / admin / security_officer) */
export function changeUserRole(userId: number, role: UserRole, token?: string) {
    return clientFetch(`/admin/users/${userId}/role`, token, {
        method: "POST",
        body: JSON.stringify({ role }),
    });
}

/** POST: Hide / restore / delete an item */
export function moderateItem(itemId: string, request: ModerateItemRequest, token?: string) {
    return clientFetch(`/admin/items/${itemId}/moderate`, token, {
        method: "POST",
        body: JSON.stringify(request),
    });
}
