import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = '/Users/yusuf/Coding/ECO/ecolife-web/public/maps';
fs.mkdirSync(OUT_DIR, { recursive: true });

const MAP_WIDTH = 768; // 16 cols * 48px
const MAP_HEIGHT = 528; // 11 rows * 48px
const TILE_SIZE = 48;
const COLS = 16;
const ROWS = 11;

class PixelCanvas {
  width: number;
  height: number;
  buffer: Uint8ClampedArray;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.buffer = new Uint8ClampedArray(w * h * 4);
  }

  setPixel(x: number, y: number, r: number, g: number, b: number, a = 255) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return;
    const idx = (iy * this.width + ix) * 4;
    if (a >= 255) {
      this.buffer[idx] = r;
      this.buffer[idx + 1] = g;
      this.buffer[idx + 2] = b;
      this.buffer[idx + 3] = 255;
    } else {
      const alpha = a / 255;
      const invAlpha = 1 - alpha;
      this.buffer[idx] = Math.round(r * alpha + this.buffer[idx] * invAlpha);
      this.buffer[idx + 1] = Math.round(g * alpha + this.buffer[idx + 1] * invAlpha);
      this.buffer[idx + 2] = Math.round(b * alpha + this.buffer[idx + 2] * invAlpha);
      this.buffer[idx + 3] = Math.min(255, this.buffer[idx + 3] + a);
    }
  }

  hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const num = Number.parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  fillRect(x: number, y: number, w: number, h: number, hex: string, alpha = 255) {
    const [r, g, b] = this.hexToRgb(hex);
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(this.width, Math.floor(x + w));
    const endY = Math.min(this.height, Math.floor(y + h));
    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        this.setPixel(px, py, r, g, b, alpha);
      }
    }
  }

  fillCircle(cx: number, cy: number, radius: number, hex: string, alpha = 255) {
    const [r, g, b] = this.hexToRgb(hex);
    const r2 = radius * radius;
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(this.height - 1, Math.ceil(cy + radius));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const d2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
        if (d2 <= r2) {
          this.setPixel(px, py, r, g, b, alpha);
        }
      }
    }
  }

  fillOval(cx: number, cy: number, rx: number, ry: number, hex: string, alpha = 255) {
    const [r, g, b] = this.hexToRgb(hex);
    const minX = Math.max(0, Math.floor(cx - rx));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + rx));
    const minY = Math.max(0, Math.floor(cy - ry));
    const maxY = Math.min(this.height - 1, Math.ceil(cy + ry));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const normX = (px - cx) / rx;
        const normY = (py - cy) / ry;
        if (normX * normX + normY * normY <= 1) {
          this.setPixel(px, py, r, g, b, alpha);
        }
      }
    }
  }

  drawDropShadow(x: number, y: number, w: number, h: number, alpha = 60) {
    this.fillRect(x, y, w, h, '#000000', alpha);
  }

  drawFencePost(
    x: number,
    y: number,
    w: number,
    h: number,
    baseColor: string,
    lightColor: string,
    darkColor: string,
    capColor: string,
  ) {
    this.drawDropShadow(x - 2, y + h - 4, w + 6, 8, 80);
    this.fillRect(x, y + 4, w, h - 4, baseColor);
    this.fillRect(x, y + 4, 2, h - 4, lightColor);
    this.fillRect(x + w - 2, y + 4, 2, h - 4, darkColor);
    this.fillRect(x + 3, y + Math.floor(h * 0.4), 2, 4, darkColor);
    this.fillRect(x - 1, y, w + 2, 4, capColor);
    this.fillRect(x + 1, y - 2, w - 2, 2, lightColor);
  }

  drawHorizontalRail(
    x: number,
    y: number,
    w: number,
    h: number,
    baseColor: string,
    lightColor: string,
    darkColor: string,
  ) {
    this.drawDropShadow(x, y + h, w, 3, 60);
    this.fillRect(x, y, w, h, baseColor);
    this.fillRect(x, y, w, 1, lightColor);
    this.fillRect(x, y + h - 1, w, 1, darkColor);
  }

  drawVerticalRail(
    x: number,
    y: number,
    w: number,
    h: number,
    baseColor: string,
    lightColor: string,
    darkColor: string,
  ) {
    this.drawDropShadow(x + w, y, 3, h, 60);
    this.fillRect(x, y, w, h, baseColor);
    this.fillRect(x, y, 1, h, lightColor);
    this.fillRect(x + w - 1, y, 1, h, darkColor);
  }

  drawStone(
    x: number,
    y: number,
    w: number,
    h: number,
    baseColor: string,
    lightColor: string,
    darkColor: string,
    mossColor?: string,
  ) {
    this.fillRect(x, y, w, h, darkColor);
    this.fillRect(x + 1, y + 1, w - 2, h - 2, baseColor);
    this.fillRect(x + 1, y + 1, w - 2, 1, lightColor);
    this.fillRect(x + 1, y + 1, 1, h - 2, lightColor);
    this.fillRect(x + 1, y + h - 2, w - 2, 1, darkColor);
    this.fillRect(x + w - 2, y + 1, 1, h - 2, darkColor);

    if (mossColor && (x + y) % 5 === 0) {
      this.fillRect(x + 2, y + 2, 3, 2, mossColor);
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
      .png({ compressionLevel: 9 })
      .toFile(filePath);
  }
}

