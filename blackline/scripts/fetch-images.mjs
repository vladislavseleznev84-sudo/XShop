// Скачивает исходники в assets-src/ (папка не коммитится).
import { mkdir, writeFile, access } from 'node:fs/promises';
import { PHOTOS } from './images.config.mjs';

await mkdir('assets-src', { recursive: true });
for (const [key, id] of Object.entries(PHOTOS)) {
  const file = `assets-src/${key}.jpg`;
  try { await access(file); console.log('skip', key); continue; } catch {}
  const url = `https://images.unsplash.com/photo-${id}?w=2400&q=85&fm=jpg&fit=max`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${key}: HTTP ${res.status}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log('ok  ', key);
}
