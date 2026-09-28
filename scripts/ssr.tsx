import React from "react";
import { renderToString } from "react-dom/server";
import { AppContext, PageHead } from "../src/core";
import { Result, NumberForm, TierTable } from "../src/components";
import { Compare, Sandbox, Explore, Atlas, NotFound } from "../src/Tools";
import { Guides, Article } from "../src/Guides";
import { GuideArticle } from "../src/GuideArticles";
import { englishGuideRoutes } from "../src/guide-content";
import {
  translate,
  locales,
  htmlLangs,
  messages,
  type Locale,
} from "../src/i18n";
import "../src/pattern-text";
import { patterns } from "../src/engine.mjs";
import { HomeSeoSections } from "../src/SeoSections";
import { homeContent } from "../src/seo-content";
import { RarestNumbers } from "../src/RarestNumbers";
import { DailyAnswer, DailyArchive } from "../src/DailyAnswers";
import {
  pageSeo,
  baseRoutes,
  routesFor,
  dailyDate,
  isKnownRoute,
  indexLocales,
} from "../src/seo";
export const routeList = baseRoutes;
export { routesFor, indexLocales };
export { articleDates } from "../src/seo-content";
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
export function render(locale: Locale, route: string, daily?: any) {
  (globalThis as any).location = {
    search: "",
    pathname: "/" + locale + "/" + route,
    origin: "https://rngdle.art",
  };
  const t = (key: string) => translate(locale, key);
  const path = (r: string) =>
    "/" + locale + (r && r !== "analyze" ? "/" + r : "");
  const meta = pageSeo(locale, route, daily);
  let page: React.ReactNode;
  if (!route)
    page = (
      <>
        <PageHead
          eyebrow={t("lab")}
          title={homeContent(locale).h1}
          description={homeContent(locale).summary}
        />
        <div className="narrow">
          <section className="panel calculator">
            <NumberForm onChange={() => {}} />
          </section>
          <Result n={142857} />
          <TierTable />
        </div>
        <HomeSeoSections />
      </>
    );
  else if (!isKnownRoute(locale, route)) page = <NotFound />;
  else if (route === "rarest-numbers") page = <RarestNumbers />;
  else if (dailyDate(route))
    page = <DailyAnswer day={dailyDate(route)!} data={daily} />;
  else if (route === "daily/answer" || route.startsWith("daily/answer/page/"))
    page = <DailyArchive page={Number(route.split("/").at(-1)) || 1} />;
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
          {indexLocales.includes(locale) && (
            <a href={path("daily/answer")}>
              {locale === "zh"
                ? "查看每日答案与归档"
                : "View daily answers and archive"}
            </a>
          )}
        </div>
      </>
    );
  else if (route === "compare") page = <Compare />;
  else if (route === "sandbox") page = <Sandbox />;
  else if (route === "explore") page = <Explore />;
  else if (route === "patterns") page = <Atlas />;
  else if (route.startsWith("patterns/")) page = <Atlas id={route.slice(9)} />;
  else if (route === "guides") page = <Guides />;
  else if (englishGuideRoutes.includes(route)) page = <GuideArticle route={route} />;
  else if (routeList.includes(route)) page = <Article name={route} />;
  else page = <NotFound />;
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
      {indexLocales.includes(locale) && (
        <nav className="footer-bottom">
          <a href={path("rarest-numbers")}>
            {locale === "zh" ? "最稀有数字榜单" : "Rarest numbers"}
          </a>
          <a href={path("daily/answer")}>
            {locale === "zh" ? "每日答案归档" : "Daily answers archive"}
          </a>
        </nav>
      )}
      <noscript>
        <p>{t("loading")}</p>
      </noscript>
    </AppContext.Provider>,
  );
  return {
    body,
    ...meta,
  };
}
export { locales, htmlLangs, messages };
