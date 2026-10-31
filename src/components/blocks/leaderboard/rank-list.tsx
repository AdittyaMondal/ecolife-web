import { Flame } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { LeaderboardRow } from '@/hooks/use-leaderboard';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface RankListProps {
  rows: LeaderboardRow[];
}

export function RankList({ rows }: RankListProps) {
  if (rows.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        No additional rankings in this view.
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight text-foreground">All Ranked Members</h2>
        <span className="text-xs text-muted-foreground">{rows.length} more</span>
      </div>

      {/* Concentric rows: Card rounded-lg (28px) + p-4 (16px) -> row rounded-sm (12px) + p-2 (8px) -> avatar rounded-xs (8px) */}
      <ol className="space-y-2">
        {rows.map((row) => {
          const profileHref = row.isMe ? '/profile' : `/users/${row.id}`;
          return (
            <li key={row.id}>
              <Link
                href={profileHref}
                aria-label={`View ${row.name}'s profile, ranked #${row.rank}`}
                className={cn(
                  'flex min-h-12 items-center justify-between gap-3 rounded-sm border p-2 transition',
                  row.isMe
                    ? 'border-primary bg-accent/50 font-semibold'
                    : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/70',
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Rank tile */}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-card text-xs font-bold tabular-nums text-muted-foreground border border-border">
                    #{row.rank}
                  </span>

                  {/* Avatar tile */}
                  <div
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-xs border text-xs font-bold uppercase',
                      row.isMe
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground',
                    )}
                  >
                    {row.avatarUrl ? (
                      <Image
                        src={row.avatarUrl}
                        alt=""
                        width={36}
                        height={36}
                        unoptimized
                        className="size-full rounded-xs object-cover"
                      />
                    ) : (
                      initials(row.name)
                    )}
                  </div>

                  {/* Name & City */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {row.name}
                      </span>
                      {row.isMe && <Badge tone="primary">You</Badge>}
                    </div>
                    {row.city && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {row.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats: Streak & Points */}
                <div className="flex shrink-0 items-center gap-3 pr-1 text-right">
                  <div className="hidden items-center gap-1 rounded-xs bg-card px-2 py-1 text-xs font-medium text-positive border border-border sm:flex">
                    <Flame className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="tabular-nums">{row.currentStreak}d</span>
                  </div>

                  <div className="min-w-16">
                    <span className="block text-sm font-bold tabular-nums text-foreground">
                      {row.pointsTotal.toLocaleString()}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                      pts
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
