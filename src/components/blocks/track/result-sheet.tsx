import { ArrowDown, ArrowUp, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { LogResult } from '@/hooks/use-track';

export interface ResultSheetProps {
  result: LogResult;
  onEdit?: () => void;
}

export function ResultSheet({ result, onEdit }: ResultSheetProps) {
  const isReduction = result.deltaKg < 0;
  const absDelta = Math.abs(result.deltaKg).toFixed(1);
  const absPct = Math.abs(result.reductionPct).toFixed(1);

  const categories = [
    { label: 'Transport', kg: result.breakdown.transportKg },
    { label: 'Food', kg: result.breakdown.foodKg },
    { label: 'Home energy', kg: result.breakdown.homeEnergyKg },
    { label: 'Water', kg: result.breakdown.waterKg },
    { label: 'Waste', kg: result.breakdown.wasteKg },
  ];

  const maxCategory = Math.max(...categories.map((c) => c.kg), 1);

  return (
    <div role="status" aria-live="polite" className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 1. Primary celebration card */}
      <Card className="border-eco-600/30 bg-secondary/40">
        <CardHeader className="text-center sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
                Today&apos;s footprint logged!
              </CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Your daily habits have been calculated and recorded.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main stats grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Total today */}
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Today&apos;s footprint
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
                  {result.breakdown.totalKg.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">kg CO₂e</span>
              </div>

              {/* Delta vs baseline */}
              <div
                className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${
                  isReduction
                    ? 'text-eco-600 dark:text-eco-400'
                    : result.deltaKg > 0
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {isReduction ? (
                  <>
                    <ArrowDown className="size-4 shrink-0" aria-hidden="true" />
                    <span>
                      {absDelta} kg ({absPct}%) below baseline
                    </span>
                  </>
                ) : result.deltaKg > 0 ? (
                  <>
                    <ArrowUp className="size-4 shrink-0" aria-hidden="true" />
                    <span>+{result.deltaKg.toFixed(1)} kg above baseline</span>
                  </>
                ) : (
                  <span>Matched your baseline</span>
                )}
              </div>
            </div>

            {/* Streak & Rewards */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4">
              {/* Rewards */}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rewards earned
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-eco-100 px-2.5 py-1 text-sm font-semibold text-eco-950 dark:bg-eco-950 dark:text-eco-200">
                    <Sparkles
                      className="size-4 text-eco-600 dark:text-eco-400"
                      aria-hidden="true"
                    />
                    <span>+{result.reward.pointsDelta.toLocaleString()} pts</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/80 px-2.5 py-1 text-sm font-semibold text-foreground">
                    <span role="img" aria-label="EcoCoins">
                      🪙
                    </span>
                    <span>+{result.reward.coinsDelta.toLocaleString()} coins</span>
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Flame className="size-5 text-amber-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">
                  {result.streak.current} day streak
                </span>
                <span className="text-xs text-muted-foreground">
                  (Personal best: {result.streak.longest}d)
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Category breakdown</h3>
            <div className="mt-3 space-y-3">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground">{cat.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {cat.kg.toFixed(1)} kg
                    </span>
                  </div>
                  <ProgressBar
                    value={cat.kg}
                    max={maxCategory}
                    label={`${cat.label}: ${cat.kg.toFixed(1)} kg`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation actions */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/home"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-eco-700 hover:text-eco-50 dark:hover:bg-eco-300 dark:hover:text-eco-950"
            >
              Back to Home
            </Link>

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary/70 sm:w-auto"
              >
                Edit answers
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
