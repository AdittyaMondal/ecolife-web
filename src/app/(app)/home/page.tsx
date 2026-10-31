'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { BreakdownList } from '@/components/blocks/home/breakdown-list';
import { GoalCard } from '@/components/blocks/home/goal-card';
import { HeroToday } from '@/components/blocks/home/hero-today';
import { LeaderboardPeek } from '@/components/blocks/home/leaderboard-peek';
import { NextEventCard } from '@/components/blocks/home/next-event-card';
import { StreakCard } from '@/components/blocks/home/streak-card';
import { WeekTrend } from '@/components/blocks/home/week-trend';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { homeQuery } from '@/hooks/use-home';
import { ApiError } from '@/lib/fetcher';

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function HomeSkeletons() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-56 sm:w-72" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 w-20 rounded-lg" />
          <Skeleton className="h-11 w-16 rounded-lg" />
        </div>
      </div>

      {/* Hero skeleton */}
      <Card className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-12 w-44" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-2 w-full rounded-full" />
      </Card>

      {/* Streak skeleton */}
      <Card className="h-16" />

      {/* Week trend skeleton */}
      <Card className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-48" />
      </Card>

      {/* Breakdown & Leaderboard skeletons */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </Card>
      </div>

      {/* Goal skeleton */}
      <Card className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2 w-full rounded-full" />
      </Card>
    </div>
  );
}

export default function HomePage() {
  const { data, error, isPending, refetch, isFetching } = useQuery(homeQuery());

  const [greeting, setGreeting] = React.useState('Good morning');

  React.useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10" aria-busy={isPending}>
      {isPending ? (
        <>
          <p className="sr-only" role="status">
            Loading your dashboard…
          </p>
          <HomeSkeletons />
        </>
      ) : error ? (
        <div
          // role="alert" carries an implicit assertive live region, so a
          // failure that appears after load is announced rather than sitting
          // there silently for a screen-reader user. Scoped to this block, not
          // <main> — a live region around the whole page would re-announce
          // every card on every refetch.
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card p-5 text-card-foreground shadow-sm"
        >
          <h2 className="text-base font-semibold text-destructive">Could not reach the API</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof ApiError ? error.message : 'Something went wrong.'}
          </p>
          {error instanceof ApiError && error.code && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">{error.code}</p>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground shadow-sm transition hover:bg-eco-700 hover:text-eco-50 disabled:opacity-60 dark:hover:bg-eco-300 dark:hover:text-eco-950"
          >
            {isFetching ? 'Checking…' : 'Try again'}
          </button>
        </div>
      ) : (
        <>
          {/* 1. Header row */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1
              suppressHydrationWarning
              className="text-2xl font-semibold tracking-tight text-foreground"
            >
              {greeting}, {data.greetingName}
            </h1>
            <div className="flex items-center gap-2">
              <Link
                href="/marketplace"
                aria-label={`${data.wallet.coinsBalance.toLocaleString()} EcoCoins, view Marketplace`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span role="img" aria-hidden="true">
                  🪙
                </span>
                <span>{data.wallet.coinsBalance.toLocaleString()}</span>
              </Link>
              <Link
                href="/leaderboard"
                aria-label={`Rank ${data.leaderboard.me.rank ?? 'unranked'}, view Leaderboard`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="font-bold text-primary">#</span>
                <span>{data.leaderboard.me.rank ?? '—'}</span>
              </Link>
            </div>
          </header>

          {/* 2. Hero */}
          <HeroToday today={data.today} />

          {/* 3. Streak */}
          <StreakCard streak={data.streak} />

          {/* 4. This week */}
          <WeekTrend week={data.week} />

          {/* 5 & 7. Breakdown (30 days) and Leaderboard peek */}
          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownList breakdown={data.breakdown30d} />
            <LeaderboardPeek leaderboard={data.leaderboard} />
          </div>

          {/* 6. Active goal */}
          <GoalCard activeGoal={data.activeGoal} />

          {/* 8. Next event (omitted if null) */}
          <NextEventCard nextEvent={data.nextEvent} />
        </>
      )}
    </main>
  );
}
