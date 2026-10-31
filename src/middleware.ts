import { type NextRequest, NextResponse } from 'next/server';

/**
 * Keeps `/` public while giving signed-in users Home (PRD-v2 §9.1).
 *
 * The cookie is only a routing hint — presence, never contents. Authorisation
 * is the server's job on every API call; middleware runs on every request and
 * is the wrong place to make a trust decision. A forged cookie here buys an
 * attacker nothing but a redirect to a page whose data calls will 401.
 */
const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? 'ecolife_refresh';

export function middleware(request: NextRequest) {
  const signedIn = request.cookies.has(SESSION_COOKIE);

  if (signedIn && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

/** Only `/` needs this. Everything else is gated by the layout and the API. */
export const config = { matcher: '/' };
