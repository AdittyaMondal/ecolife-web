import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Geometric Concentricity:
 * Badges seated inside a `rounded-sm` (12px) row or control with `p-1` (4px) inset
 * use `rounded-xs` (8px = 12 − 4).
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-semibold tracking-tight',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        accent: 'border border-tertiary/30 bg-accent text-accent-foreground',
        muted: 'border border-border bg-muted text-muted-foreground',
        neutral: 'border border-border bg-muted text-muted-foreground',
        positive: 'border border-tertiary/40 bg-accent text-positive',
        warning: 'border border-warning/30 bg-warning-surface text-warning',
        destructive: 'border border-destructive/30 bg-danger-surface text-destructive',
        danger: 'border border-destructive/30 bg-danger-surface text-destructive',
      },
    },
    defaultVariants: {
      variant: 'accent',
    },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  tone?: BadgeVariant;
}

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant: variant ?? tone }), className)} {...props} />;
}
