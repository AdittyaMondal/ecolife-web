import { ChevronRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { Home } from '@/hooks/use-home';

export interface StreakCardProps {
  streak: Home['streak'];
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card aria-labelledby="streak-heading" variant="media">
      <Link
        href="/track"
        className="flex min-h-12 items-center justify-between rounded-md bg-muted/50 p-3 transition hover:bg-accent/60"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-sm bg-secondary text-primary">
            <Flame className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="streak-heading" className="tabular text-base font-semibold text-foreground">
              {streak.current}-day logging streak
            </h2>
            <p className="tabular text-xs text-muted-foreground">
              Personal best: {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
      </Link>
    </Card>
  );
}
