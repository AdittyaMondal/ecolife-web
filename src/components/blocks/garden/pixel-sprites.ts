/**
 * Crisp procedural pixel-art sprite rendering engine for EcoLife Garden.
 * All graphics are drawn with integer coordinates on disabled image-smoothing canvas
 * for authentic 16-bit retro aesthetic.
 */

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
 * Draw a grass tile at (x, y) with organic blade variants and tiny daisies
 */
export function drawGrassTile(ctx: CanvasRenderingContext2D, px: number, py: number, seed: number) {
  ctx.fillStyle = PIXEL_PALETTE.grassBase;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  // Subtle checkered grass blades
  ctx.fillStyle = PIXEL_PALETTE.grassLight;
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
  ctx.fillStyle = PIXEL_PALETTE.grassDark;
  if ((seed * 11) % 4 === 1) {
    ctx.fillRect(px + 36, py + 6, 4, 4);
  }
  if ((seed * 17) % 3 === 1) {
    ctx.fillRect(px + 8, py + 22, 4, 4);
  }

  // Occasional tiny wild daisy or clover
  if (seed % 7 === 0) {
    // White daisy
    ctx.fillStyle = PIXEL_PALETTE.flowerWhite;
    ctx.fillRect(px + 20, py + 14, 6, 6);
    ctx.fillStyle = PIXEL_PALETTE.flowerYellow;
    ctx.fillRect(px + 22, py + 16, 2, 2);
  } else if (seed % 11 === 0) {
    // Pink blossom
    ctx.fillStyle = PIXEL_PALETTE.flowerPink;
    ctx.fillRect(px + 24, py + 30, 5, 5);
    ctx.fillStyle = PIXEL_PALETTE.flowerYellow;
    ctx.fillRect(px + 25, py + 31, 3, 3);
  }
}

/**
 * Draw a dirt / stone pathway tile
 */
export function drawPathTile(ctx: CanvasRenderingContext2D, px: number, py: number, seed: number) {
  ctx.fillStyle = PIXEL_PALETTE.pathBase;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  ctx.fillStyle = PIXEL_PALETTE.pathLight;
  ctx.fillRect(px + 4, py + 4, 18, 14);
  ctx.fillRect(px + 26, py + 22, 18, 16);

  ctx.fillStyle = PIXEL_PALETTE.pathDark;
  ctx.fillRect(px + 2, py + 18, 4, 2);
  ctx.fillRect(px + 22, py + 38, 4, 2);

  // Tiny pebbles
  ctx.fillStyle = PIXEL_PALETTE.pathPebble;
  if (seed % 2 === 0) {
    ctx.fillRect(px + 10, py + 30, 3, 3);
    ctx.fillRect(px + 34, py + 10, 4, 3);
  } else {
    ctx.fillRect(px + 14, py + 12, 3, 3);
    ctx.fillRect(px + 30, py + 32, 4, 3);
  }
}

/**
 * Draw garden water pond tile
 */
export function drawWaterTile(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  tick: number,
  hasLilypad = false,
) {
  ctx.fillStyle = PIXEL_PALETTE.waterBase;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  // Animated ripples
  const offset = Math.floor((tick / 15) % 8);
  ctx.fillStyle = PIXEL_PALETTE.waterLight;
  ctx.fillRect(px + 4 + offset, py + 12, 12, 3);
  ctx.fillRect(px + 24 - offset, py + 30, 14, 3);

  ctx.fillStyle = PIXEL_PALETTE.waterDark;
  ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);

  // Lilypad
  if (hasLilypad) {
    ctx.fillStyle = PIXEL_PALETTE.lilypad;
    ctx.beginPath();
    ctx.arc(px + 24, py + 24, 9, 0, Math.PI * 1.7);
    ctx.fill();

    // Pink water flower
    ctx.fillStyle = PIXEL_PALETTE.flowerPink;
    ctx.fillRect(px + 21, py + 20, 4, 4);
    ctx.fillStyle = PIXEL_PALETTE.flowerYellow;
    ctx.fillRect(px + 22, py + 21, 2, 2);
  }
}

/**
 * Draw garden perimeter fence
 */
