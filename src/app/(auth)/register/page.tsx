'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Building2, CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Field, Input } from '@/components/ui/input';
import { landingPathFor, useRegister } from '@/hooks/use-auth';
import { orgLookupQuery } from '@/hooks/use-organization';
import { fieldErrors } from '@/lib/errors';

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [orgCode, setOrgCode] = React.useState('');

  const cleanOrgCode = orgCode.trim();
  const isSixDigits = /^\d{6}$/.test(cleanOrgCode);
  const lookupQuery = useQuery(orgLookupQuery(cleanOrgCode));

  const issues = fieldErrors(register.error);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cleanOrgCode) {
      if (!isSixDigits || lookupQuery.isError) {
        return;
      }
    }
    register.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(cleanOrgCode && isSixDigits ? { organizationCode: cleanOrgCode } : {}),
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

        <Field
          id="reg-orgcode"
          label="Organization Code (optional)"
          hint="Have a 6-digit code from your company, NGO, or partner? Enter it here to link your account."
          error={
            cleanOrgCode.length > 0 && !isSixDigits
              ? 'Organization code must be exactly 6 digits.'
              : lookupQuery.isError
                ? (lookupQuery.error as { message?: string })?.message ||
                  'No approved organization found with this code.'
                : issues.organizationCode
          }
        >
          <div className="relative">
            <Input
              id="reg-orgcode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="e.g. 482910"
              className="font-mono tracking-widest uppercase pr-10"
              value={orgCode}
              onChange={(e) => setOrgCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {lookupQuery.isFetching && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
              )}
              {!lookupQuery.isFetching && isSixDigits && lookupQuery.data?.valid && (
                <CheckCircle2 className="size-4 text-positive" aria-hidden="true" />
              )}
              {!lookupQuery.isFetching && isSixDigits && lookupQuery.isError && (
                <XCircle className="size-4 text-destructive" aria-hidden="true" />
              )}
            </div>
          </div>

          {/* Validated Organization Preview Banner */}
          {isSixDigits && lookupQuery.data?.valid && (
            <div className="mt-2 flex items-center gap-2 rounded-xs border border-positive/30 bg-positive/5 px-2.5 py-1.5 text-xs text-positive font-medium">
              <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span>
                Linking to: <strong>{lookupQuery.data.name}</strong> (
                {lookupQuery.data.type === 'industry'
                  ? 'Corporate'
                  : lookupQuery.data.type === 'ngo'
                    ? 'Community'
                    : 'Marketplace'}{' '}
                Partner)
              </span>
            </div>
          )}
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={
            register.isPending ||
            !name.trim() ||
            !email.trim() ||
            password.length < 8 ||
            (cleanOrgCode.length > 0 &&
              (!isSixDigits || lookupQuery.isError || lookupQuery.isFetching))
          }
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

      <div className="rounded-sm border border-primary/20 bg-primary/5 p-3 text-center text-xs text-muted-foreground">
        Represent an industry, NGO, or eco-brand?{' '}
        <Link href="/partner-register" className="font-semibold text-primary hover:underline">
          Register as a Partner Organization &rarr;
        </Link>
      </div>
    </div>
  );
}
