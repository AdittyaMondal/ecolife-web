import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PETS_DIR = '/Users/yusuf/Coding/ECO/ecolife-web/public/sprites/pets';
fs.mkdirSync(PETS_DIR, { recursive: true });

const SIZE = 48;

class PixelCanvas {
  width: number;
  height: number;
  buffer: Uint8ClampedArray;

  constructor(w = SIZE, h = SIZE) {
    this.width = w;
    this.height = h;
    this.buffer = new Uint8ClampedArray(w * h * 4); // RGBA, all 0 = transparent
  }

  setPixel(x: number, y: number, r: number, g: number, b: number, a = 255) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return;
    const idx = (iy * this.width + ix) * 4;
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

  drawDropShadow(cx: number, bottomY: number, rx: number, ry: number) {
    const minX = Math.max(0, Math.floor(cx - rx));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + rx));
    const minY = Math.max(0, Math.floor(bottomY - ry));
    const maxY = Math.min(this.height - 1, Math.ceil(bottomY + ry));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const nx = (px - cx) / rx;
        const ny = (py - bottomY) / ry;
        if (nx * nx + ny * ny <= 1) {
          this.setPixel(px, py, 0, 0, 0, 75);
        }
      }
    }
  }

  async save(filename: string) {
    await sharp(this.buffer, {
      raw: {
        width: this.width,
        height: this.height,
        channels: 4,
      },
    })
      .png({ compressionLevel: 9 })
      .toFile(path.join(PETS_DIR, filename));
  }
}

// ==========================================
// 1. DOG (Golden Retriever)
// Idle: sits on hind legs, panting happily with tail wagging
// ==========================================
async function generateDog() {
  const frames: Record<string, (c: PixelCanvas) => void> = {
    walk_0: (c) => {
      c.drawDropShadow(24, 44, 12, 3);
      // Torso
      c.fillRect(16, 26, 16, 10, '#eab308');
      c.fillRect(18, 28, 12, 6, '#fef08a');
      // Legs (standing neutral)
      c.fillRect(17, 36, 3, 7, '#ca8a04');
      c.fillRect(21, 36, 3, 7, '#eab308');
      c.fillRect(26, 36, 3, 7, '#ca8a04');
      c.fillRect(30, 36, 3, 7, '#eab308');
      // Head & Ears
      c.fillRect(26, 18, 11, 10, '#eab308');
      c.fillRect(25, 20, 3, 8, '#ca8a04'); // Ear
      c.fillRect(35, 23, 5, 5, '#fef08a'); // Snout
      c.fillRect(38, 23, 2, 2, '#18181b'); // Nose
      c.fillRect(33, 21, 2, 2, '#18181b'); // Eye
      // Tail
      c.fillRect(13, 23, 4, 4, '#ca8a04');
    },
    walk_1: (c) => {
      c.drawDropShadow(24, 44, 12, 3);
      c.fillRect(16, 25, 16, 10, '#eab308');
      c.fillRect(18, 27, 12, 6, '#fef08a');
      // Legs stride 1
      c.fillRect(19, 35, 3, 7, '#ca8a04');
      c.fillRect(15, 36, 3, 6, '#eab308');
      c.fillRect(28, 35, 3, 7, '#ca8a04');
      c.fillRect(32, 36, 3, 6, '#eab308');
      // Head
      c.fillRect(26, 17, 11, 10, '#eab308');
      c.fillRect(25, 19, 3, 8, '#ca8a04');
      c.fillRect(35, 22, 5, 5, '#fef08a');
      c.fillRect(38, 22, 2, 2, '#18181b');
      c.fillRect(33, 20, 2, 2, '#18181b');
      // Tail up
      c.fillRect(12, 21, 4, 5, '#ca8a04');
    },
    walk_2: (c) => {
      c.drawDropShadow(24, 44, 12, 3);
      c.fillRect(16, 25, 16, 10, '#eab308');
      c.fillRect(18, 27, 12, 6, '#fef08a');
      // Legs stride 2
      c.fillRect(15, 35, 3, 7, '#ca8a04');
      c.fillRect(19, 36, 3, 6, '#eab308');
      c.fillRect(32, 35, 3, 7, '#ca8a04');
      c.fillRect(28, 36, 3, 6, '#eab308');
      // Head
      c.fillRect(26, 17, 11, 10, '#eab308');
      c.fillRect(25, 19, 3, 8, '#ca8a04');
      c.fillRect(35, 22, 5, 5, '#fef08a');
      c.fillRect(38, 22, 2, 2, '#18181b');
      c.fillRect(33, 20, 2, 2, '#18181b');
      // Tail
      c.fillRect(12, 22, 4, 4, '#ca8a04');
    },
    idle_0: (c) => {
      c.drawDropShadow(24, 44, 12, 3);
      c.fillRect(16, 26, 16, 10, '#eab308');
      c.fillRect(18, 28, 12, 6, '#fef08a');
      c.fillRect(17, 36, 3, 7, '#ca8a04');
      c.fillRect(21, 36, 3, 7, '#eab308');
      c.fillRect(26, 36, 3, 7, '#ca8a04');
      c.fillRect(30, 36, 3, 7, '#eab308');
      c.fillRect(26, 18, 11, 10, '#eab308');
      c.fillRect(25, 20, 3, 8, '#ca8a04');
      c.fillRect(35, 23, 5, 5, '#fef08a');
      c.fillRect(38, 23, 2, 2, '#18181b');
      c.fillRect(33, 21, 2, 2, '#18181b');
      c.fillRect(13, 24, 4, 4, '#ca8a04');
    },
    idle_1: (c) => {
      // Sitting on hind legs!
      c.drawDropShadow(24, 44, 11, 3);
      // Sitting haunches
      c.fillRect(15, 32, 10, 10, '#ca8a04');
      c.fillRect(17, 24, 12, 12, '#eab308');
      c.fillRect(20, 26, 8, 8, '#fef08a');
      // Front paws planted
      c.fillRect(25, 34, 3, 9, '#eab308');
      c.fillRect(29, 34, 3, 9, '#ca8a04');
      // Head held high
      c.fillRect(23, 14, 11, 10, '#eab308');
      c.fillRect(21, 16, 3, 8, '#ca8a04');
      c.fillRect(32, 18, 6, 6, '#fef08a');
      c.fillRect(36, 18, 2, 2, '#18181b'); // nose
      c.fillRect(30, 16, 2, 2, '#18181b'); // eye
      c.fillRect(34, 23, 3, 3, '#ef4444'); // cute panting tongue!
      // Tail resting
      c.fillRect(11, 36, 5, 4, '#ca8a04');
    },
    idle_2: (c) => {
      // Sitting with happy tail wag up!
      c.drawDropShadow(24, 44, 11, 3);
      c.fillRect(15, 32, 10, 10, '#ca8a04');
      c.fillRect(17, 24, 12, 12, '#eab308');
      c.fillRect(20, 26, 8, 8, '#fef08a');
      c.fillRect(25, 34, 3, 9, '#eab308');
      c.fillRect(29, 34, 3, 9, '#ca8a04');
      c.fillRect(23, 14, 11, 10, '#eab308');
      c.fillRect(21, 16, 3, 8, '#ca8a04');
      c.fillRect(32, 18, 6, 6, '#fef08a');
      c.fillRect(36, 18, 2, 2, '#18181b');
      c.fillRect(30, 16, 2, 2, '#18181b');
      c.fillRect(34, 23, 3, 3, '#ef4444');
      // Tail wagged up and wagging!
      c.fillRect(10, 29, 6, 4, '#eab308');
      c.fillRect(8, 25, 4, 5, '#ca8a04');
    },
  };

  for (const [name, fn] of Object.entries(frames)) {
    const c = new PixelCanvas();
    fn(c);
    await c.save(`dog_${name}.png`);
  }
  console.log('✓ Dog sprites generated (walk + sitting idle)');
}

