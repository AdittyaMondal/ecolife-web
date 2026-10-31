/**
 * Server-side API client, for Server Components and route handlers only.
 *
 * Reaches ecolife-server over the internal URL and forwards the session
 * cookies, plus — only when it can be trusted — the end user's IP.
 */
import { cookies, headers } from 'next/headers';

function internalBase(): string {
  const base = process.env.API_URL_INTERNAL;
  if (!base) {
    throw new Error('API_URL_INTERNAL is not set. See .env.example.');
  }
  return base.replace(/\/+$/, '');
}

type HeaderBag = { get(name: string): string | null };

/**
 * The end user's IP, or undefined when we cannot establish it honestly.
 *
 * `x-forwarded-for` and `x-real-ip` on the INBOUND request are set by whoever
 * called us — a browser can send anything. Forwarding them verbatim hands an
 * attacker a rate-limit bypass and a poisoned audit trail, and the server
 * rate-limits /auth/login per IP, so that is the control between it and a
 * brute force. Rotate the header, rotate the bucket.
 *
 * So: trust only what the platform sets, or an explicitly configured number of
 * proxy hops counted from the RIGHT of the chain. Returning undefined is the
 * correct answer when neither applies — the server then uses the socket
 * address, which is the truth.
 */
function trustedClientIp(h: HeaderBag): string | undefined {
  // Vercel strips any inbound copy of this before setting it, so it is not forgeable.
  const platform = h.get('x-vercel-forwarded-for');
  if (platform) return platform.split(',')[0]?.trim() || undefined;

  // Self-hosted behind our own proxy. The leftmost entries are client-written;
  // only the rightmost `hops` were appended by infrastructure we operate.
  const hops = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? '0', 10);
  if (Number.isFinite(hops) && hops > 0) {
    const chain = (h.get('x-forwarded-for') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return chain.length >= hops ? chain[chain.length - hops] : undefined;
  }

  return undefined;
}

/**
 * Fetch from the backend, returning the raw `Response` so a route handler can
 * pass the envelope straight through. Use `readEnvelope` to read the body.
 */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const outbound = new Headers();
  outbound.set('Accept', 'application/json');
  if (cookieHeader) outbound.set('cookie', cookieHeader);

  // Caller overrides come before the internal headers, so nothing downstream
  // can clobber the IP assertion or the shared secret.
  new Headers(init.headers).forEach((value, key) => {
    outbound.set(key, value);
  });

  // The IP is asserted, not forwarded, and only under a shared secret the
  // browser does not have. Without the token the server ignores it outright
  // and falls back to the socket address.
  const token = process.env.INTERNAL_PROXY_TOKEN;
  const clientIp = trustedClientIp(headerStore);
  if (token && clientIp) {
    outbound.set('x-ecolife-internal', token);
    outbound.set('x-ecolife-client-ip', clientIp);
  }

  return fetch(`${internalBase()}${path}`, { ...init, headers: outbound, cache: 'no-store' });
}
