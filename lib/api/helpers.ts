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

export async function authFetch(
    input: RequestInfo,
    init: RequestInit = {}
) {
    const session = await auth();

    if (!session?.backendToken) {
        throw new UnauthorizedError();
    }

    const res = await fetch(input, {
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