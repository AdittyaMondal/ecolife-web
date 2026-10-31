import { Info } from 'lucide-react';
import Link from 'next/link';
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
          <CardTitle id="hero-today-heading">Today</CardTitle>
          <span className="text-xs font-medium text-muted-foreground">{today.date}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {today.breakdown.totalKg.toFixed(1)}
            </span>
            <span className="text-base font-medium text-muted-foreground sm:text-lg">kg CO₂e</span>
          </div>

          <div
            className={`mt-1.5 flex items-center gap-1.5 text-sm font-medium ${
              isImprovement
                ? 'text-eco-600 dark:text-eco-400'
                : isIncrease
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            }`}
          >
            <span aria-hidden="true">{isImprovement ? '▼' : isIncrease ? '▲' : '—'}</span>
            <span>
              {isImprovement
                ? `${formattedDelta} kg below your baseline`
                : isIncrease
                  ? `${formattedDelta} kg above your baseline`
                  : '0.0 kg on your baseline'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress to baseline</span>
            <span className="font-medium text-foreground">
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
            <span>{today.inferredCount} of 5 categories estimated</span>
          </p>
        )}

        {!today.logged && (
          <div className="pt-1">
            <Link
              href="/track"
              className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-eco-700 hover:text-eco-50 dark:hover:bg-eco-300 dark:hover:text-eco-950"
            >
              Log today's activity
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
