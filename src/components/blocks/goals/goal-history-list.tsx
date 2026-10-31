import { Ban, CheckCircle2, History, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
          <History className="size-7 text-muted-foreground/60" aria-hidden="true" />
          <h3 className="text-base font-semibold text-foreground">No past goals</h3>
          <p className="max-w-xs text-xs text-muted-foreground">
            Once a goal period ends or is settled, it appears here in your history.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight text-foreground">Past goals</h2>
      <div className="space-y-3">
        {past.map((goal) => {
          const title = goalLabel(goal);

          return (
            <Card key={goal.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {goal.period}
                    </span>
                    <span className="text-xs text-muted-foreground">&bull;</span>
                    <span className="tabular text-xs text-muted-foreground">
                      {goal.startDate} to {goal.endDate}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                </div>

                <div className="flex items-center gap-4">
                  {goal.status === 'achieved' ? (
                    <Badge variant="positive">
                      <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>Achieved</span>
                    </Badge>
                  ) : goal.status === 'missed' ? (
                    <Badge variant="destructive">
                      <XCircle className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>Missed</span>
                    </Badge>
                  ) : (
                    <Badge variant="muted">
                      <Ban className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>Cancelled</span>
                    </Badge>
                  )}

                  <div className="border-l border-border pl-4 text-right">
                    <span className="block text-xs text-muted-foreground">Result</span>
                    <span className="tabular text-sm font-semibold text-foreground">
                      {goal.actualKgTotal !== null ? `${goal.actualKgTotal.toFixed(1)} kg` : '—'}
                    </span>
                    <span className="tabular block text-[11px] text-muted-foreground">
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
