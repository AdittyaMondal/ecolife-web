import { ArrowLeft, Coins, Gamepad2, Leaf, QrCode, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'About — EcoLife',
  description:
    'Learn how EcoLife turns daily carbon tracking, reduction goals, and community drives into real-world rewards.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to EcoLife
        </Link>
        <Badge tone="primary">About EcoLife</Badge>
      </div>

      <Card variant="feature" className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-xs bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
          <Leaf className="size-3.5 text-positive" />
          Our Mission
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Making daily carbon reduction measurable, social, and rewarding
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          EcoLife combines a scientifically grounded 15-question lifestyle baseline with a 60-second
          daily check-in, personal reduction goals, community plantation & cleanup drives, and an
          Eco Marketplace where your positive habits unlock real discounts.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Sparkles className="size-4 text-positive" />
            <span>Points vs. EcoCoins</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>EcoPoints</strong> never decrease—they measure your lifetime climate
            contribution and rank you on the global and city leaderboards. <strong>EcoCoins</strong>{' '}
            are your spendable currency: redeem them for up to 20% off in the Marketplace (10 coins
            = ₹1) or save them for trees and skins in EcoLife Valley.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Target className="size-4 text-positive" />
            <span>Baseline & Daily Goals</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            When you register, 15 questions across household energy, commute, diet, water, and waste
            establish your daily CO₂e benchmark. Each day you log below your baseline or complete a
            7/14/30-day goal, you earn bonus points and coins.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <QrCode className="size-4 text-positive" />
            <span>Community Events & QR Passes</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Anyone can organize a local plantation drive, garbage cleanup drive, or recycling
            workshop. Attendees receive a unique QR pass (`ecolife://pass/…`); when the host scans
            the pass at the venue, both attendee and host are rewarded.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Gamepad2 className="size-4 text-positive" />
            <span>EcoLife Valley (2D Farm Roadmap)</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Coming soon: a cozy 2D Stardew Valley-inspired homestead where your EcoCoins buy native
            saplings, solar farm buildings, and character outfits tied directly to your real-world
            habits.
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Coins className="size-4 text-positive" />
          <span>Want to inspect the exact numbers behind our calculations?</span>
        </div>
        <Link
          href="/methodology"
          className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-3.5 text-xs font-bold text-primary-foreground transition hover:bg-tertiary"
        >
          View Carbon Methodology
        </Link>
      </div>
    </div>
  );
}
