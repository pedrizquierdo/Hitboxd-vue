import sharp from 'sharp';
import { readFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const assetsDir = resolve(root, 'public/assets');

const fmt = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function compressAssets() {
  const tasks = [
    {
      input: resolve(assetsDir, 'bg-texture.jpg'),
      output: resolve(assetsDir, 'bg-texture.webp'),
      opts: { quality: 60, width: 800 },
      label: 'bg-texture',
    },
    {
      input: resolve(assetsDir, 'hero_image.png'),
      output: resolve(assetsDir, 'hero_image.webp'),
      opts: { quality: 80 },
      label: 'hero_image',
    },
  ];

  for (const { input, output, opts, label } of tasks) {
    const before = statSync(input).size;

    let pipeline = sharp(input);
    if (opts.width) pipeline = pipeline.resize({ width: opts.width, withoutEnlargement: true });
    await pipeline.webp({ quality: opts.quality }).toFile(output);

    const after = statSync(output).size;
    console.log(`${label}: ${fmt(before)} -> ${fmt(after)} (saved ${fmt(before - after)})`);
  }
}

compressAssets().catch((err) => {
  console.error('Compression failed:', err.message);
  process.exit(1);
});
