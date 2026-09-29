import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify, isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { patterns, VERSION, TOTAL } from "../src/engine.mjs";

// Build first. HTTP errors are assertions; only transport failures are retried.
// HTTP_TRANSPORT=curl honors the operator's existing proxy environment.
// --wait-for-daily (or DEPLOY_WAIT_SECONDS=300) waits for published build inputs.
const root = fileURLToPath(new URL("../", import.meta.url));
const runFile = promisify(execFile);
const base = new URL(process.env.BASE_URL || "http://127.0.0.1:4173");
const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
const transport = process.env.HTTP_TRANSPORT || "fetch";
const outputPath = resolve(root, `verification/release-${local ? "local" : "production"}-http.json`);
const results = [], requests = [], warnings = [], deploymentPolls = [];
const startedAt = new Date().toISOString();
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = (path) => readFileSync(resolve(root, path));
const json = (path) => JSON.parse(read(path).toString("utf8"));
const normalize = (text) => String(text).replace(/\s+/g, " ").trim();
const decode = (text) => String(text).replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, entity) => {
  if (entity[0] === "#") {
    const n = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "\uFFFD";
  }
  return { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " }[entity.toLowerCase()];
});
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
  .map((m) => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4])]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map((m) => attrs(m[0]));
const elementTexts = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}\\s*>`, "gi"))]
  .map((m) => visibleText(m[1]));
function visibleText(html) {
  // Ignore inert and hidden content: schema cannot satisfy its own visibility test.
  const stack = [], text = [];
  const voids = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  for (const token of html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || []) {
    if (token.startsWith("<!--")) continue;
    const close = token.match(/^<\/([\w:-]+)/), open = token.match(/^<([\w:-]+)/);
    if (close) {
      const i = stack.map((item) => item.name).lastIndexOf(close[1].toLowerCase());
      if (i >= 0) stack.length = i;
      text.push(" ");
    } else if (open) {
      const name = open[1].toLowerCase(), attributes = attrs(token);
      const hidden = stack.at(-1)?.hidden || ["script", "style", "template"].includes(name)
        || /\shidden(?:\s|=|>)/i.test(token) || attributes["aria-hidden"] === "true"
        || /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attributes.style || "");
      if (!voids.has(name) && !token.endsWith("/>")) stack.push({ name, hidden });
      text.push(" ");
    } else if (!stack.at(-1)?.hidden && !token.startsWith("<")) text.push(decode(token));
  }
  return normalize(text.join(""));
}
function documentParts(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] || "";
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] || "";
  return { head, body, meta: tags(head, "meta"), links: tags(head, "link") };
}
function assetReferences(html) {
  const { head, links } = documentParts(html);
  return [...new Set([...tags(head, "script"), ...links].map((tag) => tag.src || tag.href)
    .filter((url) => url?.startsWith("/assets/")))].sort();
}
function record(path, category) {
  const item = { path, category, pass: true, checks: [] };
  results.push(item);
  item.check = (name, pass, evidence = {}) => {
    item.checks.push({ name, pass: Boolean(pass), ...evidence });
    if (!pass) item.pass = false;
  };
  return item;
}
async function http(path, deadline = Infinity) {
  const url = new URL(path, base).href;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const start = Date.now();
    try {
      const timeout = Math.min(30000, deadline - start);
      if (timeout <= 0) throw new Error("Deployment wait deadline reached");
      let status, contentType, bytes;
      if (transport === "curl") {
        const marker = "\n__RNGDLE_HTTP_META__";
        const { stdout } = await runFile("curl", ["--silent", "--show-error", "--max-time", String(timeout / 1000), "--write-out", `${marker}%{http_code}\t%{content_type}`, url],
          { encoding: "buffer", maxBuffer: 32 * 1024 * 1024 });
        const end = stdout.lastIndexOf(marker);
        if (end < 0) throw new Error("curl returned no HTTP status metadata");
        [status, contentType] = stdout.subarray(end + marker.length).toString().split("\t");
        status = Number(status);
        if (!Number.isInteger(status) || status < 100) throw new Error("curl returned no valid HTTP response");
        bytes = stdout.subarray(0, end);
      } else {
        const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(timeout) });
        status = response.status;
        contentType = response.headers.get("content-type");
        bytes = Buffer.from(await response.arrayBuffer());
      }
      requests.push({ path, url, transport, attempt, status, durationMs: Date.now() - start, bytes: bytes.length });
      return { status, contentType, bytes, text: bytes.toString("utf8") };
    } catch (error) {
      const willRetry = attempt < 3 && Date.now() < deadline;
      requests.push({ path, url, transport, attempt, durationMs: Date.now() - start, transportError: error.message, willRetry });
      if (!willRetry) throw error;
    }
  }
}
async function inspect(path, category, evaluate) {
  const item = record(path, category);
  try {
    const response = await http(path);
    item.status = response.status;
    await evaluate(item, response);
  } catch (error) { item.check("request-or-inspection", false, { error: error.message }); }
  return item;
}
async function pool(values, fn, concurrency = 6) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (next < values.length) await fn(values[next++]);
  }));
}
async function waitForDeployment(seconds, latestDay) {
  const endpoints = [
    { path: `/data/daily/${latestDay}.json`, input: `public/data/daily/${latestDay}.json` },
    { path: "/data/seo.json", input: "public/data/seo.json" },
    { path: "/sitemap.xml", input: "dist/sitemap.xml" },
    { path: "/en", input: "dist/en.html" },
  ].map((endpoint) => ({ ...endpoint, verification: "sha256", expectedHash: hash(read(endpoint.input)) }));
  // Data can be unchanged in a same-day code release. The static homepage hash
  // also covers its SSR content and Vite references before the full audit starts.
  const start = Date.now(), deadline = start + seconds * 1000;
  let ready = false;
  while (Date.now() < deadline) {
    const observations = await Promise.all(endpoints.map(async (endpoint) => {
      try {
        const response = await http(endpoint.path, deadline);
        const actualHash = hash(response.bytes);
        return { ...endpoint, url: new URL(endpoint.path, base).href, status: response.status, actualHash,
          match: response.status === 200 && actualHash === endpoint.expectedHash };
      } catch (error) { return { ...endpoint, url: new URL(endpoint.path, base).href, match: false, error: error.message }; }
    }));
    deploymentPolls.push({ checkedAt: new Date().toISOString(), elapsedMs: Date.now() - start, endpoints: observations });
    ready = observations.every((observation) => observation.match);
    console.log(`Deployment readiness: ${observations.filter((row) => row.match).length}/${endpoints.length} endpoints match (${Math.round((Date.now() - start) / 1000)}s)`);
    if (ready || Date.now() >= deadline) break;
    await delay(Math.min(10000, deadline - Date.now()));
  }
  record("deployment-readiness", "deployment").check("published-input-hashes", ready,
    { latestDay, timeoutSeconds: seconds, elapsedMs: Date.now() - start, endpoints: deploymentPolls.at(-1)?.endpoints || endpoints });
  // A timeout is preserved as a failed check; still audit every endpoint below.
}

let routeCount = 0, indexedCount = 0, latestDay, site, sourceHash, commit;
try {
  if (!["fetch", "curl"].includes(transport)) throw new Error("HTTP_TRANSPORT must be fetch or curl");
  if (!["http:", "https:"].includes(base.protocol) || base.pathname !== "/" || base.search || base.hash || base.username || base.password)
    throw new Error("BASE_URL must be an HTTP(S) origin without credentials, path, query or fragment");
  const waitSeconds = Number(process.env.DEPLOY_WAIT_SECONDS ?? (process.argv.includes("--wait-for-daily") ? 300 : 0));
  if (!Number.isInteger(waitSeconds) || waitSeconds < 0 || waitSeconds > 300) throw new Error("DEPLOY_WAIT_SECONDS must be an integer from 0 to 300");
  const { render, routesFor, locales, indexLocales, htmlLangs } = await import("../.prerender/ssr.js");
  const seo = json("public/data/seo.json"), stats = json("public/data/stats.json");
  latestDay = seo.latestDay;
  sourceHash = seo.sourceHash;
  site = new URL(render("en", "").url).origin;
  try { commit = (await runFile("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim(); } catch { commit = null; }
  const pages = locales.flatMap((locale) => routesFor(locale).map((route) => {
    const path = `/${locale}${route ? "/" + route : ""}`;
    const day = /^daily\/answer\/\d{4}-\d{2}-\d{2}$/.test(route) ? route.slice(-10) : null;
    return { path, locale, route, day, expectedHtmlHash: hash(read(`dist${path}.html`)),
      expected: render(locale, route, day ? json(`public/data/daily/${day}.json`) : undefined) };
  }));
  const routeSet = new Set(["/", ...pages.map((page) => page.path)]);
  const publicFiles = new Set(readdirSync(resolve(root, "public"), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile()).map((entry) => "/" + resolve(entry.parentPath || entry.path, entry.name).slice(resolve(root, "public").length + 1)));
  routeCount = pages.length;
  indexedCount = pages.filter((page) => indexLocales.includes(page.locale)).length;
  const policy = record("release-inputs", "source");
  policy.check("indexed-locales", isDeepStrictEqual([...indexLocales].sort(), ["en", "zh"]), { actual: indexLocales, expected: ["en", "zh"] });
  policy.check("source-pattern-count", patterns.length === 31, { actual: patterns.length, expected: 31 });
  policy.check("source-ranking-count", seo.rankings.length === 100, { actual: seo.rankings.length, expected: 100 });
  policy.check("source-version-and-population", seo.version === VERSION && stats.version === VERSION && stats.total === TOTAL && seo.sourceHash === stats.sourceHash,
    { version: VERSION, total: TOTAL, sourceHash: seo.sourceHash });
  policy.check("latest-published-date", seo.dailyDates.includes(latestDay) && latestDay === [...seo.dailyDates].sort().at(-1), { latestDay, dailyDates: seo.dailyDates });
  policy.check("unique-route-map", new Set(pages.map((p) => p.path)).size === pages.length, { routeCount, indexedCount, locales });
  if (waitSeconds > 0) await waitForDeployment(waitSeconds, latestDay);
  const expectedAssets = assetReferences(read("dist/en.html").toString("utf8"));
  policy.check("local-build-assets", expectedAssets.length > 0, { expectedAssets });
  const imagePaths = new Set(), assetPaths = new Set(expectedAssets);
  let completed = 0;
  await pool(pages, async ({ path, locale, route, day, expected, expectedHtmlHash }) => {
    const allowedLanguages = [
      ...indexLocales.filter((language) => routesFor(language).includes(route))
        .map((language) => htmlLangs[locales.indexOf(language)]),
      "x-default",
    ].sort();
    await inspect(path, "page", (item, response) => {
      const { head, body, meta, links } = documentParts(response.text), visible = visibleText(body);
      const metaValues = (name, property = "name") => meta.filter((tag) => tag[property] === name).map((tag) => tag.content);
      item.check("http-status", response.status === 200, { expected: 200, actual: response.status });
      const actualHtmlHash = hash(response.bytes);
      item.check("current-build-html-sha256", actualHtmlHash === expectedHtmlHash, { expected: expectedHtmlHash, actual: actualHtmlHash });
      item.check("initial-document", Boolean(head && body) && /text\/html/i.test(response.contentType || ""), { contentType: response.contentType });
      item.check("html-language", tags(response.text, "html")[0]?.lang === expected.lang, { expected: expected.lang, actual: tags(response.text, "html")[0]?.lang });
      const title = elementTexts(head, "title"), h1 = elementTexts(body, "h1"), expectedH1 = elementTexts(expected.body, "h1");
      item.check("title", title.length === 1 && title[0] === normalize(expected.title), { expected: expected.title, actual: title });
      item.check("h1", h1.length === 1 && isDeepStrictEqual(h1, expectedH1) && Boolean(h1[0]), { expected: expectedH1, actual: h1 });
      const canonical = links.filter((tag) => tag.rel === "canonical").map((tag) => tag.href);
      item.check("canonical", isDeepStrictEqual(canonical, [expected.url]), { expected: expected.url, actual: canonical });
      const expectedRobots = indexLocales.includes(locale) ? "index,follow" : "noindex,follow";
      item.check("robots", isDeepStrictEqual(metaValues("robots"), [expectedRobots]), { expected: expectedRobots, actual: metaValues("robots") });
      item.check("description", isDeepStrictEqual(metaValues("description"), [expected.description]), { actual: metaValues("description") });
      const alternates = links.filter((tag) => tag.rel === "alternate").map((tag) => ({ lang: tag.hreflang, url: tag.href }));
      const sorted = (rows) => [...rows].sort((a, b) => String(a.lang).localeCompare(String(b.lang)));
      item.check("indexed-hreflang-only", isDeepStrictEqual(alternates.map((a) => a.lang).sort(), allowedLanguages)
        && isDeepStrictEqual(sorted(alternates), sorted(expected.alternates)), { expected: expected.alternates, actual: alternates });
      const scripts = [...head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
        .filter((match) => attrs(match[1]).type === "application/ld+json");
      let graph = [];
      try {
        const parsed = scripts.map((match) => JSON.parse(match[2]));
        graph = parsed.flatMap((node) => node["@graph"] || [node]);
        item.check("initial-head-jsonld", parsed.length === 1 && isDeepStrictEqual(parsed[0], expected.jsonLd),
          { scriptCount: parsed.length, types: graph.map((node) => node["@type"]), matchesExpectedGraph: isDeepStrictEqual(parsed[0], expected.jsonLd) });
      } catch (error) { item.check("initial-head-jsonld", false, { error: error.message }); }
      const faqs = graph.filter((node) => node["@type"] === "FAQPage").flatMap((node) => node.mainEntity || []);
      const missingFaq = faqs.flatMap((faq) => [faq.name, faq.acceptedAnswer?.text]).filter((text) => !text || !visible.includes(normalize(text)));
      item.check("faq-visible-in-body", missingFaq.length === 0, { questions: faqs.length, missing: missingFaq });
      if (route === "methodology") {
        const counts = graph.find((node) => node["@type"] === "Dataset")?.variableMeasured?.map((row) => row.value) || [];
        item.check("dataset-exact-pattern-counts", counts.length === patterns.length && isDeepStrictEqual(counts, patterns.map((pattern) => stats.counts[pattern.id])),
          { expectedCount: patterns.length, actualCount: counts.length, counts });
      }
      if (route === "rarest-numbers") {
        const ranking = graph.find((node) => node["@type"] === "ItemList"), entries = ranking?.itemListElement || [];
        item.check("ranking-top-100", ranking?.numberOfItems === 100 && entries.length === 100
          && entries.every((entry, index) => entry.position === index + 1 && entry.name === String(seo.rankings[index].n)),
          { declared: ranking?.numberOfItems, actual: entries.length, firstNumber: entries[0]?.name, lastNumber: entries.at(-1)?.name });
      }
      if (day) {
        const embedded = [...head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter((match) => attrs(match[1]).id === "daily-data");
        let matches = false;
        try { matches = embedded.length === 1 && isDeepStrictEqual(JSON.parse(embedded[0][2]), json(`public/data/daily/${day}.json`)); } catch { /* Assertion below records parse failures. */ }
        item.check("embedded-daily-data", matches, { date: day, scriptCount: embedded.length });
      }
      item.check("social-image-metadata", isDeepStrictEqual(metaValues("og:image", "property"), [expected.image])
        && isDeepStrictEqual(metaValues("twitter:image"), [expected.image]) && isDeepStrictEqual(metaValues("twitter:card"), ["summary_large_image"])
        && isDeepStrictEqual(metaValues("og:image:width", "property"), ["1200"]) && isDeepStrictEqual(metaValues("og:image:height", "property"), ["630"]),
        { image: metaValues("og:image", "property") });
      imagePaths.add(new URL(expected.image).pathname);
      const actualAssets = assetReferences(response.text);
      item.check("current-build-assets", isDeepStrictEqual(actualAssets, expectedAssets), { expected: expectedAssets, actual: actualAssets });
      for (const path of actualAssets) assetPaths.add(path);
      if (indexLocales.includes(locale)) {
        const broken = [], internal = new Set();
        for (const anchor of tags(body, "a")) {
          if (!anchor.href) continue;
          let target;
          try { target = new URL(anchor.href, new URL(path, base)); } catch { broken.push(anchor.href); continue; }
          if (![base.origin, site].includes(target.origin)) continue;
          const targetPath = target.pathname === "/" ? "/" : target.pathname.replace(/\/$/, "");
          internal.add(targetPath);
          if (!routeSet.has(targetPath) && !publicFiles.has(targetPath)) broken.push(anchor.href);
        }
        item.check("internal-links-in-route-map", broken.length === 0, { checked: internal.size, broken });
      }
    });
    completed++;
    if (completed % 60 === 0 || completed === pages.length) console.log(`HTTP pages: ${completed}/${pages.length}`);
  });
  const tomorrow = new Date(`${latestDay}T00:00:00.000Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const future = tomorrow.toISOString().slice(0, 10);
  const nextArchivePage = Math.max(1, ...pages.map((page) => Number(page.route.match(/^daily\/answer\/page\/(\d+)$/)?.[1]) || 1)) + 1;
  const invalidRoutes = indexLocales.flatMap((locale) => ["not-a-route", "patterns/unknown", `daily/answer/${latestDay.slice(0, 4)}-02-30`,
    "daily/answer/not-a-date", `daily/answer/${future}`, "daily/answer/page/0", "daily/answer/page/1", `daily/answer/page/${nextArchivePage}`]
    .map((route) => `/${locale}/${route}`));
  await pool(invalidRoutes, (path) => inspect(path, "invalid-page", (item, response) => {
    const { head, body, meta } = documentParts(response.text);
    const robots = meta.filter((tag) => tag.name === "robots").map((tag) => tag.content);
    item.check("http-404", response.status === 404, { expected: 404, actual: response.status });
    item.check("initial-noindex", robots.length === 1 && /(?:^|,)\s*noindex\s*(?:,|$)/.test(robots[0]), { actual: robots });
    item.check("error-document", Boolean(head && body) && elementTexts(body, "h1").length === 1, { h1: elementTexts(body, "h1") });
  }));
  const dataFiles = ["scores.bin", "patterns.bin", "stats.json", "seo.json", ...seo.dailyDates.map((day) => `daily/${day}.json`)];
  await pool(dataFiles, (file) => inspect(`/data/${file}`, "data-integrity", async (item, response) => {
    const expectedHash = hash(read(`public/data/${file}`)), actualHash = hash(response.bytes);
    item.check("http-status", response.status === 200, { expected: 200, actual: response.status });
    item.check("release-input-sha256", expectedHash === actualHash, { expected: expectedHash, actual: actualHash, bytes: response.bytes.length });
    let committedHash;
    try {
      const { stdout } = await runFile("git", ["show", `${commit}:public/data/${file}`], { cwd: root, encoding: "buffer", maxBuffer: 32 * 1024 * 1024 });
      committedHash = hash(stdout);
    } catch { committedHash = null; }
    item.commitReference = { commit, sha256: committedHash, available: committedHash !== null };
    if (committedHash) item.check("committed-sha256", actualHash === committedHash, { expected: committedHash, actual: actualHash, commit });
    else if (!local) item.check("committed-sha256", false, { error: "Release input is absent from Git HEAD; commit it before production acceptance", commit });
    else warnings.push({ path: `/data/${file}`, reason: "Absent from Git HEAD; local HTTP matches release input, committed hash must be checked after commit" });
  }));
  await inspect("/sitemap.xml", "discovery", (item, response) => {
    const urls = [...response.text.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => decode(match[1]).trim());
    const expected = pages.filter((page) => indexLocales.includes(page.locale)).map((page) => page.expected.url).sort();
    const unexpected = urls.filter((url) => !expected.includes(url)), missing = expected.filter((url) => !urls.includes(url));
    item.check("http-status", response.status === 200, { expected: 200, actual: response.status });
    item.check("xml-urlset", /<urlset\b[^>]*xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/.test(response.text));
    item.check("generated-indexed-urls-only", missing.length === 0 && unexpected.length === 0 && urls.length === new Set(urls).size,
      { expectedCount: expected.length, actualCount: urls.length, unexpected, missing });
    item.check("only-en-zh", urls.every((url) => { try { const parsed = new URL(url); return parsed.origin === site && indexLocales.includes(parsed.pathname.split("/")[1]); } catch { return false; } }), { locales: indexLocales });
  });
  await inspect("/robots.txt", "discovery", (item, response) => {
    item.check("http-status", response.status === 200, { expected: 200, actual: response.status });
    item.check("crawl-and-sitemap", /^User-agent:\s*\*/mi.test(response.text) && /^Allow:\s*\/\s*$/mi.test(response.text)
      && !/^Disallow:\s*\/\s*$/mi.test(response.text) && response.text.includes(`Sitemap: ${site}/sitemap.xml`), { actual: response.text.trim() });
  });
  await inspect("/llms.txt", "discovery", (item, response) => {
    const links = [...response.text.matchAll(/\]\((https?:\/\/[^)]+\/en\/patterns\/[^)]+)\)/g)].map((match) => match[1]);
    const expected = patterns.map((pattern) => `${site}/en/patterns/${pattern.id}`);
    item.check("http-status", response.status === 200, { expected: 200, actual: response.status });
    item.check("all-31-pattern-links", isDeepStrictEqual([...links].sort(), [...expected].sort()), { expectedCount: patterns.length, actualCount: links.length, missing: expected.filter((url) => !links.includes(url)) });
    const requiredLinks = ["/en/methodology", "/en", "/en/rarest-numbers", "/zh", "/en/daily", "/en/daily/answer", `/en/daily/answer/${latestDay}`];
    item.check("key-content-and-latest-answer", requiredLinks.every((path) => response.text.includes(`](${site}${path})`))
      && response.text.includes(`${patterns.length} independently implemented patterns`) && response.text.includes(VERSION), { latestDay, requiredLinks });
  });
  await pool([...imagePaths], (path) => inspect(path, "social-image", (item, response) => {
    const png = response.bytes, isPng = png.length >= 24 && png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && png.toString("ascii", 12, 16) === "IHDR";
    const width = isPng ? png.readUInt32BE(16) : null, height = isPng ? png.readUInt32BE(20) : null;
    item.check("http-status", response.status === 200, { expected: 200, actual: response.status });
    item.check("png-1200x630", isPng && width === 1200 && height === 630, { isPng, width, height, bytes: png.length });
  }));
  await pool(["/favicon.ico", "/favicon-16x16.png", "/favicon-32x32.png", "/apple-touch-icon.png", "/android-chrome-192x192.png", "/android-chrome-512x512.png", "/site.webmanifest", ...assetPaths], (path) => inspect(path, "asset", (item, response) => {
    item.check("http-status", response.status === 200, { expected: 200, actual: response.status });
    item.check("nonempty-asset", response.bytes.length > 0 && !/^\s*<!doctype html/i.test(response.text), { bytes: response.bytes.length, contentType: response.contentType });
    if (path.startsWith("/assets/") || path === "/site.webmanifest" || /\.(?:ico|png)$/.test(path)) {
      const expectedHash = hash(read(`dist${path}`)), actualHash = hash(response.bytes);
      item.check("current-build-sha256", expectedHash === actualHash, { expected: expectedHash, actual: actualHash });
    }
  }));
} catch (error) { record("release-setup", "setup").check("setup", false, { error: error.message }); }

