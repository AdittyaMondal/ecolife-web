'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Plus, Target } from 'lucide-react';
import Link from 'next/link';
import { GoalHistoryList } from '@/components/blocks/goals/goal-history-list';
import { GoalProgressCard } from '@/components/blocks/goals/goal-progress-card';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { goalsQuery } from '@/hooks/use-goals';
import { ApiError } from '@/lib/fetcher';

function GoalsSkeletons() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Active goal skeleton */}
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-3 w-full rounded-full" />
      </Card>

      {/* Past goals skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Card className="h-20" />
        <Card className="h-20" />
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { data, error, isPending, refetch, isFetching } = useQuery(goalsQuery());

  const hasActiveGoal = Boolean(data?.active);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10" aria-busy={isPending}>
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/track"
          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to Daily Track</span>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Reduction Goals
            </h1>
            <p className="text-sm text-muted-foreground">
              Commit to reduction targets to build durable habits and earn bonus rewards.
            </p>
          </div>

          {!hasActiveGoal && !isPending && !error && (
            <Link
              href="/track/goals/new"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-eco-700 hover:text-eco-50 dark:hover:bg-eco-300 dark:hover:text-eco-950"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>New Goal</span>
            </Link>
          )}
        </div>
      </div>

      {/* Content states */}
      {isPending ? (
        <>
          <p className="sr-only" role="status">
            Loading your goals…
          </p>
          <GoalsSkeletons />
        </>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card p-5 text-card-foreground shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-destructive">Could not load goals</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof ApiError ? error.message : 'Please check your connection.'}
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
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Goal section */}
          <section aria-label="Active Goal">
            {data.active ? (
              <GoalProgressCard activeGoal={data.active} />
            ) : (
              <EmptyState
                icon={<Target className="size-10 text-muted-foreground/60" aria-hidden="true" />}
                title="No active goal"
                description="You don't have an active reduction goal right now. Set a weekly, monthly, or quarterly goal to challenge yourself."
                action={
                  <Link
                    href="/track/goals/new"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-eco-700 hover:text-eco-50 dark:hover:bg-eco-300 dark:hover:text-eco-950"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span>Set a new goal</span>
                  </Link>
                }
              />
            )}
          </section>

          {/* Past Goals section */}
          <section aria-label="Goal History">
            <GoalHistoryList past={data.past} />
          </section>
        </div>
      )}
    </main>
  );
}
