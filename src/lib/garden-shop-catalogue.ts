import type { GardenBiomeId, CharacterSkinId, ShopItemBiome, ShopItemSkin } from '@/types/trees';

export const SKIN_ITEMS: ShopItemSkin[] = [
  {
    id: 'gardener_default',
    name: 'Classic Gardener',
    description: 'Straw sunhat, breathable emerald flannel shirt, and durable denim overalls.',
    priceCoins: 0,
    previewColor: '#22c55e',
    accentColor: '#eab308',
    unlockedByDefault: true,
  },
  {
    id: 'forest_ranger',
    name: 'Forest Ranger',
    description: 'Wide-brim ranger hat, khaki safari jacket, brass buckle, and wilderness hiking boots.',
    priceCoins: 150,
    previewColor: '#854d0e',
    accentColor: '#ca8a04',
  },
  {
    id: 'solar_scout',
    name: 'Solar Tech Scout',
    description: 'Clean high-tech cyber suit with solar fabric trim, aqua HUD visor, and ionic runners.',
    priceCoins: 300,
    previewColor: '#0284c7',
    accentColor: '#38bdf8',
  },
  {
    id: 'monsoon_botanist',
    name: 'Monsoon Botanist',
    description: 'Canary-yellow waterproof raincoat, deep forest wellington boots, and rain satchel.',
    priceCoins: 200,
    previewColor: '#eab308',
    accentColor: '#15803d',
  },
  {
    id: 'zen_hermit',
    name: 'Zen Hermit',
    description: 'Conical bamboo woven sugegasa hat, sage green silk meditation robes, and geta sandals.',
    priceCoins: 250,
    previewColor: '#4d7c0f',
    accentColor: '#d97706',
  },
];

export const BIOME_ITEMS: ShopItemBiome[] = [
  {
    id: 'meadow',
    name: 'Pastel Meadow',
    description: 'Lush green countryside grasses dotted with tiny blooming daisies and river stone walkways.',
    priceCoins: 0,
    palette: {
      grassBase: '#7ec050',
      grassLight: '#94d366',
      grassDark: '#68a540',
      pathBase: '#e8dcba',
      waterBase: '#58a6ff',
      fenceBase: '#8c603b',
    },
    unlockedByDefault: true,
  },
  {
    id: 'zen_bamboo',
    name: 'Zen Bamboo Grove',
    description: 'Fine raked zen garden sands, mossy jade stepping stones, and peaceful ornamental koi ponds.',
    priceCoins: 250,
    palette: {
      grassBase: '#588157',
      grassLight: '#a3b18a',
      grassDark: '#344e41',
      pathBase: '#d4c7b0',
      waterBase: '#3a86c8',
      fenceBase: '#4a3525',
    },
  },
  {
    id: 'autumn_orchard',
    name: 'Autumn Orchard',
    description: 'Cozy golden foliage carpet, warm terracotta brick pathways, and amber harvest waters.',
    priceCoins: 200,
    palette: {
      grassBase: '#c27d38',
      grassLight: '#e09f3e',
      grassDark: '#9e5a23',
      pathBase: '#b97352',
      waterBase: '#437c90',
      fenceBase: '#582f0e',
    },
  },
  {
    id: 'sacred_grove',
    name: 'Sacred Grove Sanctuary',
    description: 'Deep mystical forest loam with ancient runic flagstones and glowing crystalline sacred waters.',
    priceCoins: 350,
    palette: {
      grassBase: '#1b4332',
      grassLight: '#2d6a4f',
      grassDark: '#081c15',
      pathBase: '#52796f',
      waterBase: '#0077b6',
      fenceBase: '#2f3e46',
    },
  },
];

export function getSkinById(id: CharacterSkinId): ShopItemSkin {
  return SKIN_ITEMS.find((s) => s.id === id) || SKIN_ITEMS[0];
}

export function getBiomeById(id: GardenBiomeId): ShopItemBiome {
  return BIOME_ITEMS.find((b) => b.id === id) || BIOME_ITEMS[0];
}
