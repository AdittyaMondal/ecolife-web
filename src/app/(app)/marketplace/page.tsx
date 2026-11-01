'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Check,
  Coins,
  Gamepad2,
  Leaf,
  Lock,
  MapPin,
  Package,
  Palette,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Sprout,
  Trash2,
  Trees,
  User,
  PawPrint,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ModalDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Input, Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Stepper } from '@/components/ui/stepper';
import { meQuery } from '@/hooks/use-auth';
import { useGarden } from '@/hooks/use-garden';
import {
  addressesQuery,
  cartPreviewQuery,
  cartQuery,
  type ProductCategory,
  type ProductSort,
  productsInfiniteQuery,
  useAddToCart,
  useCreateAddress,
  usePlaceOrder,
  useRemoveFromCart,
  useSetCartQuantity,
} from '@/hooks/use-marketplace';
import { BIOME_ITEMS, SKIN_ITEMS } from '@/lib/garden-shop-catalogue';
import { PET_ITEMS } from '@/lib/pet-catalogue';
import { formatKg, formatNumber, formatPaise } from '@/lib/format';
import { getProductImageUrl } from '@/lib/images';
import { cn } from '@/lib/utils';

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All items' },
  { value: 'plants', label: 'Plants & Saplings' },
  { value: 'household', label: 'Household' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'stationery', label: 'Stationery' },
];

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'co2_desc', label: 'Highest CO₂e saved' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const CATEGORY_LABEL: Record<string, string> = {
  plants: 'Plants',
  household: 'Household',
  kitchen: 'Kitchen',
  personal_care: 'Personal Care',
  stationery: 'Stationery',
};

