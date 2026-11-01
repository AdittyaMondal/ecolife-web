'use client';

import { Check, Coins, Lock, Palette, Sparkles, User, Wand2 } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { BIOME_ITEMS, SKIN_ITEMS } from '@/lib/garden-shop-catalogue';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CharacterSkinId, GardenBiomeId, GardenState, ShopItemBiome, ShopItemSkin } from '@/types/trees';

export interface GardenShopDialogProps {
  open: boolean;
  onClose: () => void;
  state: GardenState;
  userCoins: number;
  onEquipSkin: (skinId: CharacterSkinId) => void;
  onBuySkin: (skin: ShopItemSkin) => void;
  onEquipBiome: (biomeId: GardenBiomeId) => void;
  onBuyBiome: (biome: ShopItemBiome) => void;
}

export function GardenShopDialog({
  open,
  onClose,
  state,
  userCoins,
  onEquipSkin,
  onBuySkin,
  onEquipBiome,
  onBuyBiome,
}: GardenShopDialogProps) {
  const [activeTab, setActiveTab] = React.useState<'skins' | 'biomes'>('skins');

  const unlockedSkins = React.useMemo(
    () => new Set(state.unlockedSkins || ['gardener_default']),
    [state.unlockedSkins],
  );

  const unlockedBiomes = React.useMemo(
    () => new Set(state.unlockedBiomes || ['meadow']),
    [state.unlockedBiomes],
  );

  const currentSkinId = state.activeSkinId || 'gardener_default';
  const currentBiomeId = state.activeBiomeId || 'meadow';

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Botanical Garden Shop & Wardrobe"
      description="Spend your earned EcoCoins to unlock stylish gardener skins and breathtaking environmental garden biomes."
      className="sm:max-w-2xl max-h-[85vh] flex flex-col"
    >
      <div className="space-y-4 pt-2 flex-1 overflow-y-auto pr-1">
        {/* EcoCoin Balance Banner */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <Coins className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                EcoCoins Balance
              </p>
              <p className="font-mono text-xl font-extrabold text-foreground">
                {formatNumber(userCoins)}{' '}
                <span className="text-xs font-medium text-muted-foreground">coins</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-full font-medium">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Earn coins via daily logs & goals</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('skins')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all',
              activeTab === 'skins'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <User className="size-4" />
            <span>Character Outfits ({SKIN_ITEMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('biomes')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all',
              activeTab === 'biomes'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Palette className="size-4" />
            <span>Garden Biomes ({BIOME_ITEMS.length})</span>
          </button>
        </div>

        {/* TAB 1: Character Skins */}
        {activeTab === 'skins' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SKIN_ITEMS.map((skin) => {
              const isUnlocked = unlockedSkins.has(skin.id);
              const isEquipped = currentSkinId === skin.id;
              const canAfford = userCoins >= skin.priceCoins;

              return (
                <Card
                  key={skin.id}
                  className={cn(
                    'p-4 flex flex-col justify-between transition-all border',
                    isEquipped
                      ? 'border-primary/80 ring-1 ring-primary/40 bg-primary/5'
                      : 'border-border bg-card hover:border-border/80',
                  )}
                >
                  <div className="space-y-2.5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="size-11 rounded-lg flex items-center justify-center border border-border bg-muted/40 shadow-xs p-1"
                        >
                          <img
                            src={`/sprites/${skin.id}_down_0.png`}
                            alt={skin.name}
                            className="size-full object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground leading-tight">
                            {skin.name}
                          </h4>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {skin.priceCoins === 0 ? 'Starter Skin' : `${skin.priceCoins} EcoCoins`}
                          </span>
                        </div>
                      </div>

                      {isEquipped ? (
                        <Badge variant="positive" className="text-[10px] uppercase font-bold py-0.5">
                          Active
                        </Badge>
                      ) : isUnlocked ? (
                        <Badge variant="neutral" className="text-[10px] uppercase font-bold py-0.5">
                          Owned
                        </Badge>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                          <Lock className="size-3" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {skin.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-1 border-t border-border/60 flex items-center justify-end">
                    {isEquipped ? (
                      <Button variant="outline" size="sm" disabled className="w-full text-xs h-8">
                        <Check className="size-3.5 mr-1 text-primary" />
                        Equipped
                      </Button>
                    ) : isUnlocked ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => onEquipSkin(skin.id)}
                      >
                        Equip Outfit
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!canAfford}
                        className="w-full text-xs h-8"
                        onClick={() => onBuySkin(skin)}
                      >
                        <Coins className="size-3.5 mr-1" />
                        Buy for {skin.priceCoins} Coins
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 2: Garden Biomes */}
        {activeTab === 'biomes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BIOME_ITEMS.map((biome) => {
              const isUnlocked = unlockedBiomes.has(biome.id);
              const isEquipped = currentBiomeId === biome.id;
              const canAfford = userCoins >= biome.priceCoins;

              return (
                <Card
                  key={biome.id}
                  className={cn(
                    'p-4 flex flex-col justify-between transition-all border',
                    isEquipped
                      ? 'border-primary/80 ring-1 ring-primary/40 bg-primary/5'
                      : 'border-border bg-card hover:border-border/80',
                  )}
                >
                  <div className="space-y-2.5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {/* Real tile images preview */}
                        <div className="size-11 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 border border-border shadow-xs bg-muted">
                          <img
                            src={`/tiles/${biome.id}_grass.png`}
                            alt="Grass"
                            className="size-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <img
                            src={`/tiles/${biome.id}_path.png`}
                            alt="Path"
                            className="size-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <img
                            src={`/tiles/${biome.id}_water.png`}
                            alt="Water"
                            className="size-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <img
                            src={`/tiles/${biome.id}_fence.png`}
                            alt="Fence"
                            className="size-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground leading-tight">
                            {biome.name}
                          </h4>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {biome.priceCoins === 0 ? 'Default Biome' : `${biome.priceCoins} EcoCoins`}
                          </span>
                        </div>
                      </div>

                      {isEquipped ? (
                        <Badge variant="positive" className="text-[10px] uppercase font-bold py-0.5">
                          Active
                        </Badge>
                      ) : isUnlocked ? (
                        <Badge variant="neutral" className="text-[10px] uppercase font-bold py-0.5">
                          Owned
                        </Badge>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                          <Lock className="size-3" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {biome.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-1 border-t border-border/60 flex items-center justify-end">
                    {isEquipped ? (
                      <Button variant="outline" size="sm" disabled className="w-full text-xs h-8">
                        <Check className="size-3.5 mr-1 text-primary" />
                        Applied
                      </Button>
                    ) : isUnlocked ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => onEquipBiome(biome.id)}
                      >
                        Apply Biome
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!canAfford}
                        className="w-full text-xs h-8"
                        onClick={() => onBuyBiome(biome)}
                      >
                        <Coins className="size-3.5 mr-1" />
                        Buy for {biome.priceCoins} Coins
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Tip: You can change your outfits and biomes any time for free once unlocked!
        </span>
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </ModalDialog>
  );
}