// ==========================================
// 2. CAT (Calico Garden Cat)
// Idle: sits gracefully, grooms paw / curls up
// ==========================================
async function generateCat() {
  const frames: Record<string, (c: PixelCanvas) => void> = {
    walk_0: (c) => {
      c.drawDropShadow(24, 43, 10, 3);
      // Torso (white + ginger + black calico patches)
      c.fillRect(16, 28, 14, 8, '#ffffff');
      c.fillRect(20, 28, 5, 5, '#ea580c');
      c.fillRect(16, 30, 4, 4, '#18181b');
      // Legs
      c.fillRect(17, 36, 2, 6, '#ffffff');
      c.fillRect(20, 36, 2, 6, '#ea580c');
      c.fillRect(25, 36, 2, 6, '#ffffff');
      c.fillRect(28, 36, 2, 6, '#18181b');
      // Head & Ears
      c.fillRect(26, 22, 8, 8, '#ffffff');
      c.fillRect(26, 22, 4, 4, '#ea580c');
      c.fillRect(26, 19, 2, 3, '#ea580c'); // Left ear
      c.fillRect(32, 19, 2, 3, '#18181b'); // Right ear
      c.fillRect(32, 24, 2, 2, '#10b981'); // Green eye
      c.fillRect(34, 26, 2, 1, '#f472b6'); // Pink nose
      // Tail curved up
      c.fillRect(12, 23, 4, 3, '#ea580c');
      c.fillRect(11, 20, 2, 4, '#18181b');
    },
    walk_1: (c) => {
      c.drawDropShadow(24, 43, 10, 3);
      c.fillRect(16, 27, 14, 8, '#ffffff');
      c.fillRect(20, 27, 5, 5, '#ea580c');
      c.fillRect(16, 29, 4, 4, '#18181b');
      // Legs stride 1
      c.fillRect(19, 35, 2, 6, '#ffffff');
      c.fillRect(15, 36, 2, 5, '#ea580c');
      c.fillRect(27, 35, 2, 6, '#ffffff');
      c.fillRect(29, 36, 2, 5, '#18181b');
      // Head
      c.fillRect(26, 21, 8, 8, '#ffffff');
      c.fillRect(26, 21, 4, 4, '#ea580c');
      c.fillRect(26, 18, 2, 3, '#ea580c');
      c.fillRect(32, 18, 2, 3, '#18181b');
      c.fillRect(32, 23, 2, 2, '#10b981');
      c.fillRect(34, 25, 2, 1, '#f472b6');
      c.fillRect(12, 22, 4, 3, '#ea580c');
      c.fillRect(11, 19, 2, 4, '#18181b');
    },
    walk_2: (c) => {
      c.drawDropShadow(24, 43, 10, 3);
      c.fillRect(16, 27, 14, 8, '#ffffff');
      c.fillRect(20, 27, 5, 5, '#ea580c');
      c.fillRect(16, 29, 4, 4, '#18181b');
      // Legs stride 2
      c.fillRect(15, 35, 2, 6, '#ffffff');
      c.fillRect(19, 36, 2, 5, '#ea580c');
      c.fillRect(29, 35, 2, 6, '#ffffff');
      c.fillRect(25, 36, 2, 5, '#18181b');
      c.fillRect(26, 21, 8, 8, '#ffffff');
      c.fillRect(26, 21, 4, 4, '#ea580c');
      c.fillRect(26, 18, 2, 3, '#ea580c');
      c.fillRect(32, 18, 2, 3, '#18181b');
      c.fillRect(32, 23, 2, 2, '#10b981');
      c.fillRect(34, 25, 2, 1, '#f472b6');
      c.fillRect(12, 22, 4, 3, '#ea580c');
      c.fillRect(11, 19, 2, 4, '#18181b');
    },
    idle_0: (c) => {
      c.drawDropShadow(24, 43, 10, 3);
      c.fillRect(16, 28, 14, 8, '#ffffff');
      c.fillRect(20, 28, 5, 5, '#ea580c');
      c.fillRect(16, 30, 4, 4, '#18181b');
      c.fillRect(17, 36, 2, 6, '#ffffff');
      c.fillRect(20, 36, 2, 6, '#ea580c');
      c.fillRect(25, 36, 2, 6, '#ffffff');
      c.fillRect(28, 36, 2, 6, '#18181b');
      c.fillRect(26, 22, 8, 8, '#ffffff');
      c.fillRect(26, 22, 4, 4, '#ea580c');
      c.fillRect(26, 19, 2, 3, '#ea580c');
      c.fillRect(32, 19, 2, 3, '#18181b');
      c.fillRect(32, 24, 2, 2, '#10b981');
      c.fillRect(34, 26, 2, 1, '#f472b6');
      c.fillRect(12, 23, 4, 3, '#ea580c');
      c.fillRect(11, 20, 2, 4, '#18181b');
    },
    idle_1: (c) => {
      // Sitting curled loaf
      c.drawDropShadow(24, 43, 9, 3);
      c.fillRect(17, 31, 13, 9, '#ffffff');
      c.fillRect(21, 31, 5, 5, '#ea580c');
      c.fillRect(17, 33, 4, 4, '#18181b');
      c.fillRect(24, 23, 8, 9, '#ffffff');
      c.fillRect(24, 23, 4, 4, '#ea580c');
      c.fillRect(24, 20, 2, 3, '#ea580c');
      c.fillRect(30, 20, 2, 3, '#18181b');
      c.fillRect(30, 25, 2, 2, '#10b981');
      c.fillRect(32, 27, 2, 1, '#f472b6');
      // Tail curled around paws
      c.fillRect(14, 38, 14, 2, '#ea580c');
    },
    idle_2: (c) => {
      // Grooming paw!
      c.drawDropShadow(24, 43, 9, 3);
      c.fillRect(17, 31, 13, 9, '#ffffff');
      c.fillRect(21, 31, 5, 5, '#ea580c');
      c.fillRect(17, 33, 4, 4, '#18181b');
      c.fillRect(24, 23, 8, 9, '#ffffff');
      c.fillRect(24, 23, 4, 4, '#ea580c');
      c.fillRect(24, 20, 2, 3, '#ea580c');
      c.fillRect(30, 20, 2, 3, '#18181b');
      c.fillRect(30, 25, 2, 2, '#10b981');
      // Lifted paw grooming face
      c.fillRect(32, 26, 3, 5, '#ffffff');
      c.fillRect(33, 27, 2, 2, '#f472b6');
      c.fillRect(14, 38, 14, 2, '#ea580c');
    },
  };

  for (const [name, fn] of Object.entries(frames)) {
    const c = new PixelCanvas();
    fn(c);
    await c.save(`cat_${name}.png`);
  }
  console.log('✓ Cat sprites generated (walk + grooming idle)');
}