// ==========================================
// 1. MEADOW BIOME (From User Uploaded Image!)
// ==========================================
async function processMeadow() {
  const userMapPath =
    '/Users/yusuf/.gemini/antigravity/brain/b6c3e4ad-c13b-48d5-bc2d-fa72adb6de26/.user_uploaded/media_1793507736367_9625bf29.jpg';
  const outPath = path.join(OUT_DIR, 'meadow.png');

  if (fs.existsSync(userMapPath)) {
    await sharp(userMapPath)
      .resize(MAP_WIDTH, MAP_HEIGHT, { fit: 'fill' })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log('✓ Meadow map matched exactly from user image (768x528): meadow.png');
  }
}

// ==========================================
// 2. ZEN BAMBOO BIOME (NO POND, MATCHING USER LAYOUT)
// ==========================================
async function generateZenBamboo() {
  const map = new PixelCanvas(MAP_WIDTH, MAP_HEIGHT);

  // A. Raked Zen sand & fine river silt
  map.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT, '#d8c7a7');

  for (let y = 0; y < MAP_HEIGHT; y += 8) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const wave = Math.sin((x / 32) + (y / 16)) * 2;
      const py = Math.floor(y + wave);
      map.setPixel(x, py, 235, 224, 203, 180);
      map.setPixel(x, py + 1, 190, 171, 134, 180);
    }
  }

  // Zen rock garden formations with moss cushions across the field
  const zenRockSites = [
    { x: 120, y: 120, r: 16 },
    { x: 620, y: 130, r: 18 },
    { x: 150, y: 400, r: 18 },
    { x: 620, y: 390, r: 20 },
    { x: 260, y: 140, r: 14 },
    { x: 490, y: 380, r: 16 },
  ];

  for (const rock of zenRockSites) {
    for (let rad = rock.r + 14; rad >= rock.r + 4; rad -= 4) {
      for (let deg = 0; deg < 360; deg += 4) {
        const theta = (deg * Math.PI) / 180;
        const rx = Math.floor(rock.x + Math.cos(theta) * rad);
        const ry = Math.floor(rock.y + Math.sin(theta) * rad);
        map.setPixel(rx, ry, 235, 224, 203, 140);
        map.setPixel(rx, ry + 1, 190, 171, 134, 140);
      }
    }
    map.fillCircle(rock.x, rock.y, rock.r + 4, '#4d7c3f');
    map.fillCircle(rock.x - 2, rock.y - 2, rock.r + 2, '#65a30d');
    map.fillOval(rock.x, rock.y, rock.r, rock.r * 0.8, '#475569');
    map.fillOval(rock.x - 2, rock.y - 3, rock.r * 0.8, rock.r * 0.6, '#64748b');
    map.fillOval(rock.x - 4, rock.y - 5, rock.r * 0.4, rock.r * 0.3, '#94a3b8');
  }

  // B. Dark slate stepping stone path (horizontal on row 5, vertical from top down to row 7)
  const pathRowY = 5 * TILE_SIZE;
  const pathColX = 7 * TILE_SIZE;

  // Horizontal path spanning from left to right (2 stones thick)
  for (let px = TILE_SIZE; px < MAP_WIDTH - TILE_SIZE; px += 24) {
    map.drawStone(px, pathRowY, 22, 22, '#334155', '#475569', '#1e293b', '#65a30d');
    map.drawStone(px, pathRowY + 24, 22, 22, '#334155', '#475569', '#1e293b', '#65a30d');
  }

  // Vertical path from top down through row 5 and ending at row 7 (2 tiles below)
  for (let py = TILE_SIZE; py <= 7 * TILE_SIZE; py += 24) {
    map.drawStone(pathColX, py, 22, 22, '#334155', '#475569', '#1e293b', '#65a30d');
    map.drawStone(pathColX + 24, py, 22, 22, '#334155', '#475569', '#1e293b', '#65a30d');
  }

  // D. Woven Bamboo Fence (Takegaki)
  const botY = (ROWS - 1) * TILE_SIZE;
  const rightX = (COLS - 1) * TILE_SIZE;

  map.drawHorizontalRail(0, 14, MAP_WIDTH, 5, '#a1824a', '#c7a76d', '#6e5426');
  map.drawHorizontalRail(0, 26, MAP_WIDTH, 5, '#a1824a', '#c7a76d', '#6e5426');
  map.drawHorizontalRail(0, botY + 14, MAP_WIDTH, 5, '#a1824a', '#c7a76d', '#6e5426');
  map.drawHorizontalRail(0, botY + 26, MAP_WIDTH, 5, '#a1824a', '#c7a76d', '#6e5426');

  map.drawVerticalRail(14, 0, 5, MAP_HEIGHT, '#a1824a', '#c7a76d', '#6e5426');
  map.drawVerticalRail(26, 0, 5, MAP_HEIGHT, '#a1824a', '#c7a76d', '#6e5426');
  map.drawVerticalRail(rightX + 14, 0, 5, MAP_HEIGHT, '#a1824a', '#c7a76d', '#6e5426');
  map.drawVerticalRail(rightX + 26, 0, 5, MAP_HEIGHT, '#a1824a', '#c7a76d', '#6e5426');

  for (let c = 0; c < COLS; c++) {
    const px = c * TILE_SIZE + 18;
    map.drawFencePost(px, 6, 10, 36, '#a1824a', '#c7a76d', '#6e5426', '#e0c58e');
    map.fillRect(px, 16, 10, 2, '#453114');
    map.fillRect(px, 28, 10, 2, '#453114');

    map.drawFencePost(px, botY + 6, 10, 36, '#a1824a', '#c7a76d', '#6e5426', '#e0c58e');
    map.fillRect(px, botY + 16, 10, 2, '#453114');
    map.fillRect(px, botY + 28, 10, 2, '#453114');
  }

  for (let r = 1; r < ROWS - 1; r++) {
    const py = r * TILE_SIZE + 6;
    map.drawFencePost(18, py, 10, 36, '#a1824a', '#c7a76d', '#6e5426', '#e0c58e');
    map.drawFencePost(rightX + 18, py, 10, 36, '#a1824a', '#c7a76d', '#6e5426', '#e0c58e');
  }

  await map.save(path.join(OUT_DIR, 'zen_bamboo.png'));
  console.log('✓ Saved Zen Bamboo map (no pond, matched layout): zen_bamboo.png');
}

