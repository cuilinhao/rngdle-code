// Compare URL behavior between a reference origin and a candidate origin, and check
// the candidate's response headers and crawler access. Used for the Vercel → Cloudflare
// Pages migration and reusable for any later hosting change.
//
// BASE_URL=https://candidate REFERENCE_URL=https://reference node scripts/compare-hosts.mjs
// REFERENCE_URL is optional; without it only the header and crawler checks run.
import { writeFileSync, mkdirSync } from "node:fs";

const base = new URL(process.env.BASE_URL || "http://127.0.0.1:4173");
const reference = process.env.REFERENCE_URL ? new URL(process.env.REFERENCE_URL) : null;
const outputPath = process.env.OUTPUT || "verification/host-comparison.json";
const locales = ["en", "zh", "ja", "ko", "de", "fr"];
const failures = [];
const report = { base: base.origin, reference: reference?.origin ?? null, startedAt: new Date().toISOString() };

async function get(origin, path, headers = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(new URL(path, origin), { redirect: "manual", headers, signal: AbortSignal.timeout(30000) });
      const body = Buffer.from(await response.arrayBuffer());
      const location = response.headers.get("location");
      return {
        status: response.status,
        location: location ? new URL(location, origin).pathname + new URL(location, origin).search : null,
        headers: Object.fromEntries(response.headers),
        bytes: body.length,
        text: body.toString("utf8"),
      };
    } catch (error) {
      if (attempt >= 3) throw error;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

// Paths: every sitemap URL, each with trailing-slash and .html variants for a sample,
// plus root, assets, data, discovery files and 404 cases.
async function paths() {
  const sitemap = await get(reference ?? base, "/sitemap.xml");
  const pages = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const set = new Set(["/", "/index.html", "/404", "/404.html", "/robots.txt", "/sitemap.xml", "/llms.txt",
    "/favicon.ico", "/favicon.svg", "/site.webmanifest", "/data/stats.json", "/data/seo.json",
    "/does-not-exist", "/en/does-not-exist", "/zh/does-not-exist/", "/EN", "/en//methodology", "/en?x=1"]);
  for (const p of pages) set.add(p);
  for (const locale of locales) for (const p of [`/${locale}`, `/${locale}/`, `/${locale}.html`, `/${locale}/index.html`]) set.add(p);
  for (const p of pages.filter((_, i) => i % 7 === 0)) { set.add(p + "/"); set.add(p + ".html"); }
  const home = await get(reference ?? base, "/en");
  for (const m of home.text.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) set.add(m[1]);
  return [...set];
}

const check = (name, ok, detail) => { if (!ok) failures.push({ name, ...detail }); return ok; };

const list = await paths();
report.pathCount = list.length;

if (reference) {
  // Differences accepted after review: both end in the same final response and neither
  // path is linked anywhere. Vercel strips a trailing slash before answering 404, and
  // collapses duplicate slashes; Cloudflare Pages answers directly (pages keep their
  // absolute canonical URL).
  const accepted = (path, a, b) =>
    (/\/$/.test(path) && path !== "/" && a.status === 308 && b.status === 404) ||
    (path.includes("//") && a.status === 308 && b.status === 200);
  report.comparison = [];
  for (const path of list) {
    const [a, b] = await Promise.all([get(reference, path), get(base, path)]);
    let same = a.status === b.status && a.location === b.location
      && (a.status !== 200 || a.headers["content-type"]?.split(";")[0] === b.headers["content-type"]?.split(";")[0]);
    const acceptedDifference = !same && accepted(path, a, b);
    if (acceptedDifference) same = true;
    report.comparison.push({ path, reference: { status: a.status, location: a.location, type: a.headers["content-type"] },
      candidate: { status: b.status, location: b.location, type: b.headers["content-type"] }, same, acceptedDifference });
    check("url-behavior", same, { path, reference: { status: a.status, location: a.location }, candidate: { status: b.status, location: b.location } });
  }
}

// Header checks on the candidate.
const pagesDev = base.hostname.endsWith(".pages.dev");
const html = await get(base, "/en");
const expectHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=63072000",
};
report.headers = { html: html.headers };
for (const [name, value] of Object.entries(expectHeaders))
  check("security-header", html.headers[name] === value, { header: name, expected: value, actual: html.headers[name] ?? null });
check("noindex-host-rule", pagesDev ? /noindex/i.test(html.headers["x-robots-tag"] ?? "") : !html.headers["x-robots-tag"],
  { host: base.hostname, actual: html.headers["x-robots-tag"] ?? null });
const asset = list.find((p) => p.startsWith("/assets/"));
if (asset) {
  const r = await get(base, asset);
  report.headers.asset = { path: asset, cacheControl: r.headers["cache-control"] };
  check("asset-cache", r.status === 200 && /max-age=31536000/.test(r.headers["cache-control"] ?? "") && /immutable/.test(r.headers["cache-control"] ?? ""),
    { path: asset, status: r.status, actual: r.headers["cache-control"] ?? null });
}
const data = await get(base, "/data/stats.json");
report.headers.data = { cacheControl: data.headers["cache-control"] };
check("data-cache", data.status === 200 && /max-age=0/.test(data.headers["cache-control"] ?? "") && /must-revalidate/.test(data.headers["cache-control"] ?? ""),
  { actual: data.headers["cache-control"] ?? null });

// Crawler access: search and AI crawlers must get the same 200 responses as browsers.
report.crawlers = [];
const agents = {
  Googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  Bingbot: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  GPTBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
  "OAI-SearchBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
  ClaudeBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  PerplexityBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  "Google-Extended": "Mozilla/5.0 (compatible; Google-Extended)",
};
const plain = await get(base, "/robots.txt");
for (const [name, ua] of Object.entries(agents))
  for (const path of ["/robots.txt", "/en", "/llms.txt"]) {
    const r = await get(base, path, { "user-agent": ua });
    report.crawlers.push({ agent: name, path, status: r.status });
    check("crawler-access", r.status === 200, { agent: name, path, status: r.status });
    if (path === "/robots.txt") check("robots-unmodified", r.text === plain.text, { agent: name });
  }
report.robots = plain.text;
check("robots-content", /^User-agent: \*\nAllow: \/\nSitemap: https:\/\/rngdle\.art\/sitemap\.xml\n$/.test(plain.text), { actual: plain.text });

report.finishedAt = new Date().toISOString();
report.failures = failures;
report.passed = failures.length === 0;
mkdirSync("verification", { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n");
console.log(`${report.pathCount} paths; ${failures.length} failures`);
for (const f of failures.slice(0, 80)) console.log(JSON.stringify(f));
process.exit(failures.length ? 1 : 0);
