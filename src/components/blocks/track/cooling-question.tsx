import { SegmentedControl } from '@/components/ui/segmented-control';
import type { DailyAnswers } from '@/hooks/use-track';

export interface CoolingQuestionProps {
  value: DailyAnswers['acHoursBucket'];
  onChange: (value: NonNullable<DailyAnswers['acHoursBucket']>) => void;
}

const AC_OPTIONS = [
  { value: '0' as const, label: '0', ariaLabel: 'Zero hours of air conditioning' },
  { value: '1_3' as const, label: '1–3 h', ariaLabel: 'One to three hours of air conditioning' },
  { value: '4_8' as const, label: '4–8 h', ariaLabel: 'Four to eight hours of air conditioning' },
  {
    value: '8_plus' as const,
    label: '8 h+',
    ariaLabel: 'More than eight hours of air conditioning',
  },
];

export function CoolingQuestion({ value, onChange }: CoolingQuestionProps) {
  return (
    <fieldset className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-base font-semibold text-foreground">
        3. How long was the AC on?
      </legend>
      <p className="mt-1 text-sm text-muted-foreground">
        Air conditioning is the single largest driver of household electricity consumption.
      </p>

      <div className="mt-4">
        <SegmentedControl
          name="ac-hours"
          label="AC hours used today"
          options={AC_OPTIONS}
          value={value ?? '0'}
          onChange={onChange}
        />
      </div>
    </fieldset>
  );
}
