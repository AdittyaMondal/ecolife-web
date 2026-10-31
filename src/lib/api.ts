/**
 * Server-side API client, for Server Components and route handlers only.
 *
 * Reaches ecolife-server over the internal URL and forwards the two things
 * the server needs to act on behalf of this request: the session cookies and
 * the caller's IP (for rate limits and audit).
 */
import { cookies, headers } from 'next/headers';

function internalBase(): string {
  const base = process.env.API_URL_INTERNAL;
  if (!base) {
    throw new Error('API_URL_INTERNAL is not set. See .env.example.');
  }
  return base.replace(/\/+$/, '');
}

/**
 * Fetch from the backend, returning the raw `Response` so a route handler can
 * pass the envelope straight through. Use `readEnvelope` to read the body.
 */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const forwarded = headerStore.get('x-forwarded-for') ?? headerStore.get('x-real-ip') ?? undefined;

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  return fetch(`${internalBase()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(forwarded ? { 'x-forwarded-for': forwarded } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });
}
