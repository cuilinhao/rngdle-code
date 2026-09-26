import { test, expect } from '@playwright/test';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import jsQR from 'jsqr';
import { readFile } from 'node:fs/promises';
const origin = process.env.BASE_URL || 'http://127.0.0.1:5173';

async function decodePng(source: string | Buffer) {
  const image = await loadImage(source);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return jsQR(new Uint8ClampedArray(ctx.getImageData(0, 0, image.width, image.height).data), image.width, image.height)?.data;
}

async function treeColors(source: string | Buffer) {
  const image = await loadImage(source);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  // The artwork band excludes text and the dedicated QR below it.
  const pixels = ctx.getImageData(622, 0, 530, 400).data;
  let green = 0, orange = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    if (g > r * 1.06 && g > b * 1.08 && g < 235) green++;
    if (r > g * 1.05 && g > b * 1.15 && b < 170) orange++;
  }
  return { green, orange };
}

test('download waits for the lazy tree and the saved PNG contains the tree', async ({ page }, info) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let requested!: () => void;
  const requestSeen = new Promise<void>(resolve => { requested = resolve; });
  await page.route(/\/(?:src\/ShareTree\.tsx|assets\/ShareTree-[^/]+\.js)(?:\?.*)?$/, async route => {
    requested();
    await gate;
    await route.continue();
  });
  await page.goto('/en?n=142857');
  await page.getByRole('button', { name: 'Create share card', exact: true }).click();
  await requestSeen;
  try {
    await expect(page.locator('.share-tree-loading')).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(requestAnimationFrame);
    });
    await expect(page.getByRole('link', { name: 'Download card', exact: true })).toHaveCount(0);
  } finally {
    release();
  }
  await expect(page.locator('.share-tree')).toHaveAttribute('data-ready', 'true');
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download card', exact: true }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('rngdle-art-142857.png');
  const png = await readFile((await file.path())!);
  expect(await decodePng(png)).toBe(origin + '/en?n=142857');
  expect((await treeColors(png)).green).toBeGreaterThan(1500);
  await info.attach('downloaded-tree-card', { body: png, contentType: 'image/png' });
});

