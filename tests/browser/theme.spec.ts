import { test, expect, type Page, type Locator } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

async function theme(page: Page, value: 'light' | 'dark') {
  await expect(page.locator('main[data-ready=true]')).toBeVisible();
  if (await page.locator('html').getAttribute('data-theme') !== value) {
    await page.getByRole('button', { name: value === 'light' ? 'Light theme' : 'Dark theme', exact: true }).click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', value);
}

// Resolve translucent surfaces through their ancestors rather than assuming a token value.
async function readable(locator: Locator) {
  const result = await locator.evaluate(element => {
    const rgb = (value: string) => {
      const match = value.match(/[\d.]+/g)?.map(Number) || [];
      return [match[0] || 0, match[1] || 0, match[2] || 0, match[3] ?? 1];
    };
    const over = (front: number[], back: number[]) => [
      ...front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3])), 1,
    ];
    const chain: Element[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) chain.push(node);
    let background = [255, 255, 255, 1];
    for (const node of chain.reverse()) background = over(rgb(getComputedStyle(node).backgroundColor), background);
    const style = getComputedStyle(element);
    const foreground = over(rgb(style.color), background);
    const lum = (color: number[]) => color.slice(0, 3).map(v => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    const values = [lum(foreground), lum(background)].sort((a, b) => a - b);
    const size = parseFloat(style.fontSize), weight = parseInt(style.fontWeight, 10);
    return { ratio: (values[1] + 0.05) / (values[0] + 0.05), minimum: size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5, text: element.textContent };
  });
  expect(result.ratio, `Text contrast: ${result.text}`).toBeGreaterThanOrEqual(result.minimum);
}

async function geometry(page: Page) {
  return page.locator('.header, .page-head, .hero-links, .calculator, .input-row input, .input-row .primary, .score-summary, .number-heading, .metrics, .dna, .feature-grid').evaluateAll(elements => elements.map(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { className: element.className, x, y, width, height };
  }));
}

test('A13 actual text contrast, button hover, validation and every tier in both themes', async ({ page }) => {
  await page.goto('/en');
  for (const value of ['dark', 'light'] as const) {
    await theme(page, value);
    await expect(page.locator('.tier-table .badge')).toHaveCount(7);
    for (const selector of ['h1', '.eyebrow', '.navigation a.active', '.page-head > p', '.number-form > label', '.number-form > p', '.big-number', '.metrics strong', '.metrics span', '.input-row .primary', '.tier-table .badge']) {
      for (const element of await page.locator(selector).all()) await readable(element);
    }
    const navLink = page.locator('.navigation a').nth(1);
    await navLink.hover();
    await readable(navLink);
    const submit = page.getByRole('button', { name: 'Analyze number', exact: true });
    await submit.hover();
    await readable(submit);
    await page.getByLabel('Enter a number', { exact: true }).fill('-1');
    await submit.click();
    await expect(page.locator('#number-error')).toBeVisible();
    await readable(page.locator('#number-error'));
    await page.getByLabel('Enter a number', { exact: true }).fill('142857');
    await submit.click();
  }
});

for (const width of [1440, 768, 390]) {
  test(`A13 A15 theme switch preserves geometry and both themes fit at ${width}px`, async ({ page }, info) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/en');
    await theme(page, 'dark');
    const before = await geometry(page);
    expect(before.length).toBeGreaterThan(8);
    await theme(page, 'light');
    const after = await geometry(page);
    expect(after.length).toBe(before.length);
    for (let i = 0; i < before.length; i++) {
      expect(after[i].className).toBe(before[i].className);
      for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect(Math.abs(after[i][key] - before[i][key]), `${before[i].className} ${key}`).toBeLessThanOrEqual(0.5);
      }
    }
    for (const value of ['light', 'dark'] as const) {
      for (const route of ['', 'infinite', 'daily', 'compare', 'explore', 'sandbox', 'patterns', 'guides']) {
        await page.goto('/en' + (route ? '/' + route : ''));
        await theme(page, value);
        await expect(page.locator('h1')).toBeVisible();
        if (!route) await info.attach(`theme-${value}-${width}`, { body: await page.screenshot({ fullPage: true, animations: 'disabled' }), contentType: 'image/png' });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${value} /${route} overflow`).toBeTruthy();
      }
    }
  });
}

test('A14 rendered share PNG has actual dimensions, distinct border and readable number/labels', async ({ page }, info) => {
  await page.goto('/en?n=12321');
  for (const value of ['dark', 'light'] as const) {
    await theme(page, value);
    await page.getByRole('button', { name: 'Create share card', exact: true }).click();
    const preview = page.locator('.share-preview');
    await expect(preview).toBeVisible();
    const image = await preview.evaluate(async element => {
      const img = element as HTMLImageElement;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const pixel = (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0, 3);
      const background = pixel(10, 10);
      const lum = (c: number[]) => c.map(v => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const contrast = (c: number[]) => { const l = [lum(c), lum(background)].sort((a, b) => a - b); return (l[1] + 0.05) / (l[0] + 0.05); };
      // Count high-contrast ink in independent content bands, excluding the border.
      // Anti-aliased edge pixels are intentionally not treated as the text's solid color.
      const ink = (x: number, y: number, w: number, h: number, minimum: number) => {
        const data = ctx.getImageData(x, y, w, h).data;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) if (contrast([data[i], data[i + 1], data[i + 2]]) >= minimum) count++;
        return count;
      };
      return { width: img.naturalWidth, height: img.naturalHeight, background, border: pixel(32, 50), numberInk: ink(70, 150, 1050, 140, 3), labelInk: ink(70, 410, 1040, 40, 4.5), titleInk: ink(70, 70, 1050, 40, 4.5) };
    });
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.border).not.toEqual(image.background);
    expect(image.numberInk).toBeGreaterThan(500);
    expect(image.labelInk).toBeGreaterThan(100);
    expect(image.titleInk).toBeGreaterThan(100);
    await info.attach(`share-${value}`, { body: await preview.screenshot({ animations: 'disabled' }), contentType: 'image/png' });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
});

test('A14 blocked clipboard retains a selected manual-copy link', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new DOMException('Clipboard blocked for this test', 'NotAllowedError'); } },
    });
  });
  await page.goto('/en?n=12321');
  await expect(page.locator('main[data-ready=true]')).toBeVisible();
  await page.getByRole('button', { name: 'Create share card', exact: true }).click();
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Copy link', exact: true });
  await expect(input).toBeFocused();
  const selection = await input.evaluate(element => {
    const field = element as HTMLInputElement;
    return { text: field.value.slice(field.selectionStart ?? 0, field.selectionEnd ?? 0), value: field.value };
  });
  expect(selection.text).toBe(selection.value);
  expect(selection.text).toContain('/en?n=12321');
});
