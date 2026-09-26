import { test, expect } from "@playwright/test";

for (const width of [320, 390]) {
  test(`homepage has no ad slots and fits a ${width}px viewport with a reserved scrollbar gutter`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en");
    await expect(page.locator("main[data-ready=true]")).toBeVisible();
    await page.addStyleTag({ content: "html { scrollbar-gutter: stable; } ::-webkit-scrollbar { width: 15px; }" });
    const geometry = await page.locator(".ad-slot__content").evaluateAll(elements => ({
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      boxes: elements.map(element => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right };
      }),
    }));
    expect(geometry.boxes).toHaveLength(0);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
  });
}
