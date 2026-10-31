import Link from 'next/link';

/**
 * The public landing page at `/`.
 *
 * A Server Component with no session dependency, so it is indexable and cheap.
 * Middleware sends an authenticated visitor to `/home` before this renders —
 * see `src/middleware.ts` and PRD-v2 §9.1 for why `/` stayed public.
 */
export const metadata = {
  title: 'EcoLife — know what your day costs the planet',
  description:
    'Answer 15 questions once, then five a day. Watch your real carbon footprint move, ' +
    'set goals, join local events and earn rewards for bringing it down.',
};

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-4 py-16">
      <div className="flex flex-col gap-5">
        <p className="font-medium text-primary text-sm uppercase tracking-wide">EcoLife</p>
        <h1 className="text-balance font-semibold text-4xl text-foreground leading-tight sm:text-5xl">
          Know what your day actually costs the planet.
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground leading-relaxed">
          Most carbon calculators ask thirty questions once and show you the same number forever.
          EcoLife asks fifteen to set your baseline, then five a day to keep it honest — so the
          number moves when you do.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/register"
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-lg border border-input px-5 font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          Sign in
        </Link>
      </div>

      <p className="text-muted-foreground text-sm">
        Every emission factor we use is published, with its source, on{' '}
        <Link href="/methodology" className="text-primary underline underline-offset-4">
          our methodology page
        </Link>
        .
      </p>
    </main>
  );
}
