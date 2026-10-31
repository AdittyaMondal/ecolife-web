import { ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { Home } from '@/hooks/use-home';

export interface HeroTodayProps {
  today: Home['today'];
}

export function HeroToday({ today }: HeroTodayProps) {
  const isImprovement = today.deltaKg < 0;
  const isIncrease = today.deltaKg > 0;
  const formattedDelta = Math.abs(today.deltaKg).toFixed(1);

  return (
    <Card aria-labelledby="hero-today-heading">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle id="hero-today-heading">Today&apos;s Carbon Footprint</CardTitle>
          <Badge variant={today.logged ? 'positive' : 'muted'}>
            {today.logged ? 'Logged' : today.date}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 rounded-sm border border-border bg-muted/40 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="tabular text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {today.breakdown.totalKg.toFixed(2)}
              </span>
              <span className="text-base font-medium text-muted-foreground sm:text-lg">
                kg CO₂e
              </span>
            </div>

            <div
              className={`mt-1.5 flex items-center gap-1.5 text-sm font-medium ${
                isImprovement
                  ? 'text-positive'
                  : isIncrease
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }`}
            >
              <span aria-hidden="true">{isImprovement ? '▼' : isIncrease ? '▲' : '—'}</span>
              <span>
                {isImprovement
                  ? `${formattedDelta} kg below your ${today.baselineTotalKg.toFixed(1)} kg baseline`
                  : isIncrease
                    ? `${formattedDelta} kg above your ${today.baselineTotalKg.toFixed(1)} kg baseline`
                    : `On your ${today.baselineTotalKg.toFixed(1)} kg baseline`}
              </span>
            </div>
          </div>

          <Link
            href="/track"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xs bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-tertiary"
          >
            <span>{today.logged ? 'Edit today’s log' : 'Log today’s activity'}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Share of daily baseline</span>
            <span className="tabular font-semibold text-foreground">
              {Math.round(today.percentOfBaseline)}% of baseline
            </span>
          </div>
          <ProgressBar
            value={today.percentOfBaseline}
            max={100}
            label={`Today's footprint is ${Math.round(today.percentOfBaseline)}% of your baseline`}
          />
        </div>

        {today.inferredCount > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {today.inferredCount} of 5 categories currently using your baseline estimate.
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
