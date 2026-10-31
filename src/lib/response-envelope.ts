/**
 * The contract (PRD-v2 §2.3). Every ecolife-server JSON response is one of:
 *
 *   success  { status: true,  data: T,    error: null }
 *   failure  { status: false, data: null, error: { code, message, details } }
 *
 * Clients branch on `error.code`, NEVER on `error.message` — messages are
 * copy and may change without a contract bump.
 *
 * Reality is messier than the contract: a proxy can answer with an HTML error
 * page, a CDN with an empty 405, a gateway with a 504 and no body at all.
 * Nothing in this module ever puts a raw response body in front of a user.
 */

export type ApiErrorShape = {
  code: string;
  message: string;
  details: unknown;
};

export type ApiSuccess<T> = { status: true; data: T; error: null };
export type ApiFailure = { status: false; data: null; error: ApiErrorShape };
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type EnvelopeResult<T> = { ok: true; data: T } | { ok: false; error: ApiErrorShape };

/** Codes minted client-side when the server never spoke the envelope. */
export const CLIENT_ERROR_CODES = {
  /** The request never reached a server (offline, DNS, CORS, abort). */
  network: 'NETWORK_ERROR',
  /** Something answered, but not with our envelope (HTML page, empty body, …). */
  malformed: 'MALFORMED_RESPONSE',
} as const;

/**
 * HTTP status → a sentence we are willing to show a person.
 * Deliberately free of jargon, status numbers and anything server-authored.
 */
export function httpStatusMessage(status: number): string {
  if (status === 0) return 'We could not reach the server. Check your connection and try again.';
  if (status === 400) return 'That request was not valid. Please check your details and try again.';
  if (status === 401) return 'Your session has ended. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 405) return 'That action is not available right now.';
  if (status === 408 || status === 504) {
    return 'The server took too long to respond. Please try again.';
  }
  if (status === 409) return 'That conflicts with something that already exists.';
  if (status === 413) return 'That file is too large to upload.';
  if (status === 422) return 'We could not process those details. Please check them and try again.';
  if (status === 429) return 'You are doing that a bit too often. Please wait a moment.';
  if (status >= 500) return 'Something went wrong on our side. Please try again shortly.';
  if (status >= 400) return 'We could not complete that request. Please try again.';
  return 'The server sent a response we did not understand. Please try again.';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** True only for a body that really is our envelope — shape-checked, not cast. */
export function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!isRecord(value)) return false;
  if (typeof value.status !== 'boolean') return false;
  if (!('data' in value) || !('error' in value)) return false;
  if (value.status === true) return value.error === null;
  return isRecord(value.error) && typeof value.error.code === 'string';
}

function failure(code: string, message: string, details: unknown = null): EnvelopeResult<never> {
  return { ok: false, error: { code, message, details } };
}

/**
 * Read a `Response` as an envelope. Returns a result rather than throwing so
 * the caller decides what an error means; `fetcher.ts` turns it into ApiError.
 *
 * Never surfaces the body: an unparseable or non-envelope body collapses to a
 * status-derived message, with the body discarded.
 */
export async function readEnvelope<T>(res: Response): Promise<EnvelopeResult<T>> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    // Empty body (a bare 405), an HTML proxy page, a truncated 504 — all land here.
    const code = res.ok ? CLIENT_ERROR_CODES.malformed : `HTTP_${res.status}`;
    return failure(code, httpStatusMessage(res.status));
  }

  if (!isEnvelope(body)) {
    const code = res.ok ? CLIENT_ERROR_CODES.malformed : `HTTP_${res.status}`;
    return failure(code, httpStatusMessage(res.status));
  }

  if (body.status === false) {
    // A real server error: its code is the contract and its message is written copy.
    const { code, message, details } = body.error;
    return failure(code, message || httpStatusMessage(res.status), details ?? null);
  }

  if (!res.ok) {
    // A success envelope on a failing status. Trust the status, not the body.
    return failure(`HTTP_${res.status}`, httpStatusMessage(res.status));
  }

  return { ok: true, data: body.data as T };
}
