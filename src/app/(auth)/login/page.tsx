'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Field, Input } from '@/components/ui/input';
import { landingPathFor, useLogin } from '@/hooks/use-auth';
import { fieldErrors } from '@/lib/errors';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const issues = fieldErrors(login.error);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (res) => {
          router.push(landingPathFor(res.user));
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to log today&apos;s footprint, track goals, and use your coins.
        </p>
      </div>

      {login.isError && <ErrorBanner title="Could not sign in" error={login.error} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field id="login-email" label="Email address" error={issues.email}>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link href="/forgot" className="text-xs font-semibold text-positive hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {issues.password && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {issues.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={login.isPending || !email.trim() || !password}
        >
          {login.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="rounded-sm border border-border bg-muted p-3 text-center text-sm text-muted-foreground">
        New to EcoLife?{' '}
        <Link href="/register" className="font-semibold text-positive hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
