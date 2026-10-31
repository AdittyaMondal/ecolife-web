'use client';

import { useQuery } from '@tanstack/react-query';
import { healthQuery } from '@/hooks/use-health';
import { ApiError } from '@/lib/fetcher';

/**
 * Sprint 0's one real screen: it proves the whole pipe — fetcher → envelope →
 * TanStack Query → eco tokens — against the Prism mock. The real Home
 * (PRD-v2 §6.2) replaces it.
 */
export default function HomePage() {
  const { data, error, isPending, refetch, isFetching } = useQuery(healthQuery());

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">EcoLife</h1>
      <p className="mt-2 text-muted-foreground">Scaffold check — the API contract, end to end.</p>

      <section
        aria-labelledby="health-heading"
        aria-busy={isPending}
        className="mt-6 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm"
      >
        <h2 id="health-heading" className="text-base font-medium">
          Backend health
        </h2>

        <div aria-live="polite" className="mt-3 min-h-16">
          {isPending ? (
            <p className="text-muted-foreground">Checking the API…</p>
          ) : error ? (
            <div>
              <p className="font-medium text-destructive">Could not reach the API.</p>
              <p className="mt-1 text-muted-foreground">
                {error instanceof ApiError ? error.message : 'Something went wrong.'}
              </p>
              {error instanceof ApiError && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">{error.code}</p>
              )}
            </div>
          ) : (
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="font-medium break-words">{data.service}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="flex items-center gap-2 font-medium">
                {/* Colour is never the only signal: the dot is paired with the word. */}
                <span aria-hidden="true" className="size-2 rounded-full bg-eco-500" />
                {data.status}
              </dd>
            </dl>
          )}
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-medium text-primary-foreground hover:bg-eco-700 hover:text-eco-50 disabled:opacity-60 dark:hover:bg-eco-300"
        >
          {isFetching ? 'Checking…' : 'Check again'}
        </button>
      </section>
    </main>
  );
}
