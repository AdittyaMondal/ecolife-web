import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Home } from '@/hooks/use-home';

export interface LeaderboardPeekProps {
  leaderboard: Home['leaderboard'];
}

const rankBadges: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function LeaderboardPeek({ leaderboard }: LeaderboardPeekProps) {
  const topUsers = leaderboard.top ?? [];

  return (
    <Card aria-labelledby="leaderboard-heading">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle id="leaderboard-heading">Leaderboard</CardTitle>
          <Link
            href="/leaderboard"
            className="inline-flex min-h-11 items-center text-xs font-medium text-primary hover:underline"
          >
            Full ranking
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {topUsers.map((user) => {
            const badge = rankBadges[user.rank] ?? `#${user.rank}`;
            return (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-lg p-2 text-sm transition hover:bg-secondary/40"
              >
                <div className="flex items-center gap-2.5">
                  {/* role="img" so the medal emoji is announced as its meaning.
                      aria-label is not supported on a bare span (role=generic). */}
                  <span
                    role="img"
                    className="flex size-6 shrink-0 items-center justify-center text-base"
                    aria-label={`Rank ${user.rank}`}
                  >
                    {badge}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{user.name}</span>
                    {user.city && (
                      <span className="text-xs text-muted-foreground">{user.city}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {user.pointsTotal.toLocaleString()} pts
                </span>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-border pt-2.5">
          <div className="flex items-center justify-between rounded-lg bg-secondary/70 p-2.5 px-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">#{leaderboard.me.rank ?? '—'}</span>
              <span className="font-medium text-foreground">You</span>
            </div>
            <span className="text-xs font-semibold text-foreground">
              {leaderboard.me.pointsTotal.toLocaleString()} pts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
