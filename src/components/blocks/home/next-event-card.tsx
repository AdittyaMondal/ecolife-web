import { Calendar, ChevronRight, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Home } from '@/hooks/use-home';

export interface NextEventCardProps {
  nextEvent: Home['nextEvent'];
}

function formatEventDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('en-IN', {
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
          <CardTitle id="next-event-heading">Upcoming registered event</CardTitle>
          {nextEvent.passReady && (
            <Badge variant="primary">
              <Ticket className="size-3.5" aria-hidden="true" />
              <span>QR Pass ready</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href={`/events/${nextEvent.slug}`}
          className="group flex min-h-11 items-center justify-between rounded-sm border border-border bg-muted/40 p-3.5 transition hover:border-tertiary hover:bg-accent/50"
        >
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">{nextEvent.title}</h3>
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