// ==========================================
// 3. HORSE (Chestnut Garden Steed)
// Idle: lowers neck and grazes grass, head bobs
// ==========================================
async function generateHorse() {
  const frames: Record<string, (c: PixelCanvas) => void> = {
    walk_0: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      // Torso
      c.fillRect(12, 22, 20, 12, '#854d0e');
      c.fillRect(14, 24, 16, 8, '#a16207');
      // Legs
      c.fillRect(14, 34, 3, 9, '#854d0e');
      c.fillRect(14, 42, 3, 2, '#1c1917'); // Hoof
      c.fillRect(19, 34, 3, 9, '#713f12');
      c.fillRect(19, 42, 3, 2, '#1c1917');
      c.fillRect(25, 34, 3, 9, '#854d0e');
      c.fillRect(25, 42, 3, 2, '#1c1917');
      c.fillRect(29, 34, 3, 9, '#713f12');
      c.fillRect(29, 42, 3, 2, '#1c1917');
      // Neck up
      c.fillRect(27, 14, 6, 10, '#854d0e');
      c.fillRect(26, 12, 3, 10, '#1c1917'); // Dark mane
      // Head
      c.fillRect(29, 9, 10, 8, '#854d0e');
      c.fillRect(37, 12, 4, 5, '#5c2c06'); // Muzzle
      c.fillRect(34, 11, 2, 2, '#18181b'); // Eye
      c.fillRect(32, 7, 2, 3, '#854d0e'); // Ear
      // Tail
      c.fillRect(9, 23, 4, 11, '#1c1917');
    },
    walk_1: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 21, 20, 12, '#854d0e');
      c.fillRect(14, 23, 16, 8, '#a16207');
      // Legs stride 1
      c.fillRect(17, 33, 3, 9, '#854d0e');
      c.fillRect(17, 41, 3, 2, '#1c1917');
      c.fillRect(12, 34, 3, 8, '#713f12');
      c.fillRect(12, 41, 3, 2, '#1c1917');
      c.fillRect(28, 33, 3, 9, '#854d0e');
      c.fillRect(28, 41, 3, 2, '#1c1917');
      c.fillRect(23, 34, 3, 8, '#713f12');
      c.fillRect(23, 41, 3, 2, '#1c1917');
      c.fillRect(27, 13, 6, 10, '#854d0e');
      c.fillRect(26, 11, 3, 10, '#1c1917');
      c.fillRect(29, 8, 10, 8, '#854d0e');
      c.fillRect(37, 11, 4, 5, '#5c2c06');
      c.fillRect(34, 10, 2, 2, '#18181b');
      c.fillRect(32, 6, 2, 3, '#854d0e');
      c.fillRect(8, 22, 5, 12, '#1c1917');
    },
    walk_2: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 21, 20, 12, '#854d0e');
      c.fillRect(14, 23, 16, 8, '#a16207');
      // Legs stride 2
      c.fillRect(12, 33, 3, 9, '#854d0e');
      c.fillRect(12, 41, 3, 2, '#1c1917');
      c.fillRect(17, 34, 3, 8, '#713f12');
      c.fillRect(17, 41, 3, 2, '#1c1917');
      c.fillRect(23, 33, 3, 9, '#854d0e');
      c.fillRect(23, 41, 3, 2, '#1c1917');
      c.fillRect(28, 34, 3, 8, '#713f12');
      c.fillRect(28, 41, 3, 2, '#1c1917');
      c.fillRect(27, 13, 6, 10, '#854d0e');
      c.fillRect(26, 11, 3, 10, '#1c1917');
      c.fillRect(29, 8, 10, 8, '#854d0e');
      c.fillRect(37, 11, 4, 5, '#5c2c06');
      c.fillRect(34, 10, 2, 2, '#18181b');
      c.fillRect(32, 6, 2, 3, '#854d0e');
      c.fillRect(8, 22, 5, 12, '#1c1917');
    },
    idle_0: (c) => {
      // Standing peaceful
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#854d0e');
      c.fillRect(14, 24, 16, 8, '#a16207');
      c.fillRect(14, 34, 3, 9, '#854d0e');
      c.fillRect(14, 42, 3, 2, '#1c1917');
      c.fillRect(19, 34, 3, 9, '#713f12');
      c.fillRect(19, 42, 3, 2, '#1c1917');
      c.fillRect(25, 34, 3, 9, '#854d0e');
      c.fillRect(25, 42, 3, 2, '#1c1917');
      c.fillRect(29, 34, 3, 9, '#713f12');
      c.fillRect(29, 42, 3, 2, '#1c1917');
      c.fillRect(27, 14, 6, 10, '#854d0e');
      c.fillRect(26, 12, 3, 10, '#1c1917');
      c.fillRect(29, 9, 10, 8, '#854d0e');
      c.fillRect(37, 12, 4, 5, '#5c2c06');
      c.fillRect(34, 11, 2, 2, '#18181b');
      c.fillRect(32, 7, 2, 3, '#854d0e');
      c.fillRect(9, 23, 4, 11, '#1c1917');
    },
    idle_1: (c) => {
      // Grazing grass! Neck bent down
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#854d0e');
      c.fillRect(14, 24, 16, 8, '#a16207');
      c.fillRect(14, 34, 3, 9, '#854d0e');
      c.fillRect(14, 42, 3, 2, '#1c1917');
      c.fillRect(19, 34, 3, 9, '#713f12');
      c.fillRect(19, 42, 3, 2, '#1c1917');
      c.fillRect(25, 34, 3, 9, '#854d0e');
      c.fillRect(25, 42, 3, 2, '#1c1917');
      c.fillRect(29, 34, 3, 9, '#713f12');
      c.fillRect(29, 42, 3, 2, '#1c1917');
      // Neck bent downward!
      c.fillRect(28, 24, 8, 8, '#854d0e');
      c.fillRect(27, 20, 4, 8, '#1c1917');
      // Head down near grass
      c.fillRect(34, 28, 9, 8, '#854d0e');
      c.fillRect(40, 32, 4, 5, '#5c2c06');
      c.fillRect(38, 29, 2, 2, '#18181b');
      c.fillRect(33, 25, 2, 3, '#854d0e');
      // Tail twitched
      c.fillRect(8, 22, 5, 10, '#1c1917');
    },
    idle_2: (c) => {
      // Chewing sweet grass! Head touching ground
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#854d0e');
      c.fillRect(14, 24, 16, 8, '#a16207');
      c.fillRect(14, 34, 3, 9, '#854d0e');
      c.fillRect(14, 42, 3, 2, '#1c1917');
      c.fillRect(19, 34, 3, 9, '#713f12');
      c.fillRect(19, 42, 3, 2, '#1c1917');
      c.fillRect(25, 34, 3, 9, '#854d0e');
      c.fillRect(25, 42, 3, 2, '#1c1917');
      c.fillRect(29, 34, 3, 9, '#713f12');
      c.fillRect(29, 42, 3, 2, '#1c1917');
      c.fillRect(28, 25, 8, 9, '#854d0e');
      c.fillRect(27, 21, 4, 8, '#1c1917');
      // Head on the ground eating grass blades!
      c.fillRect(35, 31, 9, 8, '#854d0e');
      c.fillRect(41, 35, 4, 5, '#5c2c06');
      c.fillRect(39, 32, 2, 2, '#18181b');
      c.fillRect(34, 27, 2, 3, '#854d0e');
      // Grass blades in mouth!
      c.fillRect(43, 37, 3, 4, '#22c55e');
      c.fillRect(45, 36, 2, 3, '#16a34a');
      c.fillRect(8, 24, 5, 11, '#1c1917');
    },
  };

  for (const [name, fn] of Object.entries(frames)) {
    const c = new PixelCanvas();
    fn(c);
    await c.save(`horse_${name}.png`);
  }
  console.log('✓ Horse sprites generated (walk + grazing idle)');
}

