export async function fetchData<T>(fn: () => Promise<{ ok: boolean, data?: T, error?: string }>) {
    const res = await fn();
    if (!res.ok) throw new Error(res.error || "Failed to fetch data");
    return res.data as T;
}