// Internal fetch with timeout utility (server-side; used by NextAuth callbacks)
export async function internalFetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 10000,
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
