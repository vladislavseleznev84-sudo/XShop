// Подставляет серверный рендер React в dist/index.html (статический HTML для SEO и быстрого первого кадра).
import { readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const entry = resolve('dist-ssr/entry-server.js');
const { render } = await import(pathToFileURL(entry).href);
const html = await readFile('dist/index.html', 'utf8');
if (!html.includes('<!--app-html-->')) throw new Error('Маркер <!--app-html--> не найден в dist/index.html');
await writeFile('dist/index.html', html.replace('<!--app-html-->', render()));
await rm('dist-ssr', { recursive: true, force: true });
console.log('prerender: ok');
