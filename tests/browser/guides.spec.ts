import { test as base, expect, type Page } from "@playwright/test";

// Independent release expectations: importing guide-content.ts would make Node
// load Vite-style JSON imports and would couple acceptance inputs to the renderer.
type GuideContent = {
  route: string;
  title: string;
  h1: string;
  description: string;
  image: string;
  stepsTitle: string;
  stepCount: number;
  questions: string[];
};
const guideArticles: GuideContent[] = [
  {
    route: "guides/how-rarity-works",
    title: "RNGdle Rarity Explained: How the Rarity Score Works (2026)",
    h1: "RNGdle Rarity Explained: How the Rarity Score Works",
    description: "Understand RNGdle rarity, exact pattern counts and RNGDLE.ART's independent score. Learn how to check your number and how the score differs from official EP.",
    image: "guide-how-rarity-works",
    stepsTitle: "Step by step: check your number's rarity in 60 seconds",
    stepCount: 5,
    questions: ["Is RNGdle rarity random?", "Why is my score low even though my number is a palindrome?", "Does the game use AI to decide rarity?", "Can I raise my rarity score?"],
  },
  {
    route: "rarest-numbers",
    title: "What Is the Rarest Number in RNGdle? Pattern Odds Ranked (and the Worst Roll)",
    h1: "What Is the Rarest Number in RNGdle?",
    description: "Compare exact pattern counts across 0–1,000,000, explore RNGDLE.ART's top 100 numbers, and learn what makes a low-scoring roll. Independent of official EP.",
    image: "guide-rarest-numbers",
    stepsTitle: "Step by step: find out how rare your number is",
    stepCount: 5,
    questions: ["Has anyone rolled the rarest number?", "Is 0 or 1 the rarest number?", "What's the rarest RNGdle badge?", "Do all rare patterns count equally?"],
  },
  {
    route: "guides/how-to-play",
    title: "How to Play RNGdle: Beginner's Guide, Badges & Daily Answer (Step by Step)",
    h1: "How to Play RNGdle: A Beginner's Guide",
    description: "Learn the official RNGdle daily roll, badges and EP, then analyze your number. Understand how RNGDLE.ART's separate daily challenges and answers work.",
    image: "guide-how-to-play",
    stepsTitle: "Step by step: your first roll",
    stepCount: 6,
    questions: ["How many rolls do I get?", "Where do I find the daily answer?", "Is RNGdle free?", "Is RNGdle the same as RNG games?"],
  },
];

const site = "https://rngdle.art";
const newRoutes = ["guides/how-rarity-works", "guides/how-to-play"];
const otherLocales = ["zh", "ja", "ko", "de", "fr"];
const pathFor = (article: GuideContent) => "/en/" + article.route;
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
type SchemaNode = Record<string, any>;

