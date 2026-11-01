import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_HINT_COOKIE } from '@/lib/session';

// `||`, not `??`: an ARG declared but not passed bakes in the EMPTY STRING, and
// `'' ?? x` is `''` — which would leave us asking for a cookie named "".
const REFRESH_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || 'ecolife_refresh';

/**
 * Pages reachable without a session. Everything else is protected.
 *
 * An allowlist, not a list of protected prefixes, so a page added tomorrow is
 * private by default. The previous matcher was `'/'` alone, which meant
 * /home, /track, /marketplace and the rest rendered their whole shell for a
 * signed-out visitor — empty, with every query 401ing.
 */
const PUBLIC_EXACT = new Set([
  '/',
  '/login',
  '/register',
  '/partner-register',
  '/forgot',
  '/reset',
  '/verify-email',
  '/about',
  '/methodology',
]);

function isPublic(pathname: string): boolean {
  return PUBLIC_EXACT.has(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  /**
   * Cookie presence only — this is a UX gate, not the security boundary.
   *
   * The hint cookie is first-party and not httpOnly, so it is forgeable; the
   * refresh cookie is not readable here because it belongs to the API origin
   * when the app is not proxied. Neither matters: every data call still needs
   * a real bearer token, so forging the hint buys an empty shell and a 401.
   * The real enforcement is the server's `requireUser`.
   */
  const signedIn = request.cookies.has(REFRESH_COOKIE) || request.cookies.has(SESSION_HINT_COOKIE);

  // A signed-in visitor has no use for the landing page.
  if (signedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Already signed in: no reason to show the sign-in form again.
  if (signedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (!signedIn && !isPublic(pathname)) {
    const login = new URL('/login', request.url);
    // Carry the destination so signing in lands where they were going, rather
    // than dumping everyone on /home and making them navigate again.
    login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

/**
 * Everything except Next internals, the API proxy and static files.
 *
 * Protect-by-default: the alternative is naming each private prefix, and the
 * page someone forgets to add is the one that leaks.
 */
export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf)$).*)',
  ],
};
