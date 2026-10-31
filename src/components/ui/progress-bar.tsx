import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorClassName?: string;
  label?: string;
  tone?: 'primary' | 'positive' | 'warning' | 'danger';
}

const TONE_CLASS: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  primary: 'bg-primary',
  positive: 'bg-tertiary',
  warning: 'bg-warning',
  danger: 'bg-destructive',
};

/**
 * Concentric ProgressBar:
 * Outer track is `rounded-xs` (8px) with `p-0.5` (2px) inset; inner bar is `rounded-[6px]`.
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, indicatorClassName, label, tone = 'primary', ...props }, ref) => {
    const safeMax = max > 0 ? max : 100;
    const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
        className={cn('relative h-3 w-full overflow-hidden rounded-xs bg-muted p-0.5', className)}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-[6px] transition-all duration-300',
            TONE_CLASS[tone],
            indicatorClassName,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  },
);
ProgressBar.displayName = 'ProgressBar';
