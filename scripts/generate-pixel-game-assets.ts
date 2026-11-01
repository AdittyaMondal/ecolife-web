import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const TILES_DIR = '/Users/yusuf/Coding/ECO/ecolife-web/public/tiles';
const SPRITES_DIR = '/Users/yusuf/Coding/ECO/ecolife-web/public/sprites';

fs.mkdirSync(TILES_DIR, { recursive: true });
fs.mkdirSync(SPRITES_DIR, { recursive: true });

const TILE_SIZE = 48;

class PixelCanvas {
  width: number;
  height: number;
  buffer: Uint8ClampedArray;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.buffer = new Uint8ClampedArray(w * h * 4); // all zeros = transparent
  }

  setPixel(x: number, y: number, r: number, g: number, b: number, a = 255) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (Math.floor(y) * this.width + Math.floor(x)) * 4;
    this.buffer[idx] = r;
    this.buffer[idx + 1] = g;
    this.buffer[idx + 2] = b;
    this.buffer[idx + 3] = a;
  }

  hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const num = Number.parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  fillRect(x: number, y: number, w: number, h: number, hex: string, alpha = 255) {
    const [r, g, b] = this.hexToRgb(hex);
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.setPixel(px, py, r, g, b, alpha);
      }
    }
  }

  fillCircle(cx: number, cy: number, radius: number, hex: string, alpha = 255) {
    const [r, g, b] = this.hexToRgb(hex);
    const r2 = radius * radius;
    for (let py = cy - radius; py <= cy + radius; py++) {
      for (let px = cx - radius; px <= cx + radius; px++) {
        const d2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
        if (d2 <= r2) {
          this.setPixel(px, py, r, g, b, alpha);
        }
      }
    }
  }

  async save(filePath: string) {
    await sharp(this.buffer, {
      raw: {
        width: this.width,
        height: this.height,
        channels: 4,
      },
    })
      .png()
      .toFile(filePath);
  }
}

// ==========================================
// 1. GENERATE BIOME TILESETS (16 TILES)
// ==========================================

const BIOMES = [
  {
    id: 'meadow',
    grass: { base: '#7ec050', light: '#94d366', dark: '#68a540', flower1: '#ffffff', flower2: '#f472b6', center: '#fde047' },
    path: { base: '#e8dcba', stone: '#c7b48c', shadow: '#9c8b6a' },
    water: { base: '#58a6ff', ripple: '#79c0ff', highlight: '#ffffff', lily: '#2ea043' },
    fence: { wood: '#8c603b', light: '#ab7e54', dark: '#624125' },
  },
  {
    id: 'zen_bamboo',
    grass: { base: '#e3d5b8', light: '#f4ebd8', dark: '#c5b493', moss1: '#588157', moss2: '#3a5a40', center: '#a3b18a' },
    path: { base: '#3d405b', stone: '#2b2d42', shadow: '#1a1b26' },
    water: { base: '#2a6f97', ripple: '#468faf', highlight: '#89c2d9', lily: '#e76f51' },
    fence: { wood: '#a3704c', light: '#d4a373', dark: '#6f4528' },
  },
  {
    id: 'autumn_orchard',
    grass: { base: '#c27d38', light: '#e09f3e', dark: '#9e5a23', leaf1: '#ea580c', leaf2: '#eab308', center: '#b91c1c' },
    path: { base: '#b97352', stone: '#8c432a', shadow: '#582414' },
    water: { base: '#3a6b7e', ripple: '#588d9f', highlight: '#8cb1bf', lily: '#d97706' },
    fence: { wood: '#582f0e', light: '#7f4f24', dark: '#371d08' },
  },
  {
    id: 'sacred_grove',
    grass: { base: '#1b4332', light: '#2d6a4f', dark: '#081c15', spore1: '#52b788', spore2: '#74c69d', center: '#48cae4' },
    path: { base: '#354f52', stone: '#2f3e46', shadow: '#131e21', rune: '#48cae4' },
    water: { base: '#0077b6', ripple: '#0096c7', highlight: '#90e0ef', lily: '#a855f7' },
    fence: { wood: '#283618', light: '#606c38', dark: '#141c0b' },
  },
];

