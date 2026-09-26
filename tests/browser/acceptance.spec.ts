import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { makeDaily, patterns } from "../../src/engine.mjs";
const raw = readFileSync(
  new URL("../../public/data/scores.bin", import.meta.url),
);
const scores = new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
const routes = [
  "",
  "infinite",
  "daily",
  "compare",
  "explore",
  "sandbox",
  "patterns",
  "guides",
  "methodology",
  "badges",
  "ep",
  "leaderboard",
  "about",
  "privacy",
  "terms",
  "contact",
];
const locales = ["en", "zh", "ja", "ko", "de", "fr"];
const langs = ["en-US", "zh-CN", "ja", "ko", "de", "fr"];
test.beforeEach(async ({ page }) => {
  (page as any).__errors = [];
  page.on("pageerror", (e) => (page as any).__errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") (page as any).__errors.push(m.text());
  });
});
test.afterEach(async ({ page }, info) => {
  const errors = (page as any).__errors;
  await info.attach("browser-errors", {
    body: JSON.stringify(errors),
    contentType: "application/json",
  });
  expect(errors).toEqual([]);
});
for (const [index, locale] of locales.entries())
  test(`A01 A12 A16 A17 all primary routes, metadata and reload: ${locale}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    for (const route of routes) {
      const response = await page.goto(
        "/" + locale + (route ? "/" + route : ""),
      );
      await expect(page.locator("main[data-ready=true]")).toBeVisible();
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", langs[index]);
      await expect(page).toHaveTitle(/RNGDLE.ART/);
      expect(await page.locator("main").innerText()).not.toMatch(
        /undefined|Missing translation|NaN/,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBeTruthy();
      expect(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
      ).toContain("/" + locale);
      if (route === "patterns")
        expect(await page.locator(".atlas-card").count()).toBe(31);
    }
    await page.reload();
    await expect(page.locator("h1")).toBeVisible();
  });
test("A01 A11 every pattern detail has an accessible exact count and live example", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const p of patterns) {
    await page.goto("/en/patterns/" + p.id);
    await expect(page.locator("main[data-ready=true]")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.locator(".pattern-detail .number-chip").first(),
    ).toBeVisible();
  }
  await page.locator(".pattern-detail .number-chip").first().click();
  await expect(page.getByTestId("score-summary")).toBeVisible();
});
test("A02 A03 number validation and reference sample", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  const input = page.getByLabel("Enter a number");
  for (const invalid of ["", "-1", "1.5", "1e3", "1000001", "abc"]) {
    await input.fill(invalid);
    await page
      .getByRole("button", { name: "Analyze number", exact: true })
      .click();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("rarity-score")).toHaveText("222");
  }
  for (const n of [0, 1, 1000000, 524287]) {
    await input.fill(String(n));
    await page
      .getByRole("button", { name: "Analyze number", exact: true })
      .click();
    await expect(page.getByTestId("rarity-score")).toHaveText(
      new Intl.NumberFormat("en-US").format(scores[n]),
    );
  }
  await page.reload();
  await expect(page.getByTestId("rarity-score")).toHaveText("625");
});
test("A04 A05 single, batch, turbo target, stop, save and new session", async ({
  page,
}) => {
  await page.goto("/en/infinite");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page.getByLabel("Reveal animation").uncheck();
  await page
    .getByRole("button", { name: "Roll a number", exact: true })
    .click();
  await expect(page.getByTestId("roll-count")).toHaveText("1");
  await page.getByRole("button", { name: "10 rolls", exact: true }).click();
  await expect(page.getByTestId("roll-count")).toHaveText("11");
  await page.getByRole("button", { name: "100 rolls", exact: true }).click();
  await expect(page.getByTestId("roll-count")).toHaveText("111");
  await page.getByRole("button", { name: "Save number", exact: true }).click();
  await expect(page.locator(".saved-number")).toHaveCount(1);
  await page.reload();
  await expect(page.getByTestId("roll-count")).toHaveText("111");
  await expect(page.locator(".saved-number")).toHaveCount(1);
  await page.locator("summary").click();
  await page.getByLabel("Or stop at score").fill("0");
  await page.getByRole("button", { name: "100 rolls", exact: true }).click();
  await expect(page.getByTestId("roll-count")).toHaveText("112");
  await page.getByRole("button", { name: "Start turbo", exact: true }).click();
  await expect(page.getByTestId("roll-count")).toHaveText("113");
  await expect(
    page.getByRole("button", { name: "Start turbo", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Or stop at score").fill("");
  await page.getByRole("button", { name: "Start turbo", exact: true }).click();
  await expect
    .poll(async () =>
      Number(
        (await page.getByTestId("roll-count").innerText()).replaceAll(",", ""),
      ),
    )
    .toBeGreaterThan(113);
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  const count = await page.getByTestId("roll-count").innerText();
  await page.waitForTimeout(250);
  await expect(page.getByTestId("roll-count")).toHaveText(count);
  await page.getByRole("button", { name: "New session", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByTestId("roll-count")).toHaveText("0");
  await expect(page.locator(".saved-number")).toHaveCount(1);
});
test("A04 reveal controls, simulated page-hidden event and navigation pause", async ({
  page,
  context,
}) => {
  await page.goto("/en/infinite");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page
    .getByRole("button", { name: "Roll a number", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Revealing…", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Skip reveal", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Roll a number", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Start turbo", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Start turbo", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    delete (document as any).hidden;
  });
  const count = await page.getByTestId("roll-count").innerText();
  await page.goto("/en");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page.waitForTimeout(250);
  await page.goto("/en/infinite");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(page.getByTestId("roll-count")).toHaveText(count);
});
for (const type of ["draft", "hunt", "quiz"])
  test(`A06 A07 daily ${type}: resume, complete, practice, locked result`, async ({
    page,
  }) => {
    const date = ["2026-09-24", "2026-09-25", "2026-09-26"].find(
      (day) => makeDaily(day, scores).type === type,
    )!;
    await page.clock.install({ time: new Date(date + "T12:00:00Z") });
    await page.goto("/en/daily");
    await expect(page.locator("main[data-ready=true]")).toBeVisible();
    await page
      .getByRole("button", { name: "Start challenge", exact: true })
      .click();
    if (type === "draft") {
      await page.getByTestId("draft-2").click();
      await page.reload();
      await expect(page.getByTestId("draft-2")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page
        .getByRole("button", { name: "Lock my choice", exact: true })
        .click();
    }
    if (type === "hunt") {
      await page
        .getByRole("button", { name: "Next number", exact: true })
        .click();
      const n = await page.getByTestId("hunt-number").innerText();
      await page.reload();
      await expect(page.getByTestId("hunt-number")).toHaveText(n);
      await page
        .getByRole("button", { name: "Keep this number", exact: true })
        .click();
    }
    if (type === "quiz") {
      await page.getByTestId("quiz-0").click();
      await page.reload();
      await expect(page.locator(".quiz-progress")).toContainText(
        "Round 2 / 10",
      );
      for (let i = 1; i < 10; i++) await page.getByTestId("quiz-0").click();
    }
    await expect(page.getByTestId("daily-complete")).toBeVisible();
    const before = await page.evaluate(
      (key) => localStorage.getItem("rngdle.art.daily." + key),
      date,
    );
    await page.reload();
    await expect(page.getByTestId("daily-complete")).toBeVisible();
    await page
      .getByRole("button", { name: "Practice again", exact: true })
      .click();
    await expect(
      page.getByText("Practice does not change today’s result or streak."),
    ).toBeVisible();
    expect(
      await page.evaluate(
        (key) => localStorage.getItem("rngdle.art.daily." + key),
        date,
      ),
    ).toBe(before);
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("rngdle.art.streak")!).current,
      ),
    ).toBe(1);
  });
test("A07 hunt timeout settles after elapsed time and UTC midnight changes challenge", async ({
  page,
}) => {
  const date = ["2026-09-24", "2026-09-25", "2026-09-26"].find(
    (day) => makeDaily(day, scores).type === "hunt",
  )!;
  await page.clock.install({ time: new Date(date + "T23:58:30Z") });
  await page.goto("/en/daily");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page
    .getByRole("button", { name: "Start challenge", exact: true })
    .click();
  await page.clock.fastForward(61000);
  await expect(page.getByTestId("daily-complete")).toBeVisible();
  await page.clock.fastForward(30000);
  await expect(
    page.getByRole("button", { name: "Start challenge", exact: true }),
  ).toBeVisible();
});
test("A08 comparison, random battle and independent quiz", async ({ page }) => {
  await page.goto("/en/compare");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page.getByLabel("First number").fill("1");
  await page.getByLabel("Second number").fill("1");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByTestId("comparison-result")).toHaveText(
    "An exact tie",
  );
  await page.getByLabel("Second number").fill("142857");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByTestId("comparison-result")).toHaveText("1 is rarer");
  await page.getByRole("tab", { name: "Random battle" }).click();
  await expect(page.locator(".comparison-cards .score-summary")).toHaveCount(2);
  await page.getByRole("tab", { name: "Rare or common" }).click();
  await page
    .getByRole("button", { name: "Start challenge", exact: true })
    .click();
  for (let i = 0; i < 10; i++) await page.getByTestId("quiz-1").click();
  await expect(page.getByTestId("daily-complete")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("rngdle.art.streak")),
  ).toBeNull();
});
test("A09 full-range explorer exact count, no matches, filters and random result", async ({
  page,
}) => {
  await page.goto("/en/explore");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page.getByRole("button", { name: "Find matches", exact: true }).click();
  await expect(page.getByTestId("explorer-result")).toContainText(
    "1,989 matches",
  );
  await page.getByLabel("Minimum digits").selectOption("7");
  await page.getByRole("button", { name: "Find matches", exact: true }).click();
  await expect(page.getByTestId("explorer-result")).toContainText(
    "No numbers match",
  );
  await page.getByLabel("Minimum digits").selectOption("1");
  await page.getByLabel("Minimum digit sum").fill("99");
  await page.getByRole("button", { name: "Find matches", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("54");
  await page.getByLabel("Minimum digit sum").fill("0");
  await page.getByRole("button", { name: "Find matches", exact: true }).click();
  await page
    .getByRole("button", { name: "Open a random match", exact: true })
    .click();
  await expect(page.getByTestId("score-summary")).toBeVisible();
  const n = new URL(page.url()).searchParams.get("n")!;
  expect(n).toBe([...n].reverse().join(""));
});
test("A10 sandbox keyboard, length, reset and best edit", async ({ page }) => {
  await page.goto("/en/sandbox?n=142857");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page.getByRole("button", { name: "Digit 1", exact: true }).focus();
  await page.keyboard.press("ArrowUp");
  await expect(
    page.getByRole("button", { name: "Digit 1", exact: true }),
  ).toHaveText("2");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("9");
  await expect(
    page.getByRole("button", { name: "Digit 2", exact: true }),
  ).toHaveText("9");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByTestId("rarity-score")).toHaveText("222");
  const old = 222;
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
  expect(
    Number(await page.getByTestId("rarity-score").innerText()),
  ).toBeGreaterThan(old);
  await page
    .getByRole("button", { name: "Decrease digit 0", exact: true })
    .click();
  await expect(page.locator(".editable-digit")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Increase digit 0", exact: true })
    .click();
  await expect(page.locator(".editable-digit")).toHaveCount(6);
  await page.getByLabel("Enter a number").fill("1000000");
  await page
    .getByRole("button", { name: "Analyze number", exact: true })
    .click();
  await expect(page.getByLabel("Enter a number")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});
test("A11 atlas is only stamped by daily specimens and survives reload", async ({
  page,
}) => {
  await page.goto("/en?n=111111");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("rngdle.art.atlas")),
  ).toBeNull();
  await page.goto("/en/infinite");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page
    .getByRole("button", { name: "Reveal specimen", exact: true })
    .click();
  const atlas = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rngdle.art.atlas")!),
  );
  expect(Object.keys(atlas).length).toBeGreaterThan(0);
  await page.goto("/en/patterns");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(page.locator(".atlas-record h2")).toContainText(
    String(Object.keys(atlas).length),
  );
  await page.reload();
  await expect(page.locator(".atlas-record h2")).toContainText(
    String(Object.keys(atlas).length),
  );
  await page.getByRole("button", { name: "Symmetry", exact: true }).click();
  await expect(page.locator(".atlas-card")).toHaveCount(1);
});
test("A12 A13 English default, saved selection, theme persistence and route preservation", async ({
  browser,
  page,
}) => {
  for (const language of ["en-US", "zh-CN", "ja-JP", "ko-KR", "de-DE", "fr-FR", "es-ES"]) {
    const context = await browser.newContext({ locale: language });
    const p = await context.newPage();
    await p.goto((process.env.BASE_URL || "http://127.0.0.1:5173") + "/?n=142857#main");
    await expect(p).toHaveURL(/\/en\?n=142857#main$/);
    await expect(p.locator("html")).toHaveAttribute("lang", "en-US");
    await expect(p.getByRole("heading", {level: 1})).toContainText("How rare");
    await context.close();
  }
  await page.goto("/en/sandbox?n=142857");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page.getByLabel("Language", { exact: true }).selectOption("zh");
  await expect(page).toHaveURL(/\/zh\/sandbox\?n=142857/);
  await page.getByRole("button", { name: "浅色主题", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(page).toHaveURL(/\/zh$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});
test("A14 share link clipboard, real image download and focus restoration", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en?n=12321");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  const button = page.getByRole("button", {
    name: "Create share card",
    exact: true,
  });
  await button.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".share-preview")).toHaveAttribute(
    "src",
    /^data:image\/png;base64,/,
  );
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "/en?n=12321",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download card" }).click();
  expect((await download).suggestedFilename()).toBe("rngdle-art-12321.png");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(button).toBeFocused();
});
for (const locale of locales)
  test(`A15 mobile and tablet responsive routes: ${locale}`, async ({
    page,
  }, info) => {
    test.setTimeout(120000);
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "",
        "infinite",
        "daily",
        "sandbox",
        "compare",
        "patterns",
      ]) {
        await page.goto("/" + locale + (route ? "/" + route : ""));
        await expect(page.locator("main[data-ready=true]")).toBeVisible();
        await expect(page.locator("h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          "overflow " + width + " " + route,
        ).toBeTruthy();
        if (width === 390 && route === "") {
          await page.screenshot({
            path: "verification/mobile-" + locale + ".png",
            fullPage: true,
          });
          await info.attach("mobile-" + locale, {
            path: "verification/mobile-" + locale + ".png",
            contentType: "image/png",
          });
        }
      }
    }
  });
test("A15 keyboard navigation, mobile menu and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.locator(".navigation")).toBeVisible();
  await page
    .locator(".navigation")
    .getByRole("link", { name: "Infinite", exact: true })
    .click();
  await expect(page.locator(".navigation")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Roll a number", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Roll a number", exact: true }),
  ).toBeEnabled();
  await expect(page.getByTestId("roll-count")).toHaveText("1");
});
test("A16 graceful corrupt storage and data-load failure retry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("rngdle.art.session", "{broken");
    localStorage.setItem("rngdle.art.saved", "null");
  });
  await page.goto("/en/infinite");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(page.getByTestId("roll-count")).toHaveText("0");
  await page.route("**/data/scores.bin", (r) => r.abort());
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("could not be loaded");
  await page.unroute("**/data/scores.bin");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Roll a number", exact: true }),
  ).toBeVisible();
  (page as any).__errors = (page as any).__errors.filter((e: string) =>
    e.includes("ERR_FAILED") ? false : true,
  );
});
test("A01 404 renders a real recovery route", async ({ page }) => {
  await page.goto("/en/not-a-route");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "This page is outside our range." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Back to the lab", exact: true })
    .click();
  await expect(page.getByTestId("score-summary")).toBeVisible();
  (page as any).__errors = (page as any).__errors.filter(
    (e: string) => !e.includes("404"),
  );
});

test("A03 tiny nonzero probabilities never display as zero", async ({
  page,
}) => {
  await page.goto("/en?n=1");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(page.locator(".score-summary .metrics")).toContainText(
    "Top 0.0002%",
  );
  await page.goto("/en?n=524287");
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
  await expect(
    page
      .locator(".trait")
      .filter({
        has: page.getByRole("heading", { name: "Binary repunit", exact: true }),
      }),
  ).toContainText("1 in 55,556");
});
