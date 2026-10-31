import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { type Goal, goalLabel, goalProgressQuery, useCancelGoal } from '@/hooks/use-goals';
import { errorMessage } from '@/lib/errors';

export interface GoalProgressCardProps {
  activeGoal: Goal;
}

export function GoalProgressCard({ activeGoal }: GoalProgressCardProps) {
  const {
    data: progress,
    error,
    isPending,
    refetch,
    isFetching,
  } = useQuery(goalProgressQuery(activeGoal.id));
  const cancelMutation = useCancelGoal();
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const title = goalLabel(activeGoal);

  if (isPending) {
    return (
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-full" />
      </Card>
    );
  }

  if (error || !progress) {
    return (
      <ErrorBanner
        title="Could not load goal progress"
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const projectedPct = Math.round((progress.projectedKgTotal / progress.targetKgTotal) * 100);
  const progressPctClamped = Math.min(100, Math.max(0, Math.round(progress.progressPct)));
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (circumference * progressPctClamped) / 100;

  return (
    <Card className="space-y-4" aria-labelledby="active-goal-heading">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Active Goal
            </span>
            <CardTitle id="active-goal-heading" className="text-lg font-semibold sm:text-xl">
              {title}
            </CardTitle>
          </div>

          {progress.onTrack ? (
            <Badge variant="positive">
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span>On track</span>
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Needs attention</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-col items-center gap-5 rounded-sm border border-border bg-muted/40 p-4 sm:flex-row sm:justify-between">
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
              <span className="tabular text-xl font-bold text-foreground">
                {Math.round(progress.progressPct)}%
              </span>
              <span className="text-[10px] text-muted-foreground">budget used</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 text-center sm:text-left">
            <div>
              <span className="text-xs text-muted-foreground">Cumulative footprint</span>
              <div className="mt-0.5 flex items-baseline justify-center gap-1.5 sm:justify-start">
                <span className="tabular text-2xl font-semibold text-foreground sm:text-3xl">
                  {progress.actualKgTotal.toFixed(1)}
                </span>
                <span className="tabular text-sm text-muted-foreground">
                  / {progress.targetKgTotal.toFixed(1)} kg target
                </span>
              </div>
            </div>

            <p className="rounded-xs bg-card p-2.5 text-xs text-foreground">
              <span className="font-semibold">Projection: </span>
              <span>
                At this rate you&apos;ll finish at {projectedPct}% of target (
                {progress.projectedKgTotal.toFixed(1)} kg).
              </span>
            </p>

            <div className="tabular flex items-center justify-center gap-3 text-xs text-muted-foreground sm:justify-start">
              <span>{progress.daysElapsed} days elapsed</span>
              <span>&bull;</span>
              <span>
                {progress.daysLeft} {progress.daysLeft === 1 ? 'day' : 'days'} remaining
              </span>
            </div>
          </div>
        </div>

        <ProgressBar
          value={progress.progressPct}
          max={100}
          label={`Goal completion: ${Math.round(progress.progressPct)}%`}
        />

        <div className="border-t border-border pt-3">
          {confirmCancel ? (
            <div className="flex flex-col gap-3 rounded-sm border border-destructive/30 bg-danger-surface p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-destructive">
                Cancel this goal? Your recorded days stay in history.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => cancelMutation.mutate(activeGoal.id)}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      <span>Cancelling…</span>
                    </>
                  ) : (
                    <span>Confirm cancel</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelMutation.isPending}
                >
                  Keep goal
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive"
              >
                <X className="size-3.5" aria-hidden="true" />
                <span>Cancel this goal</span>
              </button>
            </div>
          )}

          {cancelMutation.isError && (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {errorMessage(cancelMutation.error)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
