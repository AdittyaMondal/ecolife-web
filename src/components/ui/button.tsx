import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Geometric Concentricity:
 * Controls seated inside a `rounded-lg` (28px) card with `p-4` (16px) inset
 * use `rounded-sm` (12px = 28 − 16).
 * Compact controls seated inside a `rounded-sm` (12px) row with `p-1` (4px) inset
 * use `rounded-xs` (8px = 12 − 4).
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-tertiary shadow-subtle hover:shadow',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-forest-600 shadow-subtle',
        tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-primary shadow-subtle',
        outline:
          'border border-border bg-card text-foreground hover:border-primary/60 hover:bg-accent/40 shadow-subtle',
        ghost: 'text-foreground hover:bg-muted',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90 shadow-subtle',
      },
      size: {
        default: 'min-h-11 rounded-sm px-4 py-2.5 text-sm',
        md: 'min-h-11 rounded-sm px-4 py-2.5 text-sm',
        lg: 'min-h-12 rounded-sm px-6 py-3 text-base',
        sm: 'min-h-9 rounded-xs px-3 py-1.5 text-xs',
        icon: 'min-h-11 min-w-11 rounded-sm p-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, type = 'button', loading = false, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
