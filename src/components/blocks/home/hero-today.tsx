import { ArrowRight, Car, Droplets, Flame, Info, Sparkles, Trash2, Utensils, Zap } from 'lucide-react';
import Link from 'next/link';
import { EmissionGauge } from '@/components/blocks/home/emission-gauge';
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
  const formattedDelta = Math.abs(today.deltaKg).toFixed(2);

  return (
    <Card
      aria-labelledby="hero-today-heading"
      className="bg-gradient-to-br from-card via-card to-accent/20 border-border/80 shadow-sm"
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Vehicle Emission Speedometer
              </span>
            </div>
            <CardTitle id="hero-today-heading" className="text-xl sm:text-2xl font-bold tracking-tight">
              Live Carbon Tachometer
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={today.logged ? 'positive' : 'neutral'}>
              {today.logged ? '✓ Today’s Log Submitted' : 'Awaiting Today’s Log'}
            </Badge>
            <Link
              href="/track"
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-sm bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-2xs transition hover:bg-tertiary active:scale-[0.98]"
            >
              <span>{today.logged ? 'Update Log' : 'Log Today'}</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Main Speedometer Gauge Section */}
        <div className="flex flex-col items-center justify-center rounded-sm border border-border/70 bg-muted/30 px-4 py-6 sm:py-8 shadow-inner">
          <EmissionGauge
            currentKg={today.breakdown.totalKg}
            baselineKg={today.baselineTotalKg}
            logged={today.logged}
          />
        </div>

        {/* Instrument Sub-Cluster: 4 Categories as Mini Gauges */}
        <div>
          <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Emission Breakdown by Stream</span>
            <span>Total: {today.breakdown.totalKg.toFixed(1)} kg</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-sm border border-border/80 bg-card p-3 shadow-2xs transition hover:border-tertiary/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Car className="size-3.5 text-positive" />
                  <span>Transport</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {today.sources.transport}
                </span>
              </div>
              <p className="tabular font-mono mt-1 text-base font-bold text-foreground">
                {today.breakdown.transportKg.toFixed(1)}{' '}
                <span className="text-[11px] font-normal text-muted-foreground">kg</span>
              </p>
            </div>

            <div className="rounded-sm border border-border/80 bg-card p-3 shadow-2xs transition hover:border-tertiary/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Utensils className="size-3.5 text-positive" />
                  <span>Diet & Food</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {today.sources.food}
                </span>
              </div>
              <p className="tabular font-mono mt-1 text-base font-bold text-foreground">
                {today.breakdown.foodKg.toFixed(1)}{' '}
                <span className="text-[11px] font-normal text-muted-foreground">kg</span>
              </p>
            </div>

            <div className="rounded-sm border border-border/80 bg-card p-3 shadow-2xs transition hover:border-tertiary/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Zap className="size-3.5 text-positive" />
                  <span>Home Energy</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {today.sources.home_energy}
                </span>
              </div>
              <p className="tabular font-mono mt-1 text-base font-bold text-foreground">
                {today.breakdown.homeEnergyKg.toFixed(1)}{' '}
                <span className="text-[11px] font-normal text-muted-foreground">kg</span>
              </p>
            </div>

            <div className="rounded-sm border border-border/80 bg-card p-3 shadow-2xs transition hover:border-tertiary/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Droplets className="size-3.5 text-positive" />
                  <span>Water & Waste</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {today.sources.water}
                </span>
              </div>
              <p className="tabular font-mono mt-1 text-base font-bold text-foreground">
                {(today.breakdown.waterKg + today.breakdown.wasteKg).toFixed(1)}{' '}
                <span className="text-[11px] font-normal text-muted-foreground">kg</span>
              </p>
            </div>
          </div>
        </div>

        {today.inferredCount > 0 && !today.logged && (
          <div className="flex items-center gap-2 rounded-xs border border-tertiary/40 bg-accent/40 px-3.5 py-2 text-xs text-accent-foreground">
            <Info className="size-4 shrink-0 text-positive" />
            <span>
              Values currently estimated from your baseline lifestyle answers. Fill today’s 5 questions
              to calibrate with exact daily habits.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
