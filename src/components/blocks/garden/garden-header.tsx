'use client';

import { Coins, Gift, HelpCircle, Leaf, Palette, Sprout, Trees } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { formatKg, formatNumber } from '@/lib/format';
import type { GardenState } from '@/types/trees';

export interface GardenHeaderProps {
  state: GardenState;
  userCoins?: number;
  onClaimRewardSeed: () => void;
  onOpenShop?: () => void;
}

export function GardenHeader({ state, userCoins = 0, onClaimRewardSeed, onOpenShop }: GardenHeaderProps) {
  const [helpOpen, setHelpOpen] = React.useState(false);

  const plantedCount = state.plantedTrees.length;
  const totalOffset = state.stats.totalOffsetKgPerYear;

  // Count unique species
  const uniqueSpecies = new Set(state.plantedTrees.map((t) => t.treeSlug)).size;

  return (
    <>
      <div className="space-y-4">
        {/* Main Title & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xs bg-secondary text-primary">
                <Trees className="size-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-positive">
                EcoLife 2D Gamification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              My Botanical Pixel Garden
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Every tree you plant absorbs carbon dioxide and enriches biodiversity. Move your
              gardener around, arrange your trees, and harvest seasonal seedling rewards!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Garden Shop & Wardrobe modal button */}
            {onOpenShop && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenShop}
                className="gap-1.5 text-xs h-9 bg-card hover:bg-accent border-border"
                title="Customize character skin and garden layout"
              >
                <Palette className="size-3.5 text-primary" aria-hidden="true" />
                <span>Shop & Wardrobe</span>
                {userCoins > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 px-1.5 py-0.2 text-[10px] font-bold">
                    <Coins className="size-2.5" />
                    {formatNumber(userCoins)}
                  </span>
                )}
              </Button>
            )}

            {/* Help / Controls modal button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHelpOpen(true)}
              className="gap-1.5 text-xs h-9"
              title="View game controls & rules"
            >
              <HelpCircle className="size-3.5" aria-hidden="true" />
              <span>How to Play</span>
            </Button>

            {/* Claim Mystery Seed Pack Reward */}
            <Button
              variant="primary"
              size="sm"
              onClick={onClaimRewardSeed}
              className="gap-2 text-xs font-bold h-9 shadow-md"
            >
              <Gift className="size-4" aria-hidden="true" />
              <span>Open Mystery Seed Pack</span>
            </Button>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 border-border bg-card shadow-subtle flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Planted Forest
              </span>
              <p className="font-mono text-2xl font-extrabold text-foreground">
                {plantedCount} {plantedCount === 1 ? 'Tree' : 'Trees'}
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-sm bg-secondary/30 text-primary">
              <Sprout className="size-5" />
            </span>
          </Card>

          <Card className="p-4 border-border bg-card shadow-subtle flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Annual Carbon Offset
              </span>
              <p className="font-mono text-2xl font-extrabold text-positive">
                {formatKg(totalOffset, 1)}/yr
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-sm bg-accent/60 text-positive">
              <Leaf className="size-5" />
            </span>
          </Card>

          <Card className="p-4 border-border bg-card shadow-subtle flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Species Diversity
              </span>
              <p className="font-mono text-2xl font-extrabold text-foreground">
                {uniqueSpecies} Species
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-sm bg-secondary/30 text-primary">
              <Trees className="size-5" />
            </span>
          </Card>
        </div>
      </div>

      {/* Game Controls & Instructions Modal */}
      <ModalDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Garden Controls &amp; Gameplay"
        description="Here is how to explore, plant, and tend to your 2D pixel garden."
        size="md"
      >
        <div className="space-y-4 text-xs text-foreground pt-1">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <span>🎮 Movement &amp; Hotbar Controls</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded-sm bg-muted border border-border">
                <span className="font-bold text-foreground block">W / A / S / D or Arrows</span>
                <span className="text-muted-foreground">Move gardener around the garden</span>
              </div>
              <div className="p-2 rounded-sm bg-muted border border-border">
                <span className="font-bold text-foreground block">Keys [1] .. [6]</span>
                <span className="text-muted-foreground">Quick-select tree from hotbar</span>
              </div>
              <div className="p-2 rounded-sm bg-muted border border-border">
                <span className="font-bold text-foreground block">Space / Enter / E</span>
                <span className="text-muted-foreground">Plant tree or perform active tool</span>
              </div>
              <div className="p-2 rounded-sm bg-muted border border-border">
                <span className="font-bold text-foreground block">Key [R] / Backspace</span>
                <span className="text-muted-foreground">Dig up tree &amp; return to inventory</span>
              </div>
              <div className="p-2 rounded-sm bg-muted border border-border">
                <span className="font-bold text-foreground block">Key [M]</span>
                <span className="text-muted-foreground">Relocate / Move a planted tree</span>
              </div>
              <div className="p-2 rounded-sm bg-muted border border-border">
                <span className="font-bold text-foreground block">Mouse / Touch Click</span>
                <span className="text-muted-foreground">Click any tile to plant/move directly</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <span>🌳 Tree Rewards &amp; Carbon Offsets</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Every tree planted in your garden contributes to your real annual carbon offset
              balance. Higher rarity tiers (Rare, Epic, Legendary) sequester up to 88 kg CO₂ per
              year! Removing a tree digs it up safely and returns it directly to your backpack.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setHelpOpen(false)}>
              Got it, let's garden!
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  );
}
