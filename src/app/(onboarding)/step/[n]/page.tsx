'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  Coins,
  Droplets,
  Flame,
  Home,
  Leaf,
  Loader2,
  MapPin,
  Plane,
  Sparkles,
  Sun,
  Train,
  Utensils,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Field, Input, Select } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { Stepper } from '@/components/ui/stepper';
import { categoryShares } from '@/hooks/use-home';
import {
  citiesQuery,
  ONBOARDING_STEPS,
  type OnboardingCompleteResult,
  type OnboardingStep1,
  type OnboardingStep2,
  type OnboardingStep3,
  type OnboardingStep4,
  type OnboardingStep5,
  onboardingQuery,
  regionsQuery,
  useCompleteOnboarding,
  useSaveOnboardingStep,
} from '@/hooks/use-onboarding';
import { ApiError } from '@/lib/fetcher';
import { formatKg } from '@/lib/format';
import { qk } from '@/lib/query-keys';
import { cn } from '@/lib/utils';

const STEP_META = [
  {
    step: 1,
    title: 'Household & Climate',
    subtitle: 'Questions 1–4 of 15 · Where you live and how your home stays cool.',
    icon: Home,
  },
  {
    step: 2,
    title: 'Food & Diet',
    subtitle: 'Questions 5–7 of 15 · What typically goes on your plate.',
    icon: Utensils,
  },
  {
    step: 3,
    title: 'Travel & Commute',
    subtitle: 'Questions 8–11 of 15 · Daily transport and yearly flights.',
    icon: Train,
  },
  {
    step: 4,
    title: 'Electricity & Cooking Energy',
    subtitle: 'Questions 12–13 of 15 · Monthly power, cooking fuel, and solar.',
    icon: Zap,
  },
  {
    step: 5,
    title: 'Water & Waste Habits',
    subtitle: 'Questions 14–15 of 15 · Daily water use and waste segregation.',
    icon: Droplets,
  },
] as const;

const COOLING_OPTIONS: { value: OnboardingStep1['coolingUsage']; label: string; desc: string }[] = [
  { value: 'none', label: 'No cooling', desc: 'Natural ventilation only' },
  { value: 'fan_only', label: 'Ceiling / table fans', desc: 'No air conditioning' },
  { value: 'ac_occasional', label: 'AC occasionally', desc: 'Peak summer or a few hours' },
  { value: 'ac_daily', label: 'AC daily', desc: 'Most nights or daytime' },
];