// ==========================================
// 3. AUTUMN ORCHARD BIOME (NO POND, MATCHING USER LAYOUT)
// ==========================================
async function generateAutumnOrchard() {
  const map = new PixelCanvas(MAP_WIDTH, MAP_HEIGHT);

  // A. Golden-amber autumn soil & lawn
  map.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT, '#b46e29');

  for (let y = 0; y < MAP_HEIGHT; y += 4) {
    for (let x = 0; x < MAP_WIDTH; x += 4) {
      const hash = (x * 41 + y * 67) % 19;
      if (hash === 1 || hash === 2) {
        map.fillRect(x, y, 3, 2, '#c97d32');
      } else if (hash === 3 || hash === 4) {
        map.fillRect(x, y, 2, 3, '#995a1e');
      }
    }
  }

  // Scattered autumn maple leaves
  const leafColors = ['#dc2626', '#ea580c', '#f59e0b', '#d97706', '#b91c1c'];
  for (let y = 48; y < MAP_HEIGHT - 48; y += 14) {
    for (let x = 48; x < MAP_WIDTH - 48; x += 16) {
      if (
        (y >= 236 && y <= 292) ||
        (x >= 332 && x <= 388 && y <= 388)
      ) {
        continue;
      }
      const seed = (x * 19 + y * 31) % 13;
      if (seed < 4) {
        const col = leafColors[seed];
        map.fillRect(x, y, 3, 3, col);
        map.fillRect(x + 1, y - 1, 1, 5, col);
        map.fillRect(x - 1, y + 1, 5, 1, col);
      }
    }
  }

  // B. Terracotta brick walkway (matching path layout)
  const pathRowY = 5 * TILE_SIZE;
  const pathColX = 7 * TILE_SIZE;

  for (let px = TILE_SIZE; px < MAP_WIDTH - TILE_SIZE; px += 18) {
    for (let py = pathRowY; py < pathRowY + TILE_SIZE; py += 12) {
      const isShifted = Math.floor(py / 12) % 2 === 1;
      const ox = px + (isShifted ? 9 : 0);
      if (ox < MAP_WIDTH - TILE_SIZE - 4) {
        map.drawStone(ox, py, 17, 11, '#9a4325', '#be5834', '#702d15', '#f59e0b');
      }
    }
  }

  for (let py = TILE_SIZE; py <= 7 * TILE_SIZE; py += 12) {
    for (let px = pathColX; px < pathColX + TILE_SIZE; px += 18) {
      const isShifted = Math.floor(py / 12) % 2 === 1;
      const ox = px + (isShifted ? 9 : 0);
      if (ox < pathColX + TILE_SIZE) {
        map.drawStone(ox, py, 17, 11, '#9a4325', '#be5834', '#702d15', '#f59e0b');
      }
    }
  }

  // D. Rustic Dark Timber Fence
  const botY = (ROWS - 1) * TILE_SIZE;
  const rightX = (COLS - 1) * TILE_SIZE;

  map.drawHorizontalRail(0, 14, MAP_WIDTH, 5, '#5c3317', '#7c4824', '#3b1f0b');
  map.drawHorizontalRail(0, 26, MAP_WIDTH, 5, '#5c3317', '#7c4824', '#3b1f0b');
  map.drawHorizontalRail(0, botY + 14, MAP_WIDTH, 5, '#5c3317', '#7c4824', '#3b1f0b');
  map.drawHorizontalRail(0, botY + 26, MAP_WIDTH, 5, '#5c3317', '#7c4824', '#3b1f0b');

  map.drawVerticalRail(14, 0, 5, MAP_HEIGHT, '#5c3317', '#7c4824', '#3b1f0b');
  map.drawVerticalRail(26, 0, 5, MAP_HEIGHT, '#5c3317', '#7c4824', '#3b1f0b');
  map.drawVerticalRail(rightX + 14, 0, 5, MAP_HEIGHT, '#5c3317', '#7c4824', '#3b1f0b');
  map.drawVerticalRail(rightX + 26, 0, 5, MAP_HEIGHT, '#5c3317', '#7c4824', '#3b1f0b');

  for (let c = 0; c < COLS; c++) {
    const px = c * TILE_SIZE + 18;
    map.drawFencePost(px, 6, 10, 36, '#5c3317', '#7c4824', '#3b1f0b', '#94582f');
    map.drawFencePost(px, botY + 6, 10, 36, '#5c3317', '#7c4824', '#3b1f0b', '#94582f');
  }

  for (let r = 1; r < ROWS - 1; r++) {
    const py = r * TILE_SIZE + 6;
    map.drawFencePost(18, py, 10, 36, '#5c3317', '#7c4824', '#3b1f0b', '#94582f');
    map.drawFencePost(rightX + 18, py, 10, 36, '#5c3317', '#7c4824', '#3b1f0b', '#94582f');
  }

  await map.save(path.join(OUT_DIR, 'autumn_orchard.png'));
  console.log('✓ Saved Autumn Orchard map (no pond, matched layout): autumn_orchard.png');
}

