import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedControlOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string | number> {
  name?: string;
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  fullWidth?: boolean;
  'aria-label'?: string;
}

/**
 * Geometric Concentricity:
 * Outer track is `rounded-sm` (12px) with `p-1` (4px) inset and `gap-1` (4px).
 * Each inner segment is `rounded-xs` (8px = 12px − 4px).
 */
export function SegmentedControl<T extends string | number>({
  name,
  options,
  value,
  onChange,
  disabled = false,
  className,
  label,
  fullWidth = true,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const currentIndex = options.findIndex((opt) => opt.value === value);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = options.length - 1;
    }

    if (nextIndex >= 0) {
      const nextOption = options[nextIndex];
      if (nextOption && !nextOption.disabled) {
        onChange(nextOption.value);
        const buttons =
          containerRef.current?.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
        buttons?.[nextIndex]?.focus();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label || ariaLabel || name}
      onKeyDown={handleKeyDown}
      className={cn(
        'grid auto-cols-fr grid-flow-col gap-1 rounded-sm border border-border bg-muted p-1',
        fullWidth && 'w-full',
        className,
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const isDisabled = disabled || opt.disabled;

        return (
          // biome-ignore lint/a11y/useSemanticElements: role=radio on a button is the ARIA radiogroup pattern; native radios cannot be styled as adjoining segments
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={opt.ariaLabel}
            tabIndex={isSelected ? 0 : -1}
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) onChange(opt.value);
            }}
            className={cn(
              'flex min-h-10 min-w-0 flex-1 items-center justify-center rounded-xs px-3 py-2 text-center text-sm transition',
              isSelected
                ? 'bg-primary font-semibold text-primary-foreground shadow-2xs'
                : 'font-medium text-muted-foreground hover:bg-card/70 hover:text-foreground',
              isDisabled && 'cursor-not-allowed opacity-40',
            )}
          >
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