for (const b of BIOMES) {
  // A. Grass Tile
  const grass = new PixelCanvas(TILE_SIZE, TILE_SIZE);
  grass.fillRect(0, 0, TILE_SIZE, TILE_SIZE, b.grass.base);

  // Textured blade clusters / sand ripples / moss
  for (let y = 4; y < TILE_SIZE; y += 8) {
    for (let x = 4; x < TILE_SIZE; x += 10) {
      const isAlt = (x * 7 + y * 13) % 3 === 0;
      grass.fillRect(x, y, 4, 3, isAlt ? b.grass.light : b.grass.dark);
      grass.fillRect(x + 2, y - 2, 2, 3, b.grass.light);
    }
  }

  // Botanical accents: flowers / leaves / spores
  if (b.id === 'meadow') {
    // Daisy 1
    grass.fillRect(14, 12, 4, 4, b.grass.flower1!);
    grass.fillRect(15, 13, 2, 2, b.grass.center);
    // Pink bloom 2
    grass.fillRect(32, 28, 4, 4, b.grass.flower2!);
    grass.fillRect(33, 29, 2, 2, b.grass.center);
  } else if (b.id === 'zen_bamboo') {
    // Raked sand ripples & moss mound
    grass.fillCircle(30, 24, 7, b.grass.moss1!);
    grass.fillCircle(32, 22, 4, b.grass.moss2!);
    // Raked lines
    grass.fillRect(4, 8, 20, 2, b.grass.dark);
    grass.fillRect(4, 14, 20, 2, b.grass.dark);
  } else if (b.id === 'autumn_orchard') {
    // Fallen maple leaves
    grass.fillRect(12, 14, 5, 4, b.grass.leaf1!);
    grass.fillRect(14, 12, 2, 7, b.grass.leaf1!);
    grass.fillRect(30, 26, 4, 4, b.grass.leaf2!);
  } else if (b.id === 'sacred_grove') {
    // Glowing bioluminescent spores
    grass.fillRect(16, 14, 3, 3, b.grass.spore1!);
    grass.fillRect(34, 28, 3, 3, b.grass.center);
    grass.fillRect(10, 36, 2, 2, b.grass.spore2!);
  }
  await grass.save(path.join(TILES_DIR, `${b.id}_grass.png`));

  // B. Path Tile
  const pathTile = new PixelCanvas(TILE_SIZE, TILE_SIZE);
  pathTile.fillRect(0, 0, TILE_SIZE, TILE_SIZE, b.path.base);

  // Cobblestones / Pavers
  const stones = [
    { x: 3, y: 3, w: 18, h: 10 },
    { x: 25, y: 3, w: 20, h: 12 },
    { x: 4, y: 16, w: 14, h: 14 },
    { x: 22, y: 18, w: 23, h: 12 },
    { x: 2, y: 33, w: 22, h: 12 },
    { x: 27, y: 33, w: 18, h: 12 },
  ];
  for (const s of stones) {
    pathTile.fillRect(s.x, s.y, s.w, s.h, b.path.stone);
    pathTile.fillRect(s.x, s.y, s.w, 1, '#ffffff', 40); // Top highlight
    pathTile.fillRect(s.x, s.y + s.h - 1, s.w, 1, b.path.shadow, 180); // Bottom shadow
    pathTile.fillRect(s.x + s.w - 1, s.y, 1, s.h, b.path.shadow, 180); // Right shadow
  }
  if (b.id === 'sacred_grove') {
    // Glowing blue rune engraving
    pathTile.fillRect(10, 20, 6, 2, '#48cae4');
    pathTile.fillRect(12, 18, 2, 6, '#48cae4');
    pathTile.fillRect(30, 8, 8, 2, '#48cae4');
  }
  await pathTile.save(path.join(TILES_DIR, `${b.id}_path.png`));

  // C. Water Tile
  const water = new PixelCanvas(TILE_SIZE, TILE_SIZE);
  water.fillRect(0, 0, TILE_SIZE, TILE_SIZE, b.water.base);

  // Water ripples
  water.fillRect(6, 10, 14, 2, b.water.ripple);
  water.fillRect(10, 11, 6, 1, b.water.highlight, 180);

  water.fillRect(24, 22, 16, 2, b.water.ripple);
  water.fillRect(28, 23, 8, 1, b.water.highlight, 180);

  water.fillRect(8, 34, 18, 2, b.water.ripple);

  // Lilypad & flower
  water.fillCircle(34, 34, 6, b.water.lily);
  water.fillRect(33, 33, 3, 3, '#f472b6');
  water.fillRect(34, 34, 1, 1, '#fde047');
  await water.save(path.join(TILES_DIR, `${b.id}_water.png`));

  // D. Fence Tile
  const fence = new PixelCanvas(TILE_SIZE, TILE_SIZE);
  // Grass underlay
  fence.fillRect(0, 0, TILE_SIZE, TILE_SIZE, b.grass.base);

  // Horizontal rails
  fence.fillRect(0, 12, TILE_SIZE, 5, b.fence.wood);
  fence.fillRect(0, 12, TILE_SIZE, 1, b.fence.light);
  fence.fillRect(0, 16, TILE_SIZE, 1, b.fence.dark);

  fence.fillRect(0, 28, TILE_SIZE, 5, b.fence.wood);
  fence.fillRect(0, 28, TILE_SIZE, 1, b.fence.light);
  fence.fillRect(0, 32, TILE_SIZE, 1, b.fence.dark);

  // Vertical Posts
  for (const postX of [8, 32]) {
    fence.fillRect(postX, 6, 8, 36, b.fence.wood);
    fence.fillRect(postX, 6, 8, 2, b.fence.light); // post cap
    fence.fillRect(postX + 6, 8, 2, 34, b.fence.dark); // post shadow
  }
  await fence.save(path.join(TILES_DIR, `${b.id}_fence.png`));

  console.log(`Saved 4 tiles for biome: ${b.id}`);
}