test('changing season never downloads the previous tree while its new image decodes', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en?n=142857');
  await page.getByRole('button', { name: 'Create share card', exact: true }).click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-ready', 'true');
  const link = page.getByRole('link', { name: 'Download card', exact: true });
  await expect(link).toBeVisible();
  await expect.poll(async () => (await treeColors((await link.getAttribute('href'))!)).green).toBeGreaterThan(1500);
  const summer = (await link.getAttribute('href'))!;
  await page.evaluate(() => {
    const original = HTMLImageElement.prototype.decode;
    const pending: Array<() => void> = [];
    (window as any).__releaseShareDecode = () => {
      HTMLImageElement.prototype.decode = original;
      pending.forEach(resolve => resolve());
    };
    HTMLImageElement.prototype.decode = async function() {
      if (this.src.startsWith('data:image/png')) await new Promise<void>(resolve => pending.push(resolve));
      return original.call(this);
    };
  });
  await page.getByRole('button', { name: 'Show QR code', exact: true }).click();
  await page.getByRole('button', { name: 'Autumn', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Autumn', exact: true })).toHaveAttribute('aria-pressed', 'true');
  try {
    await expect(link).toHaveCount(0);
  } finally {
    await page.evaluate(() => (window as any).__releaseShareDecode());
  }
  await expect(link).toBeVisible();
  const download = page.waitForEvent('download');
  await link.click();
  const png = await readFile((await (await download).path())!);
  expect(await decodePng(png)).toBe(origin + '/en?n=142857');
  const autumn = await treeColors(png);
  expect(autumn.orange).toBeGreaterThan(1500);
  expect(autumn.orange).toBeGreaterThan((await treeColors(summer)).orange * 2);
  expect(await decodePng(await page.locator('.share-tree-viewport').screenshot())).toBe(origin + '/en?n=142857');
  await info.attach('downloaded-autumn-card', { body: png, contentType: 'image/png' });
  await page.getByRole('button', { name: 'Spring', exact: true }).click();
  await expect(link).toBeVisible();
  const spring = (await link.getAttribute('href'))!;
  expect((await treeColors(spring)).green).toBeGreaterThan(1500);
  expect(spring).not.toBe(summer);
  expect(await decodePng(spring)).toBe(origin + '/en?n=142857');
  await info.attach('spring-card', { body: Buffer.from(spring.split(',')[1], 'base64'), contentType: 'image/png' });
});

test('share tree animates to a QR that opens this result, and back to a tree', async ({ page }, info) => {
  await page.clock.install({ time: new Date('2026-09-26T00:00:00Z') });
  await page.goto('/en?n=142857');
  await page.getByRole('button', { name: 'Create share card', exact: true }).click();
  const tree = page.locator('.share-tree');
  await expect(tree).toHaveAttribute('data-ready', 'true');
  await expect(tree).toHaveAttribute('data-view', 'tree');
  await info.attach('tree', { body: await page.getByRole('dialog').screenshot({ path: info.outputPath('tree.png') }), contentType: 'image/png' });
  await page.clock.pauseAt(new Date('2026-09-26T01:00:00Z'));
  await page.getByRole('button', { name: 'Show QR code', exact: true }).click();
  await page.clock.runFor(160);
  await expect(tree).toHaveAttribute('data-view', 'transition');
  await page.clock.fastForward(1400);
  await expect(tree).toHaveAttribute('data-view', 'qr');
  await page.clock.resume();
  const png = await page.locator('.share-tree-viewport').screenshot();
  expect(await decodePng(png)).toBe(origin + '/en?n=142857');
  await info.attach('qr', { body: await page.getByRole('dialog').screenshot({ path: info.outputPath('qr.png') }), contentType: 'image/png' });
  await page.getByRole('button', { name: 'Show 3D tree', exact: true }).click();
  await expect(tree).toHaveAttribute('data-view', 'tree');
  const poster = page.getByRole('link', { name: 'Download card', exact: true });
  const summerCard = await poster.getAttribute('href');
  await page.getByRole('button', { name: 'Autumn', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Autumn', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(poster).not.toHaveAttribute('href', summerCard!);
  await expect(poster).toHaveAttribute('href', /^data:image\/png/);
  expect(await decodePng((await poster.getAttribute('href'))!)).toBe(origin + '/en?n=142857');
});

test('mobile reduced motion keeps the QR, controls and localized result usable', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/zh?n=1000000');
  await page.getByRole('button', { name: '生成分享卡片', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(page.locator('.share-tree')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: '显示二维码', exact: true }).click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'qr');
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBeTruthy();
  const png = await page.locator('.share-tree-viewport').screenshot();
  expect(await decodePng(png)).toBe(origin + '/zh?n=1000000');
  await info.attach('mobile-share', { body: await dialog.screenshot({ path: info.outputPath('mobile.png') }), contentType: 'image/png' });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('without WebGL a scannable result card and download are still available', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
      if (type.startsWith('webgl')) return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/en?n=0');
  await page.getByRole('button', { name: 'Create share card', exact: true }).click();
  await expect(page.locator('.share-fallback')).toBeVisible();
  const download = page.getByRole('link', { name: 'Download card', exact: true });
  expect(await decodePng((await download.getAttribute('href'))!)).toBe(origin + '/en?n=0');
});


test('tree interaction still works when only the WebGL snapshot export fails', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
      if (this.closest('.share-tree')) throw new DOMException('Snapshot unavailable', 'SecurityError');
      return original.apply(this, args);
    };
  });
  await page.goto('/en?n=12321');
  await page.getByRole('button', { name: 'Create share card', exact: true }).click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('button', { name: 'Show QR code', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Show QR code', exact: true }).click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'qr');
  expect(await decodePng(await page.locator('.share-tree-viewport').screenshot())).toBe(origin + '/en?n=12321');
  const download = page.getByRole('link', { name: 'Download card', exact: true });
  await expect(download).toBeVisible();
  expect(await decodePng((await download.getAttribute('href'))!)).toBe(origin + '/en?n=12321');
  await page.getByRole('button', { name: 'Autumn', exact: true }).click();
  await expect(download).toBeVisible();
  expect(await decodePng((await download.getAttribute('href'))!)).toBe(origin + '/en?n=12321');
});

test('a failed lazy tree request still offers a scannable fallback download', async ({ page }) => {
  await page.route(/\/(?:src\/ShareTree\.tsx|assets\/ShareTree-[^/]+\.js)(?:\?.*)?$/, route => route.abort());
  await page.goto('/en?n=0');
  await page.getByRole('button', { name: 'Create share card', exact: true }).click();
  await expect(page.locator('.share-fallback')).toBeVisible();
  const download = page.getByRole('link', { name: 'Download card', exact: true });
  await expect(download).toBeVisible();
  expect(await decodePng((await download.getAttribute('href'))!)).toBe(origin + '/en?n=0');
});

for (const locale of ['en', 'zh', 'ja', 'ko', 'de', 'fr']) {
  test(`share card fits at 320px in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 840 });
    await page.goto('/' + locale + '?n=1000000');
    await page.locator('.analysis-result .actions button').last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.getByRole('dialog').evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBeTruthy();
    const result = page.locator('.share-result');
    expect(await result.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBeTruthy();
  });
}


test('changing locale with history while the dialog is open rebuilds a working QR scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en?n=142857');
  await page.getByRole('button', { name: 'Create share card', exact: true }).click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => {
    history.pushState({}, '', '/zh?n=142857');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.locator('.share-tree')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: '显示二维码', exact: true }).click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'qr');
  expect(await decodePng(await page.locator('.share-tree-viewport').screenshot())).toBe(origin + '/zh?n=142857');
});
