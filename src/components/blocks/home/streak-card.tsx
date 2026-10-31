import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { Home } from '@/hooks/use-home';

export interface StreakCardProps {
  streak: Home['streak'];
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card aria-labelledby="streak-heading" className="p-0 sm:p-0">
      <Link
        href="/track"
        className="flex min-h-11 items-center justify-between rounded-xl p-4 transition hover:bg-secondary sm:p-5"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="Fire emoji">
            🔥
          </span>
          <div>
            <h2 id="streak-heading" className="text-base font-medium text-foreground">
              {streak.current}-day streak
            </h2>
            <p className="text-sm text-muted-foreground">
              Personal best: {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
      </Link>
    </Card>
  );
}
