/**
 * Browser-side API client. Talks to `NEXT_PUBLIC_API_URL` when it is set
 * (the Prism mock, or the server directly), otherwise to the same-origin
 * route handlers under `/api`, which forward with cookies attached.
 */
import { CLIENT_ERROR_CODES, httpStatusMessage, readEnvelope } from './response-envelope';

/** Trailing slashes trimmed so `${base}${path}` never doubles up. */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

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

export type RequestOptions = Omit<RequestInit, 'body' | 'method'> & { body?: unknown };

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...init } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
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

  const result = await readEnvelope<T>(res);
  if (!result.ok) {
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