// ==========================================
// 4. TIGER (Royal Bengal Tiger)
// Idle: sits regally upright, slow head turn & tail swish
// ==========================================
async function generateTiger() {
  const frames: Record<string, (c: PixelCanvas) => void> = {
    walk_0: (c) => {
      c.drawDropShadow(24, 44, 13, 3);
      // Torso
      c.fillRect(14, 25, 18, 10, '#ea580c');
      // Tiger stripes
      c.fillRect(17, 25, 2, 8, '#18181b');
      c.fillRect(22, 25, 2, 8, '#18181b');
      c.fillRect(27, 25, 2, 8, '#18181b');
      c.fillRect(17, 32, 12, 3, '#ffffff'); // white underbelly
      // Heavy paws
      c.fillRect(15, 35, 3, 8, '#ea580c');
      c.fillRect(20, 35, 3, 8, '#c2410c');
      c.fillRect(25, 35, 3, 8, '#ea580c');
      c.fillRect(29, 35, 3, 8, '#c2410c');
      // Broad head
      c.fillRect(28, 18, 10, 9, '#ea580c');
      c.fillRect(29, 18, 2, 3, '#18181b');
      c.fillRect(35, 18, 2, 3, '#18181b');
      c.fillRect(35, 22, 5, 5, '#ffffff');
      c.fillRect(38, 22, 2, 2, '#18181b');
      c.fillRect(33, 20, 2, 2, '#eab308'); // amber eye
      // Tail
      c.fillRect(10, 26, 5, 3, '#ea580c');
      c.fillRect(7, 23, 4, 4, '#18181b');
    },
    walk_1: (c) => {
      c.drawDropShadow(24, 44, 13, 3);
      c.fillRect(14, 24, 18, 10, '#ea580c');
      c.fillRect(17, 24, 2, 8, '#18181b');
      c.fillRect(22, 24, 2, 8, '#18181b');
      c.fillRect(27, 24, 2, 8, '#18181b');
      c.fillRect(17, 31, 12, 3, '#ffffff');
      // Paws stride 1
      c.fillRect(18, 34, 3, 8, '#ea580c');
      c.fillRect(13, 35, 3, 7, '#c2410c');
      c.fillRect(28, 34, 3, 8, '#ea580c');
      c.fillRect(31, 35, 3, 7, '#c2410c');
      c.fillRect(28, 17, 10, 9, '#ea580c');
      c.fillRect(29, 17, 2, 3, '#18181b');
      c.fillRect(35, 17, 2, 3, '#18181b');
      c.fillRect(35, 21, 5, 5, '#ffffff');
      c.fillRect(38, 21, 2, 2, '#18181b');
      c.fillRect(33, 19, 2, 2, '#eab308');
      c.fillRect(10, 24, 5, 3, '#ea580c');
      c.fillRect(6, 21, 4, 4, '#18181b');
    },
    walk_2: (c) => {
      c.drawDropShadow(24, 44, 13, 3);
      c.fillRect(14, 24, 18, 10, '#ea580c');
      c.fillRect(17, 24, 2, 8, '#18181b');
      c.fillRect(22, 24, 2, 8, '#18181b');
      c.fillRect(27, 24, 2, 8, '#18181b');
      c.fillRect(17, 31, 12, 3, '#ffffff');
      c.fillRect(13, 34, 3, 8, '#ea580c');
      c.fillRect(18, 35, 3, 7, '#c2410c');
      c.fillRect(31, 34, 3, 8, '#ea580c');
      c.fillRect(27, 35, 3, 7, '#c2410c');
      c.fillRect(28, 17, 10, 9, '#ea580c');
      c.fillRect(29, 17, 2, 3, '#18181b');
      c.fillRect(35, 17, 2, 3, '#18181b');
      c.fillRect(35, 21, 5, 5, '#ffffff');
      c.fillRect(38, 21, 2, 2, '#18181b');
      c.fillRect(33, 19, 2, 2, '#eab308');
      c.fillRect(10, 24, 5, 3, '#ea580c');
      c.fillRect(6, 21, 4, 4, '#18181b');
    },
    idle_0: (c) => {
      c.drawDropShadow(24, 44, 13, 3);
      c.fillRect(14, 25, 18, 10, '#ea580c');
      c.fillRect(17, 25, 2, 8, '#18181b');
      c.fillRect(22, 25, 2, 8, '#18181b');
      c.fillRect(27, 25, 2, 8, '#18181b');
      c.fillRect(17, 32, 12, 3, '#ffffff');
      c.fillRect(15, 35, 3, 8, '#ea580c');
      c.fillRect(20, 35, 3, 8, '#c2410c');
      c.fillRect(25, 35, 3, 8, '#ea580c');
      c.fillRect(29, 35, 3, 8, '#c2410c');
      c.fillRect(28, 18, 10, 9, '#ea580c');
      c.fillRect(29, 18, 2, 3, '#18181b');
      c.fillRect(35, 18, 2, 3, '#18181b');
      c.fillRect(35, 22, 5, 5, '#ffffff');
      c.fillRect(38, 22, 2, 2, '#18181b');
      c.fillRect(33, 20, 2, 2, '#eab308');
      c.fillRect(10, 26, 5, 3, '#ea580c');
      c.fillRect(7, 23, 4, 4, '#18181b');
    },
    idle_1: (c) => {
      // Sitting upright regally!
      c.drawDropShadow(24, 44, 12, 3);
      c.fillRect(15, 28, 12, 14, '#ea580c');
      c.fillRect(17, 29, 2, 8, '#18181b');
      c.fillRect(22, 29, 2, 8, '#18181b');
      c.fillRect(20, 31, 6, 10, '#ffffff'); // white chest
      c.fillRect(25, 34, 4, 9, '#ea580c'); // front paws
      c.fillRect(28, 34, 4, 9, '#c2410c');
      // Regal head held upright
      c.fillRect(21, 14, 11, 11, '#ea580c');
      c.fillRect(22, 14, 2, 3, '#18181b');
      c.fillRect(29, 14, 2, 3, '#18181b');
      c.fillRect(28, 18, 6, 6, '#ffffff');
      c.fillRect(32, 18, 2, 2, '#18181b');
      c.fillRect(26, 17, 2, 2, '#eab308');
      // Tail resting along ground
      c.fillRect(11, 39, 8, 3, '#ea580c');
      c.fillRect(8, 36, 4, 4, '#18181b');
    },
    idle_2: (c) => {
      // Sitting with tail curled up and majestic gaze
      c.drawDropShadow(24, 44, 12, 3);
      c.fillRect(15, 28, 12, 14, '#ea580c');
      c.fillRect(17, 29, 2, 8, '#18181b');
      c.fillRect(22, 29, 2, 8, '#18181b');
      c.fillRect(20, 31, 6, 10, '#ffffff');
      c.fillRect(25, 34, 4, 9, '#ea580c');
      c.fillRect(28, 34, 4, 9, '#c2410c');
      c.fillRect(21, 14, 11, 11, '#ea580c');
      c.fillRect(22, 14, 2, 3, '#18181b');
      c.fillRect(29, 14, 2, 3, '#18181b');
      c.fillRect(28, 18, 6, 6, '#ffffff');
      c.fillRect(32, 18, 2, 2, '#18181b');
      c.fillRect(26, 17, 2, 2, '#eab308');
      // Tail swished up!
      c.fillRect(11, 37, 5, 3, '#ea580c');
      c.fillRect(8, 32, 4, 6, '#18181b');
      c.fillRect(6, 28, 4, 4, '#ea580c');
    },
  };

  for (const [name, fn] of Object.entries(frames)) {
    const c = new PixelCanvas();
    fn(c);
    await c.save(`tiger_${name}.png`);
  }
  console.log('✓ Tiger sprites generated (walk + regal sitting idle)');
}

