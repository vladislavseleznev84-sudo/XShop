// assets-src/*.jpg -> public/img/{key}-{w}.{avif,webp} + src/data/images.manifest.json
import sharp from 'sharp';
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import { PHOTOS, WIDTHS } from './images.config.mjs';

await rm('public/img', { recursive: true, force: true });
await mkdir('public/img', { recursive: true });
const manifest = {};

// Единый «тон»: монохром, лёгкая подтяжка контраста, едва тёплый (костяной) оттенок светов.
const grade = (img) =>
  img.grayscale().normalise({ lower: 2, upper: 99 }).linear(1.06, -6).gamma(1.08).tint('#E9E5DC');

for (const key of Object.keys(PHOTOS)) {
  const src = `assets-src/${key}.jpg`;
  const meta = await sharp(src).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width);
  if (!widths.includes(meta.width) && meta.width <= WIDTHS.at(-1)) widths.push(meta.width);
  if (!widths.length) widths.push(meta.width);
  for (const w of widths) {
    const base = () => grade(sharp(src).resize({ width: w }));
    await base().avif({ quality: 48, effort: 5 }).toFile(`public/img/${key}-${w}.avif`);
    await base().webp({ quality: 74, effort: 5 }).toFile(`public/img/${key}-${w}.webp`);
  }
  const lq = await grade(sharp(src).resize({ width: 20 })).blur(0.6).webp({ quality: 40 }).toBuffer();
  const stats = await grade(sharp(src).resize({ width: 32 })).stats();
  manifest[key] = {
    w: meta.width,
    h: meta.height,
    widths,
    lqip: `data:image/webp;base64,${lq.toString('base64')}`,
    mean: Math.round(stats.channels[0].mean),
  };
  console.log(key, meta.width + 'x' + meta.height, widths.join(','));
}
await writeFile('src/data/images.manifest.json', JSON.stringify(manifest, null, 1));
const files = await readdir('public/img');
console.log(files.length, 'files');
