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
    !(options?.method && 
    options.method !== "GET" && 
    options.method !== "HEAD")
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
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
      code = body.code;
    } catch {}
    
    throw new APIError(res.status, detail, code);
  }

  return res.json();
}