export function drawFenceTile(ctx: CanvasRenderingContext2D, px: number, py: number) {
  // Underlying grass
  ctx.fillStyle = PIXEL_PALETTE.grassBase;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  // Wooden fence posts & horizontal rails
  ctx.fillStyle = PIXEL_PALETTE.fenceWood;
  // Rails
  ctx.fillRect(px, py + 16, TILE_SIZE, 5);
  ctx.fillRect(px, py + 30, TILE_SIZE, 5);

  // Posts
  ctx.fillRect(px + 8, py + 6, 8, 36);
  ctx.fillRect(px + 32, py + 6, 8, 36);

  // Post caps & highlights
  ctx.fillStyle = PIXEL_PALETTE.fenceLight;
  ctx.fillRect(px + 8, py + 6, 8, 4);
  ctx.fillRect(px + 32, py + 6, 8, 4);
  ctx.fillRect(px + 8, py + 16, 2, 5);
  ctx.fillRect(px + 32, py + 16, 2, 5);

  // Shadows
  ctx.fillStyle = PIXEL_PALETTE.fenceDark;
  ctx.fillRect(px + 14, py + 10, 2, 32);
  ctx.fillRect(px + 38, py + 10, 2, 32);
}

/**
 * Draw Gardener Character Sprite
 */
export function drawGardener(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  direction: 'up' | 'down' | 'left' | 'right',
  isWalking: boolean,
  tick: number,
) {
  // Walk bob oscillation (0 or 2 pixels)
  const bob = isWalking && Math.floor((tick / 8) % 2) === 1 ? -2 : 0;
  const legOffset = isWalking && Math.floor((tick / 8) % 2) === 1 ? 3 : 0;

  const cx = px + TILE_SIZE / 2;
  const cy = py + TILE_SIZE / 2 + bob;

  // Drop shadow under feet
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, py + TILE_SIZE - 4, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Boots / Feet
  ctx.fillStyle = PIXEL_PALETTE.boots;
  if (direction === 'left' || direction === 'right') {
    ctx.fillRect(cx - 5 + legOffset, cy + 12, 6, 6);
    ctx.fillRect(cx - 2 - legOffset, cy + 12, 6, 6);
  } else {
    ctx.fillRect(cx - 7, cy + 12 + (legOffset ? 1 : 0), 5, 5);
    ctx.fillRect(cx + 2, cy + 12 + (legOffset ? -1 : 0), 5, 5);
  }

  // Pants / Overalls body
  ctx.fillStyle = PIXEL_PALETTE.overallsBlue;
  ctx.fillRect(cx - 8, cy - 2, 16, 14);
  ctx.fillStyle = PIXEL_PALETTE.overallsDark;
  ctx.fillRect(cx - 1, cy + 3, 2, 9); // leg divider

  // Shirt sleeves
  ctx.fillStyle = PIXEL_PALETTE.shirtGreen;
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

  // Gardener Straw Hat (iconic brim and crown)
  ctx.fillStyle = PIXEL_PALETTE.hatStraw;
  ctx.fillRect(cx - 12, cy - 18, 24, 4); // Wide brim
  ctx.fillRect(cx - 7, cy - 24, 14, 7); // Hat crown

  // Green hat ribbon
  ctx.fillStyle = PIXEL_PALETTE.hatBand;
  ctx.fillRect(cx - 7, cy - 19, 14, 2);
}

/**
 * Draw a pixel-art tree based on its species and growth stage
 */
