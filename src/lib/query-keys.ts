/**
 * Every query key in the app. Invalidation is a lookup, never a guess
 * (PRD-v2 §9.2) — if a key is not here, it does not exist.
 */
const root = ['ecolife'] as const;

export const qk = {
  all: root,
  health: () => [...root, 'health'] as const,
  me: () => [...root, 'me'] as const,
  home: () => [...root, 'home'] as const,

  onboarding: () => [...root, 'onboarding'] as const,
  cities: (q: string) => [...root, 'cities', q] as const,
  regions: () => [...root, 'regions'] as const,

  trackToday: () => [...root, 'track', 'today'] as const,
  trackHistory: () => [...root, 'track', 'history'] as const,
  trackHistoryRange: (from: string, to: string, granularity: string) =>
    [...root, 'track', 'history', { from, to, granularity }] as const,

  goals: () => [...root, 'goals'] as const,
  goalProgress: (id: number) => [...root, 'goals', id, 'progress'] as const,

  leaderboard: () => [...root, 'leaderboard'] as const,
  leaderboardPage: (period: string, scope: string) =>
    [...root, 'leaderboard', { period, scope }] as const,
  myRank: () => [...root, 'leaderboard', 'me'] as const,

  marketplace: () => [...root, 'marketplace'] as const,
  products: (filters: Record<string, unknown>) =>
    [...root, 'marketplace', 'products', filters] as const,
  product: (slug: string) => [...root, 'marketplace', 'product', slug] as const,
  cart: () => [...root, 'marketplace', 'cart'] as const,
  cartPreview: (coins: number) => [...root, 'marketplace', 'cart', 'preview', coins] as const,
  orders: () => [...root, 'marketplace', 'orders'] as const,
  order: (id: number) => [...root, 'marketplace', 'orders', id] as const,
  addresses: () => [...root, 'addresses'] as const,

  events: () => [...root, 'events'] as const,
  eventList: (filters: Record<string, unknown>) => [...root, 'events', 'list', filters] as const,
  event: (slug: string) => [...root, 'events', 'detail', slug] as const,
  eventPass: (id: number) => [...root, 'events', id, 'pass'] as const,
  eventParticipants: (id: number) => [...root, 'events', id, 'participants'] as const,

  profile: () => [...root, 'profile'] as const,
  rewards: () => [...root, 'profile', 'rewards'] as const,
  publicProfile: (id: number) => [...root, 'users', id] as const,
  notifications: () => [...root, 'notifications'] as const,
  methodology: () => [...root, 'methodology'] as const,

  organization: () => [...root, 'organization'] as const,
  myOrganization: () => [...root, 'organization', 'me'] as const,
  orgMembers: (id: number) => [...root, 'organization', id, 'members'] as const,
  adminOrgs: (status?: string) => [...root, 'admin', 'organizations', status ?? 'all'] as const,
};
