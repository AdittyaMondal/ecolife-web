'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Target } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { GoalHistoryList } from '@/components/blocks/goals/goal-history-list';
import { GoalProgressCard } from '@/components/blocks/goals/goal-progress-card';
import { BathingQuestion } from '@/components/blocks/track/bathing-question';
import { CoolingQuestion } from '@/components/blocks/track/cooling-question';
import { MealsQuestion } from '@/components/blocks/track/meals-question';
import { ResultSheet } from '@/components/blocks/track/result-sheet';
import { TravelQuestion } from '@/components/blocks/track/travel-question';
import { WasteQuestion } from '@/components/blocks/track/waste-question';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { goalsQuery } from '@/hooks/use-goals';
import {
  type DailyAnswers,
  type TrackGranularity,
  type TripRow,
  trackHistoryQuery,
  trackTodayQuery,
  useSubmitLog,
} from '@/hooks/use-track';
import { formatDate, todayYmd } from '@/lib/format';

function TrackSkeletons() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Card className="space-y-3">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-11 w-full" />
      </Card>
      <Card className="space-y-4">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
      <Card className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-11 w-full" />
      </Card>
    </div>
  );
}

export default function TrackPage() {
  const { data, error, isPending, refetch, isFetching } = useQuery(trackTodayQuery());
  const { data: goalsData } = useQuery(goalsQuery());
  const submitMutation = useSubmitLog();

  // History series state
  const [granularity, setGranularity] = React.useState<TrackGranularity>('day');
  const [range, setRange] = React.useState<{ from: string; to: string }>({
    from: '2026-10-01',
    to: '2026-10-31',
  });

  React.useEffect(() => {
    setRange({ from: todayYmd(-29), to: todayYmd(0) });
  }, []);

  const { data: historyPoints } = useQuery(trackHistoryQuery(range.from, range.to, granularity));

  // Local form state
  const [trips, setTrips] = React.useState<TripRow[]>([]);
  const [vegMeals, setVegMeals] = React.useState(0);
  const [nonVegMeals, setNonVegMeals] = React.useState(0);
  const [veganMeals, setVeganMeals] = React.useState(0);
  const [acHoursBucket, setAcHoursBucket] =
    React.useState<NonNullable<DailyAnswers['acHoursBucket']>>('0');
  const [bathChoice, setBathChoice] =
    React.useState<NonNullable<DailyAnswers['bathChoice']>>('bucket');
  const [wasteActions, setWasteActions] = React.useState<NonNullable<DailyAnswers['wasteActions']>>(
    [],
  );

  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (data && !initialized) {
      if (data.existingLog) {
        const ans = data.existingLog.answers;
        setTrips(ans.trips ? ans.trips.map((t) => ({ ...t, _id: crypto.randomUUID() })) : []);
        setVegMeals(ans.vegMeals ?? 0);
        setNonVegMeals(ans.nonVegMeals ?? 0);
        setVeganMeals(ans.veganMeals ?? 0);
        setAcHoursBucket(ans.acHoursBucket ?? '0');
        setBathChoice(ans.bathChoice ?? 'bucket');
        setWasteActions(ans.wasteActions ? [...ans.wasteActions] : []);
      } else {
        const def = data.defaults;
        setTrips([]);
        setVegMeals(def?.vegMeals ?? 0);
        setNonVegMeals(def?.nonVegMeals ?? 0);
        setVeganMeals(def?.veganMeals ?? 0);
        setAcHoursBucket(def?.acHoursBucket ?? '0');
        setBathChoice(def?.bathChoice ?? 'bucket');
        setWasteActions(def?.wasteActions ? [...def.wasteActions] : []);
      }
      setInitialized(true);
    }
  }, [data, initialized]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data) return;

    const answers: DailyAnswers = {
      trips: trips.map(({ _id, ...trip }) => trip),
      vegMeals,
      nonVegMeals,
      veganMeals,
      acHoursBucket: data.askCooling ? acHoursBucket : undefined,
      bathChoice,
      wasteActions,
    };

    submitMutation.mutate({
      logDate: data.date,
      answers,
      existingLogId: data.existingLog?.id,
    });
  };

  const hasExistingLog = Boolean(data?.existingLog);
  const isSubmittedSuccessfully = submitMutation.isSuccess && submitMutation.data;

  const maxHistoryKg = React.useMemo(
    () => Math.max(...(historyPoints ?? []).map((p) => Math.max(p.totalKg, p.baselineTotalKg)), 1),
    [historyPoints],
  );

  return (
    <main
      className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6 sm:py-10"
      aria-busy={isPending || submitMutation.isPending}
    >
      {/* Page Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Daily Track &amp; Goals
          </h1>
          <p className="text-sm text-muted-foreground">
            Log your 5 daily questions to compute today&apos;s footprint and advance your reduction
            goals.
          </p>
        </div>

        <Link
          href="#goals-section"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:border-tertiary hover:bg-accent"
        >
          <Target className="size-4 text-positive" aria-hidden="true" />
          <span>Jump to Goals</span>
        </Link>
      </header>

      {/* SECTION 1: Daily 5-Question Log */}
      <section aria-label="Daily footprint questions" className="space-y-6">
        {isPending ? (
          <>
            <p className="sr-only" role="status">
              Loading today&apos;s questions…
            </p>
            <TrackSkeletons />
          </>
        ) : error ? (
          <ErrorBanner
            title="Could not load today's questions"
            error={error}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        ) : isSubmittedSuccessfully ? (
          <ResultSheet
            result={submitMutation.data}
            onEdit={() => {
              submitMutation.reset();
            }}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {hasExistingLog && (
              <div className="flex items-center justify-between gap-2 rounded-sm border border-tertiary/40 bg-accent p-3 text-sm text-accent-foreground">
                <span>
                  You already logged today ({data.date}). Updating adjusts your footprint before
                  02:00 tomorrow.
                </span>
                <Badge variant="secondary">Editing</Badge>
              </div>
            )}

            {submitMutation.isError && (
              <ErrorBanner title="Failed to save your answers" error={submitMutation.error} />
            )}

            <TravelQuestion trips={trips} onChange={setTrips} defaults={data.defaults} />

            <MealsQuestion
              vegMeals={vegMeals}
              nonVegMeals={nonVegMeals}
              veganMeals={veganMeals}
              onChange={({ vegMeals: v, nonVegMeals: nv, veganMeals: vg }) => {
                setVegMeals(v);
                setNonVegMeals(nv);
                setVeganMeals(vg);
              }}
            />

            {data.askCooling && (
              <CoolingQuestion value={acHoursBucket} onChange={setAcHoursBucket} />
            )}

            <BathingQuestion value={bathChoice} onChange={setBathChoice} />

            <WasteQuestion value={wasteActions} onChange={setWasteActions} />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  <span>Saving today&apos;s log…</span>
                </>
              ) : hasExistingLog ? (
                <span>Update today&apos;s log</span>
              ) : (
                <span>Save today&apos;s log &amp; claim rewards</span>
              )}
            </Button>
          </form>
        )}
      </section>

      {/* SECTION 2: Footprint Time Series History */}
      {historyPoints && historyPoints.length > 0 && (
        <Card aria-labelledby="history-heading" className="space-y-4">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle id="history-heading">Footprint History</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Daily emissions compared against your baseline ({range.from} to {range.to})
                </p>
              </div>
              <SegmentedControl
                className="w-48"
                label="History granularity"
                value={granularity}
                onChange={setGranularity}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-7 gap-1.5 rounded-sm border border-border bg-muted/40 p-3 sm:grid-cols-10">
              {historyPoints.slice(-10).map((pt) => {
                const heightPct = Math.max(12, Math.round((pt.totalKg / maxHistoryKg) * 100));
                const underBaseline = pt.totalKg <= pt.baselineTotalKg;
                return (
                  <div key={pt.date} className="flex flex-col items-center gap-1.5">
                    <div className="flex h-24 w-full items-end justify-center rounded-xs bg-card p-1">
                      <div
                        className={
                          underBaseline
                            ? 'w-full rounded-[4px] bg-primary transition-all'
                            : 'w-full rounded-[4px] bg-secondary transition-all'
                        }
                        style={{ height: `${heightPct}%` }}
                        title={`${pt.date}: ${pt.totalKg.toFixed(1)} kg (baseline ${pt.baselineTotalKg.toFixed(1)} kg)`}
                      />
                    </div>
                    <span className="tabular text-[11px] font-semibold text-foreground">
                      {pt.totalKg.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(pt.date)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 3: Goals Section (Integrated directly in Track Page as requested) */}
      <section
        id="goals-section"
        aria-labelledby="goals-section-heading"
        className="space-y-6 pt-2"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="goals-section-heading"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              Carbon Reduction Goals
            </h2>
            <p className="text-sm text-muted-foreground">
              Freeze a weekly, monthly, or quarterly target to earn bonus points and coins.
            </p>
          </div>

          {!goalsData?.active && (
            <Link
              href="/track/goals/new"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-tertiary"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>Set a new goal</span>
            </Link>
          )}
        </div>

        {goalsData?.active ? (
          <GoalProgressCard activeGoal={goalsData.active} />
        ) : (
          <EmptyState
            icon={<Target className="size-6" aria-hidden="true" />}
            title="No active reduction goal"
            description="Challenge yourself to cut emissions by a percentage or stay under a daily kg cap."
            action={
              <Link
                href="/track/goals/new"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-tertiary"
              >
                <Plus className="size-4" aria-hidden="true" />
                <span>Create reduction goal</span>
              </Link>
            }
          />
        )}

        {goalsData && <GoalHistoryList past={goalsData.past} />}
      </section>
    </main>
  );
}
