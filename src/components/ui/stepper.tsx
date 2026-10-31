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

/**
 * Concentric Stepper:
 * Outer group is `rounded-sm` (12px) with `p-1` (4px) inset.
 * Inner +/- buttons are `rounded-xs` (8px = 12px − 4px).
 */
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
        className={cn(
          'inline-flex items-center gap-1 rounded-sm border border-border bg-muted p-1',
          className,
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || isMin}
          aria-label={`Decrease ${accessibleLabel}`}
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xs bg-card text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>

        <div className="flex min-w-12 flex-col items-center justify-center px-2">
          <span
            id={id}
            aria-live="polite"
            aria-atomic="true"
            aria-describedby={ariaDescribedBy}
            className="tabular text-base font-semibold text-foreground"
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
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xs bg-card text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  },
);
Stepper.displayName = 'Stepper';
