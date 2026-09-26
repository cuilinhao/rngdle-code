import { test, expect, type Page } from '@playwright/test';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFile } from 'node:fs/promises';
import jsQR from 'jsqr';

const origin = new URL(process.env.BASE_URL || 'http://127.0.0.1:5173').origin;
const treeChunk = /\/(?:src\/ShareTree\.tsx|assets\/ShareTree-[^/]+\.js)(?:\?.*)?$/;

async function decodePng(source: string | Buffer) {
  const image = await loadImage(source);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return jsQR(
    new Uint8ClampedArray(context.getImageData(0, 0, image.width, image.height).data),
    image.width,
    image.height,
  )?.data;
}

async function openShare(page: Page) {
  await page.locator('.analysis-result .actions button').last().click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function readyTree(page: Page) {
  await expect(page.locator('.share-tree')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.share-tree-toggle')).toBeEnabled();
}

async function expectVisibleQr(page: Page, url: string) {
  const viewport = page.locator('.share-tree-viewport');
  await viewport.scrollIntoViewIfNeeded();
  await expect(viewport).toBeInViewport({ ratio: 1 });
  // Decode the rendered UI, including the control over the canvas and any clipping.
  expect(await decodePng(await viewport.screenshot())).toBe(url);
}

test('rapidly reversing the animation finishes on a scannable QR', async ({ page }) => {
  await page.goto('/en?n=142857');
  await openShare(page);
  await readyTree(page);
  const toggle = page.locator('.share-tree-toggle');
  await toggle.click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'transition');
  for (let i = 0; i < 6; i++) await toggle.click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'qr');
  await expectVisibleQr(page, origin + '/en?n=142857');
});

test('closing during animation and reopening repeatedly leaves a working scene without page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/en?n=12321');
  for (let attempt = 0; attempt < 3; attempt++) {
    await openShare(page);
    await readyTree(page);
    await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'tree');
    await page.locator('.share-tree-toggle').click();
    await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'transition');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await openShare(page);
  await readyTree(page);
  await page.locator('.share-tree-toggle').click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'qr');
  await expectVisibleQr(page, origin + '/en?n=12321');
  expect(errors).toEqual([]);
});

test('the tree chunk is lazy and a failed chunk request leaves a scannable fallback', async ({ page }) => {
  const requests: string[] = [];
  await page.route(treeChunk, async route => {
    requests.push(route.request().url());
    await route.abort('failed');
  });
  await page.goto('/en?n=0');
  await expect(page.locator('.analysis-result')).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
  });
  expect(requests).toEqual([]);
  await openShare(page);
  await expect(page.locator('.share-fallback')).toBeVisible();
  expect(requests.length).toBeGreaterThan(0);
  await expectVisibleQr(page, origin + '/en?n=0');
  const download = page.getByRole('dialog').locator('a[download]');
  await expect(download).toHaveAttribute('href', /^data:image\/png/);
  expect(await decodePng((await download.getAttribute('href'))!)).toBe(origin + '/en?n=0');
});

test('losing the real WebGL context during animation exposes the fallback QR', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/en?n=1000000');
  await openShare(page);
  await readyTree(page);
  await page.locator('.share-tree-toggle').click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'transition');
  const lost = await page.locator('.share-tree canvas').evaluate(canvas => {
    const context = (canvas as HTMLCanvasElement).getContext('webgl2');
    const extension = context?.getExtension('WEBGL_lose_context');
    if (!extension) return false;
    extension.loseContext();
    return true;
  });
  expect(lost).toBe(true);
  await expect(page.locator('.share-fallback')).toBeVisible();
  await expect(page.locator('.share-tree')).toHaveCount(0);
  await expectVisibleQr(page, origin + '/en?n=1000000');
  const download = page.getByRole('dialog').locator('a[download]');
  await expect(download).toHaveAttribute('href', /^data:image\/png/);
  expect(await decodePng((await download.getAttribute('href'))!)).toBe(origin + '/en?n=1000000');
  expect(errors).toEqual([]);
});

test('all six locales expose a scannable QR and reachable copy and download on a 320px short screen', async ({ page, context }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  for (const locale of ['en', 'zh', 'ja', 'ko', 'de', 'fr']) {
    await test.step(locale, async () => {
      const url = origin + '/' + locale + '?n=1000000';
      await page.goto('/' + locale + '?n=1000000');
      await openShare(page);
      await readyTree(page);
      const dialog = page.getByRole('dialog');
      expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      await page.locator('.share-tree-toggle').click();
      await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'qr');
      await expectVisibleQr(page, url);
      const copy = dialog.locator('.share-link-row button');
      await copy.scrollIntoViewIfNeeded();
      await expect(copy).toBeInViewport({ ratio: 1 });
      await copy.click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(url);
      const download = dialog.locator('a[download]');
      await expect(download).toBeVisible();
      await download.scrollIntoViewIfNeeded();
      await expect(download).toBeInViewport({ ratio: 1 });
      const downloaded = page.waitForEvent('download');
      await download.click();
      const file = await downloaded;
      expect(file.suggestedFilename()).toBe('rngdle-art-1000000.png');
      expect(await decodePng(await readFile((await file.path())!))).toBe(url);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    });
  }
});

test('enabling reduced motion during the animation settles on the requested scannable QR', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en?n=777777');
  await openShare(page);
  await readyTree(page);
  await page.locator('.share-tree-toggle').click();
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'transition');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.share-tree')).toHaveAttribute('data-view', 'qr');
  await expectVisibleQr(page, origin + '/en?n=777777');
});
