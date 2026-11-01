/**
/**
 * Crisp procedural pixel-art sprite rendering engine for EcoLife Garden.
 * Supports customizable biomes, character skins, and smooth 16-bit retro aesthetics.
 */

import type { CharacterSkinId, GardenBiomeId } from '@/types/trees';
import { getBiomeById } from '@/lib/garden-shop-catalogue';

export const TILE_SIZE = 48; // Screen pixels per tile

// Color palette: Pastel Meadow & Botanical EcoLife Theme
export const PIXEL_PALETTE = {
  // Terrain
  grassBase: '#7ec050',
  grassLight: '#94d366',
  grassDark: '#68a540',
  grassEdge: '#528532',
  flowerWhite: '#ffffff',
  flowerYellow: '#fde047',
  flowerPink: '#f472b6',
  clover: '#3f6c24',

  pathBase: '#e8dcba',
  pathLight: '#f4ecd4',
  pathDark: '#c7b48c',
  pathPebble: '#9c8b6a',

  waterBase: '#58a6ff',
  waterLight: '#79c0ff',
  waterDark: '#388bfd',
  waterWave: '#ffffff',
  lilypad: '#2ea043',

  fenceWood: '#8c603b',
  fenceLight: '#ab7e54',
  fenceDark: '#624125',

  // Character
  skin: '#ffdfba',
  skinShadow: '#e4b88f',
  hair: '#5c3a21',
  hatStraw: '#eab308',
  hatBand: '#15803d',
  shirtGreen: '#22c55e',
  shirtLight: '#4ade80',
  overallsBlue: '#2563eb',
  overallsDark: '#1d4ed8',
  boots: '#78350f',

  // Soil & Planting
  soilBase: '#5a3825',
  soilLight: '#784d35',
  soilDark: '#3e2417',
  waterSparkle: '#60a5fa',
};

/**
 * Draw a grass/terrain tile adapted to the active biome
 */
export function drawGrassTile(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  seed: number,
  biomeId: GardenBiomeId = 'meadow',
) {
  const biome = getBiomeById(biomeId);
  const baseColor = biome.palette.grassBase;
  const lightColor = biome.palette.grassLight;
  const darkColor = biome.palette.grassDark;

  ctx.fillStyle = baseColor;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  // Subtle checkered grass blades or foliage details
  ctx.fillStyle = lightColor;
  if ((seed * 7) % 3 === 0) {
    ctx.fillRect(px + 6, py + 8, 4, 6);
    ctx.fillRect(px + 8, py + 6, 4, 4);
  }
  if ((seed * 13) % 4 === 0) {
    ctx.fillRect(px + 28, py + 20, 4, 6);
    ctx.fillRect(px + 32, py + 18, 4, 4);
  }
  if ((seed * 19) % 5 === 0) {
    ctx.fillRect(px + 14, py + 34, 4, 6);
  }

  // Dark blades
  ctx.fillStyle = darkColor;
  if ((seed * 11) % 4 === 1) {
    ctx.fillRect(px + 36, py + 6, 4, 4);
  }
  if ((seed * 17) % 3 === 1) {
    ctx.fillRect(px + 8, py + 22, 4, 4);
  }

  // Biome-specific ambient accents
  if (biomeId === 'autumn_orchard') {
    // Amber fallen leaf
    if (seed % 5 === 0) {
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(px + 22, py + 16, 5, 4);
      ctx.fillRect(px + 24, py + 14, 2, 2);
    }
  } else if (biomeId === 'zen_bamboo') {
    // Bamboo leaf or small stone
    if (seed % 6 === 0) {
      ctx.fillStyle = '#344e41';
      ctx.fillRect(px + 18, py + 24, 6, 3);
    }
  } else if (biomeId === 'sacred_grove') {
    // Glowing magical moss flake
    if (seed % 7 === 0) {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(px + 26, py + 12, 3, 3);
    }
  } else {
    // Meadow: Wild daisy or pink flower
    if (seed % 7 === 0) {
      ctx.fillStyle = PIXEL_PALETTE.flowerWhite;
      ctx.fillRect(px + 20, py + 14, 6, 6);
      ctx.fillStyle = PIXEL_PALETTE.flowerYellow;
      ctx.fillRect(px + 22, py + 16, 2, 2);
    } else if (seed % 11 === 0) {
      ctx.fillStyle = PIXEL_PALETTE.flowerPink;
      ctx.fillRect(px + 24, py + 30, 5, 5);
      ctx.fillStyle = PIXEL_PALETTE.flowerYellow;
      ctx.fillRect(px + 25, py + 31, 3, 3);
    }
  }
}

/**
 * Draw a cobblestone / brick pathway tile adapted to the active biome
 */
