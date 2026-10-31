import { Flame } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { LeaderboardRow } from '@/hooks/use-leaderboard';
import { cn } from '@/lib/utils';

export interface RankListProps {
  rows: LeaderboardRow[];
}

export function RankList({ rows }: RankListProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No additional rankings in this view.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Rankings</h2>
      <ol className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
        {rows.map((row) => {
          return (
            <li
              key={row.id}
              className={cn(
                'flex items-center justify-between p-3 sm:p-4 transition hover:bg-secondary/40',
                row.isMe &&
                  'bg-eco-50/90 font-medium dark:bg-eco-950/40 border-l-4 border-l-primary',
              )}
            >
              {/* Rank and User Profile Link */}
              <Link
                href="/profile"
                aria-label={`View ${row.name}'s profile, ranked #${row.rank}`}
                className="flex min-h-11 flex-1 min-w-0 items-center gap-3 pr-2"
              >
                {/* Rank number */}
                <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-muted-foreground">
                  #{row.rank}
                </span>

                {/* Avatar */}
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold uppercase text-foreground',
                    row.isMe && 'border-primary ring-1 ring-primary/40',
                  )}
                >
                  {row.avatarUrl ? (
                    <Image
                      src={row.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      // unoptimized: the avatar bucket has no remotePatterns entry yet, and
                      // these are 40px. Revisit with the uploads ticket.
                      unoptimized
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    row.name.slice(0, 2)
                  )}
                </div>

                {/* Name and Location */}
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {row.name}
                    </span>
                    {row.isMe && (
                      <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        You
                      </span>
                    )}
                  </div>
                  {row.city && (
                    <span className="truncate text-xs text-muted-foreground">{row.city}</span>
                  )}
                </div>
              </Link>

              {/* Stats: Streak and Points */}
              <div className="flex shrink-0 items-center gap-3 pl-2 text-right">
                <div className="hidden sm:flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <Flame className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">{row.currentStreak}d</span>
                </div>

                <div className="min-w-16">
                  <span className="block text-sm font-semibold tabular-nums text-foreground">
                    {row.pointsTotal.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">pts</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
