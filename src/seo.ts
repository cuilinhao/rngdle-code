import { translate, locales, htmlLangs, type Locale } from "./i18n";
import "./pattern-text";
import { patterns } from "./engine.mjs";
import statsData from "../public/data/stats.json";
import seoData from "../public/data/seo.json";
import {
  homeContent,
  patternContent,
  methodologyContent,
  rarestContent,
  articleDates,
} from "./seo-content";
import { dailyContent, archiveContent } from "./daily-content";

export const SITE = "https://rngdle.art";
export const indexLocales: Locale[] = ["en", "zh"];
export const baseRoutes = [
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
  ...patterns.map((p) => "patterns/" + p.id),
];
export const seo: any = seoData;
const stats: any = statsData;
export const archiveSize = 30;
export const extraRoutes = [
  "rarest-numbers",
  "daily/answer",
  ...Array.from(
    { length: Math.max(0, Math.ceil(seo.dailyDates.length / archiveSize) - 1) },
    (_, i) => `daily/answer/page/${i + 2}`,
  ),
  ...seo.dailyDates.map((day: string) => "daily/answer/" + day),
];
export function routesFor(locale: Locale) {
  return [...baseRoutes, ...(indexLocales.includes(locale) ? extraRoutes : [])];
}
export function isKnownRoute(locale: Locale, route: string) {
  return routesFor(locale).includes(route);
}
export const pageUrl = (locale: Locale, route = "") =>
  `${SITE}/${locale}${route ? "/" + route : ""}`;