export function drawPathTile(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  seed: number,
  biomeId: GardenBiomeId = 'meadow',
) {
  const biome = getBiomeById(biomeId);
  ctx.fillStyle = biome.palette.pathBase;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  // Path stones / bricks
  ctx.fillStyle = biome.palette.grassDark;
  ctx.globalAlpha = 0.25;
  ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
  ctx.globalAlpha = 1.0;

  // Pebble details
  ctx.fillStyle = PIXEL_PALETTE.pathPebble;
  if (seed % 2 === 0) {
    ctx.fillRect(px + 8, py + 10, 8, 6);
    ctx.fillRect(px + 26, py + 24, 12, 8);
  } else {
    ctx.fillRect(px + 18, py + 8, 10, 7);
    ctx.fillRect(px + 6, py + 26, 9, 6);
  }
}

/**
 * Draw a garden pond / water tile with gentle animated ripples
 */
export function drawWaterTile(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  tick: number,
  hasLilypad = false,
  biomeId: GardenBiomeId = 'meadow',
) {
  const biome = getBiomeById(biomeId);
  ctx.fillStyle = biome.palette.waterBase;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  // Animated wave glints
  const waveOffset = Math.floor((tick / 15) % 4) * 4;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.45;
  ctx.fillRect(px + 6 + waveOffset, py + 12, 8, 2);
  ctx.fillRect(px + 24 - waveOffset, py + 28, 10, 2);
  ctx.globalAlpha = 1.0;

  // Lilypad on pond corner
  if (hasLilypad) {
    ctx.fillStyle = PIXEL_PALETTE.lilypad;
    ctx.beginPath();
    ctx.arc(px + 22, py + 22, 9, 0, Math.PI * 1.7);
    ctx.fill();

    // Pink water lotus flower
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(px + 24, py + 16, 5, 5);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(px + 25, py + 17, 3, 3);
  }
}

/**
 * Draw a rustic wooden fence border tile
 */
export function drawFenceTile(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  biomeId: GardenBiomeId = 'meadow',
) {
  const biome = getBiomeById(biomeId);
  // Grass underlay
  ctx.fillStyle = biome.palette.grassBase;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  // Horizontal fence rails
  ctx.fillStyle = biome.palette.fenceBase;
  ctx.fillRect(px, py + 12, TILE_SIZE, 6);
  ctx.fillRect(px, py + 28, TILE_SIZE, 6);

  // Vertical fence posts
  ctx.fillRect(px + 8, py + 6, 8, 36);
  ctx.fillRect(px + 32, py + 6, 8, 36);

  // Post caps & highlights
  ctx.fillStyle = PIXEL_PALETTE.fenceLight;
  ctx.fillRect(px + 8, py + 6, 8, 4);
  ctx.fillRect(px + 32, py + 6, 8, 4);
}

/**
 * Draw Gardener Character Sprite with customizable skins!
 */
