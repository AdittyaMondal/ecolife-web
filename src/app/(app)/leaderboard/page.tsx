'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, Trophy } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Podium } from '@/components/blocks/leaderboard/podium';
import { RankList } from '@/components/blocks/leaderboard/rank-list';
import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type LeaderboardPeriod,
  type LeaderboardScope,
  leaderboardQuery,
  myRankQuery,
} from '@/hooks/use-leaderboard';
import { ApiError } from '@/lib/fetcher';

const PERIOD_OPTIONS = [
  { value: 'all' as const, label: 'All time' },
  { value: 'month' as const, label: 'Month' },
  { value: 'week' as const, label: 'Week' },
];

const SCOPE_OPTIONS = [
  { value: 'global' as const, label: 'Global' },
  { value: 'city' as const, label: 'My city' },
];

function LeaderboardSkeletons() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Podium Skeleton */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 pt-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-28 w-full rounded-t-xl sm:h-36" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-2">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-36 w-full rounded-t-xl sm:h-44" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-2">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-20 w-full rounded-t-xl sm:h-28" />
        </div>
      </div>

      {/* List Skeletons */}
      <div className="space-y-2 pt-4">
        <Skeleton className="h-4 w-24" />
        <Card className="divide-y divide-border p-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [period, setPeriod] = React.useState<LeaderboardPeriod>('all');
  const [scope, setScope] = React.useState<LeaderboardScope>('global');

  const {
    data: leaderboardData,
    error: leaderboardError,
    isPending: isLeaderboardPending,
    refetch: refetchLeaderboard,
    isFetching: isLeaderboardFetching,
  } = useQuery(leaderboardQuery(period, scope));

  const {
    data: myRankData,
    error: myRankError,
    isPending: isMyRankPending,
  } = useQuery(myRankQuery());

  const items = leaderboardData?.items ?? [];
  const topThree = items.slice(0, 3);
  const remainingRows = items.slice(3);

  const isPending = isLeaderboardPending;

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10" aria-busy={isPending}>
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            See who is driving the most reduction and climbing the ranks.
          </p>
        </header>

        {/* Filters: Period & Scope */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <span className="sr-only">Leaderboard timeframe</span>
            <SegmentedControl
              name="leaderboard-period"
              label="Leaderboard timeframe"
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
          </div>

          <div>
            <span className="sr-only">Leaderboard scope</span>
            <SegmentedControl
              name="leaderboard-scope"
              label="Leaderboard geographic scope"
              options={SCOPE_OPTIONS}
              value={scope}
              onChange={setScope}
            />
          </div>
        </div>

        {/* Content States */}
        {isPending ? (
          <>
            <p className="sr-only" role="status">
              Loading leaderboard rankings…
            </p>
            <LeaderboardSkeletons />
          </>
        ) : leaderboardError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-card p-5 text-card-foreground shadow-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-destructive">
                  Could not load leaderboard
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {leaderboardError instanceof ApiError
                    ? leaderboardError.message
                    : 'Something went wrong.'}
                </p>
                {leaderboardError instanceof ApiError && leaderboardError.code && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {leaderboardError.code}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => refetchLeaderboard()}
                  disabled={isLeaderboardFetching}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground shadow-sm transition hover:bg-eco-700 hover:text-eco-50 disabled:opacity-60 dark:hover:bg-eco-300 dark:hover:text-eco-950"
                >
                  {isLeaderboardFetching ? 'Checking…' : 'Try again'}
                </button>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Trophy className="mx-auto size-10 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="mt-2 text-base font-medium text-foreground">No rankings yet</h3>
            <p className="mt-1 text-sm">
              No users have recorded scores for this combination of filters yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Podium */}
            <Podium topUsers={topThree} />

            {/* Remaining Ranked List */}
            {remainingRows.length > 0 && <RankList rows={remainingRows} />}
          </div>
        )}
      </main>

      {/* Sticky Bottom Row for Viewer's Rank */}
      {/* The sticky own-rank bar. It used to render nothing while loading or on
          error, so a slow or failed /leaderboard/me call looked like "you are
          unranked". It now states which it is. */}
      {isMyRankPending && !myRankData && (
        <div
          role="status"
          className="sticky bottom-0 border-t border-border bg-card/95 px-4 py-3 text-center text-muted-foreground text-sm backdrop-blur"
        >
          Finding your rank…
        </div>
      )}
      {myRankError && !myRankData && (
        <div
          role="alert"
          className="sticky bottom-0 border-t border-border bg-card/95 px-4 py-3 text-center text-muted-foreground text-sm backdrop-blur"
        >
          Could not load your rank.
        </div>
      )}
      {myRankData && (
        <aside
          aria-label="Your ranking summary"
          className="sticky bottom-0 z-20 border-t-2 border-primary/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link
              href="/profile"
              aria-label={`View your profile. You are ranked #${myRankData.rank ?? 'unranked'} with ${myRankData.pointsTotal.toLocaleString()} points`}
              className="group flex min-h-11 flex-1 items-center gap-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                {myRankData.rank ? `#${myRankData.rank}` : '—'}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                    You
                  </span>
                  <span className="rounded-full bg-eco-100 px-1.5 py-0.2 text-[10px] font-bold text-eco-950 dark:bg-eco-950 dark:text-eco-200">
                    Me
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {myRankData.percentile > 0
                    ? `Top ${(100 - myRankData.percentile).toFixed(0)}% of ${myRankData.totalRanked.toLocaleString()} participants`
                    : `${myRankData.totalRanked.toLocaleString()} participants`}
                </span>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <span className="block text-sm font-bold tabular-nums text-foreground sm:text-base">
                  {myRankData.pointsTotal.toLocaleString()}
                </span>
                <span className="block text-[10px] text-muted-foreground">total points</span>
              </div>

              <Link
                href="/profile"
                aria-label="Go to your profile"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
