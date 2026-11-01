'use client';

import { Check, Coins, Lock, Palette, PawPrint, Sparkles, User, Wand2 } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { formatNumber } from '@/lib/format';
import { BIOME_ITEMS, SKIN_ITEMS } from '@/lib/garden-shop-catalogue';
import { PET_ITEMS } from '@/lib/pet-catalogue';
import { cn } from '@/lib/utils';
import type {
  CharacterSkinId,
  GardenBiomeId,
  GardenState,
  PetId,
  ShopItemBiome,
  ShopItemPet,
  ShopItemSkin,
} from '@/types/trees';

export interface GardenShopDialogProps {
  open: boolean;
  onClose: () => void;
  state: GardenState;
  userCoins: number;
  onEquipSkin: (skinId: CharacterSkinId) => void;
  onBuySkin: (skin: ShopItemSkin) => void;
  onEquipBiome: (biomeId: GardenBiomeId) => void;
  onBuyBiome: (biome: ShopItemBiome) => void;
  onTogglePetRoam: (petId: PetId) => void;
  onBuyPet: (pet: ShopItemPet) => void;
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
  onTogglePetRoam,
  onBuyPet,
}: GardenShopDialogProps) {
  const [activeTab, setActiveTab] = React.useState<'skins' | 'biomes' | 'pets'>('skins');

  const unlockedSkins = React.useMemo(
    () => new Set(state.unlockedSkins || ['gardener_default']),
    [state.unlockedSkins],
  );

  const unlockedBiomes = React.useMemo(
    () => new Set(state.unlockedBiomes || ['meadow']),
    [state.unlockedBiomes],
  );

  const unlockedPets = React.useMemo(
    () => new Set(state.unlockedPets || ['dog']),
    [state.unlockedPets],
  );

  const activePetIds = React.useMemo(
    () => new Set(state.activePetIds || ['dog']),
    [state.activePetIds],
  );

  const currentSkinId = state.activeSkinId || 'gardener_default';
  const currentBiomeId = state.activeBiomeId || 'meadow';

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Botanical Garden Shop & Sanctuary"
      description="Spend your earned EcoCoins to unlock stylish gardener skins, garden biomes, and free-roaming animal companions."
      className="sm:max-w-2xl max-h-[85vh] h-[85vh] flex flex-col overflow-hidden"
    >
      {/* Top Controls: EcoCoin Balance & Tab Switcher (pinned) */}
      <div className="shrink-0 space-y-3 pt-1">
        {/* EcoCoin Balance Banner */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-subtle">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <Coins className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                EcoCoins Balance
              </p>
              <p className="font-mono text-lg font-extrabold text-foreground">
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
              'flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-md transition-all',
              activeTab === 'skins'
                ? 'bg-primary text-primary-foreground shadow-subtle'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <User className="size-4" />
            <span>Outfits ({SKIN_ITEMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('biomes')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-md transition-all',
              activeTab === 'biomes'
                ? 'bg-primary text-primary-foreground shadow-subtle'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Palette className="size-4" />
            <span>Biomes ({BIOME_ITEMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pets')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-md transition-all',
              activeTab === 'pets'
                ? 'bg-primary text-primary-foreground shadow-subtle'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <PawPrint className="size-4" />
            <span>Companions ({PET_ITEMS.length})</span>
          </button>
        </div>
      </div>

      {/* Scrollable Items Container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-2">

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
                    'p-4 flex flex-col justify-between transition-all duration-200 border-2 rounded-xl shadow-xs hover:shadow-md',
                    isEquipped
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                      : 'border-border/80 bg-card hover:border-primary/40 hover:-translate-y-0.5',
                  )}
                >
                  <div className="space-y-2.5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="size-11 rounded-lg flex items-center justify-center border border-border bg-muted/40 shadow-xs p-1">
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
                        <Badge
                          variant="positive"
                          className="text-[10px] uppercase font-bold py-0.5"
                        >
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
                    'p-4 flex flex-col justify-between transition-all duration-200 border-2 rounded-xl shadow-xs hover:shadow-md',
                    isEquipped
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                      : 'border-border/80 bg-card hover:border-primary/40 hover:-translate-y-0.5',
                  )}
                >
                  <div className="space-y-2.5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {/* Real layout map thumbnail */}
                        <div className="size-11 rounded-lg overflow-hidden border border-border shadow-xs bg-muted shrink-0">
                          <img
                            src={`/maps/${biome.id}.png`}
                            alt={biome.name}
                            className="size-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground leading-tight">
                            {biome.name}
                          </h4>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {biome.priceCoins === 0
                              ? 'Default Biome'
                              : `${biome.priceCoins} EcoCoins`}
                          </span>
                        </div>
                      </div>

                      {isEquipped ? (
                        <Badge
                          variant="positive"
                          className="text-[10px] uppercase font-bold py-0.5"
                        >
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

                    {/* Full layout map preview banner */}
                    <div className="w-full h-24 rounded-md overflow-hidden border border-border/80 shadow-2xs bg-muted relative">
                      <img
                        src={`/maps/${biome.id}.png`}
                        alt={biome.name}
                        className="size-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                      />
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

        {/* TAB 3: Animal Companions & Legendary Pets */}
        {activeTab === 'pets' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PET_ITEMS.map((pet) => {
              const isUnlocked = unlockedPets.has(pet.id);
              const isRoaming = activePetIds.has(pet.id);
              const canAfford = userCoins >= pet.priceCoins;

              const rarityBadge =
                pet.rarity === 'legendary'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : pet.rarity === 'exotic'
                    ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';

              return (
                <Card
                  key={pet.id}
                  className={cn(
                    'p-4 flex flex-col justify-between transition-all duration-200 border-2 rounded-xl shadow-xs hover:shadow-md',
                    isRoaming
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                      : 'border-border/80 bg-card hover:border-primary/40 hover:-translate-y-0.5',
                  )}
                >
                  <div className="space-y-2.5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* Pet Sprite Preview */}
                        <div className="size-12 rounded-lg border border-border/80 shadow-xs bg-muted/60 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={`/sprites/pets/${pet.id}_idle_0.png`}
                            alt={pet.name}
                            className="size-10 object-contain hover:scale-110 transition-transform"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-foreground leading-tight">
                              {pet.name}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground block">
                            {pet.unlockedByDefault
                              ? 'Starter Companion (Free)'
                              : `${pet.priceCoins} EcoCoins`}
                          </span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                          rarityBadge,
                        )}
                      >
                        {pet.rarity}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pet.description}
                    </p>

                    {/* Special Idle Behavior Banner */}
                    <div className="rounded-md bg-muted/50 p-2 border border-border/60 flex items-center gap-1.5 text-[11px] text-foreground font-medium">
                      <Sparkles className="size-3 text-amber-500 shrink-0" />
                      <span className="line-clamp-1">{pet.idleBehavior}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-2 border-t border-border/60 flex items-center justify-end">
                    {isUnlocked ? (
                      <Button
                        variant={isRoaming ? 'primary' : 'outline'}
                        size="sm"
                        className={cn(
                          'w-full text-xs h-8 font-semibold transition-all',
                          isRoaming
                            ? 'bg-primary text-primary-foreground shadow-2xs'
                            : 'hover:bg-primary/10 hover:text-primary',
                        )}
                        onClick={() => onTogglePetRoam(pet.id)}
                      >
                        {isRoaming ? (
                          <>
                            <Check className="size-3.5 mr-1" />
                            Roaming in Garden (Active)
                          </>
                        ) : (
                          <>
                            <PawPrint className="size-3.5 mr-1" />
                            Release into Garden
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!canAfford}
                        className="w-full text-xs h-8"
                        onClick={() => onBuyPet(pet)}
                      >
                        <Coins className="size-3.5 mr-1" />
                        Adopt for {pet.priceCoins} Coins
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pinned Bottom Footer */}
      <div className="shrink-0 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Tip: You can adopt pets and choose which ones roam freely in your garden!
        </span>
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </ModalDialog>
  );
}
