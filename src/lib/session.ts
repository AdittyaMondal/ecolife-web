/**
 * The browser session.
 *
 * The access token is a 15-minute JWT held in MEMORY only — never localStorage,
 * where any injected script could lift it. The refresh token is an httpOnly
 * cookie the server sets on the API origin; the browser attaches it to
 * `POST /auth/refresh` (credentials: 'include') and JavaScript never sees it.
 *
 * Because the refresh cookie lives on the API origin, this origin cannot see
 * it. `ecolife_session` is a first-party HINT cookie — presence only, no
 * secret — so the proxy can route `/` and the boot sequence knows whether a
 * refresh is worth attempting. Forging it buys nothing: every data call still
 * needs a real bearer token.
 */
import type { components } from '@/types/generated/api';

export type Session = components['schemas']['Session'];

export const SESSION_HINT_COOKIE = 'ecolife_session';

let accessToken: string | null = null;
let expiresAt = 0;

type Listener = (signedIn: boolean) => void;
const listeners = new Set<Listener>();

export function getAccessToken(): string | null {
  if (accessToken && Date.now() < expiresAt) return accessToken;
  return null;
}

export function hasSessionHint(): boolean {
  if (getAccessToken()) return true;
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => {
    const trimmed = c.trim();
    return (
      trimmed.startsWith(`${SESSION_HINT_COOKIE}=`) ||
      trimmed.startsWith('ecolife_session=') ||
      trimmed.startsWith('ecolife_refresh=')
    );
  });
}

export function setSession(session: Session): void {
  accessToken = session.accessToken;
  // Five seconds of slack so a token never expires mid-flight.
  expiresAt = Date.now() + Math.max(0, session.accessTokenExpiresIn - 5) * 1000;
  if (typeof document !== 'undefined') {
    // biome-ignore lint/suspicious/noDocumentCookie: a presence-only routing hint; Cookie Store API is not Baseline
    document.cookie = `${SESSION_HINT_COOKIE}=1; path=/; max-age=2592000; samesite=lax`;
  }
  for (const l of listeners) l(true);
}

export function clearSession(): void {
  accessToken = null;
  expiresAt = 0;
  if (typeof document !== 'undefined') {
    // biome-ignore lint/suspicious/noDocumentCookie: see setSession
    document.cookie = `${SESSION_HINT_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
  for (const l of listeners) l(false);
}

export function onSessionChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
