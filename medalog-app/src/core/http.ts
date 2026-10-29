import { getSession, patchSession } from './session';

/**
 * One HTTP client for every feature.
 *
 * - unwraps the API's `{ success, data }` envelope so callers get the payload
 * - attaches the bearer token and refreshes it exactly once per expiry
 * - the refresh is single-flight: the API rotates refresh tokens and treats a
 *   replay as theft (it revokes the whole family), so two concurrent refreshes
 *   would sign the user out for good
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const NETWORK_ERROR = 0;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: Method;
  body?: unknown;
  /** query string params; undefined/null are dropped */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** send the bearer token (default true) */
  auth?: boolean;
  timeoutMs?: number;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = getSession().serverUrl.replace(/\/+$/, '');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${url}?${qs}` : url;
}

let refreshing: Promise<string | null> | null = null;

/** Rotate the access token once, no matter how many callers need it. */
function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      const { refreshToken } = getSession();
      if (!refreshToken) return null;
      try {
        const raw = await request<{ accessToken?: string; refreshToken?: string }>(
          '/auth/refresh',
          { method: 'POST', body: { refreshToken }, auth: false }
        );
        if (!raw?.accessToken) return null;
        await patchSession({
          accessToken: raw.accessToken,
          refreshToken: raw.refreshToken || refreshToken,
        });
        return raw.accessToken;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

export async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true, timeoutMs = 15000 } = options;
  const url = buildUrl(path, query);

  const send = async (token?: string): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let res: Response;
  try {
    res = await send(getSession().accessToken);
    if (res.status === 401 && auth) {
      const fresh = await refreshAccessToken();
      if (fresh) res = await send(fresh);
    }
  } catch (e: any) {
    throw new ApiError(e?.message || 'Network request failed.', NETWORK_ERROR);
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* empty or non-json body */
  }

  if (!res.ok) {
    const message =
      json?.error?.message || json?.message || json?.error || `Request failed (${res.status}).`;
    throw new ApiError(String(message), res.status);
  }

  // every endpoint answers { success, data } - hand back just the data
  if (json && typeof json === 'object' && 'data' in json) return json.data as T;
  return json as T;
}

export const api = {
  get: <T = any>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T = any>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T = any>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T = any>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T = any>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
