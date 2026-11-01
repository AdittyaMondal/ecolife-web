/** Role-based landing paths for users, admins, and partner organizations. */
export function landingPathFor(me: {
  onboardingComplete: boolean;
  completedSteps: number;
  role?: 'user' | 'admin';
  organization?: { type?: 'industry' | 'ngo' | 'seller'; status?: string; role?: string } | null;
}): string {
  if (me.role === 'admin') return '/admin';
  if (me.organization) {
    if (me.organization.type === 'industry') return '/organization/corporate';
    if (me.organization.type === 'ngo') return '/organization/community';
    if (me.organization.type === 'seller') return '/marketplace/seller';
  }
  if (me.onboardingComplete) return '/home';
  return `/step/${Math.min(5, Math.max(1, me.completedSteps + 1))}`;
}

/**
 * A `?next=` value that is safe to navigate to, or null.
 *
 * Parse and compare ORIGINS. Do not pattern-match the string.
 *
 * The first version of this rejected a leading `//` and `/\\` by prefix, which
 * looked sufficient and was not. The URL spec has browsers STRIP tab, LF and
 * CR from a URL before parsing, so `/<TAB>/evil.example` starts with a single
 * slash, contains no `//`, and still resolves to `https://evil.example`:
 *
 *   "/\t/evil.example"  prefix-guard=PASS  →  origin https://evil.example
 *   "/\n/evil.example"  prefix-guard=PASS  →  origin https://evil.example
 *   "/\r/evil.example"  prefix-guard=PASS  →  origin https://evil.example
 *
 * That is a parser differential: the check read the raw string while the
 * browser navigated the normalised one. Resolving against a sentinel base and
 * comparing origins closes the whole class, including the tricks nobody here
 * has thought of yet.
 *
 * Returning the RE-SERIALISED path matters as much as the check: the caller
 * navigates to exactly what was validated, with the control characters gone,
 * so the two can never disagree again.
 *
 * Why it matters at all: an absolute `?next=` on a trusted domain is a
 * phishing primitive — the link looks like your site and lands on theirs.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith('/')) return null;
  // A sentinel rather than window.location.origin, so this is pure and
  // testable without a DOM. Only the origin COMPARISON matters, not the host.
  const base = 'https://next.invalid';
  try {
    const url = new URL(raw, base);
    if (url.origin !== base) return null;

    /**
     * Collapse leading slashes in the PATHNAME before returning it.
     *
     * Checking the input and returning something unchecked was the second bug
     * in this function. `/.//evil.example` resolves same-origin, so the check
     * above passes — and then `url.pathname` is `//evil.example`, which is
     * protocol-relative the moment the caller navigates to it:
     *
     *   "/.//evil.example"     origin-ok  →  returns "//evil.example"
     *   "/a/..//evil.example"  origin-ok  →  returns "//evil.example"
     *   "/%2e//evil.example"   origin-ok  →  returns "//evil.example"
     *
     * One leading slash, enforced structurally, so there is no input left to
     * be clever with. The result is a path on this site — at worst a 404.
     */
    const path = `/${url.pathname.replace(/^\/+/, '')}`;
    return `${path}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
