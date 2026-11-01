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
  const tools = [
    {
      id: 'plant' as const,
      label: 'Plant',
      shortcut: 'Space',
      icon: Sprout,
      activeColor:
        'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500/50 scale-[1.02]',
      title: 'Plant selected tree [Space or Click]',
    },
    {
      id: 'water' as const,
      label: 'Water',
      shortcut: 'W',
      icon: Droplets,
      activeColor:
        'bg-sky-600 text-white shadow-sm ring-1 ring-sky-500/50 scale-[1.02]',
      title: 'Water planted trees [Click tile]',
    },
    {
      id: 'move' as const,
      label: 'Relocate',
      shortcut: 'M',
      icon: Move,
      activeColor:
        'bg-amber-600 text-white shadow-sm ring-1 ring-amber-500/50 scale-[1.02]',
      title: 'Relocate planted tree [M or Click]',
    },
    {
      id: 'remove' as const,
      label: 'Remove',
      shortcut: 'R',
      icon: Shovel,
      activeColor:
        'bg-rose-600 text-white shadow-sm ring-1 ring-rose-500/50 scale-[1.02]',
      title: 'Dig up and return to backpack [R or Click]',
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto">
      {/* Tool Buttons & Hotbar Floating Toolbar */}
      <nav
        aria-label="Garden action toolbar"
        className="relative flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-between gap-2.5 sm:gap-3 rounded-2xl border border-border/80 bg-card/95 p-2 sm:p-2.5 shadow-lg shadow-black/5 dark:shadow-black/25 backdrop-blur-md transition-shadow hover:shadow-xl w-full"
      >
        {/* Group 1: Mode Tabs (Plant, Water, Relocate, Remove) */}
        <div
          role="radiogroup"
          aria-label="Action modes"
          className="flex items-center gap-1 p-1 bg-muted/80 dark:bg-muted/50 rounded-xl border border-border/60 shrink-0 shadow-inner"
        >
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            const Icon = tool.icon;

            return (
              <div key={tool.id} className="relative group">
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={`${tool.label} mode [${tool.shortcut}]`}
                  onClick={() => onSelectTool(tool.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all duration-200 ease-out select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    isActive
                      ? tool.activeColor
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/80',
                  )}
                  title={tool.title}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline font-semibold">{tool.label}</span>
                </button>

                {/* Floating micro-tooltip */}
                <div
                  role="tooltip"
                  className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-30 px-2 py-0.5 rounded-md bg-popover text-popover-foreground border border-border shadow-md text-[10px] font-semibold whitespace-nowrap"
                >
                  {tool.label} [{tool.shortcut}]
                </div>
              </div>
            );
          })}
        </div>

        {/* Subtle Visual Divider 1 */}
        <div
          className="hidden lg:block h-9 w-px bg-border/80 shrink-0"
          aria-hidden="true"
        />

        {/* Group 2: Center 6 Hotbar Tree Slots with Fade Edges on Mobile */}
        <div className="relative flex items-center max-w-full overflow-hidden">
          {/* Left subtle fade mask on mobile */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-card to-transparent z-10 lg:hidden"
            aria-hidden="true"
          />

          <div
            role="listbox"
            aria-label="Seed hotbar"
            className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1 max-w-full"
          >
            {state.hotbar.map((slug, idx) => {
              const isSelected = state.activeHotbarIndex === idx;
              const tree = slug ? getTreeBySlug(slug) : null;
              const invCount = slug
                ? state.inventory.find((i) => i.treeSlug === slug)?.quantity || 0
                : 0;

              return (
                <div
                  key={HOTBAR_SLOT_IDS[idx] || `hotbar_${idx}`}
                  className="relative group shrink-0"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-label={
                      tree
                        ? `${tree.name}, slot ${idx + 1}, ${invCount} seeds available`
                        : `Empty slot ${idx + 1}`
                    }
                    onClick={() => onSelectHotbarIndex(idx)}
                    className={cn(
                      'relative flex flex-col justify-between items-center w-14 sm:w-16 h-[72px] sm:h-[76px] p-1.5 rounded-xl border-2 transition-all duration-200 ease-out select-none group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      isSelected
                        ? 'border-emerald-600 bg-card shadow-md shadow-emerald-500/20 scale-[1.04] z-10 ring-2 ring-emerald-500/40 -translate-y-0.5'
                        : 'border-border/70 bg-card/75 hover:bg-card hover:border-emerald-500/50 hover:scale-[1.01] active:scale-95 opacity-90 hover:opacity-100',
                    )}
                    title={
                      tree
                        ? `${tree.name} (Press [${idx + 1}]) • ×${invCount} in bag`
                        : `Empty Slot [${idx + 1}]`
                    }
                  >
                    {/* Top Row: Keycap badge on left, Clean Quantity Pill on right */}
                    <div className="flex items-center justify-between w-full leading-none">
                      {/* Keyboard Keycap Hint Badge */}
                      <span className="size-4 rounded-xs bg-muted/90 dark:bg-muted border border-border/80 shadow-2xs font-mono text-[9px] font-bold text-muted-foreground flex items-center justify-center leading-none">
                        {idx + 1}
                      </span>

                      {/* Quantity pill (e.g. ×3) with rarity indicator */}
                      {tree && (
                        <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full leading-none shadow-2xs">
                          <span
                            className="size-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: tree.rarity.color }}
                            aria-hidden="true"
                          />
                          ×{invCount}
                        </span>
                      )}
                    </div>

                    {/* Center: Pixel-art Tree Sprite */}
                    <div className="flex items-center justify-center flex-1 my-0.5">
                      {tree ? (
                        <img
                          src={`/trees/${tree.slug}.png`}
                          alt={tree.name}
                          className="size-7 sm:size-8 object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-xs"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                      )}
                    </div>

                    {/* Bottom: Tree Name (Centered, fully free of overlapping badges) */}
                    <div className="w-full text-center leading-none">
                      {tree ? (
                        <span className="text-[10px] font-semibold text-foreground truncate block w-full">
                          {tree.name.split(' ')[0]}
                        </span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground/50 block">Empty</span>
                      )}
                    </div>
                  </button>

                  {/* Floating micro-tooltip */}
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-30 px-2 py-0.5 rounded-md bg-popover text-popover-foreground border border-border shadow-md text-[10px] font-semibold whitespace-nowrap"
                  >
                    {tree
                      ? `${tree.name} [${idx + 1}] • ×${invCount}`
                      : `Empty Slot [${idx + 1}]`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right subtle fade mask on mobile */}
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-card to-transparent z-10 lg:hidden"
            aria-hidden="true"
          />
        </div>

        {/* Subtle Visual Divider 2 */}
        <div
          className="hidden lg:block h-9 w-px bg-border/80 shrink-0"
          aria-hidden="true"
        />

        {/* Group 3: Backpack & Nursery Open Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenInventory}
          className="gap-2 text-xs font-bold shrink-0 h-10 px-3.5 sm:px-4 rounded-xl bg-emerald-950 text-emerald-50 hover:bg-emerald-900 active:scale-[0.98] border border-emerald-900/60 shadow-xs dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:border-emerald-800 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          title="Open Gardener's Backpack and Botanical Nursery [B]"
          aria-label="Open Gardener's Backpack and Botanical Nursery"
        >
          <Package className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Backpack &amp; Nursery</span>
          <span className="inline sm:hidden">Backpack</span>
        </Button>
      </nav>

      {/* Mobile Controls Drawer (Virtual D-Pad and Action Button for Touch Screens) */}
      <div className="flex sm:hidden items-center justify-between p-3 rounded-2xl border border-border/80 bg-card/95 shadow-subtle">
        {/* Virtual D-pad */}
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <Button
            variant="outline"
            size="sm"
            className="size-11 p-0 rounded-xl"
            onClick={() => onMovePlayer(0, -1, 'up')}
            aria-label="Walk Up"
          >
            <ArrowUp className="size-5" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="sm"
            className="size-11 p-0 rounded-xl"
            onClick={() => onMovePlayer(-1, 0, 'left')}
            aria-label="Walk Left"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="size-11 p-0 rounded-xl"
            onClick={() => onMovePlayer(0, 1, 'down')}
            aria-label="Walk Down"
          >
            <ArrowDown className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="size-11 p-0 rounded-xl"
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
            className="h-14 px-6 text-sm font-bold gap-2 rounded-xl shadow-md"
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
