'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ArrowRight, Trophy } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Podium } from '@/components/blocks/leaderboard/podium';
import { RankList } from '@/components/blocks/leaderboard/rank-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type LeaderboardPeriod,
  type LeaderboardScope,
  leaderboardInfiniteQuery,
  myRankQuery,
} from '@/hooks/use-leaderboard';

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
    <div className="space-y-4" aria-hidden="true">
      <Card className="p-4">
        <div className="grid grid-cols-3 items-end gap-3">
          <Skeleton className="h-40 w-full rounded-sm" />
          <Skeleton className="h-48 w-full rounded-sm" />
          <Skeleton className="h-36 w-full rounded-sm" />
        </div>
      </Card>
      <Card className="space-y-2 p-4">
        <Skeleton className="h-12 w-full rounded-sm" />
        <Skeleton className="h-12 w-full rounded-sm" />
        <Skeleton className="h-12 w-full rounded-sm" />
      </Card>
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
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(leaderboardInfiniteQuery(period, scope));

  const {
    data: myRankData,
    error: myRankError,
    isPending: isMyRankPending,
  } = useQuery(myRankQuery());

  const items = React.useMemo(
    () => leaderboardData?.pages.flatMap((p) => p.items) ?? [],
    [leaderboardData],
  );
  const topThree = items.slice(0, 3);
  const remainingRows = items.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-positive">
            Community Impact
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by total eco points earned from daily logs, emission reductions, goals, and
            events.
          </p>
        </div>
      </header>

      {/* Filters: Period & Scope */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SegmentedControl
          name="leaderboard-period"
          label="Leaderboard timeframe"
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          fullWidth
        />
        <SegmentedControl
          name="leaderboard-scope"
          label="Leaderboard geographic scope"
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={setScope}
          fullWidth
        />
      </div>

      {/* Viewer's Own Rank Card */}
      {isMyRankPending && !myRankData && <Skeleton className="h-20 w-full rounded-lg" />}
      {myRankError && !myRankData && <ErrorBanner error={myRankError} />}
      {myRankData && (
        <Card variant="secondary" className="flex items-center justify-between gap-4 p-4">
          <Link
            href="/profile"
            aria-label={`View your profile. You are ranked #${myRankData.rank ?? 'unranked'} with ${myRankData.pointsTotal.toLocaleString()} points`}
            className="group flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-primary text-sm font-extrabold text-primary-foreground">
              {myRankData.rank ? `#${myRankData.rank}` : '—'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-secondary-foreground">Your standing</span>
                <Badge tone="primary">You</Badge>
              </div>
              <p className="mt-0.5 text-xs text-secondary-foreground/80">
                {myRankData.percentile > 0
                  ? `Top ${Math.max(1, Math.round(100 - myRankData.percentile))}% of ${myRankData.totalRanked.toLocaleString()} participants`
                  : `${myRankData.totalRanked.toLocaleString()} participants`}
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <span className="block text-base font-extrabold tabular-nums text-primary sm:text-lg">
                {myRankData.pointsTotal.toLocaleString()}
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-secondary-foreground/75">
                total points
              </span>
            </div>
            <Link
              href="/profile"
              aria-label="Go to your profile"
              className="inline-flex size-10 items-center justify-center rounded-sm border border-secondary-foreground/20 bg-secondary-foreground/10 text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      )}

      {/* Main Ranking Content */}
      {isLeaderboardPending ? (
        <>
          <p className="sr-only" role="status">
            Loading leaderboard rankings…
          </p>
          <LeaderboardSkeletons />
        </>
      ) : leaderboardError ? (
        <ErrorBanner error={leaderboardError} onRetry={() => refetchLeaderboard()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Trophy className="size-5" />}
          title="No rankings yet"
          description="No members have recorded points for this filter combination yet."
        />
      ) : (
        <div className="space-y-6">
          <Podium topUsers={topThree} />
          {remainingRows.length > 0 && <RankList rows={remainingRows} />}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