const cleanResults = results.map(({ check, ...item }) => item).sort((a, b) => a.path.localeCompare(b.path));
const failures = cleanResults.filter((item) => !item.pass), checks = cleanResults.flatMap((item) => item.checks);
const report = {
  base: base.origin, transport, startedAt, checkedAt: new Date().toISOString(), localExpectedCommit: commit, site, latestDay, sourceHash,
  routeCount, indexedCount, passed: cleanResults.length - failures.length, failed: failures,
  checkSummary: { passed: checks.filter((check) => check.pass).length, failed: checks.filter((check) => !check.pass).length },
  categorySummary: Object.fromEntries([...new Set(cleanResults.map((item) => item.category))].map((category) => {
    const rows = cleanResults.filter((item) => item.category === category);
    return [category, { passed: rows.filter((item) => item.pass).length, failed: rows.filter((item) => !item.pass).length }];
  })),
  warnings, deploymentPolls, networkRetries: requests.filter((request) => request.willRetry), requests, results: cleanResults,
};
mkdirSync(resolve(root, "verification"), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ base: report.base, transport, routeCount, indexedCount, passed: report.passed,
  failed: failures.map((item) => ({ path: item.path, status: item.status, checks: item.checks.filter((check) => !check.pass) })),
  checkSummary: report.checkSummary, warnings, networkRetries: report.networkRetries.length, report: outputPath }, null, 2));
if (failures.length) process.exitCode = 1;
