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
            className="inline-flex min-h-9 items-center text-xs font-semibold text-positive hover:underline"
          >
            Full ranking →
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
                className="flex items-center justify-between rounded-sm border border-border bg-muted/40 p-2.5 text-sm transition hover:bg-accent/50"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    role="img"
                    className="flex size-7 shrink-0 items-center justify-center rounded-xs bg-card text-sm"
                    aria-label={`Rank ${user.rank}`}
                  >
                    {badge}
                  </span>
                  <div className="flex flex-col">
                    <Link
                      href={`/users/${user.id}`}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {user.name}
                    </Link>
                    {user.city && (
                      <span className="text-xs text-muted-foreground">{user.city}</span>
                    )}
                  </div>
                </div>
                <span className="tabular text-xs font-semibold text-foreground">
                  {user.pointsTotal.toLocaleString()} pts
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between rounded-sm border border-tertiary/40 bg-accent p-3 text-sm text-accent-foreground">
          <div className="flex items-center gap-2">
            <span className="tabular rounded-xs bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              #{leaderboard.me.rank ?? '—'}
            </span>
            <span className="font-semibold">You</span>
          </div>
          <span className="tabular text-xs font-semibold">
            {leaderboard.me.pointsTotal.toLocaleString()} pts
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
