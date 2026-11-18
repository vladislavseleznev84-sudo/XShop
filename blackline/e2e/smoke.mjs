/**
 * E2E-проверка собранного сайта (npm run build && npm run e2e).
 * Запускает vite preview, гоняет Chromium в десктопном и iPhone-режимах.
 * Playwright берётся из глобальной установки (NODE_PATH) или из node_modules.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const PORT = 4173;
const URL = `http://127.0.0.1:${PORT}/`;
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(URL)).ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 200));
}

let failed = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) failed++;
};

const browser = await chromium.launch();

async function session(label, contextOptions) {
  const ctx = await browser.newContext(contextOptions);
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  return { ctx, page, problems, label };
}

/* ───── SEO: статический HTML содержит контент ───── */
{
  const html = await (await fetch(URL)).text();
  check('SEO: пререндер содержит h1, услуги и мастеров', /<h1[^>]*>/.test(html) && html.includes('Classic Haircut') && html.includes('Дамир'));
  check('SEO: title, description, canonical, JSON-LD, og:image',
    ['<title>', 'name="description"', 'rel="canonical"', 'application/ld+json', 'og:image'].every((s) => html.includes(s)));
  check('SEO: один h1', (html.match(/<h1[\s>]/g) ?? []).length === 1);
}

for (const [label, opts, isMobile] of [
  ['desktop 1440', { viewport: { width: 1440, height: 900 } }, false],
  ['iPhone 14', { ...devices['iPhone 14'] }, true],
]) {
  console.log(`\n── ${label}`);
  const { ctx, page, problems } = await session(label, opts);

  check('нет ошибок/предупреждений консоли и сетевых сбоев (в т.ч. гидратации)', problems.length === 0, problems.join(' | '));

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('нет горизонтальной прокрутки', overflow <= 0, `overflow ${overflow}px`);

  const ids = await page.evaluate(() => ['top', 'manifesto', 'services', 'gallery', 'barbers', 'booking', 'location'].filter((id) => !document.getElementById(id)));
  check('все секции на месте', ids.length === 0, ids.join(','));

  const fonts = await page.evaluate(async () => { await document.fonts.ready; return ['BL Serif', 'BL Sans', 'BL Mono'].map((f) => document.fonts.check(`16px "${f}"`)); });
  check('шрифты загружены', fonts.every(Boolean));

  const brokenImgs = await page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach((i) => (i.loading = 'eager'));
    await Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    return imgs.filter((i) => !i.naturalWidth).map((i) => i.currentSrc);
  });
  check('изображения загружаются', brokenImgs.length === 0, brokenImgs.join(','));

  /* меню на мобильном */
  if (isMobile) {
    await page.getByRole('button', { name: 'Меню' }).click();
    check('мобильное меню открывается', await page.locator('#menu').isVisible());
    await page.keyboard.press('Escape');
    check('Esc закрывает меню', !(await page.locator('#menu').isVisible()));
  }

  /* лайтбокс */
  await page.locator('#gallery').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /Открыть кадр 1/ }).click({ force: true });
  await page.waitForTimeout(900);
  check('лайтбокс открывается (role=dialog)', await page.getByRole('dialog').isVisible());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900); // дождаться «шторки» листания
  check('стрелка листает кадр', (await page.locator('[role=dialog]').getAttribute('aria-label')).includes('2 из'));
  await page.getByRole('dialog').locator('img').click({ force: true });
  const zoomed = await page.getByRole('dialog').locator('img').evaluate((el) => getComputedStyle(el).transform !== 'none' || el.className.includes('zoomed'));
  check('клик увеличивает кадр', zoomed);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('Esc закрывает лайтбокс', (await page.getByRole('dialog').count()) === 0);

  /* форма записи */
  await page.evaluate(() => document.getElementById('booking').scrollIntoView());
  await page.waitForTimeout(800);
  await page.getByRole('radio', { name: /Haircut \+ Beard/ }).check({ force: true });
  await page.waitForTimeout(700);
  await page.getByRole('radio', { name: /Любой свободный/ }).check({ force: true });
  await page.waitForTimeout(1000);
  const slot = page.locator('input[name=time]:not(:disabled)').first();
  check('есть свободные слоты', (await slot.count()) > 0);
  await slot.check({ force: true });
  await page.waitForTimeout(700);

  await page.getByRole('button', { name: 'Проверить заявку' }).click();
  const errCount = await page.locator('[id$="-err"]').count();
  check('пустые контакты → 3 ошибки валидации', errCount === 3, `${errCount}`);

  await page.fill('#b-name', 'Тест');
  await page.locator('#b-phone').pressSequentially('89990001122');
  check('маска телефона', (await page.inputValue('#b-phone')) === '+7 (999) 000-11-22');
  await page.locator('label:has(input[type=checkbox])').click();
  await page.getByRole('button', { name: 'Проверить заявку' }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Отправить заявку' }).click();
  await page.getByText('Заявка сформирована').waitFor({ timeout: 5000 });
  check('форма завершается демо-подтверждением', true);
  check('честная пометка: заявка не передана в реальную систему', (await page.locator('#booking').innerText()).includes('реальной записи не создано'));
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('blackline:demo-requests') ?? '[]').length);
  check('демо-заявка сохранена только локально', stored === 1);

  /* доступность (axe) */
  await page.evaluate(axeSource);
  const axe = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { 'color-contrast': { enabled: true } } }));
  const serious = axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  check('axe: нет serious/critical нарушений', serious.length === 0,
    serious.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0].target.join(' ')}`).join(' | '));
  if (axe.violations.length) console.log('   прочие замечания axe:', axe.violations.map((v) => `${v.id}[${v.impact}]×${v.nodes.length}`).join(', '));

  await ctx.close();
}

/* prefers-reduced-motion: контент виден сразу, без шторок */
{
  const { ctx, page } = await session('reduced', { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el.firstElementChild ?? el).clipPath !== 'none' && getComputedStyle(el.firstElementChild ?? el).clipPath !== '').length);
  check('reduced-motion: ничего не спрятано шторкой', hidden === 0, `${hidden}`);
  await ctx.close();
}

await browser.close();
server.kill();
console.log(failed ? `\n${failed} проверок не пройдено` : '\nВсе проверки пройдены');
process.exit(failed ? 1 : 0);
