'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  Compass,
  MapPin,
  Plus,
  QrCode,
  Sparkles,
  Trees,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import {
  EVENT_TYPE_LABEL,
  type EventFilter,
  type EventType,
  eventsInfiniteQuery,
} from '@/hooks/use-events';
import { formatDateTimeRange, initials } from '@/lib/format';

const FILTER_TABS: { value: EventFilter; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'nearby', label: 'Nearby' },
  { value: 'registered', label: 'My Passes' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'past', label: 'Past' },
];

const EVENT_TYPES: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: 'All drives' },
  { value: 'plant_drive', label: 'Plantation Drive' },
  { value: 'cleanup_drive', label: 'Cleanup Drive' },
  { value: 'recycling_drive', label: 'Recycling Drive' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'other', label: 'Other' },
];

export default function EventsPage() {
  const [filter, setFilter] = React.useState<EventFilter>('upcoming');
  const [eventType, setEventType] = React.useState<EventType | 'all'>('all');
  const [coords, setCoords] = React.useState<{ lat: number; lng: number }>({
    lat: 19.076,
    lng: 72.8777,
  });

  React.useEffect(() => {
    if (filter === 'nearby' && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          });
        },
        () => {
          // Keep default fallback coordinates if geolocation permission is declined
        },
      );
    }
  }, [filter]);

  const events = useInfiniteQuery(
    eventsInfiniteQuery({
      filter,
      type: eventType === 'all' ? undefined : eventType,
      lat: filter === 'nearby' ? coords.lat : undefined,
      lng: filter === 'nearby' ? coords.lng : undefined,
      radiusKm: filter === 'nearby' ? 25 : undefined,
    }),
  );

  const allEvents = React.useMemo(
    () => events.data?.pages.flatMap((p) => p.items) ?? [],
    [events.data],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-positive">
            Community Drives & Passes
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Eco Events
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join plantation and cleanup drives to get a QR pass, or host an event and scan passes to
            award points & coins.
          </p>
        </div>

        <Link href="/events/new">
          <Button variant="primary" size="md">
            <Plus className="size-4" />
            Host an Event
          </Button>
        </Link>
      </header>

      {/* Filter Bar */}
      <Card className="space-y-4 p-4">
        <SegmentedControl
          name="events-filter"
          label="Filter events"
          options={FILTER_TABS}
          value={filter}
          onChange={setFilter}
          fullWidth
        />

        <div className="flex flex-wrap items-center gap-2">
          {EVENT_TYPES.map((t) => (
            <Chip
              key={t.value}
              selected={eventType === t.value}
              onToggle={() => setEventType(t.value)}
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Events Grid */}
      {events.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {['ev-s1', 'ev-s2', 'ev-s3', 'ev-s4'].map((skeletonId) => (
            <Card key={skeletonId} variant="media" className="space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
              <div className="space-y-2 p-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-sm" />
              </div>
            </Card>
          ))}
        </div>
      ) : events.isError ? (
        <ErrorBanner error={events.error} onRetry={() => events.refetch()} />
      ) : allEvents.length === 0 ? (
        <EmptyState
          icon={<Trees className="size-5" />}
          title="No events in this view"
          description="Try switching filter tabs or host your own community plantation or cleanup drive."
          action={
            <Link href="/events/new">
              <Button variant="primary" size="sm">
                <Plus className="size-4" />
                Create an Event
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {allEvents.map((ev) => {
              const capacityPct =
                ev.capacity > 0
                  ? Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100))
                  : 0;
              const isCheckedIn = ev.viewer.passStatus === 'checked_in';

              return (
                <Card
                  key={ev.id}
                  variant="media"
                  className="flex flex-col justify-between transition hover:border-primary/60"
                >
                  <div>
                    {/* Concentric Cover Image: outer Card rounded-lg (28px) + p-2 (8px) -> inner rounded-md (20px) */}
                    <Link
                      href={`/events/${ev.slug}`}
                      className="group relative block h-44 w-full overflow-hidden rounded-md border border-border/60 bg-secondary"
                    >
                      {ev.coverUrl ? (
                        <Image
                          src={ev.coverUrl}
                          alt={ev.title}
                          fill
                          unoptimized
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col justify-between bg-secondary p-4 text-secondary-foreground">
                          <div className="flex justify-end">
                            <Trees className="size-10 text-primary/40" aria-hidden="true" />
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                            {EVENT_TYPE_LABEL[ev.type] ?? ev.type}
                          </p>
                        </div>
                      )}

                      <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                        <Badge tone="primary">{EVENT_TYPE_LABEL[ev.type] ?? ev.type}</Badge>
                        {ev.viewer.isHost && <Badge tone="positive">Hosting</Badge>}
                        {!ev.viewer.isHost && ev.viewer.isCoHost && (
                          <Badge tone="positive">Co-host</Badge>
                        )}
                        {isCheckedIn ? (
                          <Badge tone="positive">
                            <CheckCircle2 className="size-3" />
                            Checked in
                          </Badge>
                        ) : (
                          ev.viewer.registered && (
                            <Badge tone="neutral">
                              <QrCode className="size-3" />
                              Pass ready
                            </Badge>
                          )
                        )}
                      </div>
                    </Link>

                    {/* Event Details */}
                    <div className="space-y-2 p-2 pt-3">
                      <Link
                        href={`/events/${ev.slug}`}
                        className="block text-lg font-bold tracking-tight text-foreground hover:text-positive"
                      >
                        {ev.title}
                      </Link>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-positive shrink-0" />
                          <span>{formatDateTimeRange(ev.startAt, ev.endAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-positive shrink-0" />
                          <span className="truncate">
                            {ev.venueName}
                            {ev.venueAddress ? ` · ${ev.venueAddress}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Host, Capacity & Action */}
                  <div className="space-y-3 p-2 pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Users className="size-3.5" />
                          <strong className="text-foreground tabular-nums">
                            {ev.registeredCount}
                          </strong>{' '}
                          / {ev.capacity} registered
                        </span>
                        <span className="text-[11px] font-semibold text-positive">
                          +Points & Coins on check-in
                        </span>
                      </div>
                      <ProgressBar
                        value={capacityPct}
                        max={100}
                        tone={capacityPct >= 100 ? 'warning' : 'primary'}
                        aria-label={`${ev.registeredCount} of ${ev.capacity} spots filled`}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-xs bg-accent text-[11px] font-bold text-accent-foreground">
                          {initials(ev.host.name)}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          By <strong className="text-foreground">{ev.host.name}</strong>
                        </span>
                      </div>

                      <Link href={`/events/${ev.slug}`}>
                        <Button
                          variant={
                            ev.viewer.isHost || ev.viewer.isCoHost
                              ? 'secondary'
                              : ev.viewer.registered
                                ? 'outline'
                                : 'primary'
                          }
                          size="sm"
                        >
                          {ev.viewer.isHost || ev.viewer.isCoHost ? (
                            <>
                              <QrCode className="size-3.5" />
                              Manage & Scan
                            </>
                          ) : ev.viewer.registered ? (
                            <>
                              <QrCode className="size-3.5" />
                              View QR Pass
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-3.5" />
                              View & Join
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {events.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                loading={events.isFetchingNextPage}
                onClick={() => events.fetchNextPage()}
              >
                <Compass className="size-4" />
                Load more events
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
