import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const seo = JSON.parse(readFileSync("public/data/seo.json", "utf8"));

test("SEO survives client navigation and language changes", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(page.locator("h1")).toHaveText(
    "RNGDLE Number Rarity Calculator",
  );
  await page.locator('a[href="/en/rarest-numbers"]').first().click();
  await expect(page).toHaveURL(/\/en\/rarest-numbers$/);
  await expect(page.locator("h1")).toContainText("Rarest Numbers");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    "https://rngdle.art/en/rarest-numbers",
  );
  const nodes = JSON.parse(
    (await page.locator("#seo-jsonld").textContent()) || "{}",
  )["@graph"];
  expect(
    nodes.find((x: any) => x["@type"] === "ItemList").itemListElement,
  ).toHaveLength(100);
  await page.getByLabel("Language", { exact: true }).selectOption("zh");
  await expect(page.locator("h1")).not.toContainText("Rarest Numbers");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute(
    "content",
    "index,follow",
  );
  await page.goto("/ja");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(page.locator("meta[name=robots]")).toHaveAttribute(
    "content",
    "noindex,follow",
  );
  expect(await page.locator("link[rel=alternate]").count()).toBe(3);
});

test("daily archive loads deterministic answer and its metadata through navigation", async ({
  page,
}) => {
  await page.goto("/en/daily/answer");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page
    .locator(`a[href="/en/daily/answer/${seo.latestDay}"]`)
    .first()
    .click();
  await expect(page.locator("h1")).toContainText("RNGDLE Daily Answer");
  await expect
    .poll(async () =>
      JSON.parse((await page.locator("#seo-jsonld").textContent()) || "{}")[
        "@graph"
      ].some((x: any) => x["@type"] === "Article"),
    )
    .toBe(true);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `https://rngdle.art/og/daily-${seo.latestDay}.png`,
  );
  await page.reload();
  await expect(page.locator("h1")).toContainText("RNGDLE Daily Answer");
  const response = await page.goto("/en/daily/answer/2099-01-01");
  expect(response?.status()).toBe(404);
  await expect(page.locator("meta[name=robots]")).toHaveAttribute(
    "content",
    "noindex,follow",
  );
});

test("new SEO pages remain readable on mobile and without JavaScript", async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of ["en", "zh"])
    for (const route of [
      "rarest-numbers",
      "patterns/repdigit",
      "daily/answer",
      `daily/answer/${seo.latestDay}`,
    ]) {
      await page.goto(`/${locale}/${route}`);
      await expect(page.locator("main[data-ready=true]")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${locale}/${route} overflow`,
      ).toBe(true);
    }
  await page.screenshot({
    path: "verification/seo-daily-mobile.png",
    fullPage: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto(
    (process.env.BASE_URL || "http://127.0.0.1:5173") +
      `/en/daily/answer/${seo.latestDay}`,
  );
  await expect(staticPage.locator("h1")).toContainText("RNGDLE Daily Answer");
  await expect(staticPage.locator("body")).toContainText("Number draft");
  await context.close();
});
