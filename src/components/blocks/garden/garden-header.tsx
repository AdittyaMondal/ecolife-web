'use client';

import {
  Cloud,
  CloudOff,
  CloudUpload,
  Coins,
  Gift,
  HelpCircle,
  Leaf,
  Loader2,
  Palette,
  Sparkles,
  Sprout,
  Trees,
} from 'lucide-react';
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
  syncStatus?: 'idle' | 'saving' | 'saved' | 'error';
  onSyncToCloud?: () => void;
}

export function GardenHeader({
  state,
  userCoins = 0,
  onClaimRewardSeed,
  onOpenShop,
  syncStatus = 'idle',
  onSyncToCloud,
}: GardenHeaderProps) {
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
            {/* Cloud Sync Status Indicator */}
            {onSyncToCloud && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSyncToCloud}
                disabled={syncStatus === 'saving'}
                className="gap-1.5 text-xs h-9 bg-card border-border hover:bg-accent"
                title="Garden is synced to your cloud database account. Click to force re-sync."
              >
                {syncStatus === 'saving' && (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-amber-500" />
                    <span className="text-muted-foreground">Saving to DB...</span>
                  </>
                )}
                {syncStatus === 'saved' && (
                  <>
                    <Cloud className="size-3.5 text-positive" />
                    <span className="font-medium text-foreground">Saved to DB ✓</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <CloudOff className="size-3.5 text-destructive" />
                    <span className="text-destructive font-medium">Sync Failed (Retry)</span>
                  </>
                )}
                {syncStatus === 'idle' && (
                  <>
                    <CloudUpload className="size-3.5 text-muted-foreground" />
                    <span>Sync to DB</span>
                  </>
                )}
              </Button>
            )}

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

        {/* 3 Metric Summary Cards (Game RPG HUD Stat Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
          {/* Card 1: Planted Forest */}
          <div className="relative flex flex-col justify-between p-4 rounded-2xl border-2 border-border/80 bg-gradient-to-b from-card via-card to-emerald-950/5 dark:to-emerald-950/20 shadow-md shadow-black/5 hover:shadow-lg hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
            {/* Top decorative accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  <Sprout className="size-3.5" />
                  <span>Sanctuary Canopy</span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-black text-foreground tracking-tight">
                    {plantedCount}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {plantedCount === 1 ? 'Tree' : 'Trees'}
                  </span>
                </div>
              </div>

              <div className="size-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 border border-emerald-400/30 group-hover:scale-105 transition-transform">
                <Trees className="size-5" />
              </div>
            </div>

            {/* Micro RPG Progress Bar */}
            <div className="space-y-1.5 pt-3 mt-1 border-t border-border/60">
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="font-semibold text-foreground/80">
                  Grove Rank {Math.floor(plantedCount / 4) + 1}
                </span>
                <span>{plantedCount} planted</span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(8, ((plantedCount % 4) / 4) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Annual Carbon Offset */}
          <div className="relative flex flex-col justify-between p-4 rounded-2xl border-2 border-border/80 bg-gradient-to-b from-card via-card to-teal-950/5 dark:to-teal-950/20 shadow-md shadow-black/5 hover:shadow-lg hover:border-teal-500/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
            {/* Top decorative accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  <Leaf className="size-3.5" />
                  <span>Carbon Sequestration</span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
                    {formatKg(totalOffset, 1)}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">/ yr</span>
                </div>
              </div>

              <div className="size-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0 border border-teal-400/30 group-hover:scale-105 transition-transform">
                <Leaf className="size-5" />
              </div>
            </div>

            {/* Active Carbon Sink Status */}
            <div className="flex items-center justify-between text-[11px] pt-3 mt-1 border-t border-border/60">
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wide">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Biosphere</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-muted-foreground">
                ~{((totalOffset / 365) * 1000).toFixed(0)} g/day CO₂
              </span>
            </div>
          </div>

          {/* Card 3: Species Diversity */}
          <div className="relative flex flex-col justify-between p-4 rounded-2xl border-2 border-border/80 bg-gradient-to-b from-card via-card to-amber-950/5 dark:to-amber-950/20 shadow-md shadow-black/5 hover:shadow-lg hover:border-amber-500/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
            {/* Top decorative accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  <Sparkles className="size-3.5" />
                  <span>Species Biodiversity</span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-black text-foreground tracking-tight">
                    {uniqueSpecies}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    / 22 Discovered
                  </span>
                </div>
              </div>

              <div className="size-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 border border-amber-400/30 group-hover:scale-105 transition-transform">
                <Sparkles className="size-5" />
              </div>
            </div>

            {/* Catalog Discovery Progress Bar */}
            <div className="space-y-1.5 pt-3 mt-1 border-t border-border/60">
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="font-semibold text-foreground/80">Catalog Index</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {Math.round((uniqueSpecies / 22) * 100)}%
                </span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(6, (uniqueSpecies / 22) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
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
