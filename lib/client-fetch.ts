import { APIError } from "./api-error";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

// Abort backend requests after this interval so failures surface as errors
// instead of infinite spinners. Override per call via `options.timeout`.
const DEFAULT_TIMEOUT_MS = 15_000;

export async function clientFetch<T = any>(
  path: string,
  token?: string,
  options?: RequestInit & { timeout?: number },
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT_MS, ...init } = options ?? {};

  const url = `${BACKEND}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (options?.headers) {
    const incoming = options.headers as Record<string, string>;
    Object.assign(headers, incoming);
  }

  if (
    !headers["Content-Type"] &&
    init.method &&
    init.method !== "GET" &&
    init.method !== "HEAD" &&
    !(init.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
  }

  // Own controller so the timeout also covers response-body reads; a
  // caller-provided signal is bridged in and takes precedence when it fires.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  if (init.signal) {
    if (init.signal.aborted) controller.abort();
    else init.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
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
  } catch (err) {
    // Normalize our own timeout into APIError so callers keep one error type
    if (timedOut && !(init.signal?.aborted as boolean)) {
      throw new APIError(408, "Request timed out", "TIMEOUT");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