// ==========================================
// 4. SACRED GROVE BIOME (NO POND, MATCHING USER LAYOUT)
// ==========================================
async function generateSacredGrove() {
  const map = new PixelCanvas(MAP_WIDTH, MAP_HEIGHT);

  // A. Mystical deep emerald forest loam
  map.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT, '#14382c');

  for (let y = 0; y < MAP_HEIGHT; y += 4) {
    for (let x = 0; x < MAP_WIDTH; x += 4) {
      const hash = (x * 43 + y * 71) % 23;
      if (hash === 1) {
        map.fillRect(x, y, 3, 2, '#1b4a3a');
      } else if (hash === 2) {
        map.fillRect(x, y, 2, 2, '#0f2920');
      }
    }
  }

  // Glowing spores across open ground
  for (let y = 48; y < MAP_HEIGHT - 48; y += 18) {
    for (let x = 48; x < MAP_WIDTH - 48; x += 22) {
      if (
        (y >= 236 && y <= 292) ||
        (x >= 332 && x <= 388 && y <= 388)
      ) {
        continue;
      }
      const seed = (x * 17 + y * 37) % 15;
      if (seed === 0) {
        map.fillCircle(x, y, 3, '#38bdf8', 120);
        map.fillRect(x, y, 2, 2, '#e0f2fe');
      } else if (seed === 1) {
        map.fillCircle(x, y, 3, '#a855f7', 120);
        map.fillRect(x, y, 2, 2, '#f3e8ff');
      } else if (seed === 2) {
        map.fillCircle(x, y, 3, '#34d399', 120);
        map.fillRect(x, y, 2, 2, '#d1fae5');
      }
    }
  }

  // B. Runic Stone Pavers (matching path layout)
  const pathRowY = 5 * TILE_SIZE;
  const pathColX = 7 * TILE_SIZE;

  for (let px = TILE_SIZE; px < MAP_WIDTH - TILE_SIZE; px += 20) {
    for (let py = pathRowY; py < pathRowY + TILE_SIZE; py += 16) {
      map.drawStone(px, py, 19, 15, '#28383a', '#394e50', '#182425', '#34d399');
      if ((px + py) % 40 === 0) {
        map.fillRect(px + 6, py + 7, 7, 1, '#38bdf8');
        map.fillRect(px + 9, py + 4, 1, 7, '#38bdf8');
      }
    }
  }

  for (let py = TILE_SIZE; py <= 7 * TILE_SIZE; py += 16) {
    for (let px = pathColX; px < pathColX + TILE_SIZE; px += 20) {
      map.drawStone(px, py, 19, 15, '#28383a', '#394e50', '#182425', '#34d399');
      if ((px + py) % 36 === 0) {
        map.fillRect(px + 6, py + 7, 7, 1, '#2dd4bf');
      }
    }
  }

  // D. Ancient Megalith Fence
  const botY = (ROWS - 1) * TILE_SIZE;
  const rightX = (COLS - 1) * TILE_SIZE;

  map.drawHorizontalRail(0, 14, MAP_WIDTH, 5, '#1e2d24', '#2d4336', '#111a14');
  map.drawHorizontalRail(0, 26, MAP_WIDTH, 5, '#1e2d24', '#2d4336', '#111a14');
  map.drawHorizontalRail(0, botY + 14, MAP_WIDTH, 5, '#1e2d24', '#2d4336', '#111a14');
  map.drawHorizontalRail(0, botY + 26, MAP_WIDTH, 5, '#1e2d24', '#2d4336', '#111a14');

  map.drawVerticalRail(14, 0, 5, MAP_HEIGHT, '#1e2d24', '#2d4336', '#111a14');
  map.drawVerticalRail(26, 0, 5, MAP_HEIGHT, '#1e2d24', '#2d4336', '#111a14');
  map.drawVerticalRail(rightX + 14, 0, 5, MAP_HEIGHT, '#1e2d24', '#2d4336', '#111a14');
  map.drawVerticalRail(rightX + 26, 0, 5, MAP_HEIGHT, '#1e2d24', '#2d4336', '#111a14');

  for (let c = 0; c < COLS; c++) {
    const px = c * TILE_SIZE + 18;
    map.drawFencePost(px, 6, 10, 36, '#1e2d24', '#2d4336', '#111a14', '#3d5c49');
    map.drawFencePost(px, botY + 6, 10, 36, '#1e2d24', '#2d4336', '#111a14', '#3d5c49');
    if (c % 3 === 0) {
      map.fillRect(px + 4, 18, 2, 4, '#38bdf8');
      map.fillRect(px + 4, botY + 18, 2, 4, '#38bdf8');
    }
  }

  for (let r = 1; r < ROWS - 1; r++) {
    const py = r * TILE_SIZE + 6;
    map.drawFencePost(18, py, 10, 36, '#1e2d24', '#2d4336', '#111a14', '#3d5c49');
    map.drawFencePost(rightX + 18, py, 10, 36, '#1e2d24', '#2d4336', '#111a14', '#3d5c49');
  }

  await map.save(path.join(OUT_DIR, 'sacred_grove.png'));
  console.log('✓ Saved Sacred Grove map (no pond, matched layout): sacred_grove.png');
}

