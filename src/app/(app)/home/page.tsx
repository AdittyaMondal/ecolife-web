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
        <Skeleton className="h-8 w-56 sm:w-72" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 w-24" />
          <Skeleton className="h-11 w-24" />
        </div>
      </div>

      <Card className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-3 w-full" />
      </Card>

      <Card className="h-16" />

      <Card className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
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
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10" aria-busy={isPending}>
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
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {greeting}, {data.greetingName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Log daily, stay under your baseline, and earn coins &amp; points.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/marketplace"
                aria-label={`${data.wallet.coinsBalance} coins, open Marketplace`}
                className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-tertiary hover:bg-accent"
              >
                <Coins className="size-4 text-positive" aria-hidden="true" />
                <span className="tabular">{data.wallet.coinsBalance.toLocaleString()} coins</span>
              </Link>
              <Link
                href="/leaderboard"
                aria-label={`${data.wallet.pointsTotal} points, rank ${data.leaderboard.me.rank ?? 'unranked'}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-tertiary hover:bg-accent"
              >
                <Trophy className="size-4 text-positive" aria-hidden="true" />
                <span className="tabular">
                  #{data.leaderboard.me.rank ?? '—'} · {data.wallet.pointsTotal.toLocaleString()}{' '}
                  pts
                </span>
              </Link>
            </div>
          </header>

          {/* 2. Hero Today */}
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

          {/* 8. Next event */}
          <NextEventCard nextEvent={data.nextEvent} />

          {/* 9. EcoLife Valley 2D Farm Preview Card */}
          <Card variant="secondary" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <Gamepad2 className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-secondary-foreground">
                    EcoLife Valley · 2D Farm Sanctuary
                  </h2>
                  <p className="text-xs text-secondary-foreground/80">
                    Spend coins you earn today on trees, crops, and character skins for your farm.
                  </p>
                </div>
              </div>
              <Badge variant="primary">
                <Sparkles className="size-3" aria-hidden="true" />
                <span>Coming soon</span>
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-sm bg-forest-800 p-2 text-xs text-secondary-foreground">
              <div className="rounded-xs bg-forest-700 p-2.5">
                <p className="font-semibold text-primary">🌳 Native Trees</p>
                <p className="mt-0.5 text-[11px] text-secondary-foreground/80">
                  Banyan, Neem &amp; Mango groves unlocked with coins
                </p>
              </div>
              <div className="rounded-xs bg-forest-700 p-2.5">
                <p className="font-semibold text-primary">🧑‍🌾 Character Skins</p>
                <p className="mt-0.5 text-[11px] text-secondary-foreground/80">
                  Botanist, Solar Ranger &amp; Ocean Diver outfits
                </p>
              </div>
              <div className="rounded-xs bg-forest-700 p-2.5">
                <p className="font-semibold text-primary">🏡 Homestead Upgrades</p>
                <p className="mt-0.5 text-[11px] text-secondary-foreground/80">
                  Windmills, rainwater ponds &amp; beehives
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </main>
  );
}
