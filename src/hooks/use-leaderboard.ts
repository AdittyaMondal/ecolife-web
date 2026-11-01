import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { api, qs } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type { components } from '@/types/generated/api';

/** PRD-v2 §6.7. Ranks are deterministic: ties break on created_at. */
export type LeaderboardRow = components['schemas']['LeaderboardRow'];
export type MyRank = components['schemas']['MyRank'];
export type PageInfo = components['schemas']['PageInfo'];

export type LeaderboardPeriod = 'all' | 'month' | 'week';
export type LeaderboardScope = 'global' | 'city';

export type LeaderboardPage = { items: LeaderboardRow[]; pageInfo: PageInfo };

export const leaderboardQuery = (
  period: LeaderboardPeriod = 'all',
  scope: LeaderboardScope = 'global',
) =>
  queryOptions({
    queryKey: qk.leaderboardPage(period, scope),
    queryFn: () =>
      api.get<LeaderboardPage>(`/leaderboard?period=${period}&scope=${scope}&limit=20`),
    staleTime: 60_000,
  });

export const leaderboardInfiniteQuery = (
  period: LeaderboardPeriod = 'all',
  scope: LeaderboardScope = 'global',
) =>
  infiniteQueryOptions({
    queryKey: qk.leaderboardPage(period, scope),
    queryFn: ({ pageParam }) =>
      api.get<LeaderboardPage>(
        `/leaderboard${qs({ period, scope, cursor: pageParam, limit: 20 })}`,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pageInfo.hasMore ? (last.pageInfo.nextCursor ?? undefined) : undefined,
    staleTime: 60_000,
  });

export const myRankQuery = () =>
  queryOptions({
    queryKey: qk.myRank(),
    queryFn: () => api.get<MyRank>('/leaderboard/me'),
    staleTime: 60_000,
  });
