# Technical behavior and evidence

## Reference evidence

SOURCE: https://rngdle.net/methodology documents range, full enumeration, seven feature groups, −log₂ likelihood, within-group decay weights and percentile thresholds. https://rngdle.net/patterns gives all 31 pattern definitions and counts. Browser-derived layout and route evidence is in RECON/.

SOURCE: /infinite documents local session state, batches, turbo targets, saved numbers and daily specimens. /daily documents daily shared seeds, three rotating games, UTC rollover and browser-local attempts. /sandbox documents natural decimal digits, six-digit editing, arrow-key navigation and one-digit optimization. /explore documents exact whole-range filters.

## This implementation

- `src/engine.mjs`: strict integer parsing; rejection-sampled cryptographic random rolls; independent digit/factorization feature extraction; exact count-based scores; versioned UTC seed and best-edit enumeration.
- `scripts/build-data.mjs`: scans every integer twice, writes exact feature counts, histogram/tail distribution, score index and pattern bitmap. Build caching is keyed to SHA-256 of the engine source.
- `src/games.mjs`: validates persisted attempts and computes results; draft has five distinct scores, hunt grades within a fixed 30-number deck, quiz has ten unambiguous pairs.
- `src/Daily.tsx`: persists attempts after each choice, uses wall-clock deadlines, rolls to a fresh day at midnight, and isolates practice state from daily results and streaks.
- `src/Infinite.tsx`: batch loop checks both targets after every roll, uses one shared persistent session model and stops its interval on unmount/hidden-page events.
- `src/Tools.tsx` and `src/explorer.worker.ts`: exact bitmap filtering off the main thread, neighborhood digit optimization, atlas and comparisons.
- `src/core.tsx`: shared storage, corruption fallbacks and cached binary loading with retry.
- `src/i18n.ts`, `src/pattern-text.ts`, `src/Guides.tsx`: explicit six-language content.
- `scripts/ssr.tsx`, `scripts/prerender.mjs`: 282 static pages plus sitemap/robots/404; React mounts interactive controls in the browser.

PARTIAL: no access to upstream private server leaderboard implementation. We do not call its endpoints or display mock global players.

PARTIAL: page-visibility pause is tested via a controlled hidden-document event and actual navigation away. The automated Chrome environment reported all opened pages as visible; a natural OS tab switch is not claimed as verified.

See tests/engine.test.mjs and tests/browser/acceptance.spec.ts for executable evidence and VERIFICATION.md for results.
