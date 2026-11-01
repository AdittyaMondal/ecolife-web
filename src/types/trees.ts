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
}
