'use client';

import {
  BookOpen,
  Check,
  Package,
  Sprout,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { getTreeBySlug, TREE_CATALOGUE, TREE_RARITIES } from '@/lib/tree-catalogue';
import { cn } from '@/lib/utils';
import type { GardenState } from '@/types/trees';

export interface GardenInventoryDialogProps {
  open: boolean;
  onClose: () => void;
  state: GardenState;
  onAssignToHotbar: (slotIndex: number, treeSlug: string) => void;
  onPlantNow: (treeSlug: string) => void;
}

const TABS = [
  { value: 'backpack', label: 'My Seedlings & Trees' },
  { value: 'catalogue', label: 'Species Catalogue & Odds' },
];

export function GardenInventoryDialog({
  open,
  onClose,
  state,
  onAssignToHotbar,
  onPlantNow,
}: GardenInventoryDialogProps) {
  const [tab, setTab] = React.useState('backpack');
  const [selectedSlotToEquip, setSelectedSlotToEquip] = React.useState<number>(0);

  const inventoryItems = state.inventory.filter((item) => item.quantity > 0);

  const totalSeeds = inventoryItems.reduce((acc, i) => acc + i.quantity, 0);

  const handleEquip = (treeSlug: string, slotIdx: number) => {
    onAssignToHotbar(slotIdx, treeSlug);
    toast.success(`Assigned to Hotbar Slot [${slotIdx + 1}]`);
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Package className="size-5 text-primary" aria-hidden="true" />
          <span>Gardener's Backpack &amp; Botanical Nursery</span>
        </div>
      }
      description="Manage your tree seeds, equip your hotbar, and explore species biodiversity."
      size="lg"
    >
      <div className="space-y-4 pt-1">
        {/* Navigation Tabs */}
        <SegmentedControl
          name="inventory-tab"
          label="Inventory section"
          options={TABS}
          value={tab}
          onChange={setTab}
          fullWidth
        />

        {/* Tab 1: Backpack & Inventory */}
        {tab === 'backpack' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
              <span>
                You have <strong className="text-foreground font-mono">{totalSeeds}</strong> trees
                ready to plant
              </span>
              <span>Select hotbar slot to equip:</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5].map((slot) => (
                  <button
                    key={`equip-slot-${slot}`}
                    type="button"
                    onClick={() => setSelectedSlotToEquip(slot)}
                    className={cn(
                      'size-6 rounded-xs font-mono text-xs font-bold transition-all',
                      selectedSlotToEquip === slot
                        ? 'bg-primary text-primary-foreground scale-105'
                        : 'bg-muted text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {slot + 1}
                  </button>
                ))}
              </div>
            </div>

            {inventoryItems.length === 0 ? (
              <div className="p-8 text-center border-dashed border-border rounded-lg bg-card space-y-2">
                <Sprout className="size-8 mx-auto text-muted-foreground/60" />
                <p className="text-sm font-bold text-foreground">Your backpack is empty</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Earn mystery tree seeds by logging daily carbon habits, completing goals, or
                  claiming your daily reward!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {inventoryItems.map((item) => {
                  const tree = getTreeBySlug(item.treeSlug);
                  if (!tree) return null;

                  const isEquippedInHotbar = state.hotbar.includes(tree.slug);
                  const equippedSlot = state.hotbar.indexOf(tree.slug);

                  return (
                    <Card
                      key={item.treeSlug}
                      className="p-3.5 border-border bg-card shadow-subtle flex flex-col justify-between gap-3 hover:border-primary/40 transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full shrink-0"
                              style={{ backgroundColor: tree.rarity.color }}
                            />
                            <h3 className="text-sm font-bold text-foreground leading-tight">
                              {tree.name}
                            </h3>
                          </div>
                          <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-xs">
                            x{item.quantity} in bag
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span
                            className="rounded-xs px-1.5 py-0.2 font-bold text-white text-[10px]"
                            style={{ backgroundColor: tree.rarity.color }}
                          >
                            {tree.rarity.name}
                          </span>
                          <span className="text-positive font-semibold font-mono">
                            +{tree.co2OffsetKgPerYear} kg CO₂/yr
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {tree.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {isEquippedInHotbar ? (
                            <span className="text-positive font-semibold flex items-center gap-1">
                              <Check className="size-3" /> Slot [{equippedSlot + 1}]
                            </span>
                          ) : (
                            'Not equipped'
                          )}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2.5"
                            onClick={() => handleEquip(tree.slug, selectedSlotToEquip)}
                          >
                            Equip to [{selectedSlotToEquip + 1}]
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs h-7 px-2.5"
                            onClick={() => {
                              onPlantNow(tree.slug);
                              onClose();
                            }}
                          >
                            Plant Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Botanical Tree Catalogue & Drop Rates */}
        {tab === 'catalogue' && (
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            <div className="rounded-sm border border-secondary/40 bg-secondary/10 p-3 text-xs text-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <BookOpen className="size-4" />
                <span>Tree Drop Weights &amp; Rarity Engine</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                As documented in the EcoLife gamification specification, trees drop from rewarded
                carbon reduction activities. Rarity weights determine relative odds when cracking a
                seed pack.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {TREE_RARITIES.map((r) => (
                  <span
                    key={r.slug}
                    className="inline-flex items-center gap-1 rounded-xs px-2 py-0.5 text-[11px] font-bold text-white"
                    style={{ backgroundColor: r.color }}
                  >
                    <span>{r.name}</span>
                    <span className="opacity-80">({r.dropWeight} wt)</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TREE_CATALOGUE.map((tree) => (
                <Card key={tree.slug} className="p-3.5 border-border bg-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{tree.name}</h4>
                      {tree.scientificName && (
                        <p className="text-[11px] italic text-muted-foreground">
                          {tree.scientificName}
                        </p>
                      )}
                    </div>
                    <span
                      className="rounded-xs px-2 py-0.5 text-[10px] font-bold text-white uppercase shrink-0"
                      style={{ backgroundColor: tree.rarity.color }}
                    >
                      {tree.rarity.name}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tree.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                    <span className="font-semibold text-positive font-mono">
                      +{tree.co2OffsetKgPerYear} kg CO₂e / year
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {tree.growthStages?.length || 4} growth stages
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
