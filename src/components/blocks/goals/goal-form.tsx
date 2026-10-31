'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Input } from '@/components/ui/input';
import { RadialDial } from '@/components/ui/radial-dial';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { type CreateGoalBody, useCreateGoal } from '@/hooks/use-goals';

const goalSchema = z
  .object({
    type: z.enum(['reduce_percent', 'absolute_cap']),
    period: z.enum(['week', 'month', 'quarter']),
    reducePercent: z.coerce.number().optional(),
    capKgPerDay: z.coerce.number().optional(),
    startDate: z.string().min(1, 'Please select a start date'),
  })
  .superRefine((values, ctx) => {
    if (values.type === 'reduce_percent') {
      if (values.reducePercent === undefined || Number.isNaN(values.reducePercent)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a reduction percentage',
          path: ['reducePercent'],
        });
      } else if (values.reducePercent < 1 || values.reducePercent > 90) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Reduction target must be between 1% and 90%',
          path: ['reducePercent'],
        });
      }
    } else if (values.type === 'absolute_cap') {
      if (values.capKgPerDay === undefined || Number.isNaN(values.capKgPerDay)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a daily cap in kg',
          path: ['capKgPerDay'],
        });
      } else if (values.capKgPerDay <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cap must be greater than 0 kg/day',
          path: ['capKgPerDay'],
        });
      }
    }
  });

type GoalFormValues = z.output<typeof goalSchema>;
type GoalFormInput = z.input<typeof goalSchema>;

const TYPE_OPTIONS = [
  {
    value: 'reduce_percent' as const,
    label: 'Reduce %',
    ariaLabel: 'Percentage reduction goal vs baseline',
  },
  {
    value: 'absolute_cap' as const,
    label: 'Daily Cap',
    ariaLabel: 'Absolute cap in kg per day',
  },
];

const PERIOD_OPTIONS = [
  { value: 'week' as const, label: 'Weekly', ariaLabel: 'One week goal' },
  { value: 'month' as const, label: 'Monthly', ariaLabel: 'One month goal' },
  { value: 'quarter' as const, label: 'Quarterly', ariaLabel: 'Three months quarterly goal' },
];

export function GoalForm() {
  const router = useRouter();
  const createMutation = useCreateGoal();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalFormInput, unknown, GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: 'reduce_percent',
      period: 'month',
      reducePercent: 15,
      capKgPerDay: 5.0,
      startDate: '',
    },
  });

  React.useEffect(() => {
    setValue('startDate', new Date().toISOString().slice(0, 10));
  }, [setValue]);

  const selectedType = watch('type');

  const onSubmit = (values: GoalFormValues) => {
    const body: CreateGoalBody = {
      type: values.type,
      period: values.period,
      startDate: values.startDate,
      ...(values.type === 'reduce_percent' ? { reducePercent: values.reducePercent } : {}),
      ...(values.type === 'absolute_cap' ? { capKgPerDay: values.capKgPerDay } : {}),
    };

    createMutation.mutate(body, {
      onSuccess: () => {
        router.push('/track');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {createMutation.isError && (
        <ErrorBanner title="Could not create goal" error={createMutation.error} />
      )}

      {/* 1. Goal Type */}
      <fieldset className="rounded-lg border border-border bg-card p-4">
        <legend className="px-1 text-base font-semibold text-foreground">
          1. What kind of target do you want to set?
        </legend>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose whether to cut emissions by a percentage relative to your baseline, or stick to an
          absolute daily limit.
        </p>

        <div className="mt-4">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                name="goal-type"
                label="Goal Type"
                options={TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </fieldset>

      {/* 2. Goal Period */}
      <fieldset className="rounded-lg border border-border bg-card p-4">
        <legend className="px-1 text-base font-semibold text-foreground">2. Duration</legend>
        <p className="mt-1 text-sm text-muted-foreground">
          How long should this challenge last? Progress is frozen over this window.
        </p>

        <div className="mt-4">
          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                name="goal-period"
                label="Goal Duration"
                options={PERIOD_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </fieldset>

      {/* 3. Matching Value Field with Rotary Radial Dial */}
      <fieldset className="rounded-lg border border-border bg-card p-5">
        <legend className="px-1 text-base font-semibold text-foreground">
          3. Set Your Target with the Dial
        </legend>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn the dial or select a quick preset to choose your commitment.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center rounded-sm border border-border/60 bg-muted/30 p-6">
          {selectedType === 'reduce_percent' ? (
            <Controller
              name="reducePercent"
              control={control}
              render={({ field }) => (
                <RadialDial
                  value={typeof field.value === 'number' ? field.value : Number(field.value) || 15}
                  min={5}
                  max={60}
                  step={1}
                  unit="%"
                  label="Reduction"
                  sublabel="vs baseline"
                  presets={[5, 10, 15, 20, 25, 30, 40]}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
          ) : (
            <Controller
              name="capKgPerDay"
              control={control}
              render={({ field }) => (
                <RadialDial
                  value={typeof field.value === 'number' ? field.value : Number(field.value) || 5.0}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="kg"
                  label="Daily Cap"
                  sublabel="max limit"
                  presets={[2, 3.5, 5, 7.5, 10, 15]}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
          )}

          {errors.reducePercent && (
            <p className="mt-3 text-xs text-destructive font-medium" role="alert">
              {errors.reducePercent.message}
            </p>
          )}
          {errors.capKgPerDay && (
            <p className="mt-3 text-xs text-destructive font-medium" role="alert">
              {errors.capKgPerDay.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* 4. Start Date */}
      <fieldset className="rounded-lg border border-border bg-card p-4">
        <legend className="px-1 text-base font-semibold text-foreground">4. Start Date</legend>
        <div className="mt-2 space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium text-foreground">
            Goal start date
          </label>
          <div className="max-w-xs">
            <Input
              id="startDate"
              type="date"
              aria-invalid={Boolean(errors.startDate)}
              aria-describedby={errors.startDate ? 'startDate-error' : undefined}
              {...register('startDate')}
            />
          </div>
          {errors.startDate && (
            <p id="startDate-error" className="text-xs text-destructive" role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              <span>Creating goal…</span>
            </>
          ) : (
            <span>Freeze &amp; Start Goal</span>
          )}
        </Button>

        <Link
          href="/track"
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-input bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