// ==========================================
// 2. GENERATE MULTI-FRAME CHARACTER SPRITES
// ==========================================

const SKINS = [
  {
    id: 'gardener_default',
    hat: { base: '#eab308', crown: '#ca8a04', band: '#15803d' },
    shirt: { base: '#22c55e', shadow: '#16a34a' },
    pants: { base: '#2563eb', shadow: '#1d4ed8' },
    boots: '#78350f',
    hair: '#5c3a21',
    skin: '#ffdfba',
    cheeks: '#f43f5e',
    eyes: '#1e293b',
  },
  {
    id: 'forest_ranger',
    hat: { base: '#78350f', crown: '#572608', band: '#f59e0b' },
    shirt: { base: '#a16207', shadow: '#854d0e' },
    pants: { base: '#451a03', shadow: '#2c1102' },
    boots: '#1c1917',
    hair: '#29180c',
    skin: '#f5cb98',
    cheeks: '#e07a5f',
    eyes: '#0f172a',
  },
  {
    id: 'solar_scout',
    hat: { base: '#0ea5e9', crown: '#0284c7', band: '#38bdf8', isVisor: true },
    shirt: { base: '#0284c7', shadow: '#0369a1', glow: '#22d3ee' },
    pants: { base: '#0f172a', shadow: '#020617', glow: '#22d3ee' },
    boots: '#0369a1',
    hair: '#334155',
    skin: '#fed7aa',
    cheeks: '#38bdf8',
    eyes: '#38bdf8',
  },
  {
    id: 'monsoon_botanist',
    hat: { base: '#facc15', crown: '#eab308', band: '#15803d' },
    shirt: { base: '#eab308', shadow: '#ca8a04' },
    pants: { base: '#ca8a04', shadow: '#a16207' },
    boots: '#14532d', // wellies
    hair: '#451a03',
    skin: '#ffdfba',
    cheeks: '#f43f5e',
    eyes: '#1e293b',
  },
  {
    id: 'zen_hermit',
    hat: { base: '#d97706', crown: '#b45309', band: '#78350f', isConical: true },
    shirt: { base: '#4d7c0f', shadow: '#365314' },
    pants: { base: '#365314', shadow: '#1a2e05' },
    boots: '#78350f', // wooden geta
    hair: '#3f3f46',
    skin: '#f6d5b0',
    cheeks: '#e09f3e',
    eyes: '#1e293b',
  },
];

