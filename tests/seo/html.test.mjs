import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { patterns } from "../../src/engine.mjs";
import { render } from "../../.prerender/ssr.js";

const html = (path) => readFileSync(`dist/${path}.html`, "utf8");
const graph = (source) => {
  const match = source.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
  );
  assert.ok(match, "JSON-LD must be in initial HTML");
  return JSON.parse(match[1])["@graph"];
};
const decode = (s) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

test("initial HTML has requested home keyword, image, and application schema", () => {
  const source = html("en");
  assert.match(source, /<title>RNGDLE Number Rarity Calculator/);
  assert.match(source, /<h1[^>]*>RNGDLE Number Rarity Calculator<\/h1>/);
  for (const type of ["WebSite", "Organization", "SoftwareApplication"])
    assert.ok(graph(source).some((x) => x["@type"] === type));
  assert.match(source, /property="og:image"/);
  assert.match(source, /name="twitter:card" content="summary_large_image"/);
});

test("only en and zh are indexed and alternate links never advertise noindex languages", () => {
  const sitemap = readFileSync("dist/sitemap.xml", "utf8");
  assert.doesNotMatch(sitemap, /https:\/\/rngdle.art\/(ja|ko|de|fr)(\/|<)/);
  for (const locale of ["en", "zh", "ja", "ko", "de", "fr"]) {
    const source = html(locale);
    if (["en", "zh"].includes(locale))
      assert.doesNotMatch(source, /name="robots" content="noindex/);
    else assert.match(source, /name="robots" content="noindex,follow"/);
    assert.doesNotMatch(source, /hreflang="(?:ja-JP|ko-KR|de-DE|fr-FR)"/);
  }
});

test("all pattern pages have specific FAQ matching visible copy and exact count", () => {
  const stats = JSON.parse(readFileSync("public/data/stats.json", "utf8"));
  for (const locale of ["en", "zh"])
    for (const p of patterns) {
      const source = html(`${locale}/patterns/${p.id}`),
        nodes = graph(source),
        visible = decode(source.split("<body>")[1]);
      const faq = nodes.find((x) => x["@type"] === "FAQPage");
      assert.equal(faq?.mainEntity.length, 3, `${locale}/${p.id}`);
      assert.ok(nodes.some((x) => x["@type"] === "DefinedTerm"));
      for (const q of faq.mainEntity) {
        assert.ok(visible.includes(q.name), q.name);
        assert.ok(
          visible.includes(q.acceptedAnswer.text),
          q.acceptedAnswer.text,
        );
      }
      assert.ok(
        visible.includes(
          stats.counts[p.id].toLocaleString(
            locale === "zh" ? "zh-CN" : "en-US",
          ),
        ),
      );
    }
});

test("full range ranking, dataset, daily pages and links are present without JavaScript", () => {
  const seo = JSON.parse(readFileSync("public/data/seo.json", "utf8"));
  const ranking = graph(html("en/rarest-numbers")).find(
    (x) => x["@type"] === "ItemList",
  );
  assert.equal(ranking.itemListElement.length, 100);
  const dataset = graph(html("en/methodology")).find(
    (x) => x["@type"] === "Dataset",
  );
  assert.equal(dataset.variableMeasured.length, patterns.length);
  const sitemap = readFileSync("dist/sitemap.xml", "utf8");
  for (const url of [
    ...sitemap.matchAll(/<loc>https:\/\/rngdle.art\/([^<]+)<\/loc>/g),
  ])
    assert.ok(existsSync(`dist/${url[1]}.html`), url[1]);
  for (const day of seo.dailyDates)
    for (const locale of ["en", "zh"]) {
      const source = html(`${locale}/daily/answer/${day}`);
      assert.ok(graph(source).some((x) => x["@type"] === "Article"));
      assert.match(source, /application\/ld\+json/);
      assert.ok(source.includes(day));
    }
  assert.match(readFileSync("dist/llms.txt", "utf8"), /methodology/);
  for (const p of patterns)
    assert.ok(
      readFileSync("dist/llms.txt", "utf8").includes(`/en/patterns/${p.id}`),
    );
});

test("all English pattern explanations meet the requested depth and invalid routes stay noindex", () => {
  for (const p of patterns) {
    const page = render("en", "patterns/" + p.id);
    assert.ok(page.paragraphs.join(" ").split(/\s+/).length >= 150, p.id);
  }
  for (const route of [
    "404",
    "not-a-route",
    "patterns/unknown",
    "daily/answer/2099-01-01",
    "daily/answer/page/9999",
  ]) {
    const page = render("en", route);
    assert.equal(page.noindex, true, route);
    assert.match(page.title, /outside our range/);
  }
});

test("all FAQ graphs match visible content and social images have actual 1200 by 630 pixels", () => {
  const manifest = JSON.parse(
    readFileSync("verification/prerender.json", "utf8"),
  );
  for (const url of manifest.htmlPages) {
    const path = url.replace("https://rngdle.art/", ""),
      source = html(path),
      visible = decode(source.split("<body>")[1]);
    const faq = graph(source).find((x) => x["@type"] === "FAQPage");
    for (const q of faq?.mainEntity || []) {
      assert.ok(visible.includes(q.name), `${path}: ${q.name}`);
      assert.ok(
        visible.includes(q.acceptedAnswer.text),
        `${path}: ${q.acceptedAnswer.text}`,
      );
    }
    for (const [, href] of source.matchAll(
      /href="(\/[^"#?]*)(?:[?#][^"]*)?"/g,
    )) {
      if (href.startsWith("/assets/") || href === "/favicon.svg") continue;
      assert.ok(
        existsSync(`dist${href}.html`) || existsSync(`dist${href}`),
        `${path} dead link: ${href}`,
      );
    }
    const imagePath = source.match(
      /property="og:image" content="https:\/\/rngdle.art([^\"]+)"/,
    )[1];
    const png = readFileSync("dist" + imagePath);
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  }
});
