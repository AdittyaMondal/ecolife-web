import { SegmentedControl } from '@/components/ui/segmented-control';
import type { DailyAnswers } from '@/hooks/use-track';

export interface BathingQuestionProps {
  value: DailyAnswers['bathChoice'];
  onChange: (value: NonNullable<DailyAnswers['bathChoice']>) => void;
}

const BATH_OPTIONS = [
  { value: 'bucket' as const, label: 'Bucket', ariaLabel: 'Bucket bath (approx. 15-20 litres)' },
  {
    value: 'short_shower' as const,
    label: 'Short shower',
    ariaLabel: 'Short shower under 5 minutes',
  },
  {
    value: 'long_shower' as const,
    label: 'Long shower',
    ariaLabel: 'Long shower over 5 minutes',
  },
];

export function BathingQuestion({ value, onChange }: BathingQuestionProps) {
  return (
    <fieldset className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-base font-semibold text-foreground">
        4. How did you bathe?
      </legend>
      <p className="mt-1 text-sm text-muted-foreground">
        Water heating and shower duration create a substantial energy footprint.
      </p>

      <div className="mt-4">
        <SegmentedControl
          name="bath-choice"
          label="Bathing method today"
          options={BATH_OPTIONS}
          value={value ?? 'bucket'}
          onChange={onChange}
        />
      </div>
    </fieldset>
  );
}
