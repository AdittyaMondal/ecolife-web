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
 * Only same-site PATHS. An absolute URL here is an open redirect, and on a
 * trusted domain that is a phishing primitive: a link to
 * `/login?next=https://evil.example` looks like your site and lands on
 * theirs. `//evil.example` is protocol-relative and resolves off-site too,
 * which is why the second character matters as much as the first.
 *
 * A backslash is rejected because some agents normalise `/\` to `//`.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/')) return null;
  if (raw.startsWith('//') || raw.startsWith('/\\')) return null;
  return raw;
}
