'use client';

import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Field, Input } from '@/components/ui/input';
import { landingPathFor, useRegister } from '@/hooks/use-auth';
import { fieldErrors } from '@/lib/errors';

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');

  const issues = fieldErrors(register.error);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      },
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
        <div className="inline-flex items-center gap-1.5 rounded-xs bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>+100 pts &amp; +50 coins after setup</span>
        </div>
        <h1 className="pt-1 text-2xl font-semibold tracking-tight text-foreground">
          Create your EcoLife account
        </h1>
        <p className="text-sm text-muted-foreground">
          Answer 15 quick lifestyle questions to calculate your baseline carbon footprint.
        </p>
      </div>

      {register.isError && <ErrorBanner title="Could not create account" error={register.error} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field id="reg-name" label="Full name" error={issues.name}>
          <Input
            id="reg-name"
            type="text"
            autoComplete="name"
            required
            placeholder="Yusuf"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field id="reg-email" label="Email address" error={issues.email}>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field
          id="reg-password"
          label="Password"
          hint="At least 8 characters."
          error={issues.password}
        >
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field id="reg-phone" label="Phone (optional)" error={issues.phone}>
          <Input
            id="reg-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={register.isPending || !name.trim() || !email.trim() || password.length < 8}
        >
          {register.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Creating account…</span>
            </>
          ) : (
            <>
              <span>Continue to 15-question setup</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="rounded-sm border border-border bg-muted p-3 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-positive hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
