'use client';

import { useQuery } from '@tanstack/react-query';
import { Coins, Gamepad2, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { BreakdownList } from '@/components/blocks/home/breakdown-list';
import { GoalCard } from '@/components/blocks/home/goal-card';
import { HeroToday } from '@/components/blocks/home/hero-today';
import { LeaderboardPeek } from '@/components/blocks/home/leaderboard-peek';
import { NextEventCard } from '@/components/blocks/home/next-event-card';
import { StreakCard } from '@/components/blocks/home/streak-card';
import { WeekTrend } from '@/components/blocks/home/week-trend';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { homeQuery } from '@/hooks/use-home';

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function HomeSkeletons() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-64 sm:w-80" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <Card className="h-56 w-full" />
          <Card className="h-80 w-full" />
          <Card className="h-64 w-full" />
        </div>
        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          <Card className="h-32 w-full" />
          <Card className="h-44 w-full" />
          <Card className="h-64 w-full" />
          <Card className="h-48 w-full" />
        </div>
      </div>
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
    <main className="w-full space-y-8" aria-busy={isPending}>
      {isPending ? (
        <>
          <p className="sr-only" role="status">
            Loading your dashboard…
          </p>
          <HomeSkeletons />
        </>
      ) : error ? (
        <ErrorBanner
          title="Could not load your dashboard"
          error={error}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <>
          {/* 1. Greeting and Wallet Strip */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {greeting}, {data.greetingName}
                </h1>
                <Badge tone="positive">Active Member</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your lifestyle, reduce emissions below your baseline, and earn EcoCoins.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/marketplace"
                aria-label={`${data.wallet.coinsBalance} coins, open Marketplace`}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-sm border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-subtle transition hover:border-primary hover:bg-accent/50"
              >
                <Coins className="size-4 text-positive" aria-hidden="true" />
                <span className="tabular font-bold text-foreground">
                  {data.wallet.coinsBalance.toLocaleString()}
                </span>
                <span className="text-muted-foreground">coins</span>
              </Link>
              <Link
                href="/leaderboard"
                aria-label={`${data.wallet.pointsTotal} points, rank ${data.leaderboard.me.rank ?? 'unranked'}`}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-sm border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-subtle transition hover:border-primary hover:bg-accent/50"
              >
                <Trophy className="size-4 text-positive" aria-hidden="true" />
                <span className="tabular font-bold text-foreground">
                  #{data.leaderboard.me.rank ?? '—'}
                </span>
                <span className="text-muted-foreground">
                  · {data.wallet.pointsTotal.toLocaleString()} pts
                </span>
              </Link>
            </div>
          </header>

          {/* 2. Responsive 12-Column Dashboard Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Primary Column: Carbon & Analytics (7 or 8 cols) */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              {/* Hero Today */}
              <HeroToday today={data.today} />

              {/* 7-Day Trend Chart */}
              <WeekTrend week={data.week} />

              {/* 30-Day Breakdown */}
              <BreakdownList breakdown={data.breakdown30d} />
            </div>

            {/* Right Supporting Column: Streaks, Goals, Events, Leaderboard & Farm (5 or 4 cols) */}
            <div className="space-y-6 lg:col-span-5 xl:col-span-4">
              {/* Daily Streak */}
              <StreakCard streak={data.streak} />

              {/* Active Goal */}
              <GoalCard activeGoal={data.activeGoal} />

              {/* Community Leaderboard Peek */}
              <LeaderboardPeek leaderboard={data.leaderboard} />

              {/* Next Community Drive */}
              <NextEventCard nextEvent={data.nextEvent} />

              {/* EcoLife Valley 2D Farm Sanctuary Preview */}
              <Card variant="secondary" className="space-y-3 shadow-hover">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-subtle">
                      <Gamepad2 className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-secondary-foreground">
                        EcoLife Valley
                      </h2>
                      <p className="text-[11px] text-secondary-foreground/80">2D Farm Sanctuary</p>
                    </div>
                  </div>
                  <Badge tone="primary">
                    <Sparkles className="size-3" aria-hidden="true" />
                    <span>Coming soon</span>
                  </Badge>
                </div>
                <p className="text-xs text-secondary-foreground/90 leading-relaxed">
                  Spend your EcoCoins on native trees, crops, and solar upgrades for your virtual
                  homestead.
                </p>
                <div className="grid grid-cols-3 gap-2 rounded-sm bg-forest-800/80 p-2 text-xs text-secondary-foreground">
                  <div className="rounded-xs bg-forest-700/80 p-2">
                    <p className="font-semibold text-primary text-[11px]">🌳 Groves</p>
                    <p className="mt-0.5 text-[10px] text-secondary-foreground/75 leading-tight">
                      Neem &amp; Banyan
                    </p>
                  </div>
                  <div className="rounded-xs bg-forest-700/80 p-2">
                    <p className="font-semibold text-primary text-[11px]">🧑‍🌾 Skins</p>
                    <p className="mt-0.5 text-[10px] text-secondary-foreground/75 leading-tight">
                      Solar Ranger
                    </p>
                  </div>
                  <div className="rounded-xs bg-forest-700/80 p-2">
                    <p className="font-semibold text-primary text-[11px]">🏡 Tech</p>
                    <p className="mt-0.5 text-[10px] text-secondary-foreground/75 leading-tight">
                      Rain harvest
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
