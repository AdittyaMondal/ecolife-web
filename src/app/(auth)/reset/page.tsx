'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Field, Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks/use-auth';

function ResetForm() {
  const sp = useSearchParams();
  const reset = useResetPassword();

  const [token, setToken] = React.useState(sp.get('token') ?? '');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reset.mutate({ token: token.trim(), password });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Choose a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Setting a new password signs out every existing session on your account.
        </p>
      </div>

      {reset.isError && <ErrorBanner title="Could not reset password" error={reset.error} />}

      {reset.isSuccess ? (
        <div className="space-y-4 rounded-sm border border-tertiary/40 bg-accent p-4 text-accent-foreground">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-positive" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Password updated</p>
              <p className="text-xs">{reset.data.message || 'You can now sign in.'}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xs bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field id="reset-token" label="Reset token">
            <Input
              id="reset-token"
              type="text"
              required
              placeholder="Paste token from email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Field>

          <Field id="reset-password" label="New password" hint="At least 8 characters.">
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={reset.isPending || !token.trim() || password.length < 8}
          >
            {reset.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Updating…</span>
              </>
            ) : (
              <span>Save new password</span>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-muted" />}>
      <ResetForm />
    </React.Suspense>
  );
}
