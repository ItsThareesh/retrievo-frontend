import { APIError } from "./api-error";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

export async function clientFetch<T = any>(
  path: string,
  token?: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BACKEND}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (options?.headers) {
    const incoming = options.headers as Record<string, string>;
    Object.assign(headers, incoming);
  }

  if (
    !headers["Content-Type"] &&
    options?.method &&
    options.method !== "GET" &&
    options.method !== "HEAD" &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = res.statusText; // Default to status text if no detail is provided
    let code: string | undefined;
    let data: unknown;
    try {
      const body = await res.json();
      data = body;
      detail = body.detail ?? detail;
      code = body.code;
    } catch {}

    throw new APIError(res.status, detail, code, data);
  }

  try {
    return await res.json();
  } catch {
    return null as T;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MutationResult = { ok: boolean; data?: any; status?: number; error?: string };

// Same request as clientFetch, but resolves failures into a plain result
// instead of throwing (except bans, which propagate for useBanHandler).
export async function clientMutate(
  path: string,
  token?: string,
  options: RequestInit = {},
): Promise<MutationResult> {
  try {
    return { ok: true, data: await clientFetch(path, token, options) };
  } catch (err) {
    if (err instanceof APIError && err.code === "USER_BANNED") throw err;

    console.error("Mutation failed:", options.method ?? "REQUEST", path, err);
    if (err instanceof APIError) return { ok: false, status: err.status, data: err.data };
    return { ok: false, error: String(err) };
  }
}
