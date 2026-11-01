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
