import { Leaf } from 'lucide-react';
import Link from 'next/link';

/**
 * Auth Layout — concentric geometric card:
 * Outer surface `rounded-xl` (36px) with `p-6` (24px) inset,
 * so form inputs and buttons inside use `rounded-sm` (12px = 36 − 24).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col justify-between bg-background px-4 py-8">
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xs bg-secondary text-primary">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">EcoLife</span>
        </Link>
        <Link
          href="/methodology"
          className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          Methodology
        </Link>
      </header>

      <main className="mx-auto my-8 w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs">
          {children}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-md text-center text-xs text-muted-foreground">
        Every emission factor is open and sourced. Track daily, lower your footprint, earn rewards.
      </footer>
    </div>
  );
}
