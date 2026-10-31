import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
    isPositive?: boolean;
  };
}

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, description, trend, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col', className)} {...props}>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="tabular text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {value}
          </span>
        </div>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        {trend && (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-sm font-medium',
              trend.isPositive
                ? 'text-positive'
                : trend.direction === 'neutral'
                  ? 'text-muted-foreground'
                  : 'text-destructive',
            )}
          >
            <span aria-hidden="true">
              {trend.direction === 'down' ? '▼' : trend.direction === 'up' ? '▲' : '—'}
            </span>
            <span>{trend.text}</span>
          </div>
        )}
      </div>
    );
  },
);
Stat.displayName = 'Stat';
