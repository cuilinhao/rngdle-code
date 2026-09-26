# RNGDLE.ART — scope and acceptance

## Baseline (2026-09-26)

The local workspace and `cuilinhao/rngdle-code` repository are empty. No existing application logic is being replaced. Reference: https://rngdle.net/ and its publicly documented flows. Workflow: https://github.com/Jane-xiaoer/claude-skill-web-clone (v1.6.0).

The reference site's terms reserve its code, design and generated content. No reusable source repository was identified. This project will independently implement mathematical features and equivalent user flows, with original code, wording, typography and monochrome styling. No original bundles, proprietary assets, tracking, or private APIs will be shipped. Reference scores must not be asserted identical without evidence.

## Changes

1. Build an independent numeric rarity engine over integers 0–1,000,000 inclusive, using exact feature counts and score distribution calculated at build time. Natural decimal notation, no leading zeros. Document all rules and differences.
2. Implement analysis, unlimited rolls (single, batch, turbo and stop conditions), daily games (draft, hunt and quiz), comparison, explorer, digit sandbox, pattern atlas and explanatory pages.
3. Store game progress and settings locally. Dates use UTC. Provide shareable number links and downloadable number cards.
4. Black/white/gray light and dark themes, six complete locales (en-US, zh-CN, ja, ko, de, fr), English default regardless of browser language, persistent manual choice.
5. Responsive layouts and accessible native inputs; localized URLs, titles and descriptions, sitemap and robots.
6. Validate locally using real Chromium in the Codex environment, fix problems, commit to specified main branch, deploy to Vercel, configure rngdle.art where account access permits, and repeat acceptance checks online.

## Acceptance matrix (each must have evidence)

| ID | Check | Local | Production |
|---|---|---|---|
| A01 | All primary and informational routes, navigation and direct reload | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A02 | Integer validation: empty, negatives, fractions, 0, 1, 1,000,000, overflow | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A03 | Mathematical traits, exact full-range distribution and percentile | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A04 | Single/batch/turbo rolls, stopping and tab visibility | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A05 | Recent/saved numbers, persistence, reset semantics | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A06 | Deterministic daily draft, hunt and quiz; lock and scoring | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A07 | UTC rollover, resumed rounds, practice and streaks | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A08 | Comparison, random battle and quiz | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A09 | Explorer exact counts, constraints, random match and no results | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A10 | Sandbox editing, keyboard, length and best one-digit improvement | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A11 | Atlas pattern detail, progress and guides | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A12 | Six locales, English default, route preservation and saved preference | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A13 | Both themes, saved preference and readable monochrome state | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A14 | Share links, clipboard fallback and generated card | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A15 | 390/768/1440 layouts, keyboard and reduced motion | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A16 | Console/page/network errors, typecheck and production build | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A17 | Metadata, language tags, sitemap, robots and 404 | Pass (see VERIFICATION.md) | Pass (see VERIFICATION.md) |
| A18 | GitHub main SHA, Vercel deployment and HTTPS/domain | N/A | Pass (see VERIFICATION.md) |

Statuses: Pass / Fail / Not verified. Browser and test outputs will be retained in verification/. A check is never passed merely by inspecting code. Remote account access and DNS propagation will be reported separately if unavailable.

## Known scope boundaries

Local collections and daily results are device-specific, as on the reference. A public global leaderboard requires a separate persistent service and is not represented by fictional players or mock rankings. No account or payment flows are required. Initial implementation focuses on the accepted main site features; any unresolved difference must be listed in the final report.