// ==========================================
// 5. DESERT OASIS BIOME (NO POND, MATCHING USER LAYOUT)
// ==========================================
async function generateDesertOasis() {
  const map = new PixelCanvas(MAP_WIDTH, MAP_HEIGHT);

  // A. Sun-drenched golden sands
  map.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT, '#e0a96d');

  for (let y = 0; y < MAP_HEIGHT; y += 4) {
    for (let x = 0; x < MAP_WIDTH; x += 4) {
      const hash = (x * 47 + y * 73) % 17;
      if (hash === 1 || hash === 2) {
        map.fillRect(x, y, 3, 2, '#ebd2b4');
      } else if (hash === 3 || hash === 4) {
        map.fillRect(x, y, 2, 3, '#c98a54');
      }
    }
  }

  for (let y = 30; y < MAP_HEIGHT - 30; y += 12) {
    for (let x = 30; x < MAP_WIDTH - 30; x++) {
      const wave = Math.sin((x / 24) + (y / 14)) * 1.5;
      const py = Math.floor(y + wave);
      map.setPixel(x, py, 245, 222, 190, 160);
      map.setPixel(x, py + 1, 184, 124, 76, 160);
    }
  }

  // B. Pale Sandstone Slab Walkway
  const pathRowY = 5 * TILE_SIZE;
  const pathColX = 7 * TILE_SIZE;

  for (let px = TILE_SIZE; px < MAP_WIDTH - TILE_SIZE; px += 18) {
    for (let py = pathRowY; py < pathRowY + TILE_SIZE; py += 16) {
      map.drawStone(px, py, 17, 15, '#e5d1b8', '#faede0', '#bfa184');
    }
  }

  for (let py = TILE_SIZE; py <= 7 * TILE_SIZE; py += 16) {
    for (let px = pathColX; px < pathColX + TILE_SIZE; px += 18) {
      map.drawStone(px, py, 17, 15, '#e5d1b8', '#faede0', '#bfa184');
    }
  }

  // D. Sun-bleached Palm-Reed Fence
  const botY = (ROWS - 1) * TILE_SIZE;
  const rightX = (COLS - 1) * TILE_SIZE;

  map.drawHorizontalRail(0, 14, MAP_WIDTH, 5, '#926239', '#b58455', '#633d1c');
  map.drawHorizontalRail(0, 26, MAP_WIDTH, 5, '#926239', '#b58455', '#633d1c');
  map.drawHorizontalRail(0, botY + 14, MAP_WIDTH, 5, '#926239', '#b58455', '#633d1c');
  map.drawHorizontalRail(0, botY + 26, MAP_WIDTH, 5, '#926239', '#b58455', '#633d1c');

  map.drawVerticalRail(14, 0, 5, MAP_HEIGHT, '#926239', '#b58455', '#633d1c');
  map.drawVerticalRail(26, 0, 5, MAP_HEIGHT, '#926239', '#b58455', '#633d1c');
  map.drawVerticalRail(rightX + 14, 0, 5, MAP_HEIGHT, '#926239', '#b58455', '#633d1c');
  map.drawVerticalRail(rightX + 26, 0, 5, MAP_HEIGHT, '#926239', '#b58455', '#633d1c');

  for (let c = 0; c < COLS; c++) {
    const px = c * TILE_SIZE + 18;
    map.drawFencePost(px, 6, 10, 36, '#926239', '#b58455', '#633d1c', '#cf9b67');
    map.drawFencePost(px, botY + 6, 10, 36, '#926239', '#b58455', '#633d1c', '#cf9b67');
  }

  for (let r = 1; r < ROWS - 1; r++) {
    const py = r * TILE_SIZE + 6;
    map.drawFencePost(18, py, 10, 36, '#926239', '#b58455', '#633d1c', '#cf9b67');
    map.drawFencePost(rightX + 18, py, 10, 36, '#926239', '#b58455', '#633d1c', '#cf9b67');
  }

  await map.save(path.join(OUT_DIR, 'desert_oasis.png'));
  console.log('✓ Saved Desert Oasis map (no pond, matched layout): desert_oasis.png');
}