export function drawGardener(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  direction: 'up' | 'down' | 'left' | 'right',
  isWalking: boolean,
  tick: number,
  skinId: CharacterSkinId = 'gardener_default',
) {
  // Walk bob oscillation
  const bob = isWalking && Math.floor((tick / 8) % 2) === 1 ? -2 : 0;
  const legOffset = isWalking && Math.floor((tick / 8) % 2) === 1 ? 3 : 0;

  const cx = px + TILE_SIZE / 2;
  const cy = py + TILE_SIZE / 2 + bob;

  // Drop shadow under feet
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, py + TILE_SIZE - 4, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outfit colors based on active skin
  let outfitPrimary = PIXEL_PALETTE.shirtGreen;
  let outfitPants = PIXEL_PALETTE.overallsBlue;
  let outfitPantsDark = PIXEL_PALETTE.overallsDark;
  let outfitHat = PIXEL_PALETTE.hatStraw;
  let outfitHatBand = PIXEL_PALETTE.hatBand;
  let bootsColor = PIXEL_PALETTE.boots;

  if (skinId === 'forest_ranger') {
    outfitPrimary = '#a16207'; // Khaki safari jacket
    outfitPants = '#451a03'; // Brown ranger pants
    outfitPantsDark = '#290e02';
    outfitHat = '#78350f'; // Dark ranger fedora
    outfitHatBand = '#f59e0b'; // Gold badge band
    bootsColor = '#1c1917';
  } else if (skinId === 'solar_scout') {
    outfitPrimary = '#0284c7'; // Cyan solar tunic
    outfitPants = '#0f172a'; // Obsidian tech suit
    outfitPantsDark = '#020617';
    outfitHat = '#0ea5e9'; // Solar visor cap
    outfitHatBand = '#38bdf8'; // Glowing neon visor
    bootsColor = '#0369a1';
  } else if (skinId === 'monsoon_botanist') {
    outfitPrimary = '#eab308'; // Canary yellow raincoat
    outfitPants = '#ca8a04';
    outfitPantsDark = '#a16207';
    outfitHat = '#facc15'; // Rain sou'wester hat
    outfitHatBand = '#15803d'; // Green strap
    bootsColor = '#14532d'; // Dark green wellies
  } else if (skinId === 'zen_hermit') {
    outfitPrimary = '#4d7c0f'; // Sage silk robe
    outfitPants = '#365314';
    outfitPantsDark = '#1a2e05';
    outfitHat = '#d97706'; // Conical bamboo hat
    outfitHatBand = '#78350f';
    bootsColor = '#78350f'; // Wooden sandals
  }

  // Boots / Feet
  ctx.fillStyle = bootsColor;
  if (direction === 'left' || direction === 'right') {
    ctx.fillRect(cx - 5 + legOffset, cy + 12, 6, 6);
    ctx.fillRect(cx - 2 - legOffset, cy + 12, 6, 6);
  } else {
    ctx.fillRect(cx - 7, cy + 12 + (legOffset ? 1 : 0), 5, 5);
    ctx.fillRect(cx + 2, cy + 12 + (legOffset ? -1 : 0), 5, 5);
  }

  // Pants / Overalls body
  ctx.fillStyle = outfitPants;
  ctx.fillRect(cx - 8, cy - 2, 16, 14);
  ctx.fillStyle = outfitPantsDark;
  ctx.fillRect(cx - 1, cy + 3, 2, 9); // leg divider

  // Shirt / Jacket
  ctx.fillStyle = outfitPrimary;
  ctx.fillRect(cx - 10, cy - 6, 20, 6);

  // Hands
  ctx.fillStyle = PIXEL_PALETTE.skin;
  if (direction === 'left') {
    ctx.fillRect(cx - 12, cy + 2, 4, 4);
  } else if (direction === 'right') {
    ctx.fillRect(cx + 8, cy + 2, 4, 4);
  } else {
    ctx.fillRect(cx - 11, cy + 1, 4, 4);
    ctx.fillRect(cx + 7, cy + 1, 4, 4);
  }

  // Head / Face
  ctx.fillStyle = PIXEL_PALETTE.skin;
  ctx.fillRect(cx - 7, cy - 16, 14, 11);

  // Directional facial details & hair
  if (direction === 'down') {
    if (skinId === 'solar_scout') {
      // Tech HUD Visor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 6, cy - 13, 12, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 4, cy - 12, 3, 2);
    } else {
      // Eyes
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 4, cy - 11, 2, 3);
      ctx.fillRect(cx + 2, cy - 11, 2, 3);
      // Rosy cheeks
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(cx - 5, cy - 8, 2, 1);
      ctx.fillRect(cx + 3, cy - 8, 2, 1);
      // Smile
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(cx - 2, cy - 7, 4, 1);
    }
  } else if (direction === 'up') {
    // Back of head / hair
    ctx.fillStyle = PIXEL_PALETTE.hair;
    ctx.fillRect(cx - 6, cy - 14, 12, 8);
  } else if (direction === 'left') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 5, cy - 11, 2, 3); // eye
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(cx - 6, cy - 8, 2, 1); // cheek
  } else if (direction === 'right') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx + 3, cy - 11, 2, 3); // eye
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(cx + 4, cy - 8, 2, 1); // cheek
  }

  // Headwear / Hat
  if (skinId === 'zen_hermit') {
    // Conical Asian Bamboo Rice Hat
    ctx.fillStyle = outfitHat;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 26);
    ctx.lineTo(cx - 15, cy - 17);
    ctx.lineTo(cx + 15, cy - 17);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = outfitHatBand;
    ctx.fillRect(cx - 8, cy - 18, 16, 2);
  } else {
    // Standard / Ranger / Raincoat Hat
    ctx.fillStyle = outfitHat;
    ctx.fillRect(cx - 12, cy - 18, 24, 4); // Wide brim
    ctx.fillRect(cx - 7, cy - 24, 14, 7); // Hat crown

    // Hat ribbon / badge
    ctx.fillStyle = outfitHatBand;
    ctx.fillRect(cx - 7, cy - 19, 14, 2);
  }
}

/**
 * Fallback procedural pixel-art tree renderer if sprite image is loading
 */
export function drawTreeSprite(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  treeSlug: string,
  growthStage = 4,
  tick = 0,
) {
  const cx = px + TILE_SIZE / 2;
  const bottomY = py + TILE_SIZE - 2;

  // Gentle wind sway oscillation
  const sway = Math.sin((tick + px * 3) / 25) * 1.5;

  // Mound of fertile soil at base
  ctx.fillStyle = PIXEL_PALETTE.soilBase;
  ctx.fillRect(cx - 10, bottomY - 4, 20, 4);
  ctx.fillStyle = PIXEL_PALETTE.soilLight;
  ctx.fillRect(cx - 6, bottomY - 6, 12, 3);

  // Stage 1: Sprout
  if (growthStage === 1) {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(cx - 1, bottomY - 14, 3, 9);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(cx - 6, bottomY - 16, 5, 4);
    ctx.fillRect(cx + 2, bottomY - 16, 5, 4);
    return;
  }

  // Stage 2: Sapling
  if (growthStage === 2) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 2, bottomY - 24, 4, 20);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(cx + sway, bottomY - 26, 12, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Stage 3 & 4: Procedural Mature Fallback
  ctx.fillStyle = '#653818';
  ctx.fillRect(cx - 3, bottomY - 32, 6, 28);
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(cx + sway, bottomY - 40, 20, 0, Math.PI * 2);
  ctx.fill();
}
