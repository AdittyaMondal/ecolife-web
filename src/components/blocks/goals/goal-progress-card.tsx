import { useQuery } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { type Goal, goalLabel, goalProgressQuery, useCancelGoal } from '@/hooks/use-goals';
import { ApiError } from '@/lib/fetcher';

export interface GoalProgressCardProps {
  activeGoal: Goal;
}

export function GoalProgressCard({ activeGoal }: GoalProgressCardProps) {
  const { data: progress, error, isPending, refetch } = useQuery(goalProgressQuery(activeGoal.id));
  const cancelMutation = useCancelGoal();
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const title = goalLabel(activeGoal);

  if (isPending) {
    return (
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
      </Card>
    );
  }

  if (error || !progress) {
    return (
      <Card
        role="alert"
        className="border-destructive/30 bg-card p-5 text-card-foreground shadow-sm"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-destructive">
              Could not load goal progress
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof ApiError ? error.message : 'Something went wrong.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-eco-700 hover:text-eco-50 dark:hover:bg-eco-300 dark:hover:text-eco-950"
            >
              Try again
            </button>
          </div>
        </div>
      </Card>
    );
  }

  const projectedPct = Math.round((progress.projectedKgTotal / progress.targetKgTotal) * 100);
  const progressPctClamped = Math.min(100, Math.max(0, Math.round(progress.progressPct)));
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (circumference * progressPctClamped) / 100;

  const handleCancel = () => {
    cancelMutation.mutate(activeGoal.id);
  };

  return (
    <Card className="space-y-5 p-4 sm:p-6" aria-labelledby="active-goal-heading">
      <CardHeader className="p-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Active Goal
            </span>
            <CardTitle id="active-goal-heading" className="text-lg font-semibold sm:text-xl">
              {title}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {progress.onTrack ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-eco-600/30 bg-eco-100 px-3 py-1 text-xs font-semibold text-eco-950 dark:bg-eco-950 dark:text-eco-200">
                <CheckCircle2
                  className="size-3.5 shrink-0 text-eco-600 dark:text-eco-400"
                  aria-hidden="true"
                />
                <span>On track</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Needs attention</span>
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-0">
        {/* Progress Visual + Numbers */}
        <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-secondary/30 p-4 sm:flex-row sm:justify-between sm:p-5">
          {/* Hand-written SVG Progress Ring */}
          <div className="relative flex shrink-0 items-center justify-center">
            <svg className="size-28 -rotate-90 transform" viewBox="0 0 100 100" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-primary transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold tabular-nums text-foreground">
                {Math.round(progress.progressPct)}%
              </span>
              <span className="text-[10px] text-muted-foreground">progress</span>
            </div>
          </div>

          {/* Stats & Projections */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <span className="text-xs text-muted-foreground">Cumulative footprint</span>
              <div className="mt-0.5 flex items-baseline justify-center gap-1.5 sm:justify-start">
                <span className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
                  {progress.actualKgTotal.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {progress.targetKgTotal.toFixed(1)} kg target
                </span>
              </div>
            </div>

            {/* Projection in words */}
            <p className="rounded-lg bg-card/80 p-2.5 text-xs text-foreground shadow-xs sm:text-sm">
              <span className="font-medium">Projection: </span>
              <span>
                At this rate you&apos;ll finish at {projectedPct}% of target (
                {progress.projectedKgTotal.toFixed(1)} kg).
              </span>
            </p>

            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground sm:justify-start">
              <span>{progress.daysElapsed} days elapsed</span>
              <span>&bull;</span>
              <span>
                {progress.daysLeft} {progress.daysLeft === 1 ? 'day' : 'days'} remaining
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar fallback / secondary visual */}
        <div className="space-y-1.5">
          <ProgressBar
            value={progress.progressPct}
            max={100}
            label={`Goal completion: ${Math.round(progress.progressPct)}%`}
          />
        </div>

        {/* Cancel Action */}
        <div className="border-t border-border pt-3">
          {confirmCancel ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <p className="text-xs text-destructive sm:text-sm">
                Cancel this goal? Your recorded days will be preserved in history.
              </p>
              <div className="mt-2.5 flex items-center gap-2 sm:mt-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-destructive px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-destructive/90 disabled:opacity-50"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1 size-3.5 animate-spin" aria-hidden="true" />
                      <span>Cancelling…</span>
                    </>
                  ) : (
                    <span>Confirm cancel</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelMutation.isPending}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary"
                >
                  Keep goal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive"
              >
                <X className="size-3.5" aria-hidden="true" />
                <span>Cancel this goal</span>
              </button>
            </div>
          )}

          {cancelMutation.isError && (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {cancelMutation.error instanceof ApiError
                ? cancelMutation.error.message
                : 'Failed to cancel the goal. Please try again.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
