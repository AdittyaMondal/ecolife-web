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
            icon={<Target className="size-8 text-muted-foreground" aria-hidden="true" />}
            title="No active goal"
            description="Set a reduction target to stay accountable and earn bonus rewards."
            action={
              <Link
                href="/track/goals"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-eco-700 hover:text-eco-50 dark:hover:bg-eco-300 dark:hover:text-eco-950"
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
            className="inline-flex min-h-11 items-center text-xs font-medium text-primary hover:underline"
          >
            Manage goals
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{activeGoal.label}</span>
            <span className="text-xs font-semibold text-foreground">
              {Math.round(activeGoal.progressPct)}%
            </span>
          </div>
          <ProgressBar
            value={activeGoal.progressPct}
            max={100}
            label={`Goal progress: ${Math.round(activeGoal.progressPct)}%`}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">
            {activeGoal.daysLeft} {activeGoal.daysLeft === 1 ? 'day' : 'days'} left
          </span>

          {activeGoal.onTrack ? (
            <span className="flex items-center gap-1.5 font-medium text-eco-600 dark:text-eco-400">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              <span>On track</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-destructive">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              <span>Needs attention</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