for (const skin of SKINS) {
  const cx = 24;
  const cy = 24;

  // Directions: 'down', 'up', 'side'
  // Frames: 0: Idle, 1: Step Left, 2: Step Right
  for (const dir of ['down', 'up', 'side'] as const) {
    for (const frame of [0, 1, 2] as const) {
      const c = new PixelCanvas(TILE_SIZE, TILE_SIZE);

      // Walk step bounce / leg offsets
      let legL_Y = 0;
      let legR_Y = 0;
      let armL_Y = 0;
      let armR_Y = 0;
      let bobY = 0;

      if (frame === 1) {
        bobY = -1;
        legL_Y = 2;
        legR_Y = -2;
        armL_Y = -2;
        armR_Y = 2;
      } else if (frame === 2) {
        bobY = -1;
        legL_Y = -2;
        legR_Y = 2;
        armL_Y = 2;
        armR_Y = -2;
      }

      const yOffset = cy + bobY;

      // 1. Drop shadow under character
      c.fillCircle(cx, 43, 7, '#000000', 60);

      // 2. Boots / Feet
      if (dir === 'side') {
        const stride = frame === 1 ? 3 : frame === 2 ? -3 : 0;
        c.fillRect(cx - 4 + stride, yOffset + 13, 7, 5, skin.boots);
        c.fillRect(cx - 1 - stride, yOffset + 13, 6, 5, skin.boots);
      } else {
        // Down or Up: left and right boots
        c.fillRect(cx - 7, yOffset + 13 + legL_Y, 5, 5, skin.boots);
        c.fillRect(cx + 2, yOffset + 13 + legR_Y, 5, 5, skin.boots);
      }

      // 3. Pants / Overalls
      if (dir === 'side') {
        c.fillRect(cx - 5, yOffset - 1, 10, 14, skin.pants.base);
        c.fillRect(cx - 1, yOffset + 2, 2, 10, skin.pants.shadow);
      } else {
        c.fillRect(cx - 7, yOffset - 1, 14, 14, skin.pants.base);
        c.fillRect(cx - 1, yOffset + 3, 2, 10, skin.pants.shadow); // Leg seam
      }

      // 4. Torso / Shirt
      c.fillRect(cx - 8, yOffset - 6, 16, 6, skin.shirt.base);
      c.fillRect(cx - 2, yOffset - 6, 4, 6, skin.shirt.shadow);

      // 5. Arms & Hands
      if (dir === 'side') {
        const armSwing = frame === 1 ? 3 : frame === 2 ? -3 : 0;
        c.fillRect(cx - 2 + armSwing, yOffset - 4, 5, 8, skin.shirt.base);
        c.fillRect(cx - 1 + armSwing, yOffset + 4, 3, 3, skin.skin); // Hand
      } else {
        // Left arm
        c.fillRect(cx - 10, yOffset - 4 + armL_Y, 3, 7, skin.shirt.base);
        c.fillRect(cx - 10, yOffset + 3 + armL_Y, 3, 3, skin.skin);
        // Right arm
        c.fillRect(cx + 7, yOffset - 4 + armR_Y, 3, 7, skin.shirt.base);
        c.fillRect(cx + 7, yOffset + 3 + armR_Y, 3, 3, skin.skin);
      }

      // 6. Head & Face
      c.fillRect(cx - 6, yOffset - 15, 12, 10, skin.skin);

      if (dir === 'down') {
        if (skin.hat.isVisor) {
          // Cyber Visor
          c.fillRect(cx - 5, yOffset - 12, 10, 4, skin.hat.band);
          c.fillRect(cx - 3, yOffset - 11, 3, 2, '#ffffff');
        } else {
          // Eyes
          c.fillRect(cx - 4, yOffset - 11, 2, 3, skin.eyes);
          c.fillRect(cx + 2, yOffset - 11, 2, 3, skin.eyes);
          // Rosy Cheeks
          c.fillRect(cx - 5, yOffset - 8, 2, 1, skin.cheeks);
          c.fillRect(cx + 3, yOffset - 8, 2, 1, skin.cheeks);
          // Smile
          c.fillRect(cx - 2, yOffset - 7, 4, 1, '#b91c1c');
        }
      } else if (dir === 'up') {
        // Back of head / hair
        c.fillRect(cx - 5, yOffset - 14, 10, 7, skin.hair);
      } else if (dir === 'side') {
        // Side profile eye & cheek
        if (skin.hat.isVisor) {
          c.fillRect(cx, yOffset - 12, 6, 4, skin.hat.band);
        } else {
          c.fillRect(cx + 1, yOffset - 11, 2, 3, skin.eyes);
          c.fillRect(cx + 2, yOffset - 8, 2, 1, skin.cheeks);
        }
      }

      // 7. Hat / Headgear
      if (skin.hat.isConical) {
        // Zen Bamboo Conical Hat
        for (let row = 0; row < 9; row++) {
          const w = 4 + row * 3;
          c.fillRect(cx - Math.floor(w / 2), yOffset - 24 + row, w, 1, skin.hat.base);
        }
        c.fillRect(cx - 7, yOffset - 16, 14, 2, skin.hat.band);
      } else {
        // Wide brim hat
        c.fillRect(cx - 10, yOffset - 17, 20, 3, skin.hat.base); // Brim
        c.fillRect(cx - 6, yOffset - 23, 12, 6, skin.hat.crown); // Crown
        c.fillRect(cx - 6, yOffset - 18, 12, 2, skin.hat.band); // Band
      }

      // Save sprite frame
      const fileName = `${skin.id}_${dir}_${frame}.png`;
      await c.save(path.join(SPRITES_DIR, fileName));
    }
  }

  // Also write default aliases so `${skin.id}.png` resolves
  fs.copyFileSync(
    path.join(SPRITES_DIR, `${skin.id}_down_0.png`),
    path.join(SPRITES_DIR, `${skin.id}.png`),
  );
  console.log(`Saved 9 animation frames for skin: ${skin.id}`);
}
console.log('All pixel game assets generated successfully!');
