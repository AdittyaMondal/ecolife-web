'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Field, Input } from '@/components/ui/input';
import { useVerifyEmail } from '@/hooks/use-auth';

function VerifyEmailContent() {
  const sp = useSearchParams();
  const verify = useVerifyEmail();
  const urlToken = sp.get('token') ?? '';
  const [token, setToken] = React.useState(urlToken);
  const autoTriggered = React.useRef(false);

  React.useEffect(() => {
    if (urlToken && !autoTriggered.current) {
      autoTriggered.current = true;
      verify.mutate(urlToken);
    }
  }, [urlToken, verify]);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          Confirm your email address to unlock points and coin rewards across EcoLife.
        </p>
      </div>

      {verify.isError && <ErrorBanner title="Verification failed" error={verify.error} />}

      {verify.isSuccess ? (
        <div className="space-y-4 rounded-sm border border-tertiary/40 bg-accent p-4 text-accent-foreground">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-positive" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Email verified</p>
              <p className="text-xs">
                {verify.data.message || 'Your account can now earn points and coins.'}
              </p>
            </div>
          </div>
          <Link
            href="/home"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xs bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Continue to EcoLife
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify.mutate(token.trim());
          }}
          className="space-y-4"
        >
          <Field id="verify-token" label="Verification token">
            <Input
              id="verify-token"
              type="text"
              required
              placeholder="Paste verification token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={verify.isPending || !token.trim()}
          >
            {verify.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Verifying…</span>
              </>
            ) : (
              <span>Verify email</span>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-muted" />}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}
