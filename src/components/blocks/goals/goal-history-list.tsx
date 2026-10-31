import { Ban, CheckCircle2, History, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { type Goal, goalLabel } from '@/hooks/use-goals';

export interface GoalHistoryListProps {
  past: Goal[];
}

export function GoalHistoryList({ past }: GoalHistoryListProps) {
  if (past.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <History className="size-8 text-muted-foreground/60" aria-hidden="true" />
          <h3 className="text-base font-medium text-foreground">No past goals</h3>
          <p className="max-w-xs text-xs text-muted-foreground">
            Once a goal period ends or is settled, it will appear here in your history.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold tracking-tight text-foreground">Past goals</h2>
      <div className="space-y-3">
        {past.map((goal) => {
          const title = goalLabel(goal);

          return (
            <Card key={goal.id} className="p-4 transition hover:bg-secondary/30 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {goal.period}
                    </span>
                    <span className="text-xs text-muted-foreground">&bull;</span>
                    <span className="text-xs text-muted-foreground">
                      {goal.startDate} to {goal.endDate}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                </div>

                {/* Status indicator: ICON AND WORD ALWAYS */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-xs text-muted-foreground">Outcome</span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      {goal.status === 'achieved' ? (
                        <>
                          <CheckCircle2
                            className="size-4 shrink-0 text-eco-600 dark:text-eco-400"
                            aria-hidden="true"
                          />
                          <span className="text-eco-600 dark:text-eco-400">Achieved</span>
                        </>
                      ) : goal.status === 'missed' ? (
                        <>
                          <XCircle
                            className="size-4 shrink-0 text-destructive"
                            aria-hidden="true"
                          />
                          <span className="text-destructive">Missed</span>
                        </>
                      ) : (
                        <>
                          <Ban
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="text-muted-foreground">Cancelled</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-l border-border pl-4 text-right">
                    <span className="block text-xs text-muted-foreground">Result</span>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      {goal.actualKgTotal !== null ? `${goal.actualKgTotal.toFixed(1)} kg` : '—'}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      / {goal.targetKgTotal.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
