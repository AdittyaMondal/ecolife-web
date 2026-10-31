import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_HINT_COOKIE } from '@/lib/session';

// `||`, not `??`: an ARG declared but not passed bakes in the EMPTY STRING, and
// `'' ?? x` is `''` — which would leave us asking for a cookie named "".
const REFRESH_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || 'ecolife_refresh';

export function middleware(request: NextRequest) {
  const signedIn = request.cookies.has(REFRESH_COOKIE) || request.cookies.has(SESSION_HINT_COOKIE);

  if (signedIn && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: '/' };
