'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarCheck, Flame, MapPin, Sparkles, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { publicProfileQuery } from '@/hooks/use-profile';
import { formatDateLong, formatNumber, initials } from '@/lib/format';

export default function PublicUserProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const profile = useQuery(publicProfileQuery(userId));

  if (profile.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-36 rounded-sm" />
        <Skeleton className="h-52 w-full rounded-lg" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <div className="space-y-4">
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Back to Leaderboard
          </Button>
        </Link>
        <ErrorBanner error={profile.error} onRetry={() => profile.refetch()} />
      </div>
    );
  }

  const u = profile.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/leaderboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Back to Leaderboard
        </Button>
      </Link>

      <Card className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-sm bg-primary text-xl font-extrabold text-primary-foreground">
            {u.user.avatarUrl ? (
              <Image
                src={u.user.avatarUrl}
                alt={u.user.name}
                width={64}
                height={64}
                unoptimized
                className="size-full rounded-sm object-cover"
              />
            ) : (
              initials(u.user.name)
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{u.user.name}</h1>
              {u.globalRank && <Badge tone="primary">Rank #{u.globalRank}</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {u.user.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-positive" />
                  {u.user.city}
                </span>
              )}
              <span>Member since {formatDateLong(u.memberSince)}</span>
            </div>
          </div>
        </div>

        {/* Concentric Impact Tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-sm border border-border bg-muted/30 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-positive" />
              <span>Total Points</span>
            </div>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">
              {formatNumber(u.pointsTotal)}
            </p>
          </div>

          <div className="rounded-sm border border-border bg-muted/30 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Trophy className="size-3.5 text-positive" />
              <span>Global Rank</span>
            </div>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">
              {u.globalRank ? `#${u.globalRank}` : 'Unranked'}
            </p>
          </div>

          <div className="rounded-sm border border-border bg-muted/30 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Flame className="size-3.5 text-positive" />
              <span>Current Streak</span>
            </div>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">
              {u.currentStreak}d
            </p>
          </div>

          <div className="rounded-sm border border-border bg-muted/30 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <CalendarCheck className="size-3.5 text-positive" />
              <span>Drives Joined</span>
            </div>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">
              {u.eventsAttended}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
