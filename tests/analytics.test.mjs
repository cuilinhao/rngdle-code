import { test } from "node:test";
import assert from "node:assert/strict";

const measurementId = "G-TEST123456";
let caseId = 0;

async function browser(t, href = "https://rngdle.art/en?n=142857#main", referrer = "") {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const scripts = [];
  globalThis.window = { location: new URL(href) };
  globalThis.document = {
    title: "Analyze — RNGDLE.ART",
    referrer,
    createElement: (tag) => ({ tagName: tag.toUpperCase() }),
    head: { append: (element) => scripts.push(element) },
  };
  t.after(() => {
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
  });
  const analytics = await import(`../src/analytics.mjs?test=${++caseId}`);
  return {
    ...analytics,
    scripts,
    commands: () => (window.dataLayer || []).map((args) => Array.from(args)),
    move: (url, title) => {
      window.location = new URL(url, window.location);
      document.title = title;
    },
  };
}

test("production page view sends the current title and strips query/hash from location and referrer", async (t) => {
  const analytics = await browser(t, undefined, "https://search.example/results?q=private#result");
  analytics.trackPageView(true, measurementId);
  const commands = analytics.commands();
  const page = {
    page_location: "https://rngdle.art/en",
    page_referrer: "https://search.example/results",
    page_title: "Analyze — RNGDLE.ART",
  };
  assert.deepEqual(commands.find(([command]) => command === "set"), ["set", page]);
  assert.deepEqual(commands.find(([command]) => command === "config"), [
    "config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    },
  ]);
  assert.deepEqual(commands.find(([command]) => command === "event"), ["event", "page_view", page]);
  assert.ok(commands.findIndex(([command]) => command === "set") < commands.findIndex(([command]) => command === "config"));
  assert.equal(analytics.scripts.length, 1);
  assert.equal(analytics.scripts[0].src, "https://www.googletagmanager.com/gtag/js?id=G-TEST123456");
  assert.equal(analytics.scripts[0].async, true);
});

test("same-path renders and number/hash edits do not add page views or reload GA", async (t) => {
  const analytics = await browser(t);
  analytics.trackPageView(true, measurementId);
  analytics.trackPageView(true, measurementId);
  analytics.move("/en?n=999999#details", "Analyze — RNGDLE.ART");
  analytics.trackPageView(true, measurementId);
  assert.equal(analytics.commands().filter(([command]) => command === "event").length, 1);
  assert.equal(analytics.commands().filter(([command]) => command === "config").length, 1);
  assert.equal(analytics.scripts.length, 1);
});

test("SPA navigation, language changes and revisits each use the preceding virtual page as referrer", async (t) => {
  const analytics = await browser(t);
  analytics.trackPageView(true, measurementId);
  for (const [url, title] of [
    ["/en/infinite?n=42", "Infinite — RNGDLE.ART"],
    ["/zh/infinite", "无限抽取 — RNGDLE.ART"],
    ["/en/infinite", "Infinite — RNGDLE.ART"],
    ["/en", "Analyze — RNGDLE.ART"],
  ]) {
    analytics.move(url, title);
    analytics.trackPageView(true, measurementId);
  }
  const views = analytics.commands().filter(([command]) => command === "event");
  assert.deepEqual(views.map(([, , page]) => [page.page_location, page.page_referrer, page.page_title]), [
    ["https://rngdle.art/en", "", "Analyze — RNGDLE.ART"],
    ["https://rngdle.art/en/infinite", "https://rngdle.art/en", "Infinite — RNGDLE.ART"],
    ["https://rngdle.art/zh/infinite", "https://rngdle.art/en/infinite", "无限抽取 — RNGDLE.ART"],
    ["https://rngdle.art/en/infinite", "https://rngdle.art/zh/infinite", "Infinite — RNGDLE.ART"],
    ["https://rngdle.art/en", "https://rngdle.art/en/infinite", "Analyze — RNGDLE.ART"],
  ]);
  assert.equal(analytics.scripts.length, 1);
});

for (const [name, href, production, id] of [
  ["development build", "https://rngdle.art/en", false, measurementId],
  ["localhost", "http://localhost:5173/en", true, measurementId],
  ["local production preview", "http://127.0.0.1:4173/en", true, measurementId],
  ["Vercel preview", "https://rngdle-demo.vercel.app/en", true, measurementId],
  ["lookalike host", "https://rngdle.art.example/en", true, measurementId],
  ["non-HTTPS origin", "http://rngdle.art/en", true, measurementId],
  ["missing measurement ID", "https://rngdle.art/en", true, ""],
  ["malformed measurement ID", "https://rngdle.art/en", true, "G-invalid?value=1"],
]) {
  test(`${name} does not initialize analytics or send events`, async (t) => {
    const analytics = await browser(t, href);
    analytics.trackPageView(production, id);
    assert.deepEqual(analytics.commands(), []);
    assert.equal(analytics.scripts.length, 0);
    assert.equal(window.gtag, undefined);
  });
}

test("www production host is tracked and malformed referrers are omitted", async (t) => {
  const analytics = await browser(t, "https://www.rngdle.art/fr", "not a URL");
  analytics.trackPageView(true, measurementId);
  assert.deepEqual(analytics.commands().find(([command]) => command === "event"), [
    "event", "page_view", {
      page_location: "https://www.rngdle.art/fr",
      page_referrer: "",
      page_title: "Analyze — RNGDLE.ART",
    },
  ]);
});

test("server-side rendering without browser globals does not initialize analytics", async (t) => {
  const analytics = await browser(t);
  delete globalThis.window;
  delete globalThis.document;
  assert.doesNotThrow(() => analytics.trackPageView(true, measurementId));
});
