/**
 * Browser-side API client. Talks to `NEXT_PUBLIC_API_URL` when it is set
 * (the Prism mock, or the server directly), otherwise to the same-origin
 * route handlers under `/api`, which forward with cookies attached.
 *
 * Auth: attaches the in-memory access token, and on a 401 performs ONE
 * single-flight refresh and retries. A failed refresh ends the session.
 */
import { CLIENT_ERROR_CODES, httpStatusMessage, readEnvelope } from './response-envelope';
import { clearSession, getAccessToken, hasSessionHint, type Session, setSession } from './session';

/** Trailing slashes trimmed so `${base}${path}` never doubles up. */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

/**
 * Fallback bearer token used ONLY while pointing at the local Prism mock
 * (`localhost:40xx`), so any screen can be browsed directly in development
 * even before signing in. Anchored to loopback only.
 */
const LOOPBACK_MOCK_URL = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::40\d{2})(?:[/?#]|$)/;

const MOCK_BEARER =
  process.env.NODE_ENV !== 'production' &&
  LOOPBACK_MOCK_URL.test(process.env.NEXT_PUBLIC_API_URL ?? '')
    ? 'prism-mock-token'
    : undefined;

export class ApiError extends Error {
  readonly code: string;
  readonly details: unknown;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus: number, details: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.httpStatus = httpStatus;
  }
}

export type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: unknown;
  /** Skip the bearer token and the refresh-on-401 dance (auth endpoints). */
  anonymous?: boolean;
};

async function rawFetch(
  method: string,
  path: string,
  options: RequestOptions,
  token: string | null,
) {
  const { body, headers, anonymous: _a, ...init } = options;
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    // Offline, DNS failure, CORS rejection, AbortController — no response exists.
    throw new ApiError(CLIENT_ERROR_CODES.network, httpStatusMessage(0), 0, {
      cause: String(cause),
    });
  }
}

let refreshing: Promise<boolean> | null = null;

/**
 * Rotate the refresh token for a fresh access token. Single-flight: ten
 * parallel 401s produce one refresh, because a replayed refresh token revokes
 * the whole family server-side (AUTH_003).
 */
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await rawFetch('POST', '/auth/refresh', { body: {} }, null);
        const result = await readEnvelope<Session>(res);
        if (!result.ok) {
          clearSession();
          return false;
        }
        setSession(result.data);
        return true;
      } catch {
        return false;
      } finally {
        // Let the next 401 start a new refresh.
        setTimeout(() => {
          refreshing = null;
        }, 0);
      }
    })();
  }
  return refreshing;
}

/** Boot: a token in memory, or a refresh if the hint cookie says one may work. */
export async function ensureSession(): Promise<boolean> {
  if (getAccessToken()) return true;
  if (!hasSessionHint()) return false;
  return refreshSession();
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.anonymous ? null : (getAccessToken() ?? MOCK_BEARER ?? null);
  let res = await rawFetch(method, path, options, token);

  if (res.status === 401 && !options.anonymous) {
    const ok = await refreshSession();
    if (ok) res = await rawFetch(method, path, options, getAccessToken());
  }

  const result = await readEnvelope<T>(res);
  if (!result.ok) {
    if (res.status === 401 && !options.anonymous) clearSession();
    throw new ApiError(result.error.code, result.error.message, res.status, result.error.details);
  }
  return result.data;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};

/** Build a query string, dropping undefined/null/empty values. */
export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}
