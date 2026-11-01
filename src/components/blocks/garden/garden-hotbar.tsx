'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Droplets,
  Move,
  Package,
  Shovel,
  Sparkles,
  Sprout,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { getTreeBySlug } from '@/lib/tree-catalogue';
import { cn } from '@/lib/utils';
import type { GardenState } from '@/types/trees';

const HOTBAR_SLOT_IDS = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6'] as const;

export interface GardenHotbarProps {
  state: GardenState;
  activeTool: 'plant' | 'water' | 'remove' | 'move';
  onSelectTool: (tool: 'plant' | 'water' | 'remove' | 'move') => void;
  onSelectHotbarIndex: (index: number) => void;
  onOpenInventory: () => void;
  onMovePlayer: (dx: number, dy: number, dir: 'up' | 'down' | 'left' | 'right') => void;
  onActionButton: () => void;
}

export function GardenHotbar({
  state,
  activeTool,
  onSelectTool,
  onSelectHotbarIndex,
  onOpenInventory,
  onMovePlayer,
  onActionButton,
}: GardenHotbarProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto">
      {/* Tool Buttons & Hotbar Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-border bg-card/95 p-3 shadow-subtle backdrop-blur-md">
        {/* Left: Mode Tools (Plant, Water, Move, Remove) */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-md border border-border">
          <button
            type="button"
            onClick={() => onSelectTool('plant')}
            className={cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold transition-all',
              activeTool === 'plant'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/60',
            )}
            title="Plant active tree [Space]"
          >
            <Sprout className="size-3.5" aria-hidden="true" />
            <span>Plant</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('water')}
            className={cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold transition-all',
              activeTool === 'water'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/60',
            )}
            title="Water tree to promote growth"
          >
            <Droplets className="size-3.5" aria-hidden="true" />
            <span>Water</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('move')}
            className={cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold transition-all',
              activeTool === 'move'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/60',
            )}
            title="Move / Relocate tree [M]"
          >
            <Move className="size-3.5" aria-hidden="true" />
            <span>Relocate</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('remove')}
            className={cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold transition-all',
              activeTool === 'remove'
                ? 'bg-destructive text-destructive-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/60',
            )}
            title="Dig up and return to inventory [R]"
          >
            <Shovel className="size-3.5" aria-hidden="true" />
            <span>Remove</span>
          </button>
        </div>

        {/* Center: 6 Hotbar Tree Slots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-muted/70 rounded-md border border-border">
          {state.hotbar.map((slug, idx) => {
            const isSelected = state.activeHotbarIndex === idx;
            const tree = slug ? getTreeBySlug(slug) : null;
            const invCount = slug
              ? state.inventory.find((i) => i.treeSlug === slug)?.quantity || 0
              : 0;

            return (
              <button
                key={HOTBAR_SLOT_IDS[idx] || `hotbar_${idx}`}
                type="button"
                onClick={() => onSelectHotbarIndex(idx)}
                className={cn(
                  'relative flex flex-col items-center justify-center size-14 rounded-sm border-2 transition-all select-none',
                  isSelected
                    ? 'border-primary bg-card shadow-md scale-105 z-10 ring-2 ring-primary/40'
                    : 'border-border bg-card/60 hover:bg-card hover:border-primary/50 opacity-90',
                )}
                title={
                  tree
                    ? `${tree.name} (${invCount} in bag) - Press [${idx + 1}]`
                    : `Empty Slot [${idx + 1}]`
                }
              >
                {/* Slot Number Pill */}
                <span className="absolute top-1 left-1.5 font-mono text-[9px] font-bold text-muted-foreground">
                  {idx + 1}
                </span>

                {/* Tree Icon & Rarity Bar */}
                {tree ? (
                  <>
                    <span
                      className="size-2 rounded-full absolute top-1.5 right-1.5"
                      style={{ backgroundColor: tree.rarity.color }}
                    />
                    <span className="font-mono text-sm font-extrabold text-foreground tracking-tight pt-2">
                      🌲
                    </span>
                    <span className="text-[10px] font-bold truncate max-w-[50px] leading-tight text-foreground">
                      {tree.name.split(' ')[0]}
                    </span>
                    {/* Quantity Badge */}
                    <span className="absolute bottom-0.5 right-1 font-mono text-[10px] font-extrabold text-primary">
                      x{invCount}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground/60 font-mono">—</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Backpack / Inventory Open Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenInventory}
          className="gap-1.5 text-xs font-bold shrink-0 h-10"
        >
          <Package className="size-4" aria-hidden="true" />
          <span>Backpack &amp; Nursery</span>
        </Button>
      </div>

      {/* Mobile Controls Drawer (Virtual D-Pad and Action Button for Touch Screens) */}
      <div className="flex sm:hidden items-center justify-between p-3 rounded-lg border border-border bg-card shadow-subtle">
        {/* Virtual D-pad */}
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <Button
            variant="outline"
            size="sm"
            className="size-11 p-0 rounded-sm"
            onClick={() => onMovePlayer(0, -1, 'up')}
            aria-label="Walk Up"
          >
            <ArrowUp className="size-5" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="sm"
            className="size-11 p-0 rounded-sm"
            onClick={() => onMovePlayer(-1, 0, 'left')}
            aria-label="Walk Left"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="size-11 p-0 rounded-sm"
            onClick={() => onMovePlayer(0, 1, 'down')}
            aria-label="Walk Down"
          >
            <ArrowDown className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="size-11 p-0 rounded-sm"
            onClick={() => onMovePlayer(1, 0, 'right')}
            aria-label="Walk Right"
          >
            <ArrowRight className="size-5" />
          </Button>
        </div>

        {/* Large Action Button */}
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onActionButton}
            className="h-14 px-6 text-sm font-bold gap-2 rounded-md shadow-md"
          >
            <Sparkles className="size-4" />
            <span>
              {activeTool === 'remove'
                ? 'Dig Up'
                : activeTool === 'water'
                  ? 'Water'
                  : activeTool === 'move'
                    ? 'Move'
                    : 'Plant Tree'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
