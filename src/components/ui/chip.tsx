import { Check } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onToggle?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Geometric Consistency:
 * Chips inside a `rounded-lg` (28px) card with `p-4` (16px) inset use `rounded-sm` (12px),
 * matching all other controls on the same surface level.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected = false, onToggle, icon, children, disabled, ...props }, ref) => {
    return (
      // biome-ignore lint/a11y/useSemanticElements: button+role=checkbox is the documented chip pattern; a native checkbox needs a hidden-input hack to style
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={selected}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition active:scale-[0.98]',
          selected
            ? 'border border-primary bg-primary font-semibold text-primary-foreground'
            : 'border border-input bg-card text-foreground hover:border-tertiary hover:bg-accent/50',
          disabled && 'cursor-not-allowed opacity-40',
          className,
        )}
        {...props}
      >
        {selected ? (
          <Check className="size-4 shrink-0" aria-hidden="true" />
        ) : (
          icon && <span className="size-4 shrink-0 text-muted-foreground">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  },
);
Chip.displayName = 'Chip';
