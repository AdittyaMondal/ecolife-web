import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type { components } from '@/types/generated/api';

/**
 * The whole Home screen in one request (PRD-v2 §6.2).
 *
 * Types come from the generated contract, not a hand-copy — when the server
 * changes a field, `pnpm gen:api` turns it into a compile error here instead
 * of an `undefined` at runtime.
 */
export type Home = components['schemas']['Home'];
export type Breakdown = components['schemas']['Breakdown'];
export type HomeToday = components['schemas']['HomeToday'];
export type LeaderboardPeek = components['schemas']['LeaderboardPeek'];
export type ActiveGoalSummary = components['schemas']['ActiveGoalSummary'];
export type NextEvent = components['schemas']['NextEvent'];

export const homeQuery = () =>
  queryOptions({
    queryKey: qk.home(),
    queryFn: () => api.get<Home>('/home'),
    staleTime: 60_000,
  });

/** The five categories in the order the UI always lists them: largest first. */
export const CATEGORY_ORDER = [
  { key: 'transportKg', label: 'Transport' },
  { key: 'foodKg', label: 'Food' },
  { key: 'homeEnergyKg', label: 'Home energy' },
  { key: 'wasteKg', label: 'Waste' },
  { key: 'waterKg', label: 'Water' },
] as const satisfies ReadonlyArray<{ key: keyof Breakdown; label: string }>;

/** Share of total per category, for the breakdown bars. Guards a zero total. */
export function categoryShares(b: Breakdown) {
  return CATEGORY_ORDER.map(({ key, label }) => ({
    key,
    label,
    kg: b[key],
    pct: b.totalKg > 0 ? (b[key] / b.totalKg) * 100 : 0,
  }));
}
