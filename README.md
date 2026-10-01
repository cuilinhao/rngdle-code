# RNGDLE.ART

A number rarity lab with a Catskills-inspired leaf theme: light (pale leaf) by default, with a switchable dark (forest) theme. Interfaces in English (US), Simplified Chinese, Japanese, Korean, German and French.

Typefaces are Instrument Sans (body) and Instrument Serif (display), both under the SIL Open Font License 1.1. They are self-hosted from the `@fontsource/instrument-sans` and `@fontsource/instrument-serif` npm packages and bundled into `dist/assets`, so the site makes no requests to Google Fonts.

## Develop

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

The site runs at `http://127.0.0.1:5173`. Locale routes use `/en`, `/zh`, `/ja`, `/ko`, `/de`, `/fr`. The root defaults to English regardless of browser language and remembers a manual preference. Explicit locale URLs always keep their requested language.

## Build and verify

```sh
npm run build
npm test
node scripts/serve-production.mjs
# In another terminal (Chrome installed locally):
BASE_URL=http://127.0.0.1:4173 npm run test:browser
```

CI installs Playwright Chromium and runs the browser suite headlessly. Local acceptance was also run in real headed Chrome from the Codex environment. The tests use isolated profiles, never the user's browsing data. `PLAN.md` contains the agreed acceptance matrix; `VERIFICATION.md` records actual outcomes and limitations.

## Features

- Analyze integers 0–1,000,000, with 31 named patterns, digit statistics, factorization, rarity scores and exact percentiles.
- Unlimited single/batch/turbo rolls, target stops, saved numbers, personal best and local session state.
- Deterministic UTC daily draft, pattern hunt and quiz, saved attempts, practice and streaks.
- Number comparisons, exact full-range pattern explorer in a Web Worker, keyboard digit sandbox and best one-digit edit.
- Pattern atlas stamped only by daily specimens; guides, methodology and score rankings.
- Shareable number URLs and downloadable PNG cards.
- Prerendered pages with canonical/alternate URLs, JSON-LD, social cards, sitemap and robots; only English and Chinese are indexed.
- Full-range rarest-number ranking and permanent daily answer snapshots with a crawlable archive.

## Architecture

`src/engine.mjs` defines the mathematics. `scripts/build-data.mjs` enumerates the entire range and generates independently calculated counts, a 2 MB score index and a 4 MB pattern index. Main page analysis is immediate; larger indices load only for games/exploration. No private upstream APIs are used.

`src/core.tsx` owns preferences and storage, `src/games.mjs` pure game rules, and the page files consume the same shared engine. `scripts/ssr.tsx` renders static content at build time; React then attaches the interactive application. Cloudflare Pages serves `dist` as static files with clean URLs and a real 404 page.

The app intentionally stores progress only in this browser. Clearing storage or switching devices starts fresh. There is no account system, shared global leaderboard, or cross-device sync. Anonymous competitor data is never fabricated.

## Provenance

The requested [Web Clone skill](https://github.com/Jane-xiaoer/claude-skill-web-clone) informed reconnaissance and verification. Its MIT-licensed utilities and license are in `scripts/vendor/web-clone`. Application code, wording and layout are independently authored. The current theme colors reference [Catskills](https://catskills-showcase.pages.dev/); its assets, fonts and layout are not copied. Reference evidence is documented in `NOTES.md` and `TEARDOWN.md`; original site's bundles and tracking scripts are not shipped. RNGDLE.ART is independent of rngdle.com and similarly named games.

## Deployment

Repository: `git@github.com:cuilinhao/rngdle-code.git`, branch `main`.

Hosting is Cloudflare Pages (project `rngdle-art`, connected to this repository). Every push to `main` builds with `npm run build` and publishes `dist`; there is no manual deploy command. Response headers are in `public/_headers` and redirects in `public/_redirects`. DNS for `rngdle.art` is managed in Cloudflare (registrar: Namecheap). No secrets are required by the application.

`.github/workflows/remote-acceptance.yml` (manual) checks any origin: URL behavior against a reference origin, response headers, search/AI crawler access, published HTML hashes and SEO metadata, and the Playwright suite. See `DEPLOYMENT.md` and `docs/CLOUDFLARE-MIGRATION.md` for the current deployment and the migration from Vercel.

## Analytics and Search Console

GA4 uses the public measurement ID `G-FN1KFQ0VMX`, configured in `src/analytics.mjs`. It runs only in production builds served from `rngdle.art` or `www.rngdle.art`; localhost, `pages.dev` and other preview hosts do not send analytics. Each new page path sends one `page_view` after the localized title is updated, including language changes and browser back/forward navigation. Editing a number or changing the theme does not send another page view. Reported page URLs and referrers exclude query strings and fragments.

Keep **Enhanced measurement disabled** for the `RNGDLE.ART Web` stream: page views are sent by the app with `send_page_view: false`, and enabling automatic history tracking would double-count navigation. See [Google's manual pageview guidance](https://developers.google.com/analytics/devguides/collection/ga4/views). Form and site-search collection are also disabled. Google signals and ad personalization are disabled in the client configuration. The privacy page describes GA4 usage in all six languages.

The existing Search Console Domain property `sc-domain:rngdle.art` is verified through a DNS TXT record (now in Cloudflare DNS). Keep that record; no HTML verification tag is needed. The sitemap is generated during every build at `https://rngdle.art/sitemap.xml` and referenced by `robots.txt`.

## SEO and daily publishing

`docs/SEO-GEO.md` documents the content models, indexing policy, verification commands and activation steps for the UTC daily publishing workflow. `npm run test:seo` checks the built HTML, FAQ/schema parity, complete ranking, image dimensions and internal links. Scheduled publication needs the workflow on main; the snapshot commit it pushes triggers the Cloudflare Pages production build.
