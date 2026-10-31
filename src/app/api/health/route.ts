import { unstable_rethrow } from 'next/navigation';
import { backendFetch } from '@/lib/api';
import type { ApiFailure } from '@/lib/response-envelope';

/**
 * Same-origin bridge to ecolife-server. The browser never holds the internal
 * URL, and cookies ride along server-side. A reachable backend's envelope
 * passes through untouched, so the client reads exactly what the server said.
 *
 * This handler is the pattern every other one copies: it always answers with
 * an envelope, never a bare 500 or an HTML error page. Future auth routes add
 * the refresh-cookie handling here (PRD-v2 §9.1).
 */
export async function GET() {
  try {
    const upstream = await backendFetch('/health');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch (cause) {
    // cookies()/headers() bail out of prerendering by throwing, and this catch
    // would swallow that control-flow signal and cache a 502. Hand it back to
    // Next first; only real upstream failures get past this line.
    unstable_rethrow(cause);

    // Misconfigured API_URL_INTERNAL, DNS failure, connection refused — the
    // backend was never reached, so there is no envelope to forward.
    console.error('[api/health] upstream unreachable', cause);

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
}
