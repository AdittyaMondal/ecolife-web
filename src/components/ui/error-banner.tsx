import { AlertCircle, RefreshCw } from 'lucide-react';
import { errorCode, errorMessage } from '@/lib/errors';
import { Button } from './button';

export interface ErrorBannerProps {
  title?: string;
  error: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * Geometric System:
 * Outer alert card is `rounded-lg` (28px) with `p-4` (16px) inset.
 * Inner icon tile and action button are `rounded-sm` (12px = 28 − 16).
 */
export function ErrorBanner({
  title = 'Could not complete request',
  error,
  onRetry,
  isRetrying = false,
}: ErrorBannerProps) {
  const code = errorCode(error);
  const message = errorMessage(error);

  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-card p-4 text-card-foreground"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-danger-surface text-destructive">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-destructive">{title}</h2>
            {code && (
              <span className="rounded-xs bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {code}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
          {onRetry && (
            <div className="pt-2">
              <Button variant="primary" onClick={onRetry} disabled={isRetrying}>
                <RefreshCw
                  className={isRetrying ? 'size-4 animate-spin' : 'size-4'}
                  aria-hidden="true"
                />
                <span>{isRetrying ? 'Checking…' : 'Try again'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
