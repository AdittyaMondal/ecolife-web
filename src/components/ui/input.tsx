import * as React from 'react';
import { cn } from '@/lib/utils';

export const inputClassName =
  'min-h-11 w-full rounded-sm border border-input bg-card px-3.5 py-2 text-base text-foreground placeholder:text-muted-foreground transition focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    if (!label) {
      return <input ref={ref} id={id} className={cn(inputClassName, className)} {...props} />;
    }
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-xs font-semibold text-foreground">
          {label}
        </label>
        <input ref={ref} id={inputId} className={cn(inputClassName, className)} {...props} />
      </div>
    );
  },
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    if (!label) {
      return (
        <textarea
          ref={ref}
          id={id}
          className={cn(inputClassName, 'min-h-24 py-2.5', className)}
          {...props}
        />
      );
    }
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-xs font-semibold text-foreground">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(inputClassName, 'min-h-24 py-2.5', className)}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    if (!label) {
      return <select ref={ref} id={id} className={cn(inputClassName, className)} {...props} />;
    }
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-xs font-semibold text-foreground">
          {label}
        </label>
        <select ref={ref} id={selectId} className={cn(inputClassName, className)} {...props} />
      </div>
    );
  },
);
Select.displayName = 'Select';

export interface FieldProps {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ id, label, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
