'use client';

import { Award, Check, Sparkles, Sprout } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ModalDialog } from '@/components/ui/dialog';
import type { Tree } from '@/types/trees';

export interface TreeRewardDialogProps {
  tree: Tree | null;
  open: boolean;
  onClose: () => void;
  onPlantNow: (treeSlug: string) => void;
}

export function TreeRewardDialog({ tree, open, onClose, onPlantNow }: TreeRewardDialogProps) {
  if (!tree) return null;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-5" />
          <span>New Tree Species Unlocked!</span>
        </div>
      }
      description="You received a tree reward from your sustainability actions."
      size="sm"
    >
      <div className="flex flex-col items-center text-center space-y-4 py-3">
        {/* Animated Celebration Aura */}
        <div className="relative flex items-center justify-center">
          <div
            className="size-24 rounded-full flex items-center justify-center shadow-lg border-2 animate-bounce"
            style={{
              backgroundColor: `${tree.rarity.color}20`,
              borderColor: tree.rarity.color,
            }}
          >
            <span className="text-4xl">🌲</span>
          </div>
          <span className="absolute -top-1 -right-1 text-2xl animate-spin">✨</span>
        </div>

        {/* Tree Details */}
        <div className="space-y-1">
          <span
            className="rounded-xs px-2.5 py-0.5 text-xs font-extrabold text-white uppercase tracking-wider"
            style={{ backgroundColor: tree.rarity.color }}
          >
            {tree.rarity.name} Tier
          </span>
          <h3 className="text-xl font-extrabold tracking-tight text-foreground pt-1">
            {tree.name}
          </h3>
          {tree.scientificName && (
            <p className="text-xs italic text-muted-foreground">{tree.scientificName}</p>
          )}
          <p className="text-xs text-muted-foreground max-w-xs mx-auto pt-1 leading-relaxed">
            {tree.description}
          </p>
        </div>

        {/* CO2 Impact Pill */}
        <div className="flex items-center gap-1.5 rounded-sm bg-accent border border-tertiary/40 px-3 py-1.5">
          <Sprout className="size-4 text-positive" />
          <span className="font-mono text-xs font-bold text-positive">
            Sequester +{tree.co2OffsetKgPerYear} kg CO₂e / year
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
            Keep in Backpack
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onPlantNow(tree.slug);
              onClose();
            }}
            className="flex-1 font-bold"
          >
            Plant in Garden
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
}
