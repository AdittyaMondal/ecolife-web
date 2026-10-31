/**
 * Every query key in the app. Invalidation is a lookup, never a guess
 * (PRD-v2 §9.2) — if a key is not here, it does not exist.
 */
const root = ['ecolife'] as const;

export const qk = {
  all: root,
  health: () => [...root, 'health'] as const,
  home: () => [...root, 'home'] as const,
  trackHistory: () => [...root, 'track', 'history'] as const,
  goals: () => [...root, 'goals'] as const,
  marketplace: () => [...root, 'marketplace'] as const,
  events: () => [...root, 'events'] as const,
  leaderboard: () => [...root, 'leaderboard'] as const,
  profile: () => [...root, 'profile'] as const,
};