// ==========================================
// 5. PEACOCK (Emerald Royal Peacock)
// Idle: fans out glorious glowing emerald tail feathers!
// ==========================================
async function generatePeacock() {
  const frames: Record<string, (c: PixelCanvas) => void> = {
    walk_0: (c) => {
      c.drawDropShadow(24, 44, 12, 3);
      // Sapphire blue body & neck
      c.fillRect(22, 26, 10, 8, '#0284c7');
      c.fillRect(27, 17, 4, 10, '#0284c7');
      // Crown Crest
      c.fillRect(29, 13, 2, 4, '#38bdf8');
      c.fillRect(28, 11, 4, 2, '#059669');
      // Golden beak & eye
      c.fillRect(33, 19, 4, 2, '#fbbf24');
      c.fillRect(30, 18, 2, 2, '#18181b');
      // Legs
      c.fillRect(24, 34, 2, 8, '#fbbf24');
      c.fillRect(28, 34, 2, 8, '#d97706');
      // Folded emerald tail feathers behind
      c.fillRect(12, 25, 11, 10, '#059669');
      c.fillRect(8, 27, 6, 8, '#10b981');
      c.fillRect(10, 29, 3, 3, '#0284c7');
    },
    walk_1: (c) => {
      c.drawDropShadow(24, 44, 12, 3);
      c.fillRect(22, 25, 10, 8, '#0284c7');
      c.fillRect(27, 16, 4, 10, '#0284c7');
      c.fillRect(29, 12, 2, 4, '#38bdf8');
      c.fillRect(28, 10, 4, 2, '#059669');
      c.fillRect(33, 18, 4, 2, '#fbbf24');
      c.fillRect(30, 17, 2, 2, '#18181b');
      // Stride legs
      c.fillRect(22, 33, 2, 8, '#fbbf24');
      c.fillRect(29, 34, 2, 7, '#d97706');
      c.fillRect(11, 24, 12, 10, '#059669');
      c.fillRect(7, 26, 6, 8, '#10b981');
      c.fillRect(9, 28, 3, 3, '#0284c7');
    },
    walk_2: (c) => {
      c.drawDropShadow(24, 44, 12, 3);
      c.fillRect(22, 25, 10, 8, '#0284c7');
      c.fillRect(27, 16, 4, 10, '#0284c7');
      c.fillRect(29, 12, 2, 4, '#38bdf8');
      c.fillRect(28, 10, 4, 2, '#059669');
      c.fillRect(33, 18, 4, 2, '#fbbf24');
      c.fillRect(30, 17, 2, 2, '#18181b');
      c.fillRect(26, 33, 2, 8, '#fbbf24');
      c.fillRect(25, 34, 2, 7, '#d97706');
      c.fillRect(11, 24, 12, 10, '#059669');
      c.fillRect(7, 26, 6, 8, '#10b981');
      c.fillRect(9, 28, 3, 3, '#0284c7');
    },
    idle_0: (c) => {
      c.drawDropShadow(24, 44, 12, 3);
      c.fillRect(22, 26, 10, 8, '#0284c7');
      c.fillRect(27, 17, 4, 10, '#0284c7');
      c.fillRect(29, 13, 2, 4, '#38bdf8');
      c.fillRect(28, 11, 4, 2, '#059669');
      c.fillRect(33, 19, 4, 2, '#fbbf24');
      c.fillRect(30, 18, 2, 2, '#18181b');
      c.fillRect(24, 34, 2, 8, '#fbbf24');
      c.fillRect(28, 34, 2, 8, '#d97706');
      c.fillRect(12, 25, 11, 10, '#059669');
      c.fillRect(8, 27, 6, 8, '#10b981');
      c.fillRect(10, 29, 3, 3, '#0284c7');
    },
    idle_1: (c) => {
      // Tail rising into half fan!
      c.drawDropShadow(24, 44, 14, 3);
      // Fan arc starting
      c.fillCircle(19, 21, 12, '#059669');
      c.fillCircle(19, 21, 8, '#10b981');
      c.fillRect(22, 26, 10, 8, '#0284c7');
      c.fillRect(27, 17, 4, 10, '#0284c7');
      c.fillRect(29, 13, 2, 4, '#38bdf8');
      c.fillRect(28, 11, 4, 2, '#059669');
      c.fillRect(33, 19, 4, 2, '#fbbf24');
      c.fillRect(30, 18, 2, 2, '#18181b');
      c.fillRect(24, 34, 2, 8, '#fbbf24');
      c.fillRect(28, 34, 2, 8, '#d97706');
    },
    idle_2: (c) => {
      // FULL GLORIOUS EMERALD FAN DISPLAY!
      c.drawDropShadow(24, 44, 16, 4);
      // Magnificent fan of emerald plumage with gold eye spots
      c.fillCircle(20, 18, 17, '#047857');
      c.fillCircle(20, 18, 14, '#059669');
      c.fillCircle(20, 18, 10, '#10b981');
      // Eye spots on fan
      const eyes = [
        { x: 10, y: 12 },
        { x: 16, y: 7 },
        { x: 24, y: 7 },
        { x: 30, y: 12 },
        { x: 12, y: 20 },
      ];
      for (const e of eyes) {
        c.fillCircle(e.x, e.y, 3, '#0284c7');
        c.fillCircle(e.x, e.y, 1, '#fde047');
      }
      // Proud peacock body in front
      c.fillRect(21, 26, 10, 8, '#0284c7');
      c.fillRect(26, 17, 4, 10, '#0284c7');
      c.fillRect(28, 13, 2, 4, '#38bdf8');
      c.fillRect(27, 11, 4, 2, '#059669');
      c.fillRect(32, 19, 4, 2, '#fbbf24');
      c.fillRect(29, 18, 2, 2, '#18181b');
      c.fillRect(23, 34, 2, 8, '#fbbf24');
      c.fillRect(27, 34, 2, 8, '#d97706');
    },
  };

  for (const [name, fn] of Object.entries(frames)) {
    const c = new PixelCanvas();
    fn(c);
    await c.save(`peacock_${name}.png`);
  }
  console.log('✓ Peacock sprites generated (walk + glorious fan idle)');
}