const DIET_OPTIONS: { value: OnboardingStep2['dietType']; label: string; desc: string }[] = [
  { value: 'vegan', label: 'Vegan', desc: '100% plant-based, no dairy or eggs' },
  { value: 'vegetarian', label: 'Vegetarian', desc: 'Vegetables, grains, pulses, and dairy' },
  { value: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian plus eggs' },
  {
    value: 'non_veg_weekly',
    label: 'Non-veg 1–3x / week',
    desc: 'Occasional meat, poultry, or fish',
  },
  { value: 'non_veg_daily', label: 'Non-veg most days', desc: 'Meat, poultry, or fish daily' },
];

const COMMUTE_MODES: { value: OnboardingStep3['primaryCommuteMode']; label: string }[] = [
  { value: 'metro_train', label: 'Metro / Local train' },
  { value: 'bus', label: 'Bus' },
  { value: 'two_wheeler', label: 'Two-wheeler' },
  { value: 'car', label: 'Car' },
  { value: 'auto_rickshaw', label: 'Auto-rickshaw' },
  { value: 'cab', label: 'Cab / Ride-hail' },
  { value: 'cycle', label: 'Cycle' },
  { value: 'walk', label: 'Walk' },
  { value: 'work_from_home', label: 'Work from home' },
];

const VEHICLE_FUELS: { value: OnboardingStep3['vehicleFuel']; label: string }[] = [
  { value: 'not_applicable', label: 'Not applicable' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric (EV)' },
];

const COOKING_FUELS: { value: OnboardingStep4['cookingFuel']; label: string; desc: string }[] = [
  { value: 'lpg', label: 'LPG cylinder', desc: 'Standard domestic cylinder' },
  { value: 'png', label: 'Piped natural gas (PNG)', desc: 'Metered city gas line' },
  { value: 'electric_induction', label: 'Electric / Induction', desc: 'Grid or solar powered' },
  { value: 'firewood', label: 'Biomass / Firewood', desc: 'Traditional stove' },
];

const WASTE_HABITS: { value: OnboardingStep5['wasteHabit']; label: string; desc: string }[] = [
  {
    value: 'segregate_and_compost',
    label: 'Segregate & compost',
    desc: 'Wet & dry separated, wet waste composted at home or society',
  },
  {
    value: 'segregate_only',
    label: 'Segregate wet & dry',
    desc: 'Separate bins handed to municipal collection',
  },
  {
    value: 'none',
    label: 'Mixed bin',
    desc: 'All household waste goes into a single bin',
  },
];

/**
 * "You already finished onboarding" in all the shapes the server can say it.
 *
 * `ONB_002` is the contract; the message checks are a belt-and-braces
 * fallback for an older server. Typed `unknown` rather than `any` so the
 * narrowing is visible instead of assumed.
 */
function isAlreadyComplete(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.code === 'ONB_002') return true;
  return error.message.includes('already complete') || error.message.includes('already set up');
}

export default function OnboardingStepPage() {
  return (
    <React.Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <OnboardingStepContent />
    </React.Suspense>
  );
}

function OnboardingStepContent() {
  const params = useParams<{ n: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const rawStep = Number.parseInt(params.n ?? '1', 10);
  const step = Number.isFinite(rawStep) ? Math.min(ONBOARDING_STEPS, Math.max(1, rawStep)) : 1;
  const meta = STEP_META[step - 1] ?? STEP_META[0];
  const StepIcon = meta.icon;

  const { data: state, isPending, error, refetch, isFetching } = useQuery(onboardingQuery());
  const { data: regions } = useQuery(regionsQuery());

  const saveStep = useSaveOnboardingStep();
  const completeOnboarding = useCompleteOnboarding();

  // Step 1 state (Questions 1–4)
  const [householdSize, setHouseholdSize] = React.useState(3);
  const [city, setCity] = React.useState('Mumbai');
  const [citySearch, setCitySearch] = React.useState('');
  const [regionCode, setRegionCode] = React.useState('IN-MH');
  const [coolingUsage, setCoolingUsage] =
    React.useState<OnboardingStep1['coolingUsage']>('ac_occasional');

  // Step 2 state (Questions 5–7)
  const [dietType, setDietType] = React.useState<OnboardingStep2['dietType']>('vegetarian');
  const [foodWasteLevel, setFoodWasteLevel] =
    React.useState<OnboardingStep2['foodWasteLevel']>('low');
  const [packagedFoodFreq, setPackagedFoodFreq] =
    React.useState<OnboardingStep2['packagedFoodFreq']>('sometimes');

  // Step 3 state (Questions 8–11)
  const [primaryCommuteMode, setPrimaryCommuteMode] =
    React.useState<OnboardingStep3['primaryCommuteMode']>('metro_train');
  const [vehicleFuel, setVehicleFuel] =
    React.useState<OnboardingStep3['vehicleFuel']>('not_applicable');
  const [commuteDistanceKm, setCommuteDistanceKm] = React.useState(12);
  const [flightsPerYear, setFlightsPerYear] = React.useState(1);

  // Step 4 state (Questions 12–13 + solar)
  const [kwhSource, setKwhSource] = React.useState<OnboardingStep4['kwhSource']>('reported');
  const [electricityKwhMonth, setElectricityKwhMonth] = React.useState<number>(220);
  const [electricityBillInr, setElectricityBillInr] = React.useState<number>(2000);
  const [cookingFuel, setCookingFuel] = React.useState<OnboardingStep4['cookingFuel']>('lpg');
  const [hasSolar, setHasSolar] = React.useState(false);

  // Step 5 state (Questions 14–15)
  const [waterUsageLevel, setWaterUsageLevel] =
    React.useState<OnboardingStep5['waterUsageLevel']>('medium');
  const [wasteHabit, setWasteHabit] =
    React.useState<OnboardingStep5['wasteHabit']>('segregate_only');

  const [completedResult, setCompletedResult] = React.useState<OnboardingCompleteResult | null>(
    null,
  );
  const hydratedRef = React.useRef(false);

  const { data: citySuggestions } = useQuery(citiesQuery(citySearch));

  // Hydrate saved answers when server state arrives
  React.useEffect(() => {
    if (!state || hydratedRef.current) return;
    hydratedRef.current = true;
    const a = state.answers;
    if (a.householdSize !== undefined) setHouseholdSize(a.householdSize);
    if (a.city) setCity(a.city);
    if (a.regionCode) setRegionCode(a.regionCode);
    if (a.coolingUsage) setCoolingUsage(a.coolingUsage);
    if (a.dietType) setDietType(a.dietType);
    if (a.foodWasteLevel) setFoodWasteLevel(a.foodWasteLevel);
    if (a.packagedFoodFreq) setPackagedFoodFreq(a.packagedFoodFreq);
    if (a.primaryCommuteMode) setPrimaryCommuteMode(a.primaryCommuteMode);
    if (a.vehicleFuel) setVehicleFuel(a.vehicleFuel);
    if (a.commuteDistanceKm !== undefined) setCommuteDistanceKm(a.commuteDistanceKm);
    if (a.flightsPerYear !== undefined) setFlightsPerYear(a.flightsPerYear);
    if (a.kwhSource) setKwhSource(a.kwhSource);
    if (a.electricityKwhMonth !== null && a.electricityKwhMonth !== undefined) {
      setElectricityKwhMonth(a.electricityKwhMonth);
    }
    if (a.electricityBillInr !== null && a.electricityBillInr !== undefined) {
      setElectricityBillInr(a.electricityBillInr);
    }
    if (a.cookingFuel) setCookingFuel(a.cookingFuel);
    if (a.hasSolar !== undefined) setHasSolar(a.hasSolar);
    if (a.waterUsageLevel) setWaterUsageLevel(a.waterUsageLevel);
    if (a.wasteHabit) setWasteHabit(a.wasteHabit);
  }, [state]);

  // If already fully onboarded, redirect directly to dashboard
  React.useEffect(() => {
    if (state?.complete && !completedResult) {
      qc.invalidateQueries({ queryKey: qk.me() });
      qc.invalidateQueries({ queryKey: qk.home() });
      router.replace('/home');
    }
  }, [state?.complete, completedResult, router, qc]);

  const handleStepSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const onAlreadyComplete = () => {
      qc.invalidateQueries({ queryKey: qk.me() });
      qc.invalidateQueries({ queryKey: qk.home() });
      router.push('/home');
    };

    const bodyForStep = () => {
      if (step === 1) {
        return {
          householdSize,
          city: city.trim() || 'Mumbai',
          regionCode: regionCode.trim() || 'IN-MH',
          coolingUsage,
        } satisfies OnboardingStep1;
      }
      if (step === 2) {
        return {
          dietType,
          foodWasteLevel,
          packagedFoodFreq,
        } satisfies OnboardingStep2;
      }
      if (step === 3) {
        return {
          primaryCommuteMode,
          vehicleFuel,
          commuteDistanceKm,
          flightsPerYear,
        } satisfies OnboardingStep3;
      }
      if (step === 4) {
        return {
          kwhSource,
          electricityKwhMonth: kwhSource === 'reported' ? electricityKwhMonth : null,
          electricityBillInr: kwhSource === 'from_bill' ? electricityBillInr : null,
          cookingFuel,
          hasSolar,
        } satisfies OnboardingStep4;
      }
      return {
        waterUsageLevel,
        wasteHabit,
      } satisfies OnboardingStep5;
    };

    saveStep.mutate(
      { step, body: bodyForStep() },
      {
        onSuccess: () => {
          if (step < ONBOARDING_STEPS) {
            router.push(`/step/${step + 1}`);
          } else {
            completeOnboarding.mutate(undefined, {
              onSuccess: (res) => {
                setCompletedResult(res);
              },
              onError: (err: unknown) => {
                if (isAlreadyComplete(err)) {
                  onAlreadyComplete();
                }
              },
            });
          }
        },
        onError: (err: unknown) => {
          if (isAlreadyComplete(err)) {
            onAlreadyComplete();
          }
        },
      },
    );
  };

  const isBusy = saveStep.isPending || completeOnboarding.isPending;

  return (
    <div className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Top Bar */}
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5 text-foreground">
            <span className="flex size-9 items-center justify-center rounded-xs bg-secondary text-primary">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <div>
              <span className="block text-base font-semibold tracking-tight leading-none">
                EcoLife
              </span>
              <span className="text-xs text-muted-foreground">15-Question Baseline Setup</span>
            </div>
          </Link>

          <Badge variant="accent">
            Step {step} of {ONBOARDING_STEPS}
          </Badge>
        </header>

        {/* Stepper Progress Pill — outer rounded-lg (28px), p-4 (16px) inset */}
        {!completedResult && (
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
              <span>Lifestyle baseline progress</span>
              <span className="tabular font-semibold text-foreground">
                {Math.round((step / ONBOARDING_STEPS) * 100)}%
              </span>
            </div>
            <ProgressBar value={(step / ONBOARDING_STEPS) * 100} label="Onboarding progress" />
            <div className="grid grid-cols-5 gap-1 pt-1">
              {STEP_META.map((s) => {
                const done = s.step < step || (state?.completedSteps ?? 0) >= s.step;
                const current = s.step === step;
                return (
                  <Link
                    key={s.step}
                    href={`/step/${s.step}`}
                    className={cn(
                      'flex min-h-9 items-center justify-center gap-1.5 rounded-sm border px-2 py-1.5 text-xs font-medium transition',
                      current
                        ? 'border-primary bg-primary font-semibold text-primary-foreground'
                        : done
                          ? 'border-tertiary/40 bg-accent text-accent-foreground'
                          : 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    {done && !current ? (
                      <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="tabular">{s.step}</span>
                    )}
                    <span className="hidden truncate sm:inline">{s.title.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}

        {/* Completion Celebration Screen */}
        {completedResult ? (
          <Card variant="feature" className="space-y-6">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Badge variant="primary">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span>Baseline calculated</span>
                </Badge>
                <h1 className="pt-1 text-2xl font-semibold tracking-tight text-foreground">
                  Your daily baseline is{' '}
                  <span className="tabular text-positive">
                    {formatKg(completedResult.baseline.totalKg, 2)} CO₂e
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Every daily log compares against this baseline so you earn points and coins
                  whenever you come in below it.
                </p>
              </div>
            </div>

            {/* Reward Grant Banner */}
            <div className="grid grid-cols-2 gap-3 rounded-sm border border-tertiary/40 bg-accent p-3">
              <div className="flex items-center gap-3 rounded-xs bg-card p-3">
                <span className="flex size-10 items-center justify-center rounded-xs bg-primary text-primary-foreground">
                  <Award className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="tabular text-lg font-semibold text-foreground">
                    +{completedResult.pointsAwarded} pts
                  </p>
                  <p className="text-xs text-muted-foreground">Leaderboard points</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xs bg-card p-3">
                <span className="flex size-10 items-center justify-center rounded-xs bg-secondary text-secondary-foreground">
                  <Coins className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="tabular text-lg font-semibold text-foreground">
                    +{completedResult.coinsAwarded} coins
                  </p>
                  <p className="text-xs text-muted-foreground">Marketplace discount</p>
                </div>
              </div>
            </div>

            {/* 5-Category Baseline Breakdown */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">
                Your 5-category daily breakdown
              </h2>
              <div className="space-y-2">
                {categoryShares(completedResult.baseline).map((cat) => (
                  <div
                    key={cat.key}
                    className="space-y-1.5 rounded-sm border border-border bg-muted/50 p-3"
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground">{cat.label}</span>
                      <span className="tabular text-muted-foreground">
                        {formatKg(cat.kg, 2)} ({cat.pct.toFixed(0)}%)
                      </span>
                    </div>
                    <ProgressBar value={cat.pct} label={cat.label} />
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/home')}
            >
              <span>Enter EcoLife Home</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Card>
        ) : isPending ? (
          <Card className="space-y-4">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
        ) : error ? (
          <ErrorBanner
            title="Could not load your onboarding progress"
            error={error}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        ) : (
          /* Wizard Step Card — outer rounded-lg (28px), p-4 (16px) inset, inner controls rounded-sm (12px) */
          <form onSubmit={handleStepSubmit} className="space-y-6" noValidate>
            <Card className="space-y-6">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-foreground">
                  <StepIcon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    {meta.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
                </div>
              </div>

              {(saveStep.isError || completeOnboarding.isError) && (
                <ErrorBanner
                  title="Could not save this step"
                  error={saveStep.error ?? completeOnboarding.error}
                />
              )}

              {/* STEP 1: Household & Climate (Questions 1–4) */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex flex-col justify-between gap-3 rounded-sm border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        1. How many people live in your household?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Shared electricity and cooking emissions are divided across household
                        members.
                      </p>
                    </div>
                    <Stepper
                      label="Household size"
                      value={householdSize}
                      onChange={setHouseholdSize}
                      min={1}
                      max={15}
                      unit="people"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id="onb-city"
                      label="2. Your city"
                      hint="Used for local events and city leaderboards."
                    >
                      <div className="relative">
                        <Input
                          id="onb-city"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            setCitySearch(e.target.value);
                          }}
                          placeholder="e.g. Mumbai"
                          required
                        />
                        {citySuggestions &&
                          citySuggestions.length > 0 &&
                          citySearch.length >= 2 && (
                            <div className="mt-1 space-y-1 rounded-sm border border-border bg-card p-1 shadow-md">
                              {citySuggestions.slice(0, 5).map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setCity(c.name);
                                    setRegionCode(c.regionCode);
                                    setCitySearch('');
                                  }}
                                  className="flex w-full items-center justify-between rounded-xs px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-accent"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="size-3.5 text-positive" aria-hidden="true" />
                                    <span>{c.name}</span>
                                  </span>
                                  <span className="font-mono text-muted-foreground">
                                    {c.regionCode}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </Field>

                    <Field
                      id="onb-region"
                      label="3. State / Grid region"
                      hint="Determines your state electricity grid factor."
                    >
                      {regions && regions.length > 0 ? (
                        <Select
                          id="onb-region"
                          value={regionCode}
                          onChange={(e) => setRegionCode(e.target.value)}
                        >
                          {regions.map((r) => (
                            <option key={r.code} value={r.code}>
                              {r.name} ({r.code} · {r.gridKgPerKwh} kg CO₂e/kWh)
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          id="onb-region"
                          value={regionCode}
                          onChange={(e) => setRegionCode(e.target.value)}
                          placeholder="IN-MH"
                          required
                        />
                      )}
                    </Field>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      4. How do you cool your home in warm months?
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {COOLING_OPTIONS.map((opt) => {
                        const selected = coolingUsage === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setCoolingUsage(opt.value)}
                            className={cn(
                              'flex flex-col items-start gap-1 rounded-sm border p-3.5 text-left transition',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-foreground hover:border-tertiary hover:bg-accent/40',
                            )}
                          >
                            <span className="text-sm font-semibold">{opt.label}</span>
                            <span
                              className={cn(
                                'text-xs',
                                selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                              )}
                            >
                              {opt.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Diet & Food (Questions 5–7) */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      5. Which best describes your usual diet?
                    </p>
                    <div className="grid gap-2">
                      {DIET_OPTIONS.map((opt) => {
                        const selected = dietType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDietType(opt.value)}
                            className={cn(
                              'flex items-center justify-between gap-3 rounded-sm border p-3.5 text-left transition',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-foreground hover:border-tertiary hover:bg-accent/40',
                            )}
                          >
                            <div>
                              <p className="text-sm font-semibold">{opt.label}</p>
                              <p
                                className={cn(
                                  'text-xs',
                                  selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                                )}
                              >
                                {opt.desc}
                              </p>
                            </div>
                            {selected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      6. How much cooked or fresh food gets thrown away at home?
                    </p>
                    <SegmentedControl
                      label="Food waste level"
                      value={foodWasteLevel}
                      onChange={setFoodWasteLevel}
                      options={[
                        { value: 'low', label: 'Low (almost none)' },
                        { value: 'medium', label: 'Medium (some leftovers)' },
                        { value: 'high', label: 'High (frequent)' },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      7. How often do you buy ultra-processed or packaged food?
                    </p>
                    <SegmentedControl
                      label="Packaged food frequency"
                      value={packagedFoodFreq}
                      onChange={setPackagedFoodFreq}
                      options={[
                        { value: 'rarely', label: 'Rarely' },
                        { value: 'sometimes', label: 'Sometimes' },
                        { value: 'often', label: 'Often' },
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Travel & Commute (Questions 8–11) */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      8. What is your primary mode of daily commute?
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {COMMUTE_MODES.map((m) => {
                        const selected = primaryCommuteMode === m.value;
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setPrimaryCommuteMode(m.value)}
                            className={cn(
                              'flex min-h-11 items-center justify-center rounded-sm border px-3 py-2.5 text-center text-xs font-semibold transition',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-foreground hover:border-tertiary hover:bg-accent/40',
                            )}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      9. If you use a personal vehicle, what fuel does it run on?
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {VEHICLE_FUELS.map((f) => {
                        const selected = vehicleFuel === f.value;
                        return (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() => setVehicleFuel(f.value)}
                            className={cn(
                              'flex min-h-10 items-center justify-center rounded-sm border px-2.5 py-2 text-center text-xs font-semibold transition',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-foreground hover:border-tertiary hover:bg-accent/40',
                            )}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Field
                    id="onb-commute-km"
                    label="10. One-way daily commute distance (km)"
                    hint="We double this for round-trip and weight it 5/7 days for your baseline."
                  >
                    <Input
                      id="onb-commute-km"
                      type="number"
                      min={0}
                      max={200}
                      step={0.5}
                      value={commuteDistanceKm}
                      onChange={(e) => setCommuteDistanceKm(Math.max(0, Number(e.target.value)))}
                    />
                  </Field>

                  <div className="flex flex-col justify-between gap-3 rounded-sm border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-2.5">
                      <Plane className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          11. Round-trip flights taken per year
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Amortised across 365 days in your baseline.
                        </p>
                      </div>
                    </div>
                    <Stepper
                      label="Flights per year"
                      value={flightsPerYear}
                      onChange={setFlightsPerYear}
                      min={0}
                      max={50}
                      unit="flights/yr"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Home Energy (Questions 12–13 + solar) */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">
                      12. Monthly household electricity consumption
                    </p>
                    <SegmentedControl
                      label="Electricity input mode"
                      value={kwhSource}
                      onChange={setKwhSource}
                      options={[
                        { value: 'reported', label: 'Enter kWh (units)' },
                        { value: 'from_bill', label: 'Enter monthly ₹ bill' },
                        { value: 'estimated', label: 'Estimate for me' },
                      ]}
                    />

                    {kwhSource === 'reported' && (
                      <Field
                        id="onb-kwh"
                        label="Monthly electricity units (kWh)"
                        hint="Shown as 'Units Consumed' on your electricity bill (0–2000 kWh)."
                      >
                        <Input
                          id="onb-kwh"
                          type="number"
                          min={0}
                          max={2000}
                          value={electricityKwhMonth}
                          onChange={(e) =>
                            setElectricityKwhMonth(Math.max(0, Number(e.target.value)))
                          }
                        />
                      </Field>
                    )}

                    {kwhSource === 'from_bill' && (
                      <Field
                        id="onb-bill"
                        label="Average monthly electricity bill (₹)"
                        hint="Converted to kWh using your state tariff."
                      >
                        <Input
                          id="onb-bill"
                          type="number"
                          min={0}
                          step={100}
                          value={electricityBillInr}
                          onChange={(e) =>
                            setElectricityBillInr(Math.max(0, Number(e.target.value)))
                          }
                        />
                      </Field>
                    )}

                    {kwhSource === 'estimated' && (
                      <p className="rounded-sm border border-border bg-muted/60 p-3 text-xs text-muted-foreground">
                        We will estimate your monthly kWh from your household size and cooling
                        pattern.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      13. Primary cooking fuel at home
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {COOKING_FUELS.map((f) => {
                        const selected = cookingFuel === f.value;
                        return (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() => setCookingFuel(f.value)}
                            className={cn(
                              'flex flex-col items-start gap-1 rounded-sm border p-3.5 text-left transition',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-foreground hover:border-tertiary hover:bg-accent/40',
                            )}
                          >
                            <span className="flex items-center gap-1.5 text-sm font-semibold">
                              <Flame className="size-4" aria-hidden="true" />
                              <span>{f.label}</span>
                            </span>
                            <span
                              className={cn(
                                'text-xs',
                                selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                              )}
                            >
                              {f.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/40 p-4">
                    <div className="flex items-start gap-2.5">
                      <Sun className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Rooftop solar</p>
                        <p className="text-xs text-muted-foreground">
                          Does your home or building generate rooftop solar power?
                        </p>
                      </div>
                    </div>
                    <SegmentedControl
                      className="w-36 shrink-0"
                      label="Has rooftop solar"
                      value={hasSolar ? 'yes' : 'no'}
                      onChange={(v) => setHasSolar(v === 'yes')}
                      options={[
                        { value: 'no', label: 'No' },
                        { value: 'yes', label: 'Yes' },
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Water & Waste (Questions 14–15) */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      14. Typical daily water usage (bathing, laundry, RO filter)
                    </p>
                    <SegmentedControl
                      label="Water usage level"
                      value={waterUsageLevel}
                      onChange={setWaterUsageLevel}
                      options={[
                        { value: 'low', label: 'Low (bucket / mindful)' },
                        { value: 'medium', label: 'Medium (short showers)' },
                        { value: 'high', label: 'High (long showers / bath)' },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      15. Household waste habit
                    </p>
                    <div className="grid gap-2">
                      {WASTE_HABITS.map((w) => {
                        const selected = wasteHabit === w.value;
                        return (
                          <button
                            key={w.value}
                            type="button"
                            onClick={() => setWasteHabit(w.value)}
                            className={cn(
                              'flex items-center justify-between gap-3 rounded-sm border p-3.5 text-left transition',
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-foreground hover:border-tertiary hover:bg-accent/40',
                            )}
                          >
                            <div>
                              <p className="text-sm font-semibold">{w.label}</p>
                              <p
                                className={cn(
                                  'text-xs',
                                  selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                                )}
                              >
                                {w.desc}
                              </p>
                            </div>
                            {selected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Footer */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/step/${step - 1}`)}
                    disabled={isBusy}
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    <span>Previous</span>
                  </Button>
                ) : (
                  <div />
                )}

                <Button type="submit" variant="primary" size="lg" disabled={isBusy}>
                  {isBusy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      <span>
                        {step === ONBOARDING_STEPS ? 'Computing baseline…' : 'Saving step…'}
                      </span>
                    </>
                  ) : step === ONBOARDING_STEPS ? (
                    <>
                      <span>Finish &amp; claim +100 pts</span>
                      <Sparkles className="size-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <span>Save &amp; continue</span>
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
