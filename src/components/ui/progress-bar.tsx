import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorClassName?: string;
  label?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, indicatorClassName, label, ...props }, ref) => {
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
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full bg-primary transition-all duration-300',
            indicatorClassName,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  },
);
ProgressBar.displayName = 'ProgressBar';
