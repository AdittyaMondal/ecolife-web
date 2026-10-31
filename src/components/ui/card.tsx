import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * The Geometric System:
 * - Default Card (`variant="default"`): outer radius `rounded-lg` (28px), padding `p-4` (16px).
 *   Child controls inside use `rounded-sm` (12px = 28 − 16).
 * - Media/Sub-panel Card (`variant="media"`): outer radius `rounded-lg` (28px), padding `p-2` (8px).
 *   Direct media/sub-panel children use `rounded-md` (20px = 28 − 8).
 * - Feature/Dialog Surface (`variant="feature"`): outer radius `rounded-xl` (36px), padding `p-6` (24px).
 *   Child controls inside use `rounded-sm` (12px = 36 − 24).
 */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article';
  variant?: 'default' | 'media' | 'feature' | 'secondary' | 'accent';
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ className, as: Component = 'section', variant = 'default', ...props }, ref) => {
    return (
      <Component
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          'border border-border text-card-foreground transition-colors',
          variant === 'default' && 'rounded-lg bg-card p-4',
          variant === 'media' && 'rounded-lg bg-card p-2',
          variant === 'feature' && 'rounded-xl bg-card p-6',
          variant === 'secondary' &&
            'rounded-lg border-secondary/30 bg-secondary p-4 text-secondary-foreground',
          variant === 'accent' &&
            'rounded-lg border-tertiary/30 bg-accent p-4 text-accent-foreground',
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-base font-semibold tracking-tight text-foreground', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('pt-2', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-3', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
