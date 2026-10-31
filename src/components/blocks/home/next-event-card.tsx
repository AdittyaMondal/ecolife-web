import { Calendar, ChevronRight, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Home } from '@/hooks/use-home';

export interface NextEventCardProps {
  nextEvent: Home['nextEvent'];
}

function formatEventDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoDate;
  }
}

export function NextEventCard({ nextEvent }: NextEventCardProps) {
  if (!nextEvent) {
    return null;
  }

  return (
    <Card aria-labelledby="next-event-heading">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle id="next-event-heading">Next event</CardTitle>
          {nextEvent.passReady && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-foreground">
              <Ticket className="size-3.5 text-primary" aria-hidden="true" />
              Pass ready
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href={`/events/${nextEvent.slug}`}
          className="group flex min-h-11 items-center justify-between rounded-lg border border-border p-3.5 transition hover:bg-secondary/60"
        >
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
              {nextEvent.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                {formatEventDate(nextEvent.startAt)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {nextEvent.venueName}
              </span>
            </div>
          </div>
          <ChevronRight
            className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </CardContent>
    </Card>
  );
}
