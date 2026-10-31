import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/60 p-6 text-center',
          className,
        )}
        {...props}
      >
        {icon && (
          <div className="mb-3 flex size-12 items-center justify-center rounded-sm bg-accent text-accent-foreground">
            {icon}
          </div>
        )}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  },
);
EmptyState.displayName = 'EmptyState';
