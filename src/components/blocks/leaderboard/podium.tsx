import { Crown, Flame, Medal, Trophy } from 'lucide-react';
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

interface PodiumStepConfig {
  rankNumber: 1 | 2 | 3;
  label: string;
  badgeLabel: string;
  cardHeight: string;
  pedestalHeight: string;
  cardClasses: string;
  baseClasses: string;
  numberClasses: string;
  avatarSize: string;
  avatarRing: string;
  pillClasses: string;
}

const STEP_CONFIGS: Record<1 | 2 | 3, PodiumStepConfig> = {
  1: {
    rankNumber: 1,
    label: '1st Place',
    badgeLabel: 'Champion',
    cardHeight: 'h-[360px] sm:h-[415px]',
    pedestalHeight: 'h-16 sm:h-22',
    cardClasses:
      'border-2 border-amber-400/80 dark:border-amber-500/70 bg-gradient-to-b from-amber-500/15 via-accent/30 to-card dark:from-amber-500/20 dark:via-card dark:to-card shadow-lg shadow-amber-500/10 dark:shadow-amber-500/5 hover:border-amber-400 hover:shadow-amber-500/20 z-10',
    baseClasses:
      'bg-gradient-to-t from-amber-500/30 via-amber-400/15 to-transparent border-t border-amber-400/40 dark:from-amber-500/35 dark:via-amber-400/10',
    numberClasses: 'text-amber-500/90 dark:text-amber-400/90',
    avatarSize: 'size-16 sm:size-20',
    avatarRing: 'ring-4 ring-amber-400/90 dark:ring-amber-400 shadow-md shadow-amber-500/25',
    pillClasses:
      'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 font-black shadow-xs',
  },
  2: {
    rankNumber: 2,
    label: '2nd Place',
    badgeLabel: 'Silver',
    cardHeight: 'h-[300px] sm:h-[350px]',
    pedestalHeight: 'h-12 sm:h-16',
    cardClasses:
      'border border-slate-300 dark:border-slate-600 bg-gradient-to-b from-slate-200/40 via-slate-100/15 to-card dark:from-slate-700/25 dark:via-card dark:to-card shadow-xs hover:border-slate-400 dark:hover:border-slate-500',
    baseClasses:
      'bg-gradient-to-t from-slate-300/40 via-slate-200/15 to-transparent border-t border-slate-300/60 dark:from-slate-700/40 dark:via-slate-600/15 dark:border-slate-600/60',
    numberClasses: 'text-slate-400 dark:text-slate-500',
    avatarSize: 'size-12 sm:size-14',
    avatarRing: 'ring-2 sm:ring-[3px] ring-slate-300 dark:ring-slate-500 shadow-xs',
    pillClasses:
      'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100 font-bold border border-slate-300/70 dark:border-slate-600',
  },
  3: {
    rankNumber: 3,
    label: '3rd Place',
    badgeLabel: 'Bronze',
    cardHeight: 'h-[260px] sm:h-[300px]',
    pedestalHeight: 'h-9 sm:h-12',
    cardClasses:
      'border border-amber-800/25 dark:border-amber-700/35 bg-gradient-to-b from-amber-800/10 via-amber-800/5 to-card dark:from-amber-900/20 dark:via-card dark:to-card shadow-xs hover:border-amber-700/45 dark:hover:border-amber-600/45',
    baseClasses:
      'bg-gradient-to-t from-amber-800/25 via-amber-700/10 to-transparent border-t border-amber-700/30 dark:from-amber-900/30 dark:via-amber-800/15 dark:border-amber-800/40',
    numberClasses: 'text-amber-700/70 dark:text-amber-600/70',
    avatarSize: 'size-11 sm:size-13',
    avatarRing: 'ring-2 ring-amber-700/50 dark:ring-amber-600/50 shadow-xs',
    pillClasses:
      'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-bold border border-amber-300/50 dark:border-amber-800/50',
  },
};

