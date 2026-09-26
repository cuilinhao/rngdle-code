# Release audit

- Application is independently implemented; no original bundles, private endpoints or embedded ads are shipped.
- Original brand/domain occurs only in the independence explanation and provenance documentation.
- Six translations are validated during build; 266 entries each have six nonempty strings.
- All score/count displays derive from exact local data. There are no invented users, fake leaderboard results, placeholder actions or hidden paid dependencies.
- No application credentials or environment secrets are required. node_modules, local auth, .vercel, .env and generated server intermediate output are ignored by Git.
- Production contains static dist output only. Research, test evidence and skill utilities are excluded from Vercel uploads.
- Production dependency audit returned 0 vulnerabilities on 2026-09-26. This is a point-in-time dependency check, not a full security audit.
- Metadata, static pages, direct links, data hashes and error paths are checked by scripts/verify-deployment.mjs.
- Browser/HTTP results and remaining deployment conditions are in VERIFICATION.md and DEPLOYMENT.md.
