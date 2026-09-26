import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  render,
  routeList,
  locales,
  htmlLangs,
  messages,
} from "../.prerender/ssr.js";
const original = readFileSync("dist/index.html", "utf8");
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
for (const [key, row] of Object.entries(messages))
  if (row.length !== 6 || row.some((t) => typeof t !== "string" || !t.trim()))
    throw Error("Incomplete locale row " + key);
const urls = [];
function document(locale, route) {
  const { body, title, description, lang } = render(locale, route),
    path = "/" + locale + (route ? "/" + route : "");
  const links =
    route === "404"
      ? ""
      : locales
          .map(
            (l, i) =>
              `<link rel="alternate" hreflang="${htmlLangs[i]}" href="https://rngdle.art/${l}${route ? "/" + route : ""}">`,
          )
          .join("") +
        `<link rel="alternate" hreflang="x-default" href="https://rngdle.art/en${route ? "/" + route : ""}">`;
  return original
    .replace('lang="en-US"', `lang="${lang}" data-theme="dark"`)
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?\s*>/,
      `<meta name="description" content="${escape(description)}">`,
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="https://rngdle.art${path}">${links}<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:url" content="https://rngdle.art${path}">${route === "404" ? '<meta name="robots" content="noindex">' : ""}</head>`,
    )
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}
for (const locale of locales)
  for (const route of routeList) {
    const path = `dist/${locale}${route ? "/" + route : ""}.html`;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, document(locale, route));
    urls.push("https://rngdle.art/" + locale + (route ? "/" + route : ""));
  }
writeFileSync("dist/index.html", document("en", ""));
writeFileSync("dist/404.html", document("en", "404"));
writeFileSync(
  "dist/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map((url) => "<url><loc>" + url + "</loc></url>").join("") +
    "</urlset>",
);
writeFileSync(
  "dist/robots.txt",
  "User-agent: *\nAllow: /\nSitemap: https://rngdle.art/sitemap.xml\n",
);
mkdirSync("verification", { recursive: true });
writeFileSync(
  "verification/prerender.json",
  JSON.stringify(
    {
      count: urls.length,
      locales,
      translationKeys: Object.keys(messages).length,
      htmlPages: urls,
    },
    null,
    2,
  ),
);
console.log(
  `Prerendered ${urls.length} pages in ${locales.length} languages; verified ${Object.keys(messages).length} translation keys.`,
);
