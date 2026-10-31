import { AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { Home } from '@/hooks/use-home';

export interface GoalCardProps {
  activeGoal: Home['activeGoal'];
}

export function GoalCard({ activeGoal }: GoalCardProps) {
  if (!activeGoal) {
    return (
      <Card aria-labelledby="active-goal-heading">
        <CardHeader className="pb-2">
          <CardTitle id="active-goal-heading">Active goal</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Target className="size-6" aria-hidden="true" />}
            title="No active goal"
            description="Set a reduction target to stay accountable and earn bonus rewards."
            action={
              <Link
                href="/track/goals/new"
                className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-tertiary"
              >
                Set your first goal
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card aria-labelledby="active-goal-heading">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle id="active-goal-heading">Active goal</CardTitle>
          <Link
            href="/track/goals"
            className="inline-flex min-h-9 items-center text-xs font-semibold text-positive hover:underline"
          >
            Manage goals →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5 rounded-sm border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">{activeGoal.label}</span>
            <span className="tabular text-xs font-semibold text-foreground">
              {Math.round(activeGoal.progressPct)}%
            </span>
          </div>
          <ProgressBar
            value={activeGoal.progressPct}
            max={100}
            label={`Goal progress: ${Math.round(activeGoal.progressPct)}%`}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="tabular text-muted-foreground">
            {activeGoal.daysLeft} {activeGoal.daysLeft === 1 ? 'day' : 'days'} left
          </span>

          {activeGoal.onTrack ? (
            <span className="flex items-center gap-1.5 font-semibold text-positive">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              <span>On track</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-destructive">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              <span>Needs attention</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
