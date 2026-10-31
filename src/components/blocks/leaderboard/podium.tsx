import { Crown, Flame, Medal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { LeaderboardRow } from '@/hooks/use-leaderboard';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface PodiumProps {
  topUsers: LeaderboardRow[];
}

export function Podium({ topUsers }: PodiumProps) {
  if (topUsers.length === 0) return null;

  const first = topUsers.find((u) => u.rank === 1) || topUsers[0];
  const second = topUsers.find((u) => u.rank === 2) || topUsers[1];
  const third = topUsers.find((u) => u.rank === 3) || topUsers[2];

  // Reorder for podium presentation: 2nd on left, 1st in center, 3rd on right
  const podiumOrder = [
    { user: second, rankNumber: 2, pedestalHeight: 'min-h-36 sm:min-h-40', label: 'Rank 2' },
    { user: first, rankNumber: 1, pedestalHeight: 'min-h-44 sm:min-h-52', label: 'Rank 1' },
    { user: third, rankNumber: 3, pedestalHeight: 'min-h-32 sm:min-h-36', label: 'Rank 3' },
  ];

  return (
    <Card aria-label="Top 3 Leaders" className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Podium
          </p>
          <h2 className="text-base font-bold text-foreground">Top impact leaders</h2>
        </div>
        <Badge tone="primary">Top 3</Badge>
      </div>

      {/* Concentric inner grid: Card p-4 (16px) -> rounded-sm (12px) pedestals */}
      <div className="grid grid-cols-3 items-end gap-3">
        {podiumOrder.map(({ user, rankNumber, pedestalHeight }) => {
          if (!user) {
            return (
              <div
                key={`empty-rank-${rankNumber}`}
                className="opacity-0 pointer-events-none"
                aria-hidden="true"
              />
            );
          }

          const isFirst = rankNumber === 1;
          const profileHref = user.isMe ? '/profile' : `/users/${user.id}`;

          return (
            <Link
              key={user.id}
              href={profileHref}
              aria-label={`View ${user.name}'s profile, ranked #${user.rank} with ${user.pointsTotal.toLocaleString()} points`}
              className={cn(
                'group flex min-w-0 flex-col justify-between rounded-sm border p-3 text-center transition',
                pedestalHeight,
                isFirst
                  ? 'border-primary bg-accent/60 hover:bg-accent'
                  : 'border-border bg-muted/50 hover:border-primary/40 hover:bg-muted',
                user.isMe && 'ring-2 ring-primary',
              )}
            >
              {/* Top: Rank badge & Avatar */}
              <div className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    'inline-flex h-6 items-center gap-1 rounded-xs px-2 text-xs font-bold tabular-nums',
                    isFirst
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground border border-border',
                  )}
                >
                  {isFirst ? (
                    <Crown className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Medal className="size-3.5 text-tertiary" aria-hidden="true" />
                  )}
                  #{user.rank}
                </span>

                {/* Concentric avatar tile: rounded-xs (8px) */}
                <div
                  className={cn(
                    'flex size-12 items-center justify-center rounded-xs border text-sm font-bold transition',
                    isFirst
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground',
                  )}
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="size-full rounded-xs object-cover"
                    />
                  ) : (
                    <span>{initials(user.name)}</span>
                  )}
                </div>

                <div className="w-full min-w-0">
                  <div className="flex items-center justify-center gap-1">
                    <span className="truncate text-xs font-bold text-foreground group-hover:text-positive sm:text-sm">
                      {user.name}
                    </span>
                  </div>
                  {user.isMe && (
                    <span className="mt-0.5 inline-block rounded-xs bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      You
                    </span>
                  )}
                  {user.city && (
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {user.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom: Points & Streak */}
              <div className="mt-3 rounded-xs border border-border/70 bg-card/80 p-2">
                <span className="block text-sm font-extrabold tabular-nums text-foreground sm:text-base">
                  {user.pointsTotal.toLocaleString()}
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  points
                </span>
                <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-positive">
                  <Flame className="size-3 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">{user.currentStreak}d</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