export default function MarketplacePage() {
  const router = useRouter();
  const [marketTab, setMarketTab] = React.useState<'products' | 'garden'>('products');
  const [gardenTab, setGardenTab] = React.useState<'skins' | 'biomes' | 'pets'>('skins');
  const [category, setCategory] = React.useState<ProductCategory | 'all'>('all');
  const [sort, setSort] = React.useState<ProductSort>('newest');
  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [cartOpen, setCartOpen] = React.useState(false);

  const {
    state: gardenState,
    equipSkin,
    buyAndEquipSkin,
    equipBiome,
    buyAndEquipBiome,
    togglePetRoam,
    buyPet,
  } = useGarden();

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(searchInput.trim()), 250);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const me = useQuery(meQuery());
  const products = useInfiniteQuery(
    productsInfiniteQuery({
      category: category === 'all' ? undefined : category,
      q: debouncedQuery || undefined,
      sort,
    }),
  );
  const cart = useQuery(cartQuery());

  const addToCart = useAddToCart();
  const setCartQty = useSetCartQuantity();
  const removeFromCart = useRemoveFromCart();

  const allProducts = React.useMemo(
    () => products.data?.pages.flatMap((p) => p.items) ?? [],
    [products.data],
  );

  const cartItems = cart.data?.items ?? [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartByProductId = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const item of cartItems) {
      map.set(item.product.id, item.quantity);
    }
    return map;
  }, [cartItems]);

  const coinsBalance = me.data?.wallet.coinsBalance ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-positive">
            Eco Marketplace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Low-Impact Essentials & Plants
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Redeem your EcoCoins for up to 20% off verified sustainable products (10 coins = ₹1).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-11 items-center gap-2 rounded-sm border border-border bg-card px-3 text-xs font-semibold">
            <Coins className="size-4 text-positive" aria-hidden="true" />
            <span className="tabular-nums font-bold">{formatNumber(coinsBalance)}</span>
            <span className="text-muted-foreground">coins available</span>
          </div>

          <Link href="/marketplace/orders">
            <Button variant="outline" size="md">
              <Package className="size-4" />
              Orders
            </Button>
          </Link>

          <Button variant="primary" size="md" onClick={() => setCartOpen(true)}>
            <ShoppingBag className="size-4" />
            <span>Cart</span>
            <span className="rounded-xs bg-neutral-900/15 px-1.5 py-0.5 text-xs font-extrabold tabular-nums">
              {cartCount}
            </span>
          </Button>
        </div>
      </header>

      {/* Top Level Category Tabs: Products vs Garden Customization */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setMarketTab('products')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-all',
            marketTab === 'products'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <ShoppingBag className="size-4" />
          <span>Eco Store & Plants</span>
        </button>

        <button
          type="button"
          onClick={() => setMarketTab('garden')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-all',
            marketTab === 'garden'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Gamepad2 className="size-4 text-amber-500" />
          <span>Botanical Garden Outfits & Biomes</span>
          <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
            Coins
          </span>
        </button>
      </div>

      {marketTab === 'garden' ? (
        <div className="space-y-6">
          {/* Garden Sub-Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-xs bg-secondary text-primary">
                  <Trees className="size-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-positive">
                  2D Pixel Garden Wardrobe
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Character Outfits & Garden Biomes
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Unlock exclusive retro pixel skins and environmental biomes for your 2D botanical garden. All purchases persist to your account.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/garden">
                <Button variant="primary" size="md" className="gap-2 shadow-xs">
                  <Gamepad2 className="size-4" />
                  <span>Launch 2D Garden</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Sub-Tabs: Skins vs Biomes */}
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <button
              type="button"
              onClick={() => setGardenTab('skins')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all',
                gardenTab === 'skins'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <User className="size-4" />
              <span>Character Outfits ({SKIN_ITEMS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setGardenTab('biomes')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all',
                gardenTab === 'biomes'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Palette className="size-4" />
              <span>Garden Biomes ({BIOME_ITEMS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setGardenTab('pets')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all',
                gardenTab === 'pets'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <PawPrint className="size-4" />
              <span>Companions & Pets ({PET_ITEMS.length})</span>
            </button>
          </div>

          {/* Skins Grid */}
          {gardenTab === 'skins' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SKIN_ITEMS.map((skin) => {
                const isUnlocked = (gardenState.unlockedSkins || ['gardener_default']).includes(skin.id);
                const isEquipped = (gardenState.activeSkinId || 'gardener_default') === skin.id;
                const canAfford = coinsBalance >= skin.priceCoins;

                return (
                  <Card
                    key={skin.id}
                    className={cn(
                      'p-5 flex flex-col justify-between transition-all border',
                      isEquipped
                        ? 'border-primary ring-1 ring-primary/40 bg-primary/5'
                        : 'border-border bg-card hover:border-border/80',
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg flex items-center justify-center border border-border bg-muted/40 shadow-xs p-1">
                            <img
                              src={`/sprites/${skin.id}_down_0.png`}
                              alt={skin.name}
                              className="size-full object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">{skin.name}</h3>
                            <span className="text-xs font-mono font-semibold text-muted-foreground">
                              {skin.priceCoins === 0 ? 'Starter Skin (Free)' : `${skin.priceCoins} EcoCoins`}
                            </span>
                          </div>
                        </div>

                        {isEquipped ? (
                          <Badge variant="positive" className="text-[10px] uppercase font-bold py-0.5">
                            Equipped
                          </Badge>
                        ) : isUnlocked ? (
                          <Badge variant="neutral" className="text-[10px] uppercase font-bold py-0.5">
                            Owned
                          </Badge>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Lock className="size-3.5" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {skin.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-border/60">
                      {isEquipped ? (
                        <Button variant="outline" size="sm" disabled className="w-full text-xs">
                          <Check className="size-3.5 mr-1.5 text-primary" />
                          Currently Wearing
                        </Button>
                      ) : isUnlocked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => equipSkin(skin.id)}
                        >
                          Equip Outfit
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!canAfford}
                          className="w-full text-xs"
                          onClick={() => buyAndEquipSkin(skin, coinsBalance)}
                        >
                          <Coins className="size-3.5 mr-1.5" />
                          Buy for {skin.priceCoins} Coins
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Biomes Grid */}
          {gardenTab === 'biomes' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BIOME_ITEMS.map((biome) => {
                const isUnlocked = (gardenState.unlockedBiomes || ['meadow']).includes(biome.id);
                const isEquipped = (gardenState.activeBiomeId || 'meadow') === biome.id;
                const canAfford = coinsBalance >= biome.priceCoins;

                return (
                  <Card
                    key={biome.id}
                    className={cn(
                      'p-5 flex flex-col justify-between transition-all border',
                      isEquipped
                        ? 'border-primary ring-1 ring-primary/40 bg-primary/5'
                        : 'border-border bg-card hover:border-border/80',
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {/* Map Thumbnail */}
                          <div className="size-12 rounded-lg overflow-hidden border border-border shadow-xs bg-muted shrink-0">
                            <img
                              src={`/maps/${biome.id}.png`}
                              alt={biome.name}
                              className="size-full object-cover"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">{biome.name}</h3>
                            <span className="text-xs font-mono font-semibold text-muted-foreground">
                              {biome.priceCoins === 0 ? 'Default Biome (Free)' : `${biome.priceCoins} EcoCoins`}
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
                          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Lock className="size-3.5" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>

                      {/* Map Preview Banner */}
                      <div className="w-full h-28 rounded-md overflow-hidden border border-border/80 shadow-2xs bg-muted relative">
                        <img
                          src={`/maps/${biome.id}.png`}
                          alt={biome.name}
                          className="size-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {biome.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-border/60">
                      {isEquipped ? (
                        <Button variant="outline" size="sm" disabled className="w-full text-xs">
                          <Check className="size-3.5 mr-1.5 text-primary" />
                          Currently Active
                        </Button>
                      ) : isUnlocked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => equipBiome(biome.id)}
                        >
                          Apply Biome
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!canAfford}
                          className="w-full text-xs"
                          onClick={() => buyAndEquipBiome(biome, coinsBalance)}
                        >
                          <Coins className="size-3.5 mr-1.5" />
                          Buy for {biome.priceCoins} Coins
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pets Grid */}
          {gardenTab === 'pets' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PET_ITEMS.map((pet) => {
                const isUnlocked = (gardenState.unlockedPets || ['dog']).includes(pet.id);
                const isRoaming = (gardenState.activePetIds || ['dog']).includes(pet.id);
                const canAfford = coinsBalance >= pet.priceCoins;

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
                      'p-4 flex flex-col justify-between transition-all border',
                      isRoaming
                        ? 'border-primary/80 ring-1 ring-primary/40 bg-primary/5'
                        : 'border-border bg-card hover:border-border/80',
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="size-14 rounded-lg border border-border shadow-xs bg-muted/60 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={`/sprites/pets/${pet.id}_idle_0.png`}
                              alt={pet.name}
                              className="size-11 object-contain hover:scale-110 transition-transform"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">{pet.name}</h3>
                            <span className="text-xs font-mono font-semibold text-muted-foreground block">
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

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {pet.description}
                      </p>

                      <div className="rounded-md bg-muted/60 p-2 border border-border/60 flex items-center gap-2 text-xs text-foreground font-medium">
                        <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                        <span className="line-clamp-1">{pet.idleBehavior}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-border/60">
                      {isUnlocked ? (
                        <Button
                          variant={isRoaming ? 'primary' : 'outline'}
                          size="sm"
                          className={cn(
                            'w-full text-xs font-semibold transition-all',
                            isRoaming
                              ? 'bg-primary text-primary-foreground shadow-2xs'
                              : 'hover:bg-primary/10 hover:text-primary',
                          )}
                          onClick={() => togglePetRoam(pet.id)}
                        >
                          {isRoaming ? (
                            <>
                              <Check className="size-3.5 mr-1.5" />
                              Roaming in Garden (Active)
                            </>
                          ) : (
                            <>
                              <PawPrint className="size-3.5 mr-1.5" />
                              Release into Garden
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!canAfford}
                          className="w-full text-xs"
                          onClick={() => buyPet(pet, coinsBalance)}
                        >
                          <Coins className="size-3.5 mr-1.5" />
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
      ) : (
        <>
          {/* Filter & Search Bar: Card p-4 (16px) -> inner controls rounded-sm (12px) */}
      <Card className="space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search indoor plants, bamboo essentials, composters…"
              aria-label="Search marketplace products"
              className="h-11 w-full rounded-sm border border-input bg-card pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          <Select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductSort)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              selected={category === cat.value}
              onToggle={() => setCategory(cat.value)}
            >
              {cat.label}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Product Grid */}
      {products.isPending ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {['p-s1', 'p-s2', 'p-s3', 'p-s4', 'p-s5', 'p-s6', 'p-s7', 'p-s8'].map((skeletonId) => (
            <Card key={skeletonId} variant="media" className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-md" />
              <div className="space-y-2 p-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-sm" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.isError ? (
        <ErrorBanner error={products.error} onRetry={() => products.refetch()} />
      ) : allProducts.length === 0 ? (
        <EmptyState
          icon={<Sprout className="size-5" />}
          title="No matching eco products"
          description="Try clearing your search query or switching to another category."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCategory('all');
                setSearchInput('');
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allProducts.map((product) => {
              const qtyInCart = cartByProductId.get(product.id) ?? 0;
              const outOfStock = product.stock <= 0;
              const maxCoinSavingPaise = Math.floor(product.pricePaise * 0.2);
              const imgUrl = getProductImageUrl(product);

              return (
                <Card
                  key={product.id}
                  variant="media"
                  className="flex flex-col justify-between transition-all duration-300 hover:border-primary/80 hover:shadow-hover hover:-translate-y-0.5"
                >
                  <div>
                    {/* Concentric media frame: outer Card is rounded-lg (28px) with p-2 (8px) -> inner frame is rounded-md (20px) */}
                    <Link
                      href={`/marketplace/${product.slug}`}
                      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md border border-border/70 bg-muted/40 shadow-subtle"
                    >
                      <Image
                        src={imgUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

                      <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 z-10">
                        <Badge tone="neutral" className="backdrop-blur-md bg-card/90 font-medium">
                          {CATEGORY_LABEL[product.category] ?? product.category}
                        </Badge>
                        {product.co2SavedKg != null && product.co2SavedKg > 0 && (
                          <Badge
                            tone="positive"
                            className="backdrop-blur-md bg-accent/95 font-semibold"
                          >
                            <Leaf className="size-3" />−{formatKg(product.co2SavedKg)} CO₂e
                          </Badge>
                        )}
                      </div>

                      {outOfStock && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950/65 backdrop-blur-[2px]">
                          <Badge tone="danger">Out of stock</Badge>
                        </div>
                      )}
                    </Link>

                    {/* Body inside p-2 */}
                    <div className="space-y-1.5 p-2 pt-3">
                      <Link
                        href={`/marketplace/${product.slug}`}
                        className="block text-base font-bold text-foreground hover:text-positive line-clamp-1 transition-colors"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Concentric Action Footer */}
                  <div className="space-y-3 p-2 pt-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-lg font-extrabold tabular-nums text-foreground">
                          {formatPaise(product.pricePaise)}
                        </span>
                        <span className="ml-1.5 text-[11px] font-medium text-positive">
                          Save up to {formatPaise(maxCoinSavingPaise)} w/ coins
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {product.stock} in stock
                      </span>
                    </div>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center justify-between gap-2">
                        <Stepper
                          value={qtyInCart}
                          min={0}
                          max={Math.min(10, product.stock)}
                          label={`Quantity for ${product.name}`}
                          onChange={(next) => {
                            if (next <= 0) {
                              removeFromCart.mutate(product.id);
                            } else {
                              setCartQty.mutate({ productId: product.id, quantity: next });
                            }
                          }}
                        />
                        <Button variant="secondary" size="sm" onClick={() => setCartOpen(true)}>
                          In cart ({qtyInCart})
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={outOfStock || addToCart.isPending}
                        onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
                      >
                        <Plus className="size-4" />
                        {outOfStock ? 'Out of stock' : 'Add to cart'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {products.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                loading={products.isFetchingNextPage}
                onClick={() => products.fetchNextPage()}
              >
                Load more products
              </Button>
            </div>
          )}
        </>
      )}

          {/* EcoLife 2D Garden Highlight Card */}
          <Card variant="secondary" className="p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-xs bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                  <Gamepad2 className="size-3.5" aria-hidden="true" />
                  Live Now · EcoLife Botanical 2D Garden
                </div>
                <h2 className="text-xl font-bold tracking-tight text-secondary-foreground">
                  Spend your EcoCoins on 2D trees, biomes & character skins
                </h2>
                <p className="text-sm text-secondary-foreground/80">
                  Alongside real-world eco products, your EcoCoins wallet powers your
                  own Cozy 2D Botanical Garden—plant native trees, unlock zen bamboo or autumn biomes,
                  and dress your gardener in stylish outfits as you hit daily carbon goals.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setMarketTab('garden')}
                  className="gap-2 text-xs font-bold shadow-xs"
                >
                  <Palette className="size-4" />
                  <span>Browse Garden Wardrobe</span>
                </Button>
                <Link href="/garden">
                  <Button variant="outline" size="md" className="gap-2 text-xs font-bold bg-card">
                    <Gamepad2 className="size-4" />
                    <span>Open Garden</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Cart & Coin Checkout Modal */}
      <CartCheckoutModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        coinsBalance={coinsBalance}
        onOrderPlaced={(orderId) => {
          setCartOpen(false);
          router.push(`/marketplace/orders/${orderId}`);
        }}
      />
    </div>
  );
}

interface CartCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  coinsBalance: number;
  onOrderPlaced: (orderId: number) => void;
}

function CartCheckoutModal({ open, onClose, coinsBalance, onOrderPlaced }: CartCheckoutModalProps) {
  const cart = useQuery(cartQuery());
  const addresses = useQuery(addressesQuery());
  const setCartQty = useSetCartQuantity();
  const removeFromCart = useRemoveFromCart();
  const createAddress = useCreateAddress();
  const placeOrder = usePlaceOrder();

  const items = cart.data?.items ?? [];
  const subtotalPaise = cart.data?.subtotalPaise ?? 0;

  // Max coins redeemable: min(user balance, 20% of subtotal at 10 coins = 100 paise -> subtotalPaise / 50)
  const maxRedeemableCoins = Math.min(coinsBalance, Math.floor(subtotalPaise / 50));

  const [coinsToSpend, setCoinsToSpend] = React.useState(0);
  const [debouncedCoins, setDebouncedCoins] = React.useState(0);
  const [selectedAddressId, setSelectedAddressId] = React.useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = React.useState(false);

  // New address form fields
  const [addrRecipient, setAddrRecipient] = React.useState('');
  const [addrPhone, setAddrPhone] = React.useState('');
  const [addrLine1, setAddrLine1] = React.useState('');
  const [addrCity, setAddrCity] = React.useState('');
  const [addrState, setAddrState] = React.useState('');
  const [addrPincode, setAddrPincode] = React.useState('');

  React.useEffect(() => {
    if (coinsToSpend > maxRedeemableCoins) {
      setCoinsToSpend(maxRedeemableCoins);
    }
  }, [maxRedeemableCoins, coinsToSpend]);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedCoins(coinsToSpend), 180);
    return () => window.clearTimeout(t);
  }, [coinsToSpend]);

  React.useEffect(() => {
    const list = addresses.data ?? [];
    if (selectedAddressId === null && list.length > 0) {
      const def = list.find((a) => a.isDefault) ?? list[0];
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses.data, selectedAddressId]);

  const preview = useQuery({
    ...cartPreviewQuery(debouncedCoins),
    enabled: open && items.length > 0,
  });

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createAddress.mutateAsync({
      name: addrRecipient,
      phone: addrPhone,
      line1: addrLine1,
      line2: null,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: (addresses.data?.length ?? 0) === 0,
    });
    setSelectedAddressId(created.id);
    setShowNewAddress(false);
    setAddrRecipient('');
    setAddrPhone('');
    setAddrLine1('');
    setAddrPincode('');
  };

  const handleCheckout = async () => {
    if (selectedAddressId === null || items.length === 0) return;
    const order = await placeOrder.mutateAsync({
      addressId: selectedAddressId,
      offeredCoins: preview.data?.coinsSpent ?? debouncedCoins,
      idempotencyKey: crypto.randomUUID(),
    });
    onOrderPlaced(order.id);
  };

  const displaySubtotal = preview.data?.subtotalPaise ?? subtotalPaise;
  const displayDiscount = preview.data?.discountPaise ?? coinsToSpend * 10;
  const displayTotal = preview.data?.totalPaise ?? Math.max(0, displaySubtotal - displayDiscount);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Your Eco Cart & Coin Checkout"
      description="Adjust quantities, apply EcoCoins for up to 20% off, and select a delivery address."
      size="lg"
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-5" />}
          title="Your cart is empty"
          description="Add indoor plants or sustainable household essentials to preview your coin discount."
        />
      ) : (
        <div className="space-y-5">
          {/* Cart Items List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/30 p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/marketplace/${item.product.slug}`}
                    onClick={onClose}
                    className="truncate text-sm font-bold text-foreground hover:text-positive block"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatPaise(item.product.pricePaise)} each
                    {item.product.co2SavedKg != null && item.product.co2SavedKg > 0
                      ? ` · −${formatKg(item.product.co2SavedKg * item.quantity)} CO₂e`
                      : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Stepper
                    value={item.quantity}
                    min={1}
                    max={Math.min(10, item.product.stock)}
                    label={`Quantity for ${item.product.name}`}
                    onChange={(next) =>
                      setCartQty.mutate({ productId: item.product.id, quantity: next })
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${item.product.name} from cart`}
                    onClick={() => removeFromCart.mutate(item.product.id)}
                    className="inline-flex size-9 items-center justify-center rounded-xs text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coin Discount Slider */}
          <div className="rounded-sm border border-primary/50 bg-accent/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-positive" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Redeem EcoCoins (up to 20% off)
                </span>
              </div>
              <Badge tone="primary">
                {coinsToSpend} coins (−{formatPaise(displayDiscount)})
              </Badge>
            </div>

            <input
              type="range"
              min={0}
              max={maxRedeemableCoins}
              step={10}
              value={coinsToSpend}
              disabled={maxRedeemableCoins <= 0}
              onChange={(e) => setCoinsToSpend(Number(e.target.value))}
              aria-label="Coins to spend on this order"
              className="w-full accent-secondary cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Wallet: {formatNumber(coinsBalance)} coins</span>
              <span>
                {preview.data?.capReached
                  ? 'Maximum 20% discount cap reached'
                  : `Max usable on this cart: ${formatNumber(maxRedeemableCoins)} coins`}
              </span>
            </div>
          </div>

          {/* Delivery Address Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Delivery Address
              </span>
              <button
                type="button"
                onClick={() => setShowNewAddress((s) => !s)}
                className="text-xs font-semibold text-positive hover:underline"
              >
                {showNewAddress ? 'Cancel new address' : '+ Add new address'}
              </button>
            </div>

            {showNewAddress ? (
              <form
                onSubmit={handleCreateAddress}
                className="space-y-3 rounded-sm border border-border bg-muted/20 p-3"
              >
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Input
                    label="Recipient Name"
                    value={addrRecipient}
                    onChange={(e) => setAddrRecipient(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone (+91…)"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="+919876543210"
                    required
                  />
                  <Input
                    label="Street Address (Line 1)"
                    value={addrLine1}
                    onChange={(e) => setAddrLine1(e.target.value)}
                    required
                  />
                  <Input
                    label="City"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    required
                  />
                  <Input
                    label="State"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    required
                  />
                  <Input
                    label="PIN Code (6 digits)"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    pattern="^[1-9][0-9]{5}$"
                    placeholder="400001"
                    required
                  />
                </div>
                {createAddress.isError && <ErrorBanner error={createAddress.error} />}
                <div className="flex justify-end">
                  <Button type="submit" size="sm" loading={createAddress.isPending}>
                    Save address
                  </Button>
                </div>
              </form>
            ) : (addresses.data?.length ?? 0) === 0 ? (
              <div className="rounded-sm border border-dashed border-border p-3 text-xs text-muted-foreground">
                No delivery address saved yet. Click <strong>+ Add new address</strong> above to
                continue.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {addresses.data?.map((addr) => {
                  const active = selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`flex items-start justify-between gap-2 rounded-sm border p-2.5 text-left transition ${
                        active
                          ? 'border-primary bg-accent/50'
                          : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <div className="min-w-0 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <MapPin className="size-3.5 text-positive shrink-0" />
                          <span>{addr.name}</span>
                        </div>
                        <p className="mt-0.5 truncate text-muted-foreground">
                          {addr.line1}, {addr.city} {addr.pincode}
                        </p>
                      </div>
                      {active && <Check className="size-4 shrink-0 text-positive" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Server-verified Pricing Summary */}
          <div className="rounded-sm border border-border bg-muted/40 p-3.5 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium text-foreground">
                {formatPaise(displaySubtotal)}
              </span>
            </div>
            <div className="flex justify-between text-positive">
              <span>Coin discount ({preview.data?.coinsSpent ?? coinsToSpend} coins)</span>
              <span className="tabular-nums font-semibold">−{formatPaise(displayDiscount)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold text-foreground">
              <span>Total payable</span>
              <span className="tabular-nums">{formatPaise(displayTotal)}</span>
            </div>
          </div>

          {placeOrder.isError && <ErrorBanner error={placeOrder.error} />}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Keep browsing
            </Button>
            <Button
              variant="primary"
              disabled={selectedAddressId === null || items.length === 0}
              loading={placeOrder.isPending}
              onClick={handleCheckout}
            >
              Place Eco Order ({formatPaise(displayTotal)})
            </Button>
          </div>
        </div>
      )}
    </ModalDialog>
  );
}
