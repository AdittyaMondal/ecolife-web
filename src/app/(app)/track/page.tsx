'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  Droplets,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Utensils,
  Zap,
} from 'lucide-react';
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
        const ans = data.existingLog.answers as DailyAnswers;
        setTrips(ans.trips ? ans.trips.map((t) => ({ ...t, _id: crypto.randomUUID() })) : []);
        setVegMeals(ans.vegMeals ?? 0);
        setNonVegMeals(ans.nonVegMeals ?? 0);
        setVeganMeals(ans.veganMeals ?? 0);
        setAcHoursBucket(ans.acHoursBucket ?? '0');
        setBathChoice(ans.bathChoice ?? 'bucket');
        setWasteActions(ans.wasteActions ? [...ans.wasteActions] : []);
      } else {
        const def = data.defaults as DailyAnswers | undefined;
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

  const [activeStep, setActiveStep] = React.useState(0);

  const questionSteps = React.useMemo(() => {
    const list = [
      { id: 'travel', title: 'Travel & Commute', short: 'Travel', icon: Car },
      { id: 'meals', title: 'Meals & Diet', short: 'Meals', icon: Utensils },
    ];
    if (data?.askCooling) {
      list.push({ id: 'cooling', title: 'AC & Cooling', short: 'Cooling', icon: Zap });
    }
    list.push(
      { id: 'bathing', title: 'Bathing & Water', short: 'Water', icon: Droplets },
      { id: 'waste', title: 'Waste Habits', short: 'Waste', icon: Trash2 },
    );
    return list;
  }, [data?.askCooling]);

  const totalSteps = questionSteps.length;
  const currentStep = questionSteps[activeStep] ?? questionSteps[0];

  const maxHistoryKg = React.useMemo(
    () => Math.max(...(historyPoints ?? []).map((p) => Math.max(p.totalKg, p.baselineTotalKg)), 1),
    [historyPoints],
  );

  return (
    <main className="w-full space-y-8" aria-busy={isPending || submitMutation.isPending}>
      {/* Page Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Daily Track &amp; Goals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log your daily activity questions to calculate today&apos;s carbon footprint and advance
            your goals.
          </p>
        </div>

        <Link
          href="#goals-section"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-subtle transition hover:border-primary hover:bg-accent/50"
        >
          <Target className="size-4 text-positive" aria-hidden="true" />
          <span>Active Goals</span>
        </Link>
      </header>

      {/* Two-Column Workspace: Left = Daily Log Form, Right = Goals & History */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* SECTION 1: Daily 5-Question Log (Left 7 cols) */}
        <section aria-label="Daily footprint questions" className="space-y-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {data ? `Questions for ${formatDate(data.date)}` : 'Today’s Questions'}
            </h2>
            <Badge tone="positive">5 Quick Questions</Badge>
          </div>

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
                <div className="flex items-center justify-between gap-2 rounded-sm border border-tertiary/40 bg-accent/60 p-3.5 text-sm text-accent-foreground shadow-subtle">
                  <span>
                    You already logged today ({data.date}). Updating adjusts your footprint and
                    rewards.
                  </span>
                  <Badge tone="primary">Editing Log</Badge>
                </div>
              )}

              {submitMutation.isError && (
                <ErrorBanner title="Failed to save your answers" error={submitMutation.error} />
              )}

              {/* Step Navigation Pill Indicator */}
              <div className="rounded-lg border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                      {activeStep + 1}
                    </span>
                    <span className="text-foreground text-sm font-bold">
                      {currentStep.title}
                    </span>
                  </div>
                  <span className="tabular">
                    Question {activeStep + 1} of {totalSteps}
                  </span>
                </div>

                {/* Question Step Tabs */}
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {questionSteps.map((s, idx) => {
                    const isDone = idx < activeStep;
                    const isCurrent = idx === activeStep;
                    const StepIcon = s.icon;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveStep(idx)}
                        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                          isCurrent
                            ? 'border-primary bg-primary text-primary-foreground shadow-2xs font-bold'
                            : isDone
                              ? 'border-tertiary/50 bg-accent text-accent-foreground'
                              : 'border-border bg-muted/60 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {isDone ? (
                          <Check className="size-3.5 shrink-0" aria-hidden="true" />
                        ) : (
                          <StepIcon className="size-3.5 shrink-0" aria-hidden="true" />
                        )}
                        <span className="hidden sm:inline truncate">{s.short}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Single Active Question Container with Animated Transition */}
              <div key={currentStep.id} className="animate-fade-in animate-rise">
                {currentStep.id === 'travel' && (
                  <TravelQuestion
                    trips={trips}
                    onChange={setTrips}
                    defaults={data.defaults as DailyAnswers}
                  />
                )}

                {currentStep.id === 'meals' && (
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
                )}

                {currentStep.id === 'cooling' && (
                  <CoolingQuestion value={acHoursBucket} onChange={setAcHoursBucket} />
                )}

                {currentStep.id === 'bathing' && (
                  <BathingQuestion value={bathChoice} onChange={setBathChoice} />
                )}

                {currentStep.id === 'waste' && (
                  <WasteQuestion value={wasteActions} onChange={setWasteActions} />
                )}
              </div>

              {/* Wizard Action Controls (Previous, Next, and Final Submit) */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                  disabled={activeStep === 0 || submitMutation.isPending}
                  className="flex items-center gap-1.5"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  <span>Previous Question</span>
                </Button>

                {activeStep < totalSteps - 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => setActiveStep((s) => Math.min(totalSteps - 1, s + 1))}
                    className="flex items-center gap-2 shadow-2xs hover:shadow"
                  >
                    <span>Next: {questionSteps[activeStep + 1]?.short}</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex items-center gap-2 shadow-subtle hover:shadow"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                        <span>Calculating footprint…</span>
                      </>
                    ) : hasExistingLog ? (
                      <>
                        <span>Update Today&apos;s Log</span>
                        <Sparkles className="size-4" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <span>Submit Log &amp; Claim EcoCoins</span>
                        <Sparkles className="size-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          )}
        </section>

        {/* SECTION 2 & 3: Goals & History (Right 5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* SECTION 3: Goals Section */}
          <section id="goals-section" aria-labelledby="goals-section-heading" className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  id="goals-section-heading"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  Carbon Reduction Goals
                </h2>
                <p className="text-xs text-muted-foreground">
                  Lock in a reduction goal to earn milestone bonuses.
                </p>
              </div>

              {!goalsData?.active && (
                <Link
                  href="/track/goals/new"
                  className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-subtle transition hover:bg-tertiary"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  <span>Set goal</span>
                </Link>
              )}
            </div>

            {goalsData?.active ? (
              <GoalProgressCard activeGoal={goalsData.active} />
            ) : (
              <EmptyState
                icon={<Target className="size-6 text-positive" aria-hidden="true" />}
                title="No active reduction goal"
                description="Challenge yourself to cut emissions below your daily baseline cap."
                action={
                  <Link
                    href="/track/goals/new"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-subtle transition hover:bg-tertiary"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span>Create goal</span>
                  </Link>
                }
              />
            )}

            {goalsData && <GoalHistoryList past={goalsData.past} />}
          </section>

          {/* SECTION 2: Footprint History Chart */}
          {historyPoints && historyPoints.length > 0 && (
            <Card aria-labelledby="history-heading" className="space-y-4 shadow-subtle">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle id="history-heading" className="text-base font-bold">
                      Footprint History
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Last 10 days vs baseline</p>
                  </div>
                  <SegmentedControl
                    className="w-36"
                    label="History granularity"
                    value={granularity}
                    onChange={setGranularity}
                    options={[
                      { value: 'day', label: 'Day' },
                      { value: 'week', label: 'Wk' },
                      { value: 'month', label: 'Mo' },
                    ]}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-5 gap-1.5 rounded-sm border border-border/80 bg-muted/40 p-3 sm:grid-cols-10">
                  {historyPoints.slice(-10).map((pt) => {
                    const heightPct = Math.max(12, Math.round((pt.totalKg / maxHistoryKg) * 100));
                    const underBaseline = pt.totalKg <= pt.baselineTotalKg;
                    return (
                      <div key={pt.date} className="flex flex-col items-center gap-1">
                        <div className="flex h-20 w-full items-end justify-center rounded-xs bg-card p-1">
                          <div
                            className={
                              underBaseline
                                ? 'w-full rounded-[3px] bg-primary transition-all'
                                : 'w-full rounded-[3px] bg-secondary transition-all'
                            }
                            style={{ height: `${heightPct}%` }}
                            title={`${pt.date}: ${pt.totalKg.toFixed(1)} kg (baseline ${pt.baselineTotalKg.toFixed(1)} kg)`}
                          />
                        </div>
                        <span className="tabular text-[10px] font-bold text-foreground">
                          {pt.totalKg.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {formatDate(pt.date).slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
