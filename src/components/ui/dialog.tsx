'use client';

import { X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Light dismiss (`any`) or Esc-only (`closerequest`). Defaults to `any`. */
  closedBy?: 'any' | 'closerequest' | 'none';
}

const SIZE_CLASSES: Record<NonNullable<ModalDialogProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Native `<dialog>` modal following modern web platform patterns:
 * - Opened via `dialog.showModal()` so the browser manages top-layer, inert background,
 *   focus containment, `::backdrop`, `Esc` dismissal, and focus restoration.
 * - No manual `role="dialog"` or `aria-modal` (provided natively by `showModal()`).
 * - Uses `closedby` attribute with pointer coordinates fallback for browsers without native `closedBy`.
 * - Geometric System: outer surface `rounded-xl` (36px) with `p-6` (24px) inset,
 *   so internal controls use `rounded-sm` (12px = 36 − 24).
 */
export function ModalDialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
  closedBy = 'any',
}: ModalDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Fallback for browsers where `HTMLDialogElement.prototype.closedBy` is not yet supported
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || closedBy !== 'any') return;
    if ('closedBy' in HTMLDialogElement.prototype) return;

    const outside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = outside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && outside(e)) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, [closedBy]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      {...({ closedby: closedBy } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      onClose={() => {
        if (dialogRef.current) dialogRef.current.returnValue = '';
        onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-32px)] rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl open:flex open:flex-col open:gap-4',
        SIZE_CLASSES[size],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p id={descId} className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close dialog"
          className="inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-muted text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-4">{children}</div>
    </dialog>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'destructive' | 'secondary' | 'outline';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <ModalDialog open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          size="sm"
          onClick={onConfirm}
          disabled={loading}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </ModalDialog>
  );
}