// Run against the built site (scripts/serve-production.mjs) or BASE_URL in production.
// An ordinary Vite dev server cannot satisfy the static HTML / real 404 checks.
const test = base.extend<{
  expectedDocument404s: Set<string>;
  runtimeCheck: void;
}>({
  expectedDocument404s: async ({}, use) => {
    await use(new Set<string>());
  },
  runtimeCheck: [async ({ page, baseURL, expectedDocument404s }, use, info) => {
    const origin = new URL(baseURL!).origin;
    const errors: string[] = [];
    const sameOrigin = (url: string) => {
      try { return new URL(url).origin === origin; } catch { return false; }
    };
    const expected404 = (url: string) => expectedDocument404s.has(new URL(url).pathname);
    page.on("pageerror", (error) => errors.push(`JavaScript: ${error.message}`));
    page.on("console", (message) => {
      const url = message.location().url;
      if (message.type() === "error" && sameOrigin(url) && !expected404(url)) {
        errors.push(`Console: ${message.text()} (${url})`);
      }
    });
    page.on("response", (response) => {
      if (!sameOrigin(response.url()) || response.status() < 400) return;
      if (response.status() === 404 && response.request().resourceType() === "document" && expected404(response.url())) return;
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    page.on("requestfailed", (request) => {
      if (sameOrigin(request.url())) errors.push(`Resource: ${request.url()} (${request.failure()?.errorText})`);
    });
    await use();
    await info.attach("guides-browser-errors", {
      body: JSON.stringify(errors, null, 2), contentType: "application/json",
    });
    expect(errors, "No JavaScript errors or failed same-origin resources").toEqual([]);
  }, { auto: true }],
});

async function ready(page: Page) {
  await expect(page.locator("main[data-ready=true]")).toBeVisible();
}

async function graph(page: Page): Promise<SchemaNode[]> {
  await expect(page.locator("#seo-jsonld")).toHaveCount(1);
  const json = JSON.parse((await page.locator("#seo-jsonld").textContent())!);
  expect(json["@context"]).toBe("https://schema.org");
  expect(Array.isArray(json["@graph"])).toBe(true);
  return json["@graph"];
}

function only(nodes: SchemaNode[], type: string): SchemaNode {
  const matches = nodes.filter((node) => node["@type"] === type);
  expect(matches, `Exactly one ${type} schema`).toHaveLength(1);
  return matches[0];
}

async function readableArticle(page: Page, article: GuideContent) {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(article.h1);
  await expect(page.getByRole("heading", { name: article.stepsTitle, exact: true })).toBeVisible();
  const steps = page.locator("#step-by-step ol > li");
  await expect(steps).toHaveCount(article.stepCount);
  for (const step of await steps.all()) {
    await expect(step).toBeVisible();
    expect(normalize(await step.innerText()).length).toBeGreaterThan(30);
  }
  await expect(page.getByRole("heading", { name: "Frequently asked questions", exact: true })).toBeVisible();
  for (const question of article.questions) {
    const visibleFaq = page.locator(".faq-item").filter({
      has: page.getByRole("heading", { name: question, exact: true }),
    });
    await expect(visibleFaq.locator("p")).toBeVisible();
    expect(normalize(await visibleFaq.locator("p").innerText()).length).toBeGreaterThan(40);
  }
  const related = page.getByRole("region", { name: "Related guides", exact: true });
  await expect(related).toBeVisible();
  for (const sibling of guideArticles.filter((item) => item.route !== article.route)) {
    await expect(related.getByRole("link", { name: sibling.h1, exact: true }))
      .toHaveAttribute("href", pathFor(sibling));
  }
  await expect(related.getByRole("link", { name: "All guides", exact: true })).toHaveAttribute("href", "/en/guides");
  await expect(page.locator('#step-by-step a[href="/en"]')).toBeVisible();
  await expect(page.locator('#step-by-step a[href="/en/compare"]')).toBeVisible();
}

async function articleSeo(page: Page, article: GuideContent) {
  const canonical = site + pathFor(article);
  const image = `${site}/og/${article.image}.png`;
  await expect(page).toHaveTitle(article.title);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", article.description);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
  for (const [property, content] of Object.entries({
    "og:title": article.title, "og:url": canonical, "og:type": "article",
    "og:image": image, "og:image:width": "1200", "og:image:height": "630",
  })) {
    await expect(page.locator(`meta[property="${property}"]`)).toHaveAttribute("content", content);
  }
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", image);
  // Load the image from the environment under test, even when canonical URLs use production.
  const dimensions = await page.evaluate(async (imagePath) => {
    const image = new Image();
    image.src = imagePath;
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  }, new URL(image).pathname);
  expect(dimensions, "Actual OG image dimensions").toEqual([1200, 630]);

  const nodes = await graph(page);
  const articleNode = only(nodes, "Article");
  expect(articleNode.headline).toBe(article.h1);
  expect(articleNode.description).toBe(article.description);
  expect(articleNode.image).toBe(image);
  expect(articleNode.inLanguage).toBe("en-US");
  expect(articleNode.mainEntityOfPage["@id"]).toBe(canonical + "#webpage");
  for (const key of ["datePublished", "dateModified"]) {
    expect(Number.isNaN(Date.parse(articleNode[key]))).toBe(false);
    await expect(page.locator(`article time[datetime="${articleNode[key]}"]`).first()).toBeVisible();
  }
  const breadcrumb = only(nodes, "BreadcrumbList");
  expect(breadcrumb.itemListElement).toEqual([
    { "@type": "ListItem", position: 1, name: "Home", item: site + "/en" },
    { "@type": "ListItem", position: 2, name: "Guides", item: site + "/en/guides" },
    { "@type": "ListItem", position: 3, name: article.h1, item: canonical },
  ]);
  const faq = only(nodes, "FAQPage");
  const visibleFaqs = await page.locator(".faq-item").evaluateAll((items) => items.map((item) => ({
    question: item.querySelector("h3")!.textContent!,
    answer: item.querySelector("p")!.textContent!,
  })));
  expect(visibleFaqs.length).toBeGreaterThanOrEqual(4);
  expect(faq.mainEntity.map((question: SchemaNode) => ({
    question: normalize(question.name), answer: normalize(question.acceptedAnswer.text),
  }))).toEqual(visibleFaqs.map((item) => ({ question: normalize(item.question), answer: normalize(item.answer) })));

  if (newRoutes.includes(article.route)) {
    const howTo = only(nodes, "HowTo");
    expect(howTo.name).toBe(await page.locator("#step-by-step h2").innerText());
    const steps = await page.locator("#step-by-step ol > li").allInnerTexts();
    expect(howTo.step.map((step: SchemaNode) => ({ type: step["@type"], position: step.position, text: normalize(step.text) })))
      .toEqual(steps.map((text, index) => ({ type: "HowToStep", position: index + 1, text: normalize(text) })));
    const alternates = await page.locator('link[rel="alternate"]').evaluateAll((links) => links.map((link) => ({
      lang: link.getAttribute("hreflang"), href: link.getAttribute("href"),
    })));
    expect(alternates).toEqual([
      { lang: "en-US", href: canonical }, { lang: "x-default", href: canonical },
    ]);
  } else {
    const dataset = only(nodes, "Dataset");
    expect(dataset.url).toBe(canonical + "#pattern-odds");
    expect(dataset.isBasedOn).toBe(site + "/en/methodology");
    const rows = page.getByTestId("guide-pattern-odds").locator("tbody tr");
    await expect(rows).toHaveCount(5);
    const visibleCounts = await rows.evaluateAll((items) => items.map((row) => ({
      name: row.querySelector("th")!.textContent!.trim(),
      value: Number(row.querySelectorAll("td")[1].textContent!.replaceAll(",", "")),
    })));
    expect(dataset.variableMeasured.map((value: SchemaNode) => ({ name: value.name, value: value.value })))
      .toEqual(visibleCounts);
    // Frozen release acceptance values protect the existing ranking from content regressions.
    const rankingRows = page.getByTestId("rarest-ranking").locator("tbody tr");
    await expect(rankingRows).toHaveCount(100);
    await expect(rankingRows.first().locator("td").nth(0)).toHaveText("1");
    await expect(rankingRows.first().locator("td").nth(1)).toHaveText("3");
    await expect(rankingRows.first().locator("td").nth(2)).toHaveText("1,677");
    const ranking = only(nodes, "ItemList");
    expect(ranking.numberOfItems).toBe(100);
    expect(ranking.itemListElement).toHaveLength(100);
    expect(ranking.itemListElement[0]).toMatchObject({ position: 1, name: "3", url: site + "/en?n=3" });
    expect(ranking.itemListElement[0].description).toContain("1677");
  }
}

test("Guides index exposes seven distinct cards including all three articles", async ({ page }) => {
  const response = await page.goto("/en/guides");
  expect(response?.status()).toBe(200);
  await ready(page);
  const cards = page.locator(".guide-grid .guide-card");
  await expect(cards).toHaveCount(7);
  expect(await cards.evaluateAll((links) => links.map((link) => link.getAttribute("href"))))
    .toEqual([...guideArticles.map(pathFor), "/en/methodology", "/en/badges", "/en/ep", "/en/leaderboard"]);
  for (const article of guideArticles) {
    await expect(cards.filter({ has: page.getByRole("heading", { level: 2, name: article.h1, exact: true }) })).toBeVisible();
  }
});

for (const article of guideArticles) {
  test(`${article.route}: SPA entry, complete article and SEO, reload and browser back`, async ({ page }) => {
    await page.goto("/en/guides");
    await ready(page);
    const marker = `same-document-${article.route}`;
    await page.evaluate((value) => { (window as any).__guideDocumentMarker = value; }, marker);
    await page.locator(`.guide-card[href="${pathFor(article)}"]`).click();
    await expect(page).toHaveURL(new RegExp(pathFor(article) + "$"));
    await ready(page);
    expect(await page.evaluate(() => (window as any).__guideDocumentMarker)).toBe(marker);
    await readableArticle(page, article);
    await articleSeo(page, article);
    const response = await page.reload();
    expect(response?.status()).toBe(200);
    await ready(page);
    await expect(page.locator("h1")).toHaveText(article.h1);
    await expect(page).toHaveTitle(article.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", site + pathFor(article));
    expect(await page.evaluate(() => (window as any).__guideDocumentMarker)).toBeUndefined();
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/guides$/);
    await expect(page.locator(".guide-card")).toHaveCount(7);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", site + "/en/guides");
  });
}

for (const route of newRoutes) {
  test(`${route}: locale switching uses real pages and translated article URLs are 404`, async ({ page, expectedDocument404s }) => {
    test.setTimeout(120000);
    for (const locale of otherLocales) {
      await page.goto(`/en/${route}?n=142857`);
      await ready(page);
      await page.getByLabel("Language", { exact: true }).selectOption(locale);
      await expect(page).toHaveURL(new RegExp(`/${locale}\\?n=142857$`));
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${site}/${locale}`);
      await expect(page.locator("#step-by-step")).toHaveCount(0);
      const fakeTranslation = `/${locale}/${route}`;
      expectedDocument404s.add(fakeTranslation);
      const response = await page.goto(fakeTranslation);
      expect(response?.status(), fakeTranslation).toBe(404);
      await ready(page);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
      await expect(page.locator(".guide-article")).toHaveCount(0);
      await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
      expect((await graph(page)).some((node) => ["Article", "HowTo", "FAQPage"].includes(node["@type"]))).toBe(false);
    }
  });
}

test("The existing Chinese rarest-numbers page keeps its translated route and top 100", async ({ page }) => {
  await page.goto("/en/rarest-numbers");
  await ready(page);
  await page.getByLabel("Language", { exact: true }).selectOption("zh");
  await expect(page).toHaveURL(/\/zh\/rarest-numbers$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("h1")).toHaveText("0 至 1,000,000 最稀有的数字");
  await expect(page.getByTestId("rarest-ranking").locator("tbody tr")).toHaveCount(100);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", site + "/zh/rarest-numbers");
  await page.goto("/zh/guides");
  await ready(page);
  await expect(page.locator(".guide-card")).toHaveCount(4);
  for (const route of newRoutes) await expect(page.locator(`a[href="/zh/${route}"]`)).toHaveCount(0);
});

test.describe("Prerendered Guides without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  for (const article of guideArticles) {
    test(`${article.route} remains readable with article content and links`, async ({ page }) => {
      const response = await page.goto(pathFor(article));
      expect(response?.status()).toBe(200);
      await readableArticle(page, article);
      await expect(page).toHaveTitle(article.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", site + pathFor(article));
      await page.getByRole("region", { name: "Related guides", exact: true }).getByRole("link", { name: "All guides", exact: true }).click();
      await expect(page).toHaveURL(/\/en\/guides$/);
      await expect(page.locator(".guide-card")).toHaveCount(7);
    });
  }
});

for (const width of [1440, 768, 390, 320]) {
  test(`Guides and all three articles fit ${width}px in light and dark themes`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["guides", ...guideArticles.map((article) => article.route)]) {
      await page.goto("/en/" + route);
      await ready(page);
      for (const theme of ["dark", "light"]) {
        if (await page.locator("html").getAttribute("data-theme") !== theme) {
          await page.getByRole("button", { name: theme === "dark" ? "Dark theme" : "Light theme", exact: true }).click();
        }
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("h1")).toBeVisible();
        const geometry = await page.evaluate(() => ({
          viewport: innerWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(geometry.document, `${route}, ${theme}: document overflow at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1);
        expect(geometry.body, `${route}, ${theme}: body overflow at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1);
        // Tables may scroll inside their wrappers; prose and cards must remain on screen.
        const outside = await page.locator("h1, .guide-card, .article > section, .table-scroll").evaluateAll((elements) => elements
          .filter((element) => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > innerWidth + 1; })
          .map((element) => element.tagName + "." + element.className));
        expect(outside, `${route}, ${theme}: content outside the viewport`).toEqual([]);
      }
    }
  });
}
