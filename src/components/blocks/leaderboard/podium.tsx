import { Flame } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { LeaderboardRow } from '@/hooks/use-leaderboard';
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
    { user: second, rankNumber: 2, medal: '🥈', pedestalHeight: 'h-28 sm:h-36', label: 'Rank 2' },
    { user: first, rankNumber: 1, medal: '🥇', pedestalHeight: 'h-36 sm:h-44', label: 'Rank 1' },
    { user: third, rankNumber: 3, medal: '🥉', pedestalHeight: 'h-20 sm:h-28', label: 'Rank 3' },
  ];

  return (
    <section aria-label="Top 3 Leaders" className="pt-2">
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {podiumOrder.map(({ user, rankNumber, medal, pedestalHeight, label }) => {
          if (!user) {
            return (
              <div
                key={`empty-rank-${rankNumber}`}
                className="flex-1 opacity-0 pointer-events-none"
                aria-hidden="true"
              />
            );
          }

          const isFirst = rankNumber === 1;

          return (
            <div
              key={user.id}
              className={cn(
                'flex flex-1 min-w-0 flex-col items-center text-center',
                user.isMe && 'scale-100',
              )}
            >
              {/* User Avatar & Name Link */}
              <Link
                href="/profile"
                aria-label={`View ${user.name}'s profile, ranked #${user.rank} with ${user.pointsTotal.toLocaleString()} points`}
                className="group flex flex-col items-center min-w-0 w-full"
              >
                {/* Medal */}
                <span
                  role="img"
                  aria-label={label}
                  className={cn(
                    'text-xl sm:text-2xl transition group-hover:scale-110',
                    isFirst ? 'size-8 text-2xl' : 'size-6 text-lg',
                  )}
                >
                  {medal}
                </span>

                {/* Avatar circle */}
                <div
                  className={cn(
                    'mt-1 flex size-11 items-center justify-center rounded-full border-2 text-foreground transition sm:size-12',
                    isFirst
                      ? 'border-primary bg-primary/20 text-primary font-bold shadow-xs'
                      : 'border-border bg-muted font-medium',
                    user.isMe && 'ring-2 ring-primary ring-offset-2',
                  )}
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      // unoptimized: the avatar bucket has no remotePatterns entry yet, and
                      // these are 40px. Revisit with the uploads ticket.
                      unoptimized
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold uppercase">{user.name.slice(0, 2)}</span>
                  )}
                </div>

                {/* Name */}
                <div className="mt-1.5 flex flex-col items-center w-full px-1">
                  <span className="w-full truncate text-xs font-semibold text-foreground group-hover:text-primary sm:text-sm">
                    {user.name}
                  </span>
                  {user.isMe && (
                    <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                      You
                    </span>
                  )}
                  {user.city && (
                    <span className="w-full truncate text-[10px] text-muted-foreground sm:text-xs">
                      {user.city}
                    </span>
                  )}
                </div>
              </Link>

              {/* Pedestal block */}
              <div
                className={cn(
                  'mt-2.5 flex w-full flex-col items-center justify-between rounded-t-xl border border-b-0 p-2 sm:p-3 transition',
                  pedestalHeight,
                  isFirst
                    ? 'border-primary/40 bg-eco-100/80 dark:bg-eco-950/70 shadow-xs'
                    : 'border-border bg-secondary/50',
                  user.isMe && 'border-primary',
                )}
              >
                <span
                  className={cn(
                    'text-lg font-bold sm:text-xl',
                    isFirst ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  #{user.rank}
                </span>

                <div className="space-y-0.5 text-center">
                  <span className="block text-xs font-bold tabular-nums text-foreground sm:text-sm">
                    {user.pointsTotal.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">pts</span>

                  <div className="flex items-center justify-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    <Flame className="size-3 shrink-0" aria-hidden="true" />
                    <span>{user.currentStreak}d</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
