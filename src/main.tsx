import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Sun,
  Moon,
  Menu,
  X,
  Globe2,
  ArrowUpRight,
  Dices,
  ChartNoAxesCombined,
  FlaskConical,
  BookOpen,
  ArrowLeftRight,
  Compass,
  CalendarDays,
} from "lucide-react";
import {
  locales,
  localeNames,
  htmlLangs,
  defaultLocale,
  translate,
  messages,
  type Locale,
} from "./i18n";
import "./pattern-text";
import {
  A,
  AppContext,
  useApp,
  PageHead,
  readStorage,
  writeStorage,
  recordRecent,
} from "./core";
import {
  NumberForm,
  Result,
  Recent,
  ShareDialog,
  TierTable,
} from "./components";
import { parseNumber } from "./engine.mjs";
import { trackPageView } from "./analytics.mjs";
import Infinite from "./Infinite";
import Daily from "./Daily";
import { Compare, Sandbox, Explore, Atlas, NotFound } from "./Tools";
import { Guides, Article } from "./Guides";
import { GuideArticle } from "./GuideArticles";
import { englishGuideRoutes } from "./guide-content";
import "./style.css";
import "./seo.css";
import { HomeSeoSections } from "./SeoSections";
import { homeContent } from "./seo-content";
import { RarestNumbers } from "./RarestNumbers";
import { DailyAnswer, DailyArchive } from "./DailyAnswers";
import { applySeo, dailyDate, isKnownRoute, indexLocales } from "./seo";
export const routes = [
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
const routeFor = (key: string) => (key === "analyze" ? "/" : "/" + key);
function initialLocation() {
  const parts = location.pathname.split("/").filter(Boolean);
  let locale = parts[0] as Locale;
  if (!locales.includes(locale)) {
    locale = defaultLocale(readStorage("language", ""));
    const rest = location.pathname === "/" ? "" : location.pathname;
    history.replaceState(
      null,
      "",
      "/" + locale + rest + location.search + location.hash,
    );
  }
  return locale;
}
const initialLocale = initialLocation();
function Home() {
  const { t, locale } = useApp(),
    content = homeContent(locale),
    q = new URLSearchParams(location.search),
    [n, setN] = useState(parseNumber(q.get("n") ?? "142857") ?? 142857);
  useEffect(() => {
    setN(
      parseNumber(new URLSearchParams(location.search).get("n") ?? "142857") ??
        142857,
    );
  }, [location.search]);
  function change(value: number) {
    setN(value);
    recordRecent(value);
    const url = new URL(location.href);
    url.searchParams.set("n", String(value));
    history.replaceState(null, "", url);
  }
  return (
    <>
      <PageHead
        eyebrow={t("lab")}
        title={content.h1}
        description={content.summary}
      />
      <div className="hero-links">
        <A to="/infinite" className="button primary">
          {t("play")}
          <ArrowUpRight size={16} />
        </A>
        <A to="/sandbox" className="text-link">
          {t("sandbox")}
          <ArrowUpRight size={16} />
        </A>
      </div>
      <div className="narrow">
        <section className="panel calculator">
          <NumberForm initial={n} onChange={change} />
          <Recent />
        </section>
        <Result n={n} />
        <TierTable />
      </div>
      <HomeSeoSections />
      <div className="section-heading feature-heading">
        <h2>{t("tools")}</h2>
        <span className="small muted">RNGDLE.ART</span>
      </div>
      <div className="feature-grid">
        {[
          ["infinite", "rollIntro", Dices],
          ["daily", "dailyIntro", CalendarDays],
          ["compare", "compareIntro", ArrowLeftRight],
          ["explore", "exploreIntro", Compass],
          ["sandbox", "sandboxIntro", FlaskConical],
          ["patterns", "atlasIntro", BookOpen],
        ].map(([key, desc, Icon]: any) => (
          <A to={"/" + key} className="feature-card panel" key={key}>
            <Icon size={24} />
            <h3>{t(key)}</h3>
            <p className="small muted">{t(desc)}</p>
            <ArrowUpRight className="corner-arrow" size={18} />
          </A>
        ))}
      </div>
    </>
  );
}
function Header({
  theme,
  setTheme,
  setLocale,
}: {
  theme: string;
  setTheme: (s: string) => void;
  setLocale: (l: Locale) => void;
}) {
  const { t, locale } = useApp(),
    [open, setOpen] = useState(false),
    current = location.pathname.split("/")[2] || "analyze";
  return (
    <header className="header">
      <div className="header-inner">
        <A to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">λ</span>
          <span>
            RNGDLE<span className="brand-art">.ART</span>
            <small>{t("lab")}</small>
          </span>
        </A>
        <nav
          className={open ? "navigation open" : "navigation"}
          aria-label={t("menu")}
        >
          {nav.map((key) => (
            <span key={key} onClick={() => setOpen(false)}>
              <A
                to={routeFor(key)}
                className={current === key ? "active" : ""}
                aria-current={current === key ? "page" : undefined}
              >
                {t(key)}
              </A>
            </span>
          ))}
        </nav>
        <div className="header-controls">
          <label className="language-control">
            <Globe2 size={17} />
            <select
              aria-label={t("language")}
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
            >
              {locales.map((l, i) => (
                <option key={l} value={l}>
                  {localeNames[i]}
                </option>
              ))}
            </select>
          </label>
          <button
            className="icon-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={t(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            className="icon-button mobile-menu"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
function Footer() {
  const { t, locale } = useApp();
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <A to="/" className="brand">
            RNGDLE<span className="brand-art">.ART</span>
          </A>
          <p>{t("footer")}</p>
        </div>
        {[
          ["tools", ...nav.slice(0, 6)],
          [
            "learn",
            "patterns",
            "guides",
            "methodology",
            "badges",
            "leaderboard",
          ],
          ["site", "about", "privacy", "terms", "contact"],
        ].map(([heading, ...items]) => (
          <div key={heading}>
            <h2 className="label">{t(heading)}</h2>
            {items.map((item) => (
              <A key={item} to={routeFor(item)}>
                {t(item)}
              </A>
            ))}
          </div>
        ))}
      </div>
      {indexLocales.includes(locale) && (
        <div className="footer-bottom">
          <A to="/rarest-numbers">
            {locale === "zh" ? "最稀有数字榜单" : "Rarest numbers"}
          </A>
          <A to="/daily/answer">
            {locale === "zh" ? "每日答案归档" : "Daily answers archive"}
          </A>
        </div>
      )}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} RNGDLE.ART</span>
        <span>{t("exactNote")}</span>
      </div>
    </footer>
  );
}
function App() {
  const [locale, setLocaleState] = useState<Locale>(initialLocale),
    [url, setUrl] = useState(location.pathname + location.search),
    [theme, setThemeState] = useState(() => readStorage("theme", "light")),
    [toast, setToast] = useState(""),
    [shared, setShared] = useState<number | null>(null);
  const [dailyData, setDailyData] = useState<any>(() => {
    try {
      return JSON.parse(
        document.getElementById("daily-data")?.textContent || "null",
      );
    } catch {
      return null;
    }
  });
  const route = location.pathname.split("/").slice(2).filter(Boolean).join("/");
  function navigate(to: string) {
    const next = "/" + locale + (to === "/" ? "" : to);
    history.pushState(null, "", next);
    setUrl(next);
    window.scrollTo(0, 0);
  }
  function setLocale(l: Locale) {
    setLocaleState(l);
    writeStorage("language", l);
    const translatedRoute = isKnownRoute(l, route) ? route : "";
    const next =
      "/" +
      l +
      (translatedRoute ? "/" + translatedRoute : "") +
      location.search;
    history.replaceState(null, "", next);
    setUrl(next);
  }
  function setTheme(value: string) {
    setThemeState(value);
    writeStorage("theme", value);
  }
  useEffect(() => {
    function pop() {
      const l = location.pathname.split("/")[1] as Locale;
      if (locales.includes(l)) setLocaleState(l);
      setUrl(location.pathname + location.search);
    }
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#223a28" : "#eaefd1");
  }, [theme]);
  useEffect(() => {
    applySeo(locale, route, dailyData);
    trackPageView(import.meta.env.PROD);
  }, [url, locale, route, dailyData]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  let page: React.ReactNode;
  // Keep ad containers alive across locale/query changes; the number form
  // already follows location.search without remounting the whole homepage.
  if (!route) page = <Home />;
  else if (!isKnownRoute(locale, route)) page = <NotFound />;
  else if (route === "rarest-numbers") page = <RarestNumbers />;
  else if (dailyDate(route))
    page = (
      <DailyAnswer
        key={route}
        day={dailyDate(route)!}
        data={dailyData?.date === dailyDate(route) ? dailyData : undefined}
        onData={setDailyData}
      />
    );
  else if (route === "daily/answer" || route.startsWith("daily/answer/page/"))
    page = <DailyArchive page={Number(route.split("/").at(-1)) || 1} />;
  else if (route === "infinite") page = <Infinite />;
  else if (route === "daily") page = <Daily />;
  else if (route === "compare") page = <Compare key={url} />;
  else if (route === "explore") page = <Explore key={url} />;
  else if (route === "sandbox") page = <Sandbox key={url} />;
  else if (route === "patterns") page = <Atlas />;
  else if (route.startsWith("patterns/")) page = <Atlas id={route.slice(9)} />;
  else if (route === "guides") page = <Guides />;
  else if (englishGuideRoutes.includes(route)) page = <GuideArticle route={route} />;
  else if (routes.includes(route)) page = <Article name={route} />;
  else page = <NotFound />;
  return (
    <AppContext.Provider
      value={{ locale, navigate, notify: setToast, share: setShared }}
    >
      <a className="skip-link" href="#main">
        {translate(locale, "skip")}
      </a>
      <Header theme={theme} setTheme={setTheme} setLocale={setLocale} />
      <main id="main" data-ready="true" tabIndex={-1}>
        {page}
      </main>
      <Footer />
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {shared !== null && (
        <ShareDialog n={shared} onClose={() => setShared(null)} />
      )}
    </AppContext.Provider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
