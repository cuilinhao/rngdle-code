import React from "react";
import { renderToString } from "react-dom/server";
import { AppContext, PageHead } from "../src/core";
import { Result, NumberForm, TierTable } from "../src/components";
import { Compare, Sandbox, Explore, Atlas, NotFound } from "../src/Tools";
import { Guides, Article } from "../src/Guides";
import {
  translate,
  locales,
  htmlLangs,
  messages,
  type Locale,
} from "../src/i18n";
import "../src/pattern-text";
import { patterns } from "../src/engine.mjs";
export const routeList = [
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
const nav = [
  "analyze",
  "infinite",
  "daily",
  "compare",
  "explore",
  "sandbox",
  "patterns",
  "guides",
];
export function render(locale: Locale, route: string) {
  (globalThis as any).location = {
    search: "",
    pathname: "/" + locale + "/" + route,
    origin: "https://rngdle.art",
  };
  const t = (key: string) => translate(locale, key);
  const path = (r: string) =>
    "/" + locale + (r && r !== "analyze" ? "/" + r : "");
  let page: React.ReactNode;
  if (!route)
    page = (
      <>
        <PageHead
          eyebrow={t("lab")}
          title={t("hero")}
          description={t("intro")}
        />
        <div className="narrow">
          <section className="panel calculator">
            <NumberForm onChange={() => {}} />
          </section>
          <Result n={142857} />
          <TierTable />
        </div>
      </>
    );
  else if (route === "infinite")
    page = (
      <>
        <PageHead
          eyebrow={t("infinite")}
          title={t("rollTitle")}
          description={t("rollIntro")}
        />
        <div className="narrow">
          <section className="panel roll-board">
            <div className="roll-digits">
              {"??????".split("").map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <p>{t("range")}</p>
            <p>{t("localNote")}</p>
          </section>
        </div>
      </>
    );
  else if (route === "daily")
    page = (
      <>
        <PageHead
          eyebrow={t("daily")}
          title={t("dailyTitle")}
          description={t("dailyIntro")}
        />
        <div className="narrow panel">
          {["draft", "hunt", "quiz"].map((k) => (
            <section key={k}>
              <h2>{t(k)}</h2>
              <p>{t(k + "Rules")}</p>
            </section>
          ))}
          <p>{t("utc")}</p>
        </div>
      </>
    );
  else if (route === "compare") page = <Compare />;
  else if (route === "sandbox") page = <Sandbox />;
  else if (route === "explore") page = <Explore />;
  else if (route === "patterns") page = <Atlas />;
  else if (route.startsWith("patterns/")) page = <Atlas id={route.slice(9)} />;
  else if (route === "guides") page = <Guides />;
  else if (routeList.includes(route)) page = <Article name={route} />;
  else page = <NotFound />;
  const title = route.startsWith("patterns/")
    ? t("p_" + route.slice(9))
    : route === "404"
      ? t("notFound")
      : t(route || "hero");
  const descKey = route.startsWith("patterns/")
    ? "d_" + route.slice(9)
    : (
        {
          "": "intro",
          infinite: "rollIntro",
          daily: "dailyIntro",
          compare: "compareIntro",
          explore: "exploreIntro",
          sandbox: "sandboxIntro",
          patterns: "atlasIntro",
          guides: "guidesIntro",
          methodology: "method1",
          ep: "epText",
          about: "aboutText",
          privacy: "privacyText",
          terms: "termsText",
          contact: "contactText",
        } as Record<string, string>
      )[route] || "exactNote";
  const body = renderToString(
    <AppContext.Provider
      value={{ locale, navigate: () => {}, notify: () => {}, share: () => {} }}
    >
      <header className="header">
        <div className="header-inner">
          <a className="brand" href={path("")}>
            λ RNGDLE.ART
          </a>
          <nav className="navigation">
            {nav.map((k) => (
              <a key={k} href={path(k)}>
                {t(k)}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main id="main">{page}</main>
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <a className="brand" href={path("")}>
              RNGDLE.ART
            </a>
            <p>{t("footer")}</p>
          </div>
          {["guides", "about", "privacy", "terms", "contact"].map((k) => (
            <a key={k} href={path(k)}>
              {t(k)}
            </a>
          ))}
        </div>
      </footer>
      <noscript>
        <p>{t("loading")}</p>
      </noscript>
    </AppContext.Provider>,
  );
  return {
    body,
    title: title + " — RNGDLE.ART",
    description: t(descKey),
    lang: htmlLangs[locales.indexOf(locale)],
  };
}
export { locales, htmlLangs, messages };