// ==========================================
// 6. UNICORN (Celestial Silver Unicorn)
// Idle: grazes sweet starlight grass, golden horn glows cyan sparkles
// ==========================================
async function generateUnicorn() {
  const frames: Record<string, (c: PixelCanvas) => void> = {
    walk_0: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      // Silver white body
      c.fillRect(12, 22, 20, 12, '#f8fafc');
      c.fillRect(14, 24, 16, 8, '#ffffff');
      // Silver hooves
      c.fillRect(14, 34, 3, 9, '#f8fafc');
      c.fillRect(14, 42, 3, 2, '#38bdf8'); // Cyan starlight hooves
      c.fillRect(19, 34, 3, 9, '#e2e8f0');
      c.fillRect(19, 42, 3, 2, '#38bdf8');
      c.fillRect(25, 34, 3, 9, '#f8fafc');
      c.fillRect(25, 42, 3, 2, '#38bdf8');
      c.fillRect(29, 34, 3, 9, '#e2e8f0');
      c.fillRect(29, 42, 3, 2, '#38bdf8');
      // Neck & Violet-Silver Mane
      c.fillRect(27, 14, 6, 10, '#f8fafc');
      c.fillRect(25, 12, 4, 11, '#c084fc');
      // Head
      c.fillRect(29, 9, 10, 8, '#f8fafc');
      c.fillRect(37, 12, 4, 5, '#e0f2fe');
      c.fillRect(34, 11, 2, 2, '#38bdf8'); // Celestial eye
      c.fillRect(32, 7, 2, 3, '#f8fafc');
      // Radiant Glowing Spiral Horn!
      c.fillRect(34, 2, 2, 7, '#38bdf8');
      c.fillRect(35, 1, 1, 3, '#ffffff');
      // Flowing tail
      c.fillRect(8, 23, 5, 12, '#c084fc');
    },
    walk_1: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 21, 20, 12, '#f8fafc');
      c.fillRect(14, 23, 16, 8, '#ffffff');
      // Stride 1
      c.fillRect(17, 33, 3, 9, '#f8fafc');
      c.fillRect(17, 41, 3, 2, '#38bdf8');
      c.fillRect(12, 34, 3, 8, '#e2e8f0');
      c.fillRect(12, 41, 3, 2, '#38bdf8');
      c.fillRect(28, 33, 3, 9, '#f8fafc');
      c.fillRect(28, 41, 3, 2, '#38bdf8');
      c.fillRect(23, 34, 3, 8, '#e2e8f0');
      c.fillRect(23, 41, 3, 2, '#38bdf8');
      c.fillRect(27, 13, 6, 10, '#f8fafc');
      c.fillRect(25, 11, 4, 11, '#c084fc');
      c.fillRect(29, 8, 10, 8, '#f8fafc');
      c.fillRect(37, 11, 4, 5, '#e0f2fe');
      c.fillRect(34, 10, 2, 2, '#38bdf8');
      c.fillRect(32, 6, 2, 3, '#f8fafc');
      c.fillRect(34, 1, 2, 7, '#38bdf8');
      c.fillRect(35, 0, 1, 3, '#ffffff');
      c.fillRect(7, 22, 6, 13, '#c084fc');
    },
    walk_2: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 21, 20, 12, '#f8fafc');
      c.fillRect(14, 23, 16, 8, '#ffffff');
      // Stride 2
      c.fillRect(12, 33, 3, 9, '#f8fafc');
      c.fillRect(12, 41, 3, 2, '#38bdf8');
      c.fillRect(17, 34, 3, 8, '#e2e8f0');
      c.fillRect(17, 41, 3, 2, '#38bdf8');
      c.fillRect(23, 33, 3, 9, '#f8fafc');
      c.fillRect(23, 41, 3, 2, '#38bdf8');
      c.fillRect(28, 34, 3, 8, '#e2e8f0');
      c.fillRect(28, 41, 3, 2, '#38bdf8');
      c.fillRect(27, 13, 6, 10, '#f8fafc');
      c.fillRect(25, 11, 4, 11, '#c084fc');
      c.fillRect(29, 8, 10, 8, '#f8fafc');
      c.fillRect(37, 11, 4, 5, '#e0f2fe');
      c.fillRect(34, 10, 2, 2, '#38bdf8');
      c.fillRect(32, 6, 2, 3, '#f8fafc');
      c.fillRect(34, 1, 2, 7, '#38bdf8');
      c.fillRect(35, 0, 1, 3, '#ffffff');
      c.fillRect(7, 22, 6, 13, '#c084fc');
    },
    idle_0: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#f8fafc');
      c.fillRect(14, 24, 16, 8, '#ffffff');
      c.fillRect(14, 34, 3, 9, '#f8fafc');
      c.fillRect(14, 42, 3, 2, '#38bdf8');
      c.fillRect(19, 34, 3, 9, '#e2e8f0');
      c.fillRect(19, 42, 3, 2, '#38bdf8');
      c.fillRect(25, 34, 3, 9, '#f8fafc');
      c.fillRect(25, 42, 3, 2, '#38bdf8');
      c.fillRect(29, 34, 3, 9, '#e2e8f0');
      c.fillRect(29, 42, 3, 2, '#38bdf8');
      c.fillRect(27, 14, 6, 10, '#f8fafc');
      c.fillRect(25, 12, 4, 11, '#c084fc');
      c.fillRect(29, 9, 10, 8, '#f8fafc');
      c.fillRect(37, 12, 4, 5, '#e0f2fe');
      c.fillRect(34, 11, 2, 2, '#38bdf8');
      c.fillRect(32, 7, 2, 3, '#f8fafc');
      c.fillRect(34, 2, 2, 7, '#38bdf8');
      c.fillRect(35, 1, 1, 3, '#ffffff');
      c.fillRect(8, 23, 5, 12, '#c084fc');
    },
    idle_1: (c) => {
      // Grazing grass! Horn angled forward
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#f8fafc');
      c.fillRect(14, 24, 16, 8, '#ffffff');
      c.fillRect(14, 34, 3, 9, '#f8fafc');
      c.fillRect(14, 42, 3, 2, '#38bdf8');
      c.fillRect(19, 34, 3, 9, '#e2e8f0');
      c.fillRect(19, 42, 3, 2, '#38bdf8');
      c.fillRect(25, 34, 3, 9, '#f8fafc');
      c.fillRect(25, 42, 3, 2, '#38bdf8');
      c.fillRect(29, 34, 3, 9, '#e2e8f0');
      c.fillRect(29, 42, 3, 2, '#38bdf8');
      // Neck lowering down
      c.fillRect(28, 24, 8, 8, '#f8fafc');
      c.fillRect(26, 20, 5, 8, '#c084fc');
      c.fillRect(34, 28, 9, 8, '#f8fafc');
      c.fillRect(40, 32, 4, 5, '#e0f2fe');
      c.fillRect(38, 29, 2, 2, '#38bdf8');
      c.fillRect(33, 25, 2, 3, '#f8fafc');
      // Glowing horn pointing forward/down
      c.fillRect(40, 24, 5, 2, '#38bdf8');
      c.fillRect(44, 23, 3, 2, '#ffffff');
      c.fillRect(8, 22, 5, 11, '#c084fc');
    },
    idle_2: (c) => {
      // Grazing starlight grass with sparkling magic dust!
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#f8fafc');
      c.fillRect(14, 24, 16, 8, '#ffffff');
      c.fillRect(14, 34, 3, 9, '#f8fafc');
      c.fillRect(14, 42, 3, 2, '#38bdf8');
      c.fillRect(19, 34, 3, 9, '#e2e8f0');
      c.fillRect(19, 42, 3, 2, '#38bdf8');
      c.fillRect(25, 34, 3, 9, '#f8fafc');
      c.fillRect(25, 42, 3, 2, '#38bdf8');
      c.fillRect(29, 34, 3, 9, '#e2e8f0');
      c.fillRect(29, 42, 3, 2, '#38bdf8');
      c.fillRect(28, 25, 8, 9, '#f8fafc');
      c.fillRect(26, 21, 5, 8, '#c084fc');
      c.fillRect(35, 31, 9, 8, '#f8fafc');
      c.fillRect(41, 35, 4, 5, '#e0f2fe');
      c.fillRect(39, 32, 2, 2, '#38bdf8');
      c.fillRect(34, 27, 2, 3, '#f8fafc');
      // Glowing Horn radiant pulse
      c.fillRect(41, 27, 5, 2, '#38bdf8');
      c.fillRect(45, 26, 3, 2, '#ffffff');
      // Magic star sparkles around grazing mouth & horn!
      c.fillRect(44, 33, 2, 2, '#38bdf8');
      c.fillRect(42, 22, 2, 2, '#c084fc');
      c.fillRect(46, 28, 2, 2, '#ffffff');
      c.fillRect(8, 24, 5, 11, '#c084fc');
    },
  };

  for (const [name, fn] of Object.entries(frames)) {
    const c = new PixelCanvas();
    fn(c);
    await c.save(`unicorn_${name}.png`);
  }
  console.log('✓ Unicorn sprites generated (walk + grazing sparkle idle)');
}

