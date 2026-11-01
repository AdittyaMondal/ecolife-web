export interface TreeRarity {
  id: number;
  slug: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | string;
  name: string;
  rank: number;
  dropWeight: number;
  isActive: boolean;
  color?: string; // Accent color for pixel badge / glow
}

export interface GrowthStage {
  stage: number;
  label: string;
  imageUrl: string;
}

export interface Tree {
  id: number;
  slug: string;
  name: string;
  description: string;
  rarity: TreeRarity;
  imageUrl: string;
  growthStages: GrowthStage[] | null;
  co2OffsetKgPerYear: number;
  isActive: boolean;
  scientificName?: string;
  nativeRegion?: string;
}

export interface PlantedTree {
  instanceId: string;
  treeSlug: string;
  x: number;
  y: number;
  plantedAt: string;
  growthStage: number;
  wateredAt?: string;
}

export interface GardenInventoryItem {
  treeSlug: string;
  quantity: number;
}

export type CharacterSkinId =
  | 'gardener_default'
  | 'forest_ranger'
  | 'solar_scout'
  | 'monsoon_botanist'
  | 'zen_hermit';

export type GardenBiomeId =
  | 'meadow'
  | 'zen_bamboo'
  | 'autumn_orchard'
  | 'sacred_grove';

export interface ShopItemSkin {
  id: CharacterSkinId;
  name: string;
  description: string;
  priceCoins: number;
  previewColor: string;
  accentColor: string;
  unlockedByDefault?: boolean;
}

export interface ShopItemBiome {
  id: GardenBiomeId;
  name: string;
  description: string;
  priceCoins: number;
  palette: {
    grassBase: string;
    grassLight: string;
    grassDark: string;
    pathBase: string;
    waterBase: string;
    fenceBase: string;
  };
  unlockedByDefault?: boolean;
}

export interface GardenState {
  gridCols: number;
  gridRows: number;
  plantedTrees: PlantedTree[];
  inventory: GardenInventoryItem[];
  hotbar: (string | null)[]; // 6 slots
  playerPos: { x: number; y: number; direction: 'up' | 'down' | 'left' | 'right' };
  activeHotbarIndex: number; // 0..5
  stats: {
    totalPlanted: number;
    totalOffsetKgPerYear: number;
    timesWatered: number;
  };
  // Customization & Shop
  activeSkinId?: CharacterSkinId;
  unlockedSkins?: CharacterSkinId[];
  activeBiomeId?: GardenBiomeId;
  unlockedBiomes?: GardenBiomeId[];
}
