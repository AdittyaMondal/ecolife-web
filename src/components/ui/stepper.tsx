import { Minus, Plus } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StepperProps {
  id?: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  unit?: string;
  'aria-describedby'?: string;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      min = 0,
      max,
      step = 1,
      disabled = false,
      className,
      unit,
      'aria-describedby': ariaDescribedBy,
    },
    ref,
  ) => {
    const handleDecrement = () => {
      if (disabled || value <= min) return;
      onChange(Math.max(min, value - step));
    };

    const handleIncrement = () => {
      if (disabled || (max !== undefined && value >= max)) return;
      onChange(max !== undefined ? Math.min(max, value + step) : value + step);
    };

    const isMin = value <= min;
    const isMax = max !== undefined && value >= max;
    const accessibleLabel = label || 'value';

    return (
      // biome-ignore lint/a11y/useSemanticElements: spinbutton is correct for a +/- stepper; a bare number input loses the 44px touch targets
      <div
        ref={ref}
        role="group"
        aria-label={label ? `${label} stepper` : 'Number stepper'}
        className={cn('inline-flex items-center gap-2', className)}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || isMin}
          aria-label={`Decrease ${accessibleLabel}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-input bg-card text-foreground shadow-xs transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>

        <div className="flex min-w-12 flex-col items-center justify-center px-1">
          <span
            id={id}
            aria-live="polite"
            aria-atomic="true"
            aria-describedby={ariaDescribedBy}
            className="text-lg font-semibold tabular-nums text-foreground"
          >
            {value}
          </span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || isMax}
          aria-label={`Increase ${accessibleLabel}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-input bg-card text-foreground shadow-xs transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  },
);
Stepper.displayName = 'Stepper';
