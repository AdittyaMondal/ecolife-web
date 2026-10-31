import { ArrowDown, ArrowUp, Award, CheckCircle2, Coins, Flame } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
    <div role="status" aria-live="polite" className="space-y-6">
      <Card variant="accent" className="space-y-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Today&apos;s footprint logged!
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your 5 categories have been calculated and credited to your wallet.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Total today */}
            <div className="rounded-sm border border-border bg-card p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Today&apos;s footprint
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="tabular text-3xl font-semibold text-foreground sm:text-4xl">
                  {result.breakdown.totalKg.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">kg CO₂e</span>
              </div>

              <div
                className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${
                  isReduction ? 'text-positive' : 'text-muted-foreground'
                }`}
              >
                {isReduction ? (
                  <>
                    <ArrowDown className="size-4 shrink-0" aria-hidden="true" />
                    <span className="tabular">
                      {absDelta} kg ({absPct}%) below baseline
                    </span>
                  </>
                ) : result.deltaKg > 0 ? (
                  <>
                    <ArrowUp className="size-4 shrink-0" aria-hidden="true" />
                    <span className="tabular">+{result.deltaKg.toFixed(1)} kg above baseline</span>
                  </>
                ) : (
                  <span>Matched your baseline</span>
                )}
              </div>
            </div>

            {/* Streak & Rewards */}
            <div className="flex flex-col justify-between gap-3 rounded-sm border border-border bg-card p-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rewards earned
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-xs bg-primary px-2.5 py-1 text-sm font-semibold text-primary-foreground">
                    <Award className="size-4" aria-hidden="true" />
                    <span className="tabular">
                      +{result.reward.pointsDelta.toLocaleString()} pts
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-xs bg-secondary px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
                    <Coins className="size-4" aria-hidden="true" />
                    <span className="tabular">
                      +{result.reward.coinsDelta.toLocaleString()} coins
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border pt-2.5">
                <Flame className="size-4 text-positive" aria-hidden="true" />
                <span className="tabular text-sm font-semibold text-foreground">
                  {result.streak.current} day streak
                </span>
                <span className="tabular text-xs text-muted-foreground">
                  (Best: {result.streak.longest}d)
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="rounded-sm border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Category breakdown</h3>
            <div className="mt-3 space-y-3">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground">{cat.label}</span>
                    <span className="tabular text-muted-foreground">{cat.kg.toFixed(2)} kg</span>
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

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Link
              href="/home"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition hover:bg-forest-600"
            >
              Back to Home
            </Link>

            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit answers
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
