'use client';

import { Check, Coins, Lock, Palette, PawPrint, Sparkles, User } from 'lucide-react';
import * as React from 'react';
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

  const tabs = [
    { id: 'skins' as const, label: 'Outfits', icon: User, count: SKIN_ITEMS.length },
    { id: 'biomes' as const, label: 'Biomes', icon: Palette, count: BIOME_ITEMS.length },
    { id: 'pets' as const, label: 'Companions', icon: PawPrint, count: PET_ITEMS.length },
  ];
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Botanical Garden Shop & Sanctuary"
      description="Spend your earned EcoCoins to unlock stylish gardener skins, garden biomes, and free-roaming animal companions."
      /*
       * max-w-5xl matches the garden page wrapper so the shop is the same width
       * as the toolbar, and the translate re-centres it on the CONTENT column.
       *
       * ModalDialog uses `m-auto` on a native <dialog>, which centres on the
       * VIEWPORT — but the page content sits in a column offset by the fixed
       * sidebar (`md:pl-72 lg:pl-80` in the app layout). Viewport-centred
       * therefore reads as shifted left of the toolbar above it. Shifting right
       * by HALF the sidebar offset puts the dialog's centre on the column's
       * centre, so both cards share a left and right edge. No transform below
       * `md`, where there is no sidebar.
       */
      className="sm:max-w-5xl max-h-[88vh] h-[88vh] flex flex-col overflow-hidden md:translate-x-[9rem] lg:translate-x-[10rem]"
    >
      <div className="shrink-0 space-y-4 pt-1">
        {/* EcoCoins HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-3 shadow-subtle">
          <div className="flex items-center gap-3">
            <span className="relative flex size-10 items-center justify-center rounded-full border-2 border-amber-500/40 bg-amber-500/15 text-amber-500">
              <Coins className="size-5" />
              {/* the shine */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"
              />
            </span>
            <div className="leading-none">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                EcoCoins Balance
              </p>
              <p className="mt-1 font-mono text-2xl font-extrabold tabular-nums text-foreground">
                {formatNumber(userCoins)}
                <span className="ml-1 text-xs font-semibold text-muted-foreground">coins</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Earn coins via daily logs &amp; goals</span>
          </div>
        </div>

        {/* Segmented pill tabs with a sliding indicator */}
        <div
          role="tablist"
          aria-label="Shop categories"
          className="relative grid grid-cols-3 gap-1 rounded-full border-2 border-border bg-muted/50 p-1"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-1 rounded-full bg-primary shadow-subtle transition-transform duration-200 ease-out"
            style={{
              width: `calc((100% - 0.5rem) / ${tabs.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative z-10 flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  selected
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none',
                    selected ? 'bg-primary-foreground/20' : 'bg-foreground/10',
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 pb-2">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {activeTab === 'skins' &&
            SKIN_ITEMS.map((skin) => {
              const isUnlocked = unlockedSkins.has(skin.id);
              const isEquipped = currentSkinId === skin.id;
              return (
                <ShopCard
                  key={skin.id}
                  name={skin.name}
                  description={skin.description}
                  priceCoins={skin.priceCoins}
                  userCoins={userCoins}
                  owned={isUnlocked}
                  active={isEquipped}
                  activeLabel="Equipped"
                  ownedCta="Equip Outfit"
                  buyCta={`Buy for ${skin.priceCoins} Coins`}
                  tint={tintForPrice(skin.priceCoins)}
                  onEquip={() => onEquipSkin(skin.id)}
                  onBuy={() => onBuySkin(skin)}
                  preview={
                    <img
                      src={`/sprites/${skin.id}_down_0.png`}
                      alt=""
                      className="size-20 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-110"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  }
                />
              );
            })}

          {activeTab === 'biomes' &&
            BIOME_ITEMS.map((biome) => {
              const isUnlocked = unlockedBiomes.has(biome.id);
              const isEquipped = currentBiomeId === biome.id;
              return (
                <ShopCard
                  key={biome.id}
                  name={biome.name}
                  description={biome.description}
                  priceCoins={biome.priceCoins}
                  userCoins={userCoins}
                  owned={isUnlocked}
                  active={isEquipped}
                  activeLabel="Active Biome"
                  ownedCta="Set as Biome"
                  buyCta={`Buy for ${biome.priceCoins} Coins`}
                  tint={tintForPrice(biome.priceCoins)}
                  onEquip={() => onEquipBiome(biome.id)}
                  onBuy={() => onBuyBiome(biome)}
                  preview={
                    <img
                      src={`/maps/${biome.id}.png`}
                      alt=""
                      className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  }
                  previewFills
                />
              );
            })}

          {activeTab === 'pets' &&
            PET_ITEMS.map((pet) => {
              const isUnlocked = unlockedPets.has(pet.id);
              const isRoaming = activePetIds.has(pet.id);
              return (
                <ShopCard
                  key={pet.id}
                  name={pet.name}
                  description={pet.description}
                  priceCoins={pet.priceCoins}
                  userCoins={userCoins}
                  owned={isUnlocked}
                  active={isRoaming}
                  activeLabel="Roaming"
                  ownedCta={isRoaming ? 'Send Home' : 'Let Roam'}
                  buyCta={`Adopt for ${pet.priceCoins} Coins`}
                  rarity={pet.rarity}
                  tint={RARITY_TINT[pet.rarity] ?? tintForPrice(pet.priceCoins)}
                  onEquip={() => onTogglePetRoam(pet.id)}
                  onBuy={() => onBuyPet(pet)}
                  preview={
                    <img
                      src={`/sprites/pets/${pet.id}_idle_0.png`}
                      alt=""
                      className="size-16 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-110"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  }
                />
              );
            })}
        </div>
      </div>
    </ModalDialog>
  );
}

/** Rarity -> preview gradient. Keeps the green palette, tints only the frame. */
const RARITY_TINT: Record<string, string> = {
  common: 'from-primary/10 to-primary/5',
  rare: 'from-sky-500/20 to-primary/5',
  exotic: 'from-fuchsia-500/20 to-primary/5',
  legendary: 'from-amber-500/25 to-primary/5',
};

/** No rarity on skins or biomes, so price stands in for it. */
function tintForPrice(price: number): string {
  if (price === 0) return RARITY_TINT.common as string;
  if (price <= 150) return RARITY_TINT.rare as string;
  if (price <= 300) return RARITY_TINT.exotic as string;
  return RARITY_TINT.legendary as string;
}

type ShopCardProps = {
  name: string;
  description: string;
  priceCoins: number;
  userCoins: number;
  owned: boolean;
  active: boolean;
  activeLabel: string;
  ownedCta: string;
  buyCta: string;
  tint: string;
  rarity?: string;
  preview: React.ReactNode;
  previewFills?: boolean;
  onEquip: () => void;
  onBuy: () => void;
};

/**
 * One collectible card, shared by all three tabs.
 *
 * Presentational only: every handler is passed in, so the three tabs keep the
 * exact behaviour they had when each rendered its own near-identical block.
 */
function ShopCard({
  name,
  description,
  priceCoins,
  userCoins,
  owned,
  active,
  activeLabel,
  ownedCta,
  buyCta,
  tint,
  rarity,
  preview,
  previewFills,
  onEquip,
  onBuy,
}: ShopCardProps) {
  const canAfford = userCoins >= priceCoins;
  const shortfall = priceCoins - userCoins;

  return (
    <Card
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border-2 p-0 transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.98]',
        active
          ? 'border-primary shadow-[0_0_0_3px_rgba(27,77,62,0.18)]'
          : 'border-border/80 hover:border-primary/50',
      )}
    >
      {active && (
        <span className="absolute right-0 top-3 z-10 flex items-center gap-1 rounded-l-full bg-primary py-1 pl-2.5 pr-3 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-subtle">
          <Check className="size-3" />
          Active
        </span>
      )}

      {/* Framed preview */}
      <div
        className={cn(
          'relative flex h-28 items-center justify-center overflow-hidden border-b-2 border-border/60 bg-gradient-to-br',
          tint,
          !owned && 'saturate-50',
          previewFills && 'p-0',
        )}
      >
        {preview}
        {!owned && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-bold text-muted-foreground backdrop-blur-sm">
            <Lock className="size-3" />
            Locked
          </span>
        )}
        {rarity && (
          <span className="absolute bottom-2 left-2 rounded-full bg-background/85 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
            {rarity}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold leading-tight text-foreground">{name}</h4>
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <Coins className="size-3" aria-hidden="true" />
            {priceCoins === 0 ? 'Free' : priceCoins}
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>

        {/* CTA pinned to the bottom, so cards line up whatever the text length */}
        <div className="mt-auto pt-2">
          {active ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-9 w-full text-xs"
              aria-label={`${name} is ${activeLabel.toLowerCase()}`}
            >
              <Check className="mr-1 size-3.5 text-primary" />
              {activeLabel}
            </Button>
          ) : owned ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full text-xs transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              onClick={onEquip}
              aria-label={`${ownedCta}: ${name}`}
            >
              {ownedCta}
            </Button>
          ) : canAfford ? (
            <Button
              variant="primary"
              size="sm"
              className="h-9 w-full animate-glow text-xs motion-reduce:animate-none"
              onClick={onBuy}
              aria-label={`${buyCta}: ${name}`}
            >
              <Coins className="mr-1 size-3.5" aria-hidden="true" />
              {buyCta}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-9 w-full border-dashed text-xs text-muted-foreground opacity-100"
              aria-label={`${name} costs ${priceCoins} coins. You need ${shortfall} more.`}
            >
              <Lock className="mr-1 size-3.5" aria-hidden="true" />
              Need {formatNumber(shortfall)} more coins
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
