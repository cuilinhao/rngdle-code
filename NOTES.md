# Implementation notes

- Requested reference: https://rngdle.net/
- Requested workflow: Jane-xiaoer/claude-skill-web-clone v1.6.0; MIT utilities copied with license under scripts/vendor/web-clone.
- Baseline: empty local directory and empty cuilinhao/rngdle-code repository.
- Complexity: L3 multi-route interactive frontend with exact mathematical data; no WebGL, login, payment or private API dependency.
- Mode: independent functional and structural recreation with requested monochrome rebrand and six locales.
- Reconnaissance: real browser captures at 1440, 768 and 390 px; route map at RECON/routes/original-route-map.json. Original dark page uses a centered calculator, feature cards, mathematical details, navigation and footer. It also displayed third-party advertising in one capture; that is excluded.
- Source evidence: public methodology and pattern definitions supplied the behavioral reference. GitHub search did not identify a reusable source repository for rngdle.net. Original terms reserve its materials. No original JavaScript/CSS bundles or copy were incorporated into the application.
- Engine: independent enumeration reproduces all 31 published counts, the seven rarity thresholds, 807 distinct scores and a maximum of 1,677. Reference samples 142857=222 and 524287=625 agree. This is measured agreement, not a claim that every undocumented upstream behavior is identical.
- Fonts and assets: system fonts; original CSS graph and monochrome mark; Lucide icons. No external fonts or advertising. GA4 was added on 2026-09-26 for production page usage statistics; see README.md and the localized privacy page.
- Language: all 266 message entries provide six explicit translations; no fallback-English strings in application UI. Proper names, numeric formulas and EP remain unchanged intentionally.
- State: localStorage namespace rngdle.art; manual analysis does not collect atlas patterns; daily specimens do. UTC challenge rotation uses our own deterministic seed, so daily numbers differ from upstream.
- Run: npm ci; npm run dev. Build: npm run build. Verification: README.md and VERIFICATION.md.
- Known differences: original code and exact visual assets are not mirrored; new monochrome branding, original wording, system font, new daily seeds; no upstream anonymous global leaderboard or account sync. All visible shipped features are functional.
