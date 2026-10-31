import {
  ArrowRight,
  Calendar,
  Coins,
  Flame,
  Gamepad2,
  Leaf,
  QrCode,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'EcoLife — Know what your day costs the planet & get rewarded',
  description:
    'Answer 15 questions once, then five a day. Watch your real carbon footprint move, set goals, join local events with QR passes, and spend EcoCoins in the marketplace.',
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Concentric Top Navigation Bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-sm bg-primary text-primary-foreground font-extrabold">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-foreground">EcoLife</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/methodology"
            className="hidden rounded-sm px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            Methodology
          </Link>
          <Link
            href="/about"
            className="hidden rounded-sm px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            About
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-sm border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-sm bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:bg-tertiary"
          >
            <span>Get started</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero Feature Surface: rounded-xl (36px) + p-6 (24px) -> inner rounded-sm (12px) */}
        <Card variant="feature" className="bg-secondary text-secondary-foreground border-secondary">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-5 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-xs bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                <Sparkles className="size-3.5" aria-hidden="true" />
                15-Question Baseline · Daily Tracking · Real Rewards
              </div>

              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-secondary-foreground sm:text-5xl">
                Measure your daily carbon footprint, reduce it, and earn EcoCoins.
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-secondary-foreground/80">
                Complete a 15-question lifestyle baseline across diet, transport, electricity,
                water, and waste. Log 5 quick daily questions, hit reduction goals, scan QR passes
                at local plantation and cleanup drives, and redeem coins for up to 20% off in the
                Eco Marketplace.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-tertiary"
                >
                  <span>Start 15-Question Baseline</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/home"
                  className="inline-flex h-12 items-center justify-center rounded-sm border border-secondary-foreground/25 bg-secondary-foreground/10 px-5 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary-foreground/20"
                >
                  Explore Live Demo
                </Link>
              </div>
            </div>

            {/* Concentric Preview Tiles inside Hero */}
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
              <div className="rounded-sm border border-secondary-foreground/15 bg-secondary-foreground/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Daily Footprint</span>
                  <Flame className="size-4 text-primary" />
                </div>
                <p className="text-2xl font-extrabold tabular-nums">4.2 kg CO₂e</p>
                <p className="text-xs text-secondary-foreground/75">
                  −22% below your 15-question baseline (+25 pts, +15 coins)
                </p>
              </div>

              <div className="rounded-sm border border-secondary-foreground/15 bg-secondary-foreground/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Event QR Pass</span>
                  <QrCode className="size-4 text-primary" />
                </div>
                <p className="text-2xl font-extrabold tabular-nums">+100 pts</p>
                <p className="text-xs text-secondary-foreground/75">
                  Host scans your pass at Plantation & Cleanup drives
                </p>
              </div>

              <div className="rounded-sm border border-secondary-foreground/15 bg-secondary-foreground/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Eco Marketplace</span>
                  <Coins className="size-4 text-primary" />
                </div>
                <p className="text-2xl font-extrabold tabular-nums">Up to 20% Off</p>
                <p className="text-xs text-secondary-foreground/75">
                  Redeem EcoCoins on indoor plants & sustainable household goods
                </p>
              </div>

              <div className="rounded-sm border border-secondary-foreground/15 bg-secondary-foreground/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">EcoLife Valley</span>
                  <Gamepad2 className="size-4 text-primary" />
                </div>
                <p className="text-2xl font-extrabold">2D Farm Game</p>
                <p className="text-xs text-secondary-foreground/75">
                  Unlock 2D trees, crops & character skins with your coins
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Core Pillars Grid */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-positive">
                How EcoLife Works
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                One integrated system from daily habits to real-world action
              </h2>
            </div>
            <Badge tone="primary">4 Core Modules</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Flame,
                title: '1. Home & Leaderboard',
                desc: 'See your daily carbon emissions vs. baseline, 7-day trend, 30-day category breakdown, and live points ranking on the global and city leaderboards.',
              },
              {
                icon: Target,
                title: '2. Track & Goals',
                desc: 'Answer 5 daily questions (travel, meals, AC hours, water, waste) to compute today’s footprint and lock in 7, 14, or 30-day reduction goals.',
              },
              {
                icon: ShoppingBag,
                title: '3. Eco Marketplace',
                desc: 'Shop indoor plants and eco-friendly household items. Apply your earned EcoCoins for instant discounts up to 20% off (10 coins = ₹1).',
              },
              {
                icon: Calendar,
                title: '4. Drives & QR Passes',
                desc: 'Create or register for Plantation & Cleanup drives. Attendees get a QR pass; hosts scan passes on event day to award points and coins.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="flex flex-col justify-between p-4 space-y-4">
                  <div className="space-y-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-sm bg-accent text-positive">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="rounded-sm border border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold text-positive">
                    Credits Points + EcoCoins
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-positive" />
            <span>Every emission factor is published openly with its scientific source.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/methodology" className="font-semibold text-positive hover:underline">
              Carbon Methodology
            </Link>
            <Link href="/about" className="font-semibold text-positive hover:underline">
              About EcoLife
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
