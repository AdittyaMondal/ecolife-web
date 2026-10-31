'use client';

import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Field, Input } from '@/components/ui/input';
import { useForgotPassword } from '@/hooks/use-auth';

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    forgot.mutate(email.trim());
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to sign in</span>
        </Link>
        <h1 className="pt-1 text-2xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we will send you a link to set a new password.
        </p>
      </div>

      {forgot.isError && <ErrorBanner title="Could not send reset link" error={forgot.error} />}

      {forgot.isSuccess ? (
        <div className="space-y-4 rounded-sm border border-tertiary/40 bg-accent p-4 text-accent-foreground">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-positive" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Check your inbox</p>
              <p className="text-xs">
                {forgot.data.message || 'If that address exists, a reset link is on its way.'}
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xs bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field id="forgot-email" label="Email address">
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={forgot.isPending || !email.trim()}
          >
            {forgot.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Sending…</span>
              </>
            ) : (
              <span>Send reset link</span>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
