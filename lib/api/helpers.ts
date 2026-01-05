import { auth } from "@/auth";

// Custom Error for Unauthorized Access
export class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

// Helper function to safely parse JSON
export async function safeJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL}${input}`, {
        ...init,
        headers: {
            ...(init.headers || {}),
            Authorization: `Bearer ${session.backendToken}`,
        },
    });

    if (res.status === 401) {
        throw new UnauthorizedError();
    }

    return res;
}

// Fetch with timeout utility
export async function fetchWithTimeout(url: string, options: RequestInit, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}