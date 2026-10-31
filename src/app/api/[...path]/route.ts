import { unstable_rethrow } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api';
import type { ApiFailure } from '@/lib/response-envelope';

/**
 * The same-origin bridge to ecolife-server (PRD-v2 §9.1).
 *
 * `lib/fetcher.ts` falls back to `/api` when `NEXT_PUBLIC_API_URL` is unset,
 * which is the deployed configuration — so without this handler every call
 * the browser makes 404s against Next's own router. That is what
 * `POST /api/auth/login` was doing: returning a prerendered 404 HTML page.
 *
 * Why a proxy rather than pointing the browser straight at the API:
 *
 *   - The refresh token stays a FIRST-PARTY httpOnly cookie. Set on the API
 *     origin it would be third-party, which Safari's ITP and Chrome's
 *     phasing-out of third-party cookies both break.
 *   - No CORS, no preflight on every mutation.
 *   - The browser never learns the internal API URL.
 *
 * The trade is that the backend sees this container's socket address for
 * every user, which would put everyone in one rate-limit bucket. That is
 * why `backendFetch` asserts the real client IP under INTERNAL_PROXY_TOKEN —
 * see the comments there and in the server's `clientIp`.
 */

/** Headers worth forwarding. An allowlist, because `host` and
 *  `content-length` belong to THIS hop and break the next one. */
const FORWARDED_REQUEST_HEADERS = [
  'authorization',
  'content-type',
  'x-ecolife-platform',
  'idempotency-key',
];

/** Hop-by-hop and length headers must not be copied onto our own response. */
const SKIPPED_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
]);

function upstreamUnreachable(path: string, cause: unknown): Response {
  console.error(`[api proxy] ${path} — upstream unreachable`, cause);
  const body: ApiFailure = {
    status: false,
    data: null,
    error: {
      code: 'UPSTREAM_UNREACHABLE',
      message: 'Something went wrong on our side. Please try again shortly.',
      details: {},
    },
  };
  return Response.json(body, { status: 502 });
}

/**
 * Rebuilds the backend path from the catch-all segments.
 *
 * Segments are rejected rather than sanitised. `..` would let a caller climb
 * out of the API base and reach another service on the internal network, and
 * quietly stripping it hides an attempt that should be visible as a 400.
 */
function backendPath(segments: string[], search: string): string | null {
  if (segments.length === 0) return null;

  const encoded: string[] = [];
  for (const segment of segments) {
    // Next has already percent-decoded these, so `%2e%2e` arrives as `..`.
    // Reject rather than strip, then RE-ENCODE: a segment that decoded to
    // `?` or `#` would otherwise reappear as real URL syntax once joined,
    // turning a path segment into a query string against another endpoint.
    if (segment === '' || segment === '.' || segment === '..') return null;
    if (/[/\\?#]/.test(segment)) return null;
    encoded.push(encodeURIComponent(segment));
  }
  return `/${encoded.join('/')}${search}`;
}

/**
 * Same-origin check for anything that changes state.
 *
 * The refresh cookie is SameSite=Lax, which already stops a cross-site POST
 * carrying it — but that leans entirely on one cookie attribute and on the
 * browser honouring it. An Origin that is present and foreign is never a
 * legitimate call to this proxy, so reject it outright. Origin absent means
 * no browser initiated it (curl, a server-side call), which is not CSRF.
 */
function isCrossSite(request: NextRequest): boolean {
  const site = request.headers.get('sec-fetch-site');
  if (site) return site !== 'same-origin' && site !== 'none';

  const origin = request.headers.get('origin');
  if (!origin) return false;

  /**
   * Compare against the host the CLIENT addressed, not `request.url`.
   *
   * Behind a reverse proxy, `request.url` is the INTERNAL url — Traefik
   * forwards to http://container:3000, so `new URL(request.url).origin` is
   * `http://localhost:3000` and never matches the public origin a browser
   * sends. Using it rejected every state-changing request on the deployed
   * site as cross-site, while working perfectly in local dev where the two
   * happen to be the same. `x-forwarded-host` is what the proxy sets to the
   * public name; `host` covers the no-proxy case.
   */
  const expectedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!expectedHost) return true;
  try {
    return new URL(origin).host !== expectedHost;
  } catch {
    // A malformed Origin is not something to wave through.
    return true;
  }
}

const SAFE_METHODS = new Set(['GET', 'HEAD']);

async function proxy(request: NextRequest, segments: string[]): Promise<Response> {
  if (!SAFE_METHODS.has(request.method) && isCrossSite(request)) {
    const body: ApiFailure = {
      status: false,
      data: null,
      error: { code: 'GEN_403', message: 'Cross-site request rejected.', details: {} },
    };
    return Response.json(body, { status: 403 });
  }

  const path = backendPath(segments, new URL(request.url).search);
  if (!path) {
    const body: ApiFailure = {
      status: false,
      data: null,
      error: { code: 'GEN_400', message: 'Invalid request path.', details: {} },
    };
    return Response.json(body, { status: 400 });
  }

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  // GET and HEAD must not carry a body, and `duplex` is required by undici
  // for a streamed request body.
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const init: RequestInit & { duplex?: 'half' } = { method: request.method, headers };
  if (hasBody) {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await backendFetch(path, init);

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!SKIPPED_RESPONSE_HEADERS.has(key.toLowerCase()) && key.toLowerCase() !== 'set-cookie') {
        responseHeaders.set(key, value);
      }
    });

    // The refresh cookie. Forwarded verbatim and WITHOUT a Domain attribute,
    // so the browser scopes it to this origin — which is the whole point of
    // proxying: it becomes first-party here instead of third-party on the
    // API host. `getSetCookie` is the only way to read multiple Set-Cookie
    // headers; `headers.get` would join them into one broken string.
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append('set-cookie', cookie);
    }

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (cause) {
    // cookies()/headers() bail out of prerendering by throwing. Hand that
    // control-flow signal back to Next before treating anything as a failure.
    unstable_rethrow(cause);
    return upstreamUnreachable(path, cause);
  }
}

type Context = { params: Promise<{ path: string[] }> };

const handler = async (request: NextRequest, context: Context) =>
  proxy(request, (await context.params).path);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;

/**
 * No `dynamic = 'force-dynamic'` here.
 *
 * Next 16's cacheComponents rejects that route segment config outright, and
 * it is redundant: `backendFetch` awaits cookies() and headers(), which is
 * already what makes every response uncacheable and per-caller.
 */
