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

// Internal fetch with timeout utility
export async function internalFetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 5000
): Promise<Response> {
    if (!process.env.INTERNAL_SECRET_KEY) {
        throw new Error("INTERNAL_SECRET_KEY is not configured");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                ...(options.headers || {}),
                "X-Internal-Secret": process.env.INTERNAL_SECRET_KEY,
            },
        });
    } catch (error) {
        if ((error as any)?.name === "AbortError") {
            throw new Error("Backend request timed out");
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

// Authenticated fetch utility
export async function authFetch(input: RequestInfo, options: RequestInit = {}, timeout = 5000): Promise<Response> {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    const res = await internalFetchWithTimeout(
        `${process.env.INTERNAL_BACKEND_URL}${input}`,
        {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${session.backendToken}`,
            },
        },
        timeout
    );

    if (res.status === 401) {
        throw new UnauthorizedError();
    }

    return res;
}

// Public fetch utility (no authentication)
export async function publicFetch(
    input: RequestInfo,
    options: RequestInit = {},
    timeout = 5000,
) {
    return internalFetchWithTimeout(
        `${process.env.INTERNAL_BACKEND_URL}${input}`,
        options,
        timeout,
    );
}