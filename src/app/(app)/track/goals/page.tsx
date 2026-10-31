'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Target } from 'lucide-react';
import Link from 'next/link';
import { GoalHistoryList } from '@/components/blocks/goals/goal-history-list';
import { GoalProgressCard } from '@/components/blocks/goals/goal-progress-card';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { goalsQuery } from '@/hooks/use-goals';

function GoalsSkeletons() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-3 w-full" />
      </Card>
    </div>
  );
}

export default function GoalsPage() {
  const { data, error, isPending, refetch, isFetching } = useQuery(goalsQuery());

  const hasActiveGoal = Boolean(data?.active);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10" aria-busy={isPending}>
      <div className="space-y-2">
        <Link
          href="/track"
          className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
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
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-tertiary"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>New Goal</span>
            </Link>
          )}
        </div>
      </div>

      {isPending ? (
        <>
          <p className="sr-only" role="status">
            Loading your goals…
          </p>
          <GoalsSkeletons />
        </>
      ) : error ? (
        <ErrorBanner
          title="Could not load goals"
          error={error}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <div className="space-y-8">
          <section aria-label="Active Goal">
            {data.active ? (
              <GoalProgressCard activeGoal={data.active} />
            ) : (
              <EmptyState
                icon={<Target className="size-6" aria-hidden="true" />}
                title="No active goal"
                description="Set a weekly, monthly, or quarterly goal to challenge yourself."
                action={
                  <Link
                    href="/track/goals/new"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-tertiary"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span>Set a new goal</span>
                  </Link>
                }
              />
            )}
          </section>

          <section aria-label="Goal History">
            <GoalHistoryList past={data.past} />
          </section>
        </div>
      )}
    </main>
  );
}