export function dailyDate(route: string) {
  return /^daily\/answer\/\d{4}-\d{2}-\d{2}$/.test(route)
    ? route.slice(-10)
    : null;
}
export function pageSeo(locale: Locale, route: string, daily?: any) {
  const t = (key: string) => translate(locale, key),
    zh = locale === "zh";
  const valid = isKnownRoute(locale, route),
    day = dailyDate(route);
  const url = pageUrl(locale, route),
    lang = htmlLangs[locales.indexOf(locale)];
  let content: any;
  if (!route) content = homeContent(locale);
  else if (route.startsWith("patterns/") && valid)
    content = patternContent(locale, route.slice(9));
  else if (route === "methodology") content = methodologyContent(locale);
  else if (route === "rarest-numbers" && valid) content = rarestContent(locale);
  else if (day && valid && daily?.date === day)
    content = dailyContent(locale, daily);
  else if (
    valid &&
    (route === "daily/answer" || route.startsWith("daily/answer/page/"))
  )
    content = archiveContent(locale, Number(route.split("/").at(-1)) || 1);
  else {
    const descKeys: Record<string, string> = {
      infinite: "rollIntro",
      daily: "dailyIntro",
      compare: "compareIntro",
      explore: "exploreIntro",
      sandbox: "sandboxIntro",
      patterns: "atlasIntro",
      guides: "guidesIntro",
      ep: "epText",
      about: "aboutText",
      privacy: "privacyText",
      terms: "termsText",
      contact: "contactText",
    };
    content = {
      title: (valid && !day ? t(route) : t("notFound")) + " — RNGDLE.ART",
      description: t(descKeys[route] || "exactNote"),
      h1: valid && !day ? t(route) : t("notFound"),
      faqs: [],
    };
    if (day && valid)
      content = {
        ...content,
        title: zh ? `RNGDLE 每日答案 — ${day}` : `RNGDLE Daily Answer — ${day}`,
        h1: zh ? `RNGDLE 每日答案 — ${day}` : `RNGDLE Daily Answer — ${day}`,
        description: zh
          ? "RNGDLE.ART 每日数字挑战答案与分数。"
          : "Seeded daily number solutions and rarity scores for RNGDLE.ART.",
      };
  }
  const image = `${SITE}/og/${day && valid ? "daily-" + day : "default"}.png`;
  const noindex = !valid || !indexLocales.includes(locale);
  const org = {
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: "RNGDLE.ART",
    url: pageUrl(locale),
  };
  const website = {
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: pageUrl(locale),
    name: "RNGDLE.ART",
    inLanguage: lang,
  };
  const page = {
    "@type": "WebPage",
    "@id": url + "#webpage",
    url,
    name: content.title,
    description: content.description,
    inLanguage: lang,
    isPartOf: { "@id": `${SITE}/#website` },
  };
  const graph: any[] = valid ? [website, org, page] : [];
  const crumb = (name: string, path: string, position: number) => ({
    "@type": "ListItem",
    position,
    name,
    item: pageUrl(locale, path),
  });
  if (route && valid)
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        crumb(zh ? "首页" : "Home", "", 1),
        ...(route.startsWith("patterns/")
          ? [crumb(t("patterns"), "patterns", 2)]
          : day
            ? [
                crumb(
                  zh ? "每日答案归档" : "Daily answers archive",
                  "daily/answer",
                  2,
                ),
              ]
            : []),
        crumb(
          content.h1 || content.title,
          route,
          route.startsWith("patterns/") || day ? 3 : 2,
        ),
      ],
    });
  const article = (published: string, modified: string) => ({
    "@type": "Article",
    headline: content.h1 || content.title,
    description: content.description,
    datePublished: published,
    dateModified: modified,
    author: org,
    publisher: org,
    inLanguage: lang,
    image,
    mainEntityOfPage: { "@id": url + "#webpage" },
    isPartOf: { "@id": `${SITE}/#website` },
  });
  if (!route) {
    Object.assign(website, {
      alternateName: "RNGDLE Number Rarity Calculator",
      description: content.summary,
      publisher: { "@id": `${SITE}/#organization` },
    });
    graph.push({
      "@type": "SoftwareApplication",
      "@id": `${SITE}/#app`,
      name: "RNGDLE Number Rarity Calculator",
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: content.summary,
    });
  }
  if (route.startsWith("patterns/") && valid)
    graph.push({
      "@type": "DefinedTerm",
      "@id": url + "#term",
      name: content.termName || content.h1,
      ...(content.alternateName
        ? { alternateName: content.alternateName }
        : {}),
      description: content.summary,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: zh
          ? "RNGDLE.ART 数字模式图鉴"
          : "RNGDLE.ART Number Pattern Atlas",
        url: pageUrl(locale, "patterns"),
      },
    });
  if (route === "patterns")
    graph.push({
      "@type": "CollectionPage",
      url,
      name: content.h1,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: patterns.length,
        itemListElement: patterns.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t("p_" + p.id),
          url: pageUrl(locale, "patterns/" + p.id),
        })),
      },
    });
  if (route === "methodology")
    graph.push({
      "@type": "Dataset",
      name: content.h1,
      description: content.summary,
      url,
      isAccessibleForFree: true,
      license: pageUrl(locale, "terms"),
      creator: org,
      variableMeasured: patterns.map((p) => ({
        "@type": "PropertyValue",
        name: t("p_" + p.id),
        value: stats.counts[p.id],
      })),
    });
  const dates = articleDates(route);
  if (["guides", "badges", "ep", "leaderboard"].includes(route))
    graph.push(article(dates.datePublished, dates.dateModified));
  if (route === "about")
    graph.push({
      "@type": "AboutPage",
      url,
      name: content.h1,
      mainEntity: org,
    });
  if (day && valid && daily?.date === day)
    graph.push(article(daily.datePublished, daily.dateModified));
  if (route === "rarest-numbers" && valid) {
    graph.push(article(dates.datePublished, dates.dateModified));
    graph.push({
      "@type": "ItemList",
      name: content.h1,
      numberOfItems: seo.rankings.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: seo.rankings.map((row: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        name: String(row.n),
        url: pageUrl(locale) + `?n=${row.n}`,
        description: zh
          ? `稀有度分数 ${row.score}；前 ${row.percent.toLocaleString("zh-CN", { maximumFractionDigits: 6 })}%；命中 ${row.patterns.length} 种模式。`
          : `Rarity score ${row.score}; top ${row.percent.toLocaleString("en-US", { maximumFractionDigits: 6 })}%; matches ${row.patterns.length} patterns.`,
      })),
    });
  }
  if (content.faqs?.length && valid && indexLocales.includes(locale))
    graph.push({
      "@type": "FAQPage",
      mainEntity: content.faqs.map((faq: any) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  return {
    ...content,
    url,
    lang,
    image,
    noindex,
    type: graph.some((x) => x["@type"] === "Article") ? "article" : "website",
    alternates: valid
      ? indexLocales
          .map((l) => ({
            lang: htmlLangs[locales.indexOf(l)],
            url: pageUrl(l, route),
          }))
          .concat([{ lang: "x-default", url: pageUrl("en", route) }])
      : [],
    jsonLd: { "@context": "https://schema.org", "@graph": graph },
  };
}
export function applySeo(locale: Locale, route: string, daily?: any) {
  const meta = pageSeo(locale, route, daily);
  document.title = meta.title;
  document.documentElement.lang = meta.lang;
  const tag = (selector: string, attrs: Record<string, string>) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement(
        selector.startsWith("link") ? "link" : "meta",
      );
      document.head.append(el);
    }
    Object.entries(attrs).forEach(([key, value]) =>
      el!.setAttribute(key, value),
    );
  };
  tag('meta[name="description"]', {
    name: "description",
    content: meta.description,
  });
  tag('meta[name="robots"]', {
    name: "robots",
    content: meta.noindex ? "noindex,follow" : "index,follow",
  });
  tag('link[rel="canonical"]', { rel: "canonical", href: meta.url });
  for (const [key, value] of Object.entries({
    "og:title": meta.title,
    "og:description": meta.description,
    "og:url": meta.url,
    "og:type": meta.type,
    "og:image": meta.image,
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:alt": meta.title,
  }))
    tag(`meta[property="${key}"]`, { property: key, content: String(value) });
  for (const [key, value] of Object.entries({
    "twitter:card": "summary_large_image",
    "twitter:title": meta.title,
    "twitter:description": meta.description,
    "twitter:image": meta.image,
  }))
    tag(`meta[name="${key}"]`, { name: key, content: String(value) });
  document.head
    .querySelectorAll('link[rel="alternate"]')
    .forEach((el) => el.remove());
  for (const a of meta.alternates) {
    const el = document.createElement("link");
    el.rel = "alternate";
    el.hreflang = a.lang;
    el.href = a.url;
    document.head.append(el);
  }
  let ld = document.head.querySelector("#seo-jsonld");
  if (!ld) {
    ld = document.createElement("script");
    ld.id = "seo-jsonld";
    ld.setAttribute("type", "application/ld+json");
    document.head.append(ld);
  }
  ld.textContent = JSON.stringify(meta.jsonLd).replaceAll("<", "\\u003c");
}
