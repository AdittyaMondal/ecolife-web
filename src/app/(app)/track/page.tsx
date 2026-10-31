'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { BathingQuestion } from '@/components/blocks/track/bathing-question';
import { CoolingQuestion } from '@/components/blocks/track/cooling-question';
import { MealsQuestion } from '@/components/blocks/track/meals-question';
import { ResultSheet } from '@/components/blocks/track/result-sheet';
import { TravelQuestion } from '@/components/blocks/track/travel-question';
import { WasteQuestion } from '@/components/blocks/track/waste-question';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type DailyAnswers, type TripRow, trackTodayQuery, useSubmitLog } from '@/hooks/use-track';
import { ApiError } from '@/lib/fetcher';

function TrackSkeletons() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Question 1 Skeleton */}
      <Card className="space-y-3 p-4 sm:p-5">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </Card>

      {/* Question 2 Skeleton */}
      <Card className="space-y-4 p-4 sm:p-5">
        <Skeleton className="h-5 w-52" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
        </div>
      </Card>

      {/* Question 3 Skeleton */}
      <Card className="space-y-3 p-4 sm:p-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </Card>

      {/* Question 4 Skeleton */}
      <Card className="space-y-3 p-4 sm:p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </Card>

      {/* Question 5 Skeleton */}
      <Card className="space-y-3 p-4 sm:p-5">
        <Skeleton className="h-5 w-36" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </Card>

      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

export default function TrackPage() {
  const { data, error, isPending, refetch, isFetching } = useQuery(trackTodayQuery());
  const submitMutation = useSubmitLog();

  // Local form state
  /**
   * Rows carry a client-only `_id`. The trip list is removable, and an array
   * index as React key makes a deletion reuse the previous row's DOM node, so
   * focus and caret land on the wrong input. `_id` is stripped before submit.
   */
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

  // Initialize or prefill state when data lands
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
        // Safe defaults from server
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
    });
  };

  const hasExistingLog = Boolean(data?.existingLog);
  const isUpdating = hasExistingLog;
  const isSubmittedSuccessfully = submitMutation.isSuccess && submitMutation.data;

  return (
    <main
      className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10"
      aria-busy={isPending || submitMutation.isPending}
    >
      {/* Page Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Daily Track</h1>
          <p className="text-sm text-muted-foreground">
            Answer 5 quick questions to calculate your daily footprint in under 30 seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/track/goals"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>Goals &amp; Targets</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Main Content States */}
      {isPending ? (
        <>
          <p className="sr-only" role="status">
            Loading today&apos;s questions…
          </p>
          <TrackSkeletons />
        </>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card p-5 text-card-foreground shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-destructive">
                Could not load today&apos;s questions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof ApiError ? error.message : 'Please check your connection.'}
              </p>
              {error instanceof ApiError && error.code && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">{error.code}</p>
              )}
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground shadow-sm transition hover:bg-eco-700 hover:text-eco-50 disabled:opacity-60 dark:hover:bg-eco-300 dark:hover:text-eco-950"
              >
                {isFetching ? 'Checking…' : 'Try again'}
              </button>
            </div>
          </div>
        </div>
      ) : isSubmittedSuccessfully ? (
        /* Result Sheet on mutation success (no refetch needed) */
        <ResultSheet
          result={submitMutation.data}
          onEdit={() => {
            submitMutation.reset();
          }}
        />
      ) : (
        /* The 5 Daily Questions Form */
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Notice if editing existing log */}
          {hasExistingLog && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-secondary/70 p-3 text-sm text-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                You already logged today. Updating this form will adjust today&apos;s footprint.
              </span>
            </div>
          )}

          {/* Mutation Error Alert (keeps answers intact) */}
          {submitMutation.isError && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 bg-card p-4 text-card-foreground shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-sm font-semibold text-destructive">
                    Failed to save your answers
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {submitMutation.error instanceof ApiError
                      ? submitMutation.error.message
                      : 'Something went wrong while saving. Your answers have been preserved — please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 1. Travel Question */}
          <TravelQuestion trips={trips} onChange={setTrips} defaults={data.defaults} />

          {/* 2. Meals Question */}
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

          {/* 3. Cooling Question — rendered ONLY when askCooling is true */}
          {data.askCooling && <CoolingQuestion value={acHoursBucket} onChange={setAcHoursBucket} />}

          {/* 4. Bathing Question */}
          <BathingQuestion value={bathChoice} onChange={setBathChoice} />

          {/* 5. Waste Question */}
          <WasteQuestion value={wasteActions} onChange={setWasteActions} />

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-eco-700 hover:text-eco-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-eco-300 dark:hover:text-eco-950"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  <span>Saving today&apos;s log…</span>
                </>
              ) : isUpdating ? (
                <span>Update today&apos;s log</span>
              ) : (
                <span>Save today&apos;s log</span>
              )}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
