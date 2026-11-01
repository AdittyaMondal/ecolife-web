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
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 p-2.5 sm:p-3 shadow-subtle backdrop-blur-md">
        {/* Left: Mode Tools (Plant, Water, Move, Remove) */}
        <div className="flex items-center gap-1 p-1 bg-muted/80 rounded-xl border border-border/60 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTool('plant')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              activeTool === 'plant'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/70',
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
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              activeTool === 'water'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/70',
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
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              activeTool === 'move'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/70',
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
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              activeTool === 'remove'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/70',
            )}
            title="Dig up and return to inventory [R]"
          >
            <Shovel className="size-3.5" aria-hidden="true" />
            <span>Remove</span>
          </button>
        </div>

        {/* Center: 6 Hotbar Tree Slots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-muted/60 rounded-xl border border-border/60">
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
                  'relative flex flex-col justify-between items-center w-14 sm:w-16 h-[72px] sm:h-[76px] p-1.5 rounded-xl border-2 transition-all select-none group shrink-0',
                  isSelected
                    ? 'border-emerald-600 bg-card shadow-md scale-105 z-10 ring-2 ring-emerald-500/30'
                    : 'border-border/80 bg-card/70 hover:bg-card hover:border-emerald-500/40 opacity-90',
                )}
                title={
                  tree
                    ? `${tree.name} (${invCount} in bag) - Press [${idx + 1}]`
                    : `Empty Slot [${idx + 1}]`
                }
              >
                {/* Top Row: Slot number & Quantity badge */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  {tree && (
                    <span className="flex items-center gap-0.5 font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded leading-none">
                      <span
                        className="size-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: tree.rarity.color }}
                      />
                      x{invCount}
                    </span>
                  )}
                </div>

                {/* Center: Pixel-art Tree Sprite */}
                <div className="flex items-center justify-center flex-1 my-0.5">
                  {tree ? (
                    <img
                      src={`/trees/${tree.slug}.png`}
                      alt={tree.name}
                      className="size-7 sm:size-8 object-contain transition-transform group-hover:scale-110 drop-shadow-xs"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                  )}
                </div>

                {/* Bottom: Tree Name (Isolated, completely free of badge overlap) */}
                <div className="w-full text-center leading-none">
                  {tree ? (
                    <span className="text-[10px] font-bold text-foreground truncate block w-full">
                      {tree.name.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-foreground/50 block">Empty</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Backpack / Inventory Open Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenInventory}
          className="gap-2 text-xs font-bold shrink-0 h-10 px-4 rounded-xl bg-emerald-950 text-white hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 shadow-xs"
        >
          <Package className="size-4" aria-hidden="true" />
          <span>Backpack &amp; Nursery</span>
        </Button>
      </div>

      {/* Mobile Controls Drawer (Virtual D-Pad and Action Button for Touch Screens) */}
      <div className="flex sm:hidden items-center justify-between p-3 rounded-2xl border border-border bg-card shadow-subtle">
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
