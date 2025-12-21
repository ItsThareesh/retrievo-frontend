"use server";

import { auth } from "@/auth";
import { safeJson, UnauthorizedError } from "./helpers";

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL;

// POST: Lost or Found Item
export async function postLostFoundItem(formData: FormData) {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/items/create`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.backendToken}`,
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

// PATCH: Update single item fields
export async function updateItem(itemId: string, data: Record<string, any>) {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/items/${itemId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.backendToken}`,
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
export async function deleteItem(itemId: string) {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/items/${itemId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.backendToken}`,
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
export async function setHostel(hostel: string) {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/profile/set-hostel/${hostel}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.backendToken}`,
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

export async function createResolution(itemId: string, description: string) {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/resolutions/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.backendToken}`,
            },
            body: JSON.stringify({ found_item_id: itemId, claim_description: description }),
        });

        if (!res.ok) {
            console.error("createResolution failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("createResolution error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function getNotifications() {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/notifications`, {
            headers: {
                Authorization: `Bearer ${session.backendToken}`,
            },
        });

        if (!res.ok) {
            console.error("getNotifications failed:", res.status);
            return {
                ok: false, data: {
                    notifications: []
                }, status: res.status
            };
        }

        return { ok: true, data: await safeJson(res) };
    } catch (err) {
        console.error("getNotifications error:", err);
        return {
            ok: false, data: {
                notifications: []
            }, error: String(err)
        };
    }
}

export async function readNotification(notificationId: string) {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/notifications/${notificationId}/mark-read`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.backendToken}`,
            },
        });

        if (!res.ok) {
            console.error("readNotification failed:", res.status);
            return { ok: false, status: res.status };
        }
        return { ok: true };
    } catch (err) {
        console.error("readNotification error:", err);
        return { ok: false, error: String(err) };
    }
}

export async function readAllNotifications() {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/notifications/mark-all-read`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.backendToken}`,
            },
        });

        if (!res.ok) {
            console.error("readAllNotifications failed:", res.status);
            return { ok: false, status: res.status };
        }

        return { ok: true };
    } catch (err) {
        console.error("readAllNotifications error:", err);
        return { ok: false, error: String(err) };
    }
}