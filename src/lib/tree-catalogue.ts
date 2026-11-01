import type { Tree, TreeRarity } from '@/types/trees';

export const TREE_RARITIES: TreeRarity[] = [
  {
    id: 1,
    slug: 'common',
    name: 'Common',
    rank: 1,
    dropWeight: 500,
    isActive: true,
    color: '#7EBF52', // Leaf Green
  },
  {
    id: 2,
    slug: 'uncommon',
    name: 'Uncommon',
    rank: 2,
    dropWeight: 280,
    isActive: true,
    color: '#3B82F6', // Blue
  },
  {
    id: 3,
    slug: 'rare',
    name: 'Rare',
    rank: 3,
    dropWeight: 140,
    isActive: true,
    color: '#8B5CF6', // Purple
  },
  {
    id: 4,
    slug: 'epic',
    name: 'Epic',
    rank: 4,
    dropWeight: 60,
    isActive: true,
    color: '#EC4899', // Rose/Magenta
  },
  {
    id: 5,
    slug: 'legendary',
    name: 'Legendary',
    rank: 5,
    dropWeight: 20,
    isActive: true,
    color: '#F59E0B', // Amber/Gold
  },
];

export const TREE_CATALOGUE: Tree[] = [
  {
    id: 1,
    slug: 'neem',
    name: 'Neem Tree',
    scientificName: 'Azadirachta indica',
    description:
      'The village dispensary of India. Offers expansive shade, natural pest resistance, and medicinal oxygen release.',
    rarity: TREE_RARITIES[0], // Common
    imageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    co2OffsetKgPerYear: 48.5,
    isActive: true,
    growthStages: [
      { stage: 1, label: 'Sprout', imageUrl: '' },
      { stage: 2, label: 'Sapling', imageUrl: '' },
      { stage: 3, label: 'Young Neem', imageUrl: '' },
      { stage: 4, label: 'Mature Canopy', imageUrl: '' },
    ],
  },
  {
    id: 2,
    slug: 'mango',
    name: 'Mango Tree',
    scientificName: 'Mangifera indica',
    description:
      'The king of fruits. Dense evergreen foliage with luscious sweet blossoms that attract wild pollinators.',
    rarity: TREE_RARITIES[0], // Common
    imageUrl:
      'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=600&q=80',
    co2OffsetKgPerYear: 38.0,
    isActive: true,
    growthStages: [
      { stage: 1, label: 'Seedling', imageUrl: '' },
      { stage: 2, label: 'Sapling', imageUrl: '' },
      { stage: 3, label: 'Flowering', imageUrl: '' },
      { stage: 4, label: 'Fruiting Tree', imageUrl: '' },
    ],
  },
  {
    id: 3,
    slug: 'amaltas',
    name: 'Amaltas (Golden Shower)',
    scientificName: 'Cassia fistula',
    description:
      'Spectacular cascading chains of vivid yellow blossoms, revered for soil renewal and cooling urban microclimates.',
    rarity: TREE_RARITIES[1], // Uncommon
    imageUrl:
      'https://images.unsplash.com/photo-1462927114214-6956d2fddd4e?auto=format&fit=crop&w=600&q=80',
    co2OffsetKgPerYear: 32.0,
    isActive: true,
    growthStages: [
      { stage: 1, label: 'Sprout', imageUrl: '' },
      { stage: 2, label: 'Sapling', imageUrl: '' },
      { stage: 3, label: 'Budding', imageUrl: '' },
      { stage: 4, label: 'Golden Shower', imageUrl: '' },
    ],
  },
  {
    id: 4,
    slug: 'teak',
    name: 'Teak Tree',
    scientificName: 'Tectona grandis',
    description:
      'Stately hardwood with large fibrous leaves that effectively trap ambient dust and sequester deep carbon.',
    rarity: TREE_RARITIES[1], // Uncommon
    imageUrl:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    co2OffsetKgPerYear: 55.0,
    isActive: true,
    growthStages: [
      { stage: 1, label: 'Sprout', imageUrl: '' },
      { stage: 2, label: 'Slender Sapling', imageUrl: '' },
      { stage: 3, label: 'Timber Tree', imageUrl: '' },
      { stage: 4, label: 'Ancient Giant', imageUrl: '' },
    ],
  },
  {
    id: 5,
    slug: 'gulmohar',
    name: 'Gulmohar (Flame Tree)',
    scientificName: 'Delonix regia',
    description:
      'Famous for fiery scarlet-orange petals that form an umbrella of vibrant urban shade every summer.',
    rarity: TREE_RARITIES[2], // Rare
    imageUrl:
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    co2OffsetKgPerYear: 36.5,
    isActive: true,
    growthStages: [
      { stage: 1, label: 'Sprout', imageUrl: '' },
      { stage: 2, label: 'Fern-leaf Sapling', imageUrl: '' },
      { stage: 3, label: 'Budding Tree', imageUrl: '' },
      { stage: 4, label: 'Flame Canopy', imageUrl: '' },
    ],
  },
  {
    id: 6,
    slug: 'jacaranda',
    name: 'Jacaranda Tree',
    scientificName: 'Jacaranda mimosifolia',
    description:
      'Sublime violet-blue tubular blooms creating an ethereal canopy that captures atmospheric nitrogen.',
    rarity: TREE_RARITIES[2], // Rare
    imageUrl:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80',
    co2OffsetKgPerYear: 42.0,
    isActive: true,
    growthStages: [
      { stage: 1, label: 'Sprout', imageUrl: '' },
      { stage: 2, label: 'Sapling', imageUrl: '' },
      { stage: 3, label: 'Purple Mist', imageUrl: '' },
      { stage: 4, label: 'Full Blossom', imageUrl: '' },
    ],
  },
  {
    id: 7,
    slug: 'peepal',
    name: 'Sacred Peepal',
    scientificName: 'Ficus religiosa',
    description:
      'Heart-shaped leaves that whisper in the gentlest breeze. Releases life-giving oxygen round the clock.',
    rarity: TREE_RARITIES[3], // Epic
    imageUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    co2OffsetKgPerYear: 68.0,
    isActive: true,
    growthStages: [
      { stage: 1, label: 'Sacred Sprout', imageUrl: '' },
      { stage: 2, label: 'Heartleaf Sapling', imageUrl: '' },
      { stage: 3, label: 'Sacred Grove', imageUrl: '' },
      { stage: 4, label: 'Venerable Bodhi', imageUrl: '' },
    ],
  },
  {
    id: 8,
    slug: 'banyan',
    name: 'Majestic Banyan',
    scientificName: 'Ficus benghalensis',
    description:
      'National tree of India. Massive architectural canopy supported by aerial prop roots, sheltering entire ecosystems.',
    rarity: TREE_RARITIES[4], // Legendary
    imageUrl:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    co2OffsetKgPerYear: 88.0,
    isActive: true,
    growthStages: [
      { stage: 1, label: 'Sacred Seed', imageUrl: '' },
      { stage: 2, label: 'Aerial Sapling', imageUrl: '' },
      { stage: 3, label: 'Pillared Tree', imageUrl: '' },
      { stage: 4, label: 'Immortal Banyan', imageUrl: '' },
    ],
  },
];

export function getTreeBySlug(slug: string): Tree | undefined {
  return TREE_CATALOGUE.find((t) => t.slug === slug);
}

/**
 * Weighted random drop simulation following PRD-v2 §6.10:
 * "Weights are relative, not percentages: divide one by the sum of the active tiers."
 */
export function rollTreeReward(): Tree {
  const totalWeight = TREE_RARITIES.reduce((acc, r) => acc + r.dropWeight, 0);
  let random = Math.random() * totalWeight;

  let selectedRarity = TREE_RARITIES[0];
  for (const rarity of TREE_RARITIES) {
    if (random < rarity.dropWeight) {
      selectedRarity = rarity;
      break;
    }
    random -= rarity.dropWeight;
  }

  // Filter catalogue by selected rarity
  const candidates = TREE_CATALOGUE.filter((t) => t.rarity.slug === selectedRarity.slug);
  if (candidates.length === 0) return TREE_CATALOGUE[0];

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return picked;
}
