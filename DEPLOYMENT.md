# Deployment record — 2026-09-26

- Repository: https://github.com/cuilinhao/rngdle-code ; branch `main`.
- Application/dependency release: `1c6213af455d1e438e0fd668e8f563e33dd0aea1`.
- Vercel project: `linhaos-projects/rngdle-art`, connected to the GitHub repository. Main pushes automatically deploy to production.
- Verified application deployment: `dpl_AGfK4fPW43Gbf7wqZXqrcijSs6ZD` (Ready), https://rngdle-np6uds59f-linhaos-projects.vercel.app .
- Primary URL: https://rngdle.art ; Chinese entry: https://rngdle.art/zh .
- Additional domain: https://www.rngdle.art ; both hosts serve the same app, with canonical URLs pointing to rngdle.art.
- Backup URL: https://rngdle-art.vercel.app .
- GitHub build/test run for the application release: https://github.com/cuilinhao/rngdle-code/actions/runs/36226450999 — success.
- Later commits containing acceptance evidence and deployment documentation do not change application behavior. See GitHub main for the latest report commit.

## DNS and HTTPS

Namecheap Advanced DNS was edited through the already logged-in desktop browser and saved successfully. Nameservers remain `dns1.registrar-servers.com` and `dns2.registrar-servers.com`.

| Type | Host | Value | TTL |
|---|---|---|---|
| A | @ | 216.150.1.1 | 30 min |
| A | @ | 216.150.16.1 | Automatic |
| CNAME | www | ca491a073f28d8ac.vercel-dns-016.com. | 30 min |

The previous @ URL Redirect to http://www.rngdle.art/ was changed into the first A record; the previous www parking CNAME was updated. Existing email forwarding/TXT settings were retained. No other domains or nameservers were changed.

Both configured A records and the www CNAME were confirmed from the authoritative DNS. Vercel reports both domain configurations valid. Vercel automatically issued certificates for rngdle.art and www.rngdle.art; both HTTPS endpoints returned 200 with certificate verification enabled. Initial connection closures while certificates were being issued resolved without bypassing TLS verification.

## Production acceptance

The primary domain and backup Vercel alias each passed all 30 browser acceptance cases in real Chrome and 291 HTTP checks. Full details, bounded network retries and remaining scope limits are in VERIFICATION.md. No application secret, API key or environment variable is needed; Vercel authentication remains outside Git.

## English default and Google Search Console update

Application commit `e1190976978267b001005dfe2c647fa631cc4f5b` defaults first-time root visits to English while retaining saved manual language selections and explicit language routes. Its Vercel production deployment is `dpl_xApMNcKszW3yaQqUshJhwTCLLjQE` (Ready); GitHub CI passed at https://github.com/cuilinhao/rngdle-code/actions/runs/36227703995 . Local and production targeted Chrome checks each passed 7/7.

The user-selected Google account owns the verified Domain property `sc-domain:rngdle.art`. A Google site-verification TXT was added at Namecheap with host `@` and Automatic TTL; retain that record for continued verification. Existing web and mail DNS records were retained.

Search Console confirmed that https://rngdle.art/sitemap.xml was successfully processed on 2026-09-26 with 282 discovered pages. This confirms sitemap processing, not indexing of every page. Console: https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Arngdle.art .

## GA4 setup — 2026-09-26

- GA4 property: `rngdle.art` (`556025125`), in the existing Analytics account `359267652`.
- Web stream: `RNGDLE.ART Web` (`15848589477`), URL `https://rngdle.art`.
- Public measurement ID: `G-FN1KFQ0VMX`.
- Reporting time zone: China time (UTC+08:00); currency: CNY.
- Enhanced measurement was disabled and the saved data-stream details confirmed it is off. The app manages page views manually; keep automatic history, form and search measurement disabled.
- Analytics console: https://analytics.google.com/analytics/web/#/a359267652p556025125/reports/intelligenthome .
- GSC was rechecked in the live console: sitemap status remains **Success**, with **282 discovered pages**. DNS still contains the Google verification TXT record, and the production robots file points to the sitemap.
- Validation before deployment: Node `22.23.3` production build succeeded; all 23 unit tests (including 13 GA4 cases) and all 30 Chromium browser acceptance tests passed. The build regenerated 282 localized pages.