// ==========================================
// 6. CRYSTAL GLADE BIOME (NO POND, MATCHING USER LAYOUT)
// ==========================================
async function generateCrystalGlade() {
  const map = new PixelCanvas(MAP_WIDTH, MAP_HEIGHT);

  // A. Twilight Violet Loam
  map.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT, '#361e56');

  for (let y = 0; y < MAP_HEIGHT; y += 4) {
    for (let x = 0; x < MAP_WIDTH; x += 4) {
      const hash = (x * 53 + y * 79) % 21;
      if (hash === 1) {
        map.fillRect(x, y, 3, 2, '#4c2b75');
      } else if (hash === 2) {
        map.fillRect(x, y, 2, 2, '#231238');
      }
    }
  }

  for (let y = 48; y < MAP_HEIGHT - 48; y += 18) {
    for (let x = 48; x < MAP_WIDTH - 48; x += 22) {
      if (
        (y >= 236 && y <= 292) ||
        (x >= 332 && x <= 388 && y <= 388)
      ) {
        continue;
      }
      const seed = (x * 23 + y * 41) % 17;
      if (seed === 0) {
        map.fillRect(x, y, 3, 3, '#c084fc');
        map.fillRect(x + 1, y - 1, 1, 5, '#e9d5ff');
      } else if (seed === 1) {
        map.fillRect(x, y, 2, 2, '#38bdf8');
      }
    }
  }

  // B. Luminous Amethyst Crystal Walkway
  const pathRowY = 5 * TILE_SIZE;
  const pathColX = 7 * TILE_SIZE;

  for (let px = TILE_SIZE; px < MAP_WIDTH - TILE_SIZE; px += 18) {
    for (let py = pathRowY; py < pathRowY + TILE_SIZE; py += 16) {
      map.drawStone(px, py, 17, 15, '#6b21a8', '#9333ea', '#4c1d95', '#c084fc');
      if ((px + py) % 36 === 0) {
        map.fillRect(px + 6, py + 6, 5, 2, '#e879f9');
      }
    }
  }

  for (let py = TILE_SIZE; py <= 7 * TILE_SIZE; py += 16) {
    for (let px = pathColX; px < pathColX + TILE_SIZE; px += 18) {
      map.drawStone(px, py, 17, 15, '#6b21a8', '#9333ea', '#4c1d95', '#c084fc');
    }
  }

  // D. Ancient Quartz Crystal Fence
  const botY = (ROWS - 1) * TILE_SIZE;
  const rightX = (COLS - 1) * TILE_SIZE;

  map.drawHorizontalRail(0, 14, MAP_WIDTH, 5, '#4c1d95', '#6b21a8', '#2e1065');
  map.drawHorizontalRail(0, 26, MAP_WIDTH, 5, '#4c1d95', '#6b21a8', '#2e1065');
  map.drawHorizontalRail(0, botY + 14, MAP_WIDTH, 5, '#4c1d95', '#6b21a8', '#2e1065');
  map.drawHorizontalRail(0, botY + 26, MAP_WIDTH, 5, '#4c1d95', '#6b21a8', '#2e1065');

  map.drawVerticalRail(14, 0, 5, MAP_HEIGHT, '#4c1d95', '#6b21a8', '#2e1065');
  map.drawVerticalRail(26, 0, 5, MAP_HEIGHT, '#4c1d95', '#6b21a8', '#2e1065');
  map.drawVerticalRail(rightX + 14, 0, 5, MAP_HEIGHT, '#4c1d95', '#6b21a8', '#2e1065');
  map.drawVerticalRail(rightX + 26, 0, 5, MAP_HEIGHT, '#4c1d95', '#6b21a8', '#2e1065');

  for (let c = 0; c < COLS; c++) {
    const px = c * TILE_SIZE + 18;
    map.drawFencePost(px, 6, 10, 36, '#4c1d95', '#7e22ce', '#2e1065', '#c084fc');
    map.drawFencePost(px, botY + 6, 10, 36, '#4c1d95', '#7e22ce', '#2e1065', '#c084fc');
    if (c % 3 === 0) {
      map.fillRect(px + 4, 18, 2, 4, '#c084fc');
      map.fillRect(px + 4, botY + 18, 2, 4, '#c084fc');
    }
  }

  for (let r = 1; r < ROWS - 1; r++) {
    const py = r * TILE_SIZE + 6;
    map.drawFencePost(18, py, 10, 36, '#4c1d95', '#7e22ce', '#2e1065', '#c084fc');
    map.drawFencePost(rightX + 18, py, 10, 36, '#4c1d95', '#7e22ce', '#2e1065', '#c084fc');
  }

  await map.save(path.join(OUT_DIR, 'crystal_glade.png'));
  console.log('✓ Saved Crystal Glade map (no pond, matched layout): crystal_glade.png');
}

// Execute all 6 map generators
await processMeadow();
await generateZenBamboo();
await generateAutumnOrchard();
await generateSacredGrove();
await generateDesertOasis();
await generateCrystalGlade();
console.log('★ All 6 garden layout maps matched user reference and removed pond!');