export function drawTreeSprite(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  treeSlug: string,
  growthStage = 4, // 1: Seedling, 2: Sapling, 3: Young, 4: Full Mature
  tick = 0,
) {
  const cx = px + TILE_SIZE / 2;
  const bottomY = py + TILE_SIZE - 2;

  // Gentle wind sway oscillation for mature trees
  const sway = Math.sin((tick + px * 3) / 25) * 1.5;

  // Mound of fertile soil at base
  ctx.fillStyle = PIXEL_PALETTE.soilBase;
  ctx.fillRect(cx - 10, bottomY - 4, 20, 4);
  ctx.fillStyle = PIXEL_PALETTE.soilLight;
  ctx.fillRect(cx - 6, bottomY - 6, 12, 3);

  // Stage 1: Seedling / Little Sprout
  if (growthStage === 1) {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(cx - 1, bottomY - 14, 3, 9);
    // Two little curved sprout leaves
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(cx - 6, bottomY - 16, 5, 4);
    ctx.fillRect(cx + 2, bottomY - 16, 5, 4);
    return;
  }

  // Stage 2: Young Sapling
  if (growthStage === 2) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 2, bottomY - 24, 4, 20);
    // Small bushy canopy
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(cx + sway, bottomY - 26, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.fillRect(cx - 4 + sway, bottomY - 32, 6, 6);
    return;
  }

  // Stage 3 & 4: Mature Species-Specific Pixel Trees
  switch (treeSlug) {
    case 'neem': {
      // Slender tall brown trunk with branches
      ctx.fillStyle = '#653818';
      ctx.fillRect(cx - 3, bottomY - 32, 6, 28);
      ctx.fillRect(cx - 8, bottomY - 28, 6, 4);
      ctx.fillRect(cx + 2, bottomY - 24, 7, 4);

      // Serrated feathery green canopy
      ctx.fillStyle = '#15803d'; // Deep green
      ctx.beginPath();
      ctx.arc(cx - 10 + sway, bottomY - 36, 14, 0, Math.PI * 2);
      ctx.arc(cx + 10 + sway, bottomY - 36, 14, 0, Math.PI * 2);
      ctx.arc(cx + sway, bottomY - 44, 18, 0, Math.PI * 2);
      ctx.fill();

      // Light leafy texture & yellow medicinal berries
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(cx - 6 + sway, bottomY - 48, 8, 6);
      ctx.fillRect(cx + 6 + sway, bottomY - 40, 6, 6);

      ctx.fillStyle = '#fde047'; // Neem berries
      ctx.fillRect(cx - 8 + sway, bottomY - 34, 3, 3);
      ctx.fillRect(cx + 7 + sway, bottomY - 44, 3, 3);
      ctx.fillRect(cx + 2 + sway, bottomY - 36, 3, 3);
      break;
    }

    case 'mango': {
      // Solid thick trunk
      ctx.fillStyle = '#543015';
      ctx.fillRect(cx - 5, bottomY - 28, 10, 24);

      // Lush round dense dome canopy
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(cx + sway, bottomY - 38, 22, 0, Math.PI * 2);
      ctx.fill();

      // Bright leaf highlights
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(cx - 4 + sway, bottomY - 42, 14, 0, Math.PI * 2);
      ctx.fill();

      // Golden ripe mangoes hanging
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 10 + sway, bottomY - 36, 4, 5);
      ctx.fillRect(cx + 8 + sway, bottomY - 40, 4, 5);
      ctx.fillRect(cx - 2 + sway, bottomY - 46, 4, 5);
      ctx.fillRect(cx + 4 + sway, bottomY - 32, 4, 5);
      break;
    }

    case 'amaltas': {
      // Slender trunk
      ctx.fillStyle = '#713f12';
      ctx.fillRect(cx - 3, bottomY - 30, 6, 26);

      // Emerald canopy
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(cx + sway, bottomY - 38, 18, 0, Math.PI * 2);
      ctx.fill();

      // Cascading golden-yellow floral tassels!
      ctx.fillStyle = '#facc15';
      // Draped chains of blossoms
      ctx.fillRect(cx - 14 + sway, bottomY - 34, 5, 12);
      ctx.fillRect(cx - 6 + sway, bottomY - 32, 6, 15);
      ctx.fillRect(cx + 3 + sway, bottomY - 32, 6, 14);
      ctx.fillRect(cx + 10 + sway, bottomY - 36, 5, 11);

      ctx.fillStyle = '#fef08a'; // bright tips
      ctx.fillRect(cx - 13 + sway, bottomY - 24, 3, 4);
      ctx.fillRect(cx - 5 + sway, bottomY - 19, 4, 4);
      ctx.fillRect(cx + 4 + sway, bottomY - 20, 4, 4);
      break;
    }

    case 'teak': {
      // Tall, straight, powerful timber trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - 5, bottomY - 42, 10, 38);

      // Tiered broad horizontal leaf canopy
      ctx.fillStyle = '#14532d';
      ctx.fillRect(cx - 22 + sway, bottomY - 48, 44, 12);
      ctx.fillRect(cx - 16 + sway, bottomY - 58, 32, 12);
      ctx.fillRect(cx - 10 + sway, bottomY - 66, 20, 10);

      ctx.fillStyle = '#16a34a'; // Large leaf highlights
      ctx.fillRect(cx - 18 + sway, bottomY - 46, 10, 4);
      ctx.fillRect(cx + 8 + sway, bottomY - 46, 10, 4);
      ctx.fillRect(cx - 12 + sway, bottomY - 56, 8, 4);
      break;
    }

    case 'gulmohar': {
      // Graceful umbrella trunk
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(cx - 4, bottomY - 34, 8, 30);
      ctx.fillRect(cx - 14, bottomY - 38, 12, 5);
      ctx.fillRect(cx + 2, bottomY - 38, 12, 5);

      // Fiery scarlet-red flowering umbrella!
      ctx.fillStyle = '#dc2626'; // Vivid flame red
      ctx.beginPath();
      ctx.ellipse(cx + sway, bottomY - 44, 25, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Orange and vermilion petals
      ctx.fillStyle = '#f97316';
      ctx.fillRect(cx - 16 + sway, bottomY - 48, 8, 8);
      ctx.fillRect(cx + 8 + sway, bottomY - 48, 8, 8);
      ctx.fillRect(cx - 4 + sway, bottomY - 54, 8, 8);

      ctx.fillStyle = '#fef08a'; // Golden pistil centers
      ctx.fillRect(cx - 8 + sway, bottomY - 42, 3, 3);
      ctx.fillRect(cx + 4 + sway, bottomY - 44, 3, 3);
      break;
    }

    case 'jacaranda': {
      // Slender dark trunk
      ctx.fillStyle = '#4a2810';
      ctx.fillRect(cx - 3, bottomY - 32, 6, 28);

      // Dreamy violet-purple blossom canopy!
      ctx.fillStyle = '#7c3aed'; // Royal purple
      ctx.beginPath();
      ctx.arc(cx - 10 + sway, bottomY - 38, 16, 0, Math.PI * 2);
      ctx.arc(cx + 10 + sway, bottomY - 38, 16, 0, Math.PI * 2);
      ctx.arc(cx + sway, bottomY - 48, 18, 0, Math.PI * 2);
      ctx.fill();

      // Lavender highlights
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(cx - 8 + sway, bottomY - 52, 10, 8);
      ctx.fillRect(cx + 6 + sway, bottomY - 42, 8, 8);
      ctx.fillRect(cx - 14 + sway, bottomY - 38, 6, 6);
      break;
    }

    case 'peepal': {
      // Pale silvery trunk with sacred contours
      ctx.fillStyle = '#78716c';
      ctx.fillRect(cx - 5, bottomY - 36, 10, 32);

      // Broad shimmering sacred canopy
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(cx + sway, bottomY - 44, 24, 0, Math.PI * 2);
      ctx.fill();

      // Heart-leaf shimmer
      ctx.fillStyle = '#86efac';
      ctx.fillRect(cx - 12 + sway, bottomY - 50, 6, 6);
      ctx.fillRect(cx + 6 + sway, bottomY - 52, 6, 6);
      ctx.fillRect(cx - 4 + sway, bottomY - 40, 8, 6);

      // Sacred golden aura glint (Epic tier)
      if (Math.floor(tick / 20) % 2 === 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx + 16 + sway, bottomY - 56, 3, 3);
        ctx.fillRect(cx - 18 + sway, bottomY - 42, 3, 3);
      }
      break;
    }

    default: {
      // Massive ancient trunk with iconic aerial prop roots!
      ctx.fillStyle = '#44281d';
      ctx.fillRect(cx - 8, bottomY - 34, 16, 30);
      // Aerial roots hanging to the ground
      ctx.fillRect(cx - 18, bottomY - 26, 3, 24);
      ctx.fillRect(cx + 15, bottomY - 26, 3, 24);
      ctx.fillRect(cx - 24, bottomY - 20, 2, 18);
      ctx.fillRect(cx + 22, bottomY - 20, 2, 18);

      // Expansive giant canopy spreading wide
      ctx.fillStyle = '#064e3b'; // Deep emerald
      ctx.beginPath();
      ctx.arc(cx - 18 + sway, bottomY - 42, 18, 0, Math.PI * 2);
      ctx.arc(cx + 18 + sway, bottomY - 42, 18, 0, Math.PI * 2);
      ctx.arc(cx + sway, bottomY - 50, 26, 0, Math.PI * 2);
      ctx.fill();

      // Lush canopy highlights
      ctx.fillStyle = '#10b981';
      ctx.fillRect(cx - 14 + sway, bottomY - 58, 12, 8);
      ctx.fillRect(cx + 6 + sway, bottomY - 54, 14, 8);
      ctx.fillRect(cx - 24 + sway, bottomY - 42, 8, 6);

      // Legendary golden amber sparkle
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx + 2 + sway, bottomY - 62, 4, 4);
      ctx.fillRect(cx - 22 + sway, bottomY - 46, 3, 3);
      ctx.fillRect(cx + 22 + sway, bottomY - 48, 3, 3);
      break;
    }
  }
}