export function Podium({ topUsers }: PodiumProps) {
  if (topUsers.length === 0) return null;

  const first = topUsers.find((u) => u.rank === 1) || topUsers[0];
  const second =
    topUsers.find((u) => u.rank === 2) || (topUsers.length > 1 ? topUsers[1] : undefined);
  const third =
    topUsers.find((u) => u.rank === 3) || (topUsers.length > 2 ? topUsers[2] : undefined);

  // Classic podium presentation: 2nd on left (silver), 1st in center (gold, tallest), 3rd on right (bronze, lowest)
  const podiumOrder = [
    { user: second, config: STEP_CONFIGS[2] },
    { user: first, config: STEP_CONFIGS[1] },
    { user: third, config: STEP_CONFIGS[3] },
  ];

  return (
    <Card aria-label="Top 3 Leaders" className="relative overflow-hidden p-4 sm:p-5">
      {/* Atmospheric ambient glow behind the 1st place champion */}
      <div
        className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 -translate-y-1/2 size-56 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-400/5"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Trophy className="size-3.5 text-amber-500" aria-hidden="true" />
            <span>Leaderboard Podium</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">Top Impact Leaders</h2>
        </div>
        <Badge tone="primary" className="font-bold">
          Top 3
        </Badge>
      </div>

      {/* Podium grid: 3 stepped columns aligned to bottom floor */}
      <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 pt-4 sm:pt-6">
        {podiumOrder.map(({ user, config }) => {
          if (!user) {
            return (
              <div
                key={`empty-rank-${config.rankNumber}`}
                className={cn(
                  'flex min-w-0 flex-col justify-end rounded-sm border border-dashed border-border/60 bg-muted/20 text-center opacity-60',
                  config.cardHeight,
                )}
                aria-hidden="true"
              >
                <div className="p-3 text-center">
                  <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full border border-dashed border-border bg-muted/40 text-muted-foreground">
                    <Medal className="size-4 opacity-40" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">Empty spot</span>
                </div>
                <div
                  className={cn(
                    'flex w-full flex-col items-center justify-center border-t border-border/40 bg-muted/30',
                    config.pedestalHeight,
                  )}
                >
                  <span className="text-xl sm:text-3xl font-black font-mono text-muted-foreground/40">
                    {config.rankNumber}
                  </span>
                </div>
              </div>
            );
          }

          const isFirst = config.rankNumber === 1;
          const isSecond = config.rankNumber === 2;
          const profileHref = user.isMe ? '/profile' : `/users/${user.id}`;

          return (
            <Link
              key={user.id}
              href={profileHref}
              aria-label={`View ${user.name}'s profile, ranked #${user.rank} with ${user.pointsTotal.toLocaleString()} points`}
              className={cn(
                'group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-sm transition-all duration-200 hover:-translate-y-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
                config.cardHeight,
                config.cardClasses,
                user.isMe && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
              )}
            >
              {/* Top Section: Crown/Medal + Rank Pill + Avatar + Name */}
              <div className="flex flex-col items-center p-2 sm:p-3 text-center">
                {/* Crown / Medal icon */}
                <div className="relative mb-1 flex items-center justify-center">
                  {isFirst ? (
                    <>
                      <div className="absolute -inset-1 rounded-full bg-amber-400/30 blur-xs dark:bg-amber-400/20" />
                      <div className="relative flex size-7 sm:size-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-amber-950 shadow-sm ring-2 ring-amber-300 dark:ring-amber-400">
                        <Crown className="size-4 sm:size-4.5 fill-amber-950" aria-hidden="true" />
                      </div>
                    </>
                  ) : isSecond ? (
                    <div className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 shadow-xs ring-2 ring-slate-200 dark:from-slate-600 dark:to-slate-400 dark:text-slate-100 dark:ring-slate-500">
                      <Medal className="size-3.5 sm:size-4" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-50 shadow-xs ring-2 ring-amber-600/60 dark:from-amber-800 dark:to-amber-600">
                      <Medal className="size-3 sm:size-3.5" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Rank Pill */}
                <div className="mb-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider',
                      config.pillClasses,
                    )}
                  >
                    #{user.rank} {config.badgeLabel}
                  </span>
                </div>

                {/* Avatar with medal ring */}
                <div
                  className={cn(
                    'relative flex shrink-0 items-center justify-center rounded-full bg-muted font-bold transition group-hover:scale-105',
                    config.avatarSize,
                    config.avatarRing,
                  )}
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 64px, 80px"
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className={
                        isFirst ? 'text-sm sm:text-base font-black' : 'text-xs sm:text-sm font-bold'
                      }
                    >
                      {initials(user.name)}
                    </span>
                  )}
                </div>

                {/* Name & City */}
                <div className="mt-2 w-full min-w-0">
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={cn(
                        'truncate font-bold text-foreground group-hover:text-primary transition',
                        isFirst ? 'text-xs sm:text-sm font-extrabold' : 'text-[11px] sm:text-xs',
                      )}
                    >
                      {user.name}
                    </span>
                  </div>
                  {user.isMe && (
                    <span className="mt-0.5 inline-block rounded-xs bg-primary px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-primary-foreground">
                      You
                    </span>
                  )}
                  {user.city && (
                    <span className="block truncate text-[10px] sm:text-[11px] text-muted-foreground">
                      {user.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Section: Points & Streak */}
              <div className="px-1.5 sm:px-2.5 pb-2">
                <div className="rounded-xs border border-border/70 bg-card/90 dark:bg-card/75 p-1.5 sm:p-2 shadow-2xs backdrop-blur-xs">
                  <span
                    className={cn(
                      'block font-black tabular-nums text-foreground',
                      isFirst ? 'text-sm sm:text-lg' : 'text-xs sm:text-sm',
                    )}
                  >
                    {user.pointsTotal.toLocaleString()}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    points
                  </span>
                  <div className="mt-0.5 flex items-center justify-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold text-positive">
                    <Flame
                      className="size-3 sm:size-3.5 shrink-0 fill-positive/20"
                      aria-hidden="true"
                    />
                    <span className="tabular-nums">{user.currentStreak}d</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Stepped Pedestal Base */}
              <div
                className={cn(
                  'relative mt-auto flex w-full flex-col items-center justify-center border-t',
                  config.pedestalHeight,
                  config.baseClasses,
                )}
              >
                <span
                  className={cn(
                    'font-black tabular-nums leading-none select-none tracking-tight',
                    config.numberClasses,
                    isFirst
                      ? 'text-3xl sm:text-5xl font-mono'
                      : isSecond
                        ? 'text-2xl sm:text-4xl font-mono'
                        : 'text-xl sm:text-3xl font-mono',
                  )}
                  aria-hidden="true"
                >
                  {config.rankNumber}
                </span>
                <span
                  className={cn(
                    'mt-0.5 font-extrabold uppercase tracking-widest leading-none select-none',
                    config.numberClasses,
                    isFirst ? 'text-[10px] sm:text-xs' : 'text-[8px] sm:text-[10px]',
                  )}
                  aria-hidden="true"
                >
                  {config.badgeLabel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