// ==========================================
// 7. PEGASUS (Divine Winged Pegasus)
// Idle: grazes sweet grass and spreads/flaps majestic feathered wings!
// ==========================================
async function generatePegasus() {
  const frames: Record<string, (c: PixelCanvas) => void> = {
    walk_0: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#ffffff');
      c.fillRect(14, 24, 16, 8, '#f1f5f9');
      // Golden hooves
      c.fillRect(14, 34, 3, 9, '#ffffff');
      c.fillRect(14, 42, 3, 2, '#facc15');
      c.fillRect(19, 34, 3, 9, '#e2e8f0');
      c.fillRect(19, 42, 3, 2, '#facc15');
      c.fillRect(25, 34, 3, 9, '#ffffff');
      c.fillRect(25, 42, 3, 2, '#facc15');
      c.fillRect(29, 34, 3, 9, '#e2e8f0');
      c.fillRect(29, 42, 3, 2, '#facc15');
      // Folded wing along flank
      c.fillRect(16, 19, 12, 8, '#e2e8f0');
      c.fillRect(18, 20, 9, 6, '#ffffff');
      // Neck & head
      c.fillRect(27, 14, 6, 10, '#ffffff');
      c.fillRect(26, 12, 3, 10, '#e2e8f0');
      c.fillRect(29, 9, 10, 8, '#ffffff');
      c.fillRect(37, 12, 4, 5, '#f1f5f9');
      c.fillRect(34, 11, 2, 2, '#a855f7'); // Violet divine eye
      c.fillRect(32, 7, 2, 3, '#ffffff');
      c.fillRect(8, 23, 5, 12, '#ffffff');
    },
    walk_1: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 21, 20, 12, '#ffffff');
      c.fillRect(14, 23, 16, 8, '#f1f5f9');
      c.fillRect(17, 33, 3, 9, '#ffffff');
      c.fillRect(17, 41, 3, 2, '#facc15');
      c.fillRect(12, 34, 3, 8, '#e2e8f0');
      c.fillRect(12, 41, 3, 2, '#facc15');
      c.fillRect(28, 33, 3, 9, '#ffffff');
      c.fillRect(28, 41, 3, 2, '#facc15');
      c.fillRect(23, 34, 3, 8, '#e2e8f0');
      c.fillRect(23, 41, 3, 2, '#facc15');
      c.fillRect(16, 18, 12, 8, '#e2e8f0');
      c.fillRect(18, 19, 9, 6, '#ffffff');
      c.fillRect(27, 13, 6, 10, '#ffffff');
      c.fillRect(26, 11, 3, 10, '#e2e8f0');
      c.fillRect(29, 8, 10, 8, '#ffffff');
      c.fillRect(37, 11, 4, 5, '#f1f5f9');
      c.fillRect(34, 10, 2, 2, '#a855f7');
      c.fillRect(32, 6, 2, 3, '#ffffff');
      c.fillRect(7, 22, 6, 13, '#ffffff');
    },
    walk_2: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 21, 20, 12, '#ffffff');
      c.fillRect(14, 23, 16, 8, '#f1f5f9');
      c.fillRect(12, 33, 3, 9, '#ffffff');
      c.fillRect(12, 41, 3, 2, '#facc15');
      c.fillRect(17, 34, 3, 8, '#e2e8f0');
      c.fillRect(17, 41, 3, 2, '#facc15');
      c.fillRect(23, 33, 3, 9, '#ffffff');
      c.fillRect(23, 41, 3, 2, '#facc15');
      c.fillRect(28, 34, 3, 8, '#e2e8f0');
      c.fillRect(28, 41, 3, 2, '#facc15');
      c.fillRect(16, 18, 12, 8, '#e2e8f0');
      c.fillRect(18, 19, 9, 6, '#ffffff');
      c.fillRect(27, 13, 6, 10, '#ffffff');
      c.fillRect(26, 11, 3, 10, '#e2e8f0');
      c.fillRect(29, 8, 10, 8, '#ffffff');
      c.fillRect(37, 11, 4, 5, '#f1f5f9');
      c.fillRect(34, 10, 2, 2, '#a855f7');
      c.fillRect(32, 6, 2, 3, '#ffffff');
      c.fillRect(7, 22, 6, 13, '#ffffff');
    },
    idle_0: (c) => {
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#ffffff');
      c.fillRect(14, 24, 16, 8, '#f1f5f9');
      c.fillRect(14, 34, 3, 9, '#ffffff');
      c.fillRect(14, 42, 3, 2, '#facc15');
      c.fillRect(19, 34, 3, 9, '#e2e8f0');
      c.fillRect(19, 42, 3, 2, '#facc15');
      c.fillRect(25, 34, 3, 9, '#ffffff');
      c.fillRect(25, 42, 3, 2, '#facc15');
      c.fillRect(29, 34, 3, 9, '#e2e8f0');
      c.fillRect(29, 42, 3, 2, '#facc15');
      c.fillRect(16, 19, 12, 8, '#e2e8f0');
      c.fillRect(18, 20, 9, 6, '#ffffff');
      c.fillRect(27, 14, 6, 10, '#ffffff');
      c.fillRect(26, 12, 3, 10, '#e2e8f0');
      c.fillRect(29, 9, 10, 8, '#ffffff');
      c.fillRect(37, 12, 4, 5, '#f1f5f9');
      c.fillRect(34, 11, 2, 2, '#a855f7');
      c.fillRect(32, 7, 2, 3, '#ffffff');
      c.fillRect(8, 23, 5, 12, '#ffffff');
    },
    idle_1: (c) => {
      // Grazing grass with wings lifting!
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#ffffff');
      c.fillRect(14, 24, 16, 8, '#f1f5f9');
      c.fillRect(14, 34, 3, 9, '#ffffff');
      c.fillRect(14, 42, 3, 2, '#facc15');
      c.fillRect(19, 34, 3, 9, '#e2e8f0');
      c.fillRect(19, 42, 3, 2, '#facc15');
      c.fillRect(25, 34, 3, 9, '#ffffff');
      c.fillRect(25, 42, 3, 2, '#facc15');
      c.fillRect(29, 34, 3, 9, '#e2e8f0');
      c.fillRect(29, 42, 3, 2, '#facc15');
      // Wings half unfolded upward!
      c.fillRect(14, 10, 14, 10, '#e2e8f0');
      c.fillRect(16, 8, 12, 8, '#ffffff');
      c.fillRect(28, 24, 8, 8, '#ffffff');
      c.fillRect(34, 28, 9, 8, '#ffffff');
      c.fillRect(40, 32, 4, 5, '#f1f5f9');
      c.fillRect(38, 29, 2, 2, '#a855f7');
      c.fillRect(33, 25, 2, 3, '#ffffff');
      c.fillRect(8, 22, 5, 11, '#ffffff');
    },
    idle_2: (c) => {
      // Grazing grass while magnificent wings are fully spread & flapping!
      c.drawDropShadow(24, 45, 14, 3);
      c.fillRect(12, 22, 20, 12, '#ffffff');
      c.fillRect(14, 24, 16, 8, '#f1f5f9');
      c.fillRect(14, 34, 3, 9, '#ffffff');
      c.fillRect(14, 42, 3, 2, '#facc15');
      c.fillRect(19, 34, 3, 9, '#e2e8f0');
      c.fillRect(19, 42, 3, 2, '#facc15');
      c.fillRect(25, 34, 3, 9, '#ffffff');
      c.fillRect(25, 42, 3, 2, '#facc15');
      c.fillRect(29, 34, 3, 9, '#e2e8f0');
      c.fillRect(29, 42, 3, 2, '#facc15');
      // MAGNIFICENT SPREAD WINGS!
      c.fillRect(8, 3, 22, 16, '#e2e8f0');
      c.fillRect(10, 2, 19, 14, '#ffffff');
      // Feather row tips
      c.fillRect(8, 2, 3, 4, '#cbd5e1');
      c.fillRect(14, 0, 4, 4, '#cbd5e1');
      c.fillRect(22, 1, 4, 4, '#cbd5e1');
      c.fillRect(28, 25, 8, 9, '#ffffff');
      c.fillRect(35, 31, 9, 8, '#ffffff');
      c.fillRect(41, 35, 4, 5, '#f1f5f9');
      c.fillRect(39, 32, 2, 2, '#a855f7');
      c.fillRect(34, 27, 2, 3, '#ffffff');
      c.fillRect(8, 24, 5, 11, '#ffffff');
    },
  };

  for (const [name, fn] of Object.entries(frames)) {
    const c = new PixelCanvas();
    fn(c);
    await c.save(`pegasus_${name}.png`);
  }
  console.log('✓ Pegasus sprites generated (walk + flapping wings grazing idle)');
}

// Generate all 7 pets
await generateDog();
await generateCat();
await generateHorse();
await generateTiger();
await generatePeacock();
await generateUnicorn();
await generatePegasus();

console.log('★ All 7 pet species multi-frame pixel sprites generated successfully!');

