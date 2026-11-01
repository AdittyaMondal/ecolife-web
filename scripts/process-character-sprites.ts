import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BRAIN_DIR = '/Users/yusuf/.gemini/antigravity/brain/b6c3e4ad-c13b-48d5-bc2d-fa72adb6de26';
const OUT_DIR = '/Users/yusuf/Coding/ECO/ecolife-web/public/sprites';

fs.mkdirSync(OUT_DIR, { recursive: true });

const spriteNames = [
  'gardener_front',
  'gardener_back',
  'gardener_walk',
  'forest_ranger',
  'solar_scout',
  'garden_tileset',
];

const brainFiles = fs.readdirSync(BRAIN_DIR);

for (const name of spriteNames) {
  const matching = brainFiles
    .filter((f) => f.startsWith(`${name}_`) && f.endsWith('.jpg'))
    .sort()
    .pop();

  if (!matching) {
    console.log(`Waiting for ${name}...`);
    continue;
  }

  const inputPath = path.join(BRAIN_DIR, matching);
  const outputPath = path.join(OUT_DIR, `${name}.png`);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const pixels = data;

  // Background removal for white background
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (r > 230 && g > 230 && b > 230) {
      pixels[i + 3] = 0;
    } else if (r > 215 && g > 215 && b > 215) {
      const maxDiff = Math.max(r, g, b);
      const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - (maxDiff - 215) / (230 - 215)))));
      pixels[i + 3] = alpha;
    }
  }

  await sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .trim({ threshold: 10 })
    .resize(96, 96, {
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);

  console.log(`Processed & saved: ${name}.png`);
}
