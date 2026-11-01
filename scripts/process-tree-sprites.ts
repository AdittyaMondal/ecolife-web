import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BRAIN_DIR = '/Users/yusuf/.gemini/antigravity/brain/b6c3e4ad-c13b-48d5-bc2d-fa72adb6de26';
const OUT_DIR = '/Users/yusuf/Coding/ECO/ecolife-web/public/trees';

fs.mkdirSync(OUT_DIR, { recursive: true });

const trees = [
  'neem',
  'mango',
  'amaltas',
  'gulmohar',
  'jacaranda',
  'banyan',
  'peepal',
  'red-sanders',
];

const brainFiles = fs.readdirSync(BRAIN_DIR);

for (const slug of trees) {
  // Find matching file
  const matching = brainFiles
    .filter(
      (f) =>
        (f.startsWith(`${slug}_`) || f.startsWith(`${slug.replace('-', '_')}_`)) &&
        f.endsWith('.jpg'),
    )
    .sort()
    .pop();

  if (!matching) {
    console.log(`Waiting for ${slug}...`);
    continue;
  }

  const inputPath = path.join(BRAIN_DIR, matching);
  const outputPath = path.join(OUT_DIR, `${slug}.png`);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const pixels = data;

  // Flood fill / background removal:
  // Convert near-white background pixels (R, G, B > 235) to transparent
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (r > 232 && g > 232 && b > 232) {
      pixels[i + 3] = 0; // Transparent
    } else if (r > 215 && g > 215 && b > 215) {
      // Soft antialiased edge
      const maxDiff = Math.max(r, g, b);
      const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - (maxDiff - 215) / (235 - 215)))));
      pixels[i + 3] = alpha;
    }
  }

  // Create clean transparent PNG, trim extra empty space, and resize to 128x128
  await sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .trim({ threshold: 10 })
    .resize(128, 128, {
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);

  console.log(`Processed & saved: ${slug}.png`);
}
