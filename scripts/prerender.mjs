import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  render,
  routesFor,
  locales,
  indexLocales,
  messages,
  articleDates,
} from "../.prerender/ssr.js";
import { patterns, MAX, TOTAL } from "../src/engine.mjs";
const original = readFileSync("dist/index.html", "utf8");
const seo = JSON.parse(readFileSync("public/data/seo.json", "utf8"));
const SITE = "https://rngdle.art";
const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const safeJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
for (const [key, row] of Object.entries(messages))
  if (row.length !== 6 || row.some((t) => typeof t !== "string" || !t.trim()))
    throw Error("Incomplete locale row " + key);
const urls = [],
  pages = [];
function document(locale, route) {
  const day = /^daily\/answer\/\d{4}-\d{2}-\d{2}$/.test(route)
    ? route.slice(-10)
    : null;
  const daily = day
    ? JSON.parse(readFileSync(`public/data/daily/${day}.json`, "utf8"))
    : undefined;
  const meta = render(locale, route, daily);
  const {
    body,
    title,
    description,
    lang,
    url,
    image,
    type,
    noindex,
    alternates,
    jsonLd,
  } = meta;
  const links = alternates
    .map(
      (a) =>
        `<link rel="alternate" hreflang="${a.lang}" href="${escape(a.url)}">`,
    )
    .join("");
  return original
    .replace(/lang="en-US"/, `lang="${lang}" data-theme="dark"`)
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?\s*>/,
      `<meta name="description" content="${escape(description)}">`,
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="${escape(url)}">${links}<meta name="robots" content="${noindex ? "noindex,follow" : "index,follow"}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="${type}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${image}"><script id="seo-jsonld" type="application/ld+json">${safeJson(jsonLd)}</script>${daily ? `<script id="daily-data" type="application/json">${safeJson(daily)}</script>` : ""}</head>`,
    )
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}
for (const locale of locales)
  for (const route of routesFor(locale)) {
    const path = `dist/${locale}${route ? "/" + route : ""}.html`;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, document(locale, route));
    const url = `${SITE}/${locale}${route ? "/" + route : ""}`;
    pages.push(url);
    if (indexLocales.includes(locale))
      urls.push({
        url,
        lastmod: /^daily\/answer\/\d/.test(route)
          ? JSON.parse(
              readFileSync(
                `public/data/daily/${route.slice(-10)}.json`,
                "utf8",
              ),
            ).dateModified
          : route === "rarest-numbers" || route === "guides" || route.startsWith("guides/")
            ? articleDates(route).dateModified
            : route.startsWith("daily/answer")
              ? seo.latestDay
              : undefined,
      });
  }
writeFileSync("dist/index.html", document("en", ""));
writeFileSync("dist/404.html", document("en", "404"));
writeFileSync(
  "dist/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        ({ url, lastmod }) =>
          `<url><loc>${escape(url)}</loc>${lastmod ? `<lastmod>${escape(lastmod)}</lastmod>` : ""}</url>`,
      )
      .join("\n") +
    "\n</urlset>\n",
);
writeFileSync(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`,
);
writeFileSync(
  "dist/llms.txt",
  `# RNGDLE.ART\n\n> Independent, free number rarity calculator and browser number games. Not affiliated with rngdle.com or other similarly named sites. Answers here are only for RNGDLE.ART.\n\n## Scope and methodology\n\n- Inclusive integer range: 0–${MAX.toLocaleString("en-US")} (${TOTAL.toLocaleString("en-US")} values), without leading zeros.\n- ${patterns.length} independently implemented patterns; counts are exhaustive, not sampled.\n- Engine: ${seo.version}. Score uses weighted −log₂ exact probabilities, digit-sum and distinct-digit distributions, and short-length information, multiplied by 20 and rounded once.\n- Top percentage is the share scoring at least as high, ties included. Smaller percentages indicate rarer scores; individual random draws remain equally likely.\n- [Methodology](${SITE}/en/methodology)\n- [Calculator](${SITE}/en)\n- [Full-range top 100](${SITE}/en/rarest-numbers)\n- [Chinese calculator](${SITE}/zh)\n\n## Daily answers\n\nThe active game mode rotates daily; all three seeded mode solutions are labeled separately. Daily resets at 00:00 UTC. Static publication is scheduled for 00:05 UTC and may be delayed by the build queue. Archive begins ${seo.dailyDates.at(-1)}. Future answers are not published.\n\n- [Daily game](${SITE}/en/daily)\n- [Answer archive](${SITE}/en/daily/answer)\n- [Latest published answers](${SITE}/en/daily/answer/${seo.latestDay})\n- Dated URL pattern: ${SITE}/en/daily/answer/YYYY-MM-DD\n\n## Pattern atlas\n\n${patterns.map((p) => `- [${messages["p_" + p.id]?.[0] || p.id}](${SITE}/en/patterns/${p.id})`).join("\n")}\n`,
);
mkdirSync("verification", { recursive: true });
writeFileSync(
  "verification/prerender.json",
  JSON.stringify(
    {
      count: pages.length,
      indexedCount: urls.length,
      locales,
      indexLocales,
      translationKeys: Object.keys(messages).length,
      htmlPages: pages,
    },
    null,
    2,
  ),
);
console.log(
  `Prerendered ${pages.length} pages; sitemap includes ${urls.length} English/Chinese URLs.`,
);
