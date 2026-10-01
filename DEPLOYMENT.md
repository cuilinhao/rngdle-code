# Deployment record

## Current deployment — Cloudflare Pages (since 2026-10-01)

- Repository: https://github.com/cuilinhao/rngdle-code ; branch `main`.
- Hosting: Cloudflare Pages project `rngdle-art` (account Cuilinhao2021), connected through the "Cloudflare Workers and Pages" GitHub App (access limited to this repository). Every push to `main` runs `npm run build` (Node 22, `NODE_VERSION=22`) and publishes `dist`; a build takes about one minute.
- Domains: https://rngdle.art and https://www.rngdle.art both serve the site directly (canonical URLs point to `rngdle.art`). Fallback: https://rngdle-art.pages.dev (returns `X-Robots-Tag: noindex`).
- DNS: Cloudflare (nameservers `liberty.ns.cloudflare.com`, `milan.ns.cloudflare.com`, set at Namecheap; DNSSEC off). Records: `@` and `www` CNAME `rngdle-art.pages.dev` (proxied), Google site verification TXT, `v=spf1 -all`, `_dmarc` `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s`.
- Headers and redirects: `public/_headers`, `public/_redirects`. Cloudflare features that rewrite HTML (email obfuscation, Rocket Loader, automatic HTTPS rewrites, RUM injection) are off; AI crawlers are allowed and Cloudflare does not manage `robots.txt`.
- Daily answers: `.github/workflows/daily-answers.yml` pushes the snapshot commit, which triggers the Pages production build, then verifies https://rngdle.art. No deploy hook or secret is used.
- Acceptance: `.github/workflows/remote-acceptance.yml` (manual). Cut-over runs 36841184578 (`rngdle.art`) and 36841344830 (`www.rngdle.art`) against the Vercel deployment as reference: 184/184 URL behaviors identical, 4473/4473 content checks, 75/75 browser tests.
- Migration plan and log: `docs/CLOUDFLARE-MIGRATION.md`. Vercel is no longer used; everything below is history.

## Deployment record — 2026-09-26 (Vercel, historical)

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
- Application commit: `a568b313b23d352413a2ca9bb17905b288f55174`. Vercel reports a successful production deployment at https://vercel.com/linhaos-projects/rngdle-art/2on7Xn8V3R4YiJj4YpGwBahsSkMW ; GitHub CI passed at https://github.com/cuilinhao/rngdle-code/actions/runs/36233055794 .
- Production HTTP checks confirmed the deployed JavaScript contains the correct measurement ID, all six privacy pages describe GA4, the sitemap contains 282 URLs, and robots.txt points to that sitemap.
- A production page load and SPA navigation were exercised in Chrome. Receipt in GA4 Realtime was not yet confirmed at handoff; concurrent use of Chrome interrupted the final network/report verification. Do not treat the deployment checks as proof that Google has processed events.

## SEO / GEO 与绿色主题上线 — 2026-09-26

本节记录最新应用版本。上面的应用提交、30 项浏览器测试及 282 个 sitemap URL 等结果属于更早版本，保留为部署历史；最新逐项结论见 [release-acceptance.md](verification/release-acceptance.md)。

- 应用 `main` 提交：`134ff99db40726757a191d6d83000a642391eaa6`，已完成 SEO / GEO、每日答案归档与绿色主题合并。
- 完整构建、TypeScript、31/31 引擎/数据单测、6/6 静态 SEO 测试通过；本地及正式域名真实 Chrome 各 39/39 通过，生产 0 失败、0 跳过、0 flaky。
- 当前为 288 个预渲染 HTML，sitemap 仅包含 en / zh 的 100 个 URL。最新本地 HTTP 318/318 项、4233/4233 条断言；生产 HTTP 319/319 项、4234/4234 条断言，均通过且无警告、无网络重试。生产比本地多一次部署内容等待检查。
- 首次应用部署：`dpl_C25KmJPHbS1XATt8Pvd4ws87ESeE`，[`rngdle-i5b5j9axw-linhaos-projects.vercel.app`](https://rngdle-i5b5j9axw-linhaos-projects.vercel.app)，`production / READY`；Vercel 返回的 Git SHA 与上述完整提交一致。
- 已通过林豪浏览器界面创建绑定 `main` 的 `RNGDLE Daily Answers` Deploy Hook，并成功添加 GitHub 仓库 secret `VERCEL_DEPLOY_HOOK`；Hook 密钥 URL 不写入仓库或报告。
- `.github/workflows/daily-answers.yml` 已配置每天 **UTC 00:05（北京时间 08:05）**自动发布。首次手动运行 [36236434586](https://github.com/cuilinhao/rngdle-code/actions/runs/36236434586) 已完成，16 个实际步骤全部成功，并上传 `daily-answer-verification` 附件。计划任务可能排队；手动通过不代表已实际观察到下一次定时运行。
- 此次工作流创建的 Hook 部署为 `dpl_FNF83Zm1ZgqP66XzhaszPMBkA71d`，[`rngdle-4hgwz1yu6-linhaos-projects.vercel.app`](https://rngdle-4hgwz1yu6-linhaos-projects.vercel.app)，于 `2026-09-26T10:39:57.733Z` 达到 `production / READY`。Git SHA 与 `main` 的上述提交一致，别名包含 `rngdle.art` 和 `www.rngdle.art`。
- GSC 本次重新提交 sitemap 后，界面显示**成功、已发现 100 个网页**，取代早期 282 的当前状态。五个 URL Inspection / 请求编入索引和 Rich Results Test 的实际结果见最终报告，不从部署或 HTTP 通过推断 Google 收录与富结果状态。

证据：[本地 HTTP](verification/release-local-http.json)、[生产 HTTP](verification/release-production-http.json)、[生产浏览器](verification/release-production-browser-results.json)、[首次部署身份](verification/release-vercel-deployment.json)、[每日工作流与 Hook 部署](verification/release-daily-workflow.json)。

## Google 实测修复与最终应用版本

最终应用提交为 `c13184b1122f22e181ee4f49670f9312d9293224`。Google Rich Results 初测发现 Article 的 `datePublished` 只有日期，产生“无效日期时间/缺时区”两条非严重警告；已改用有 Vercel 首次生产记录依据的 UTC 发布时间，正文 `<time>` 与 JSON-LD 共用来源，历史每日快照保持原样。

- 在隔离工作区复验构建、7/7 静态 SEO、本地有界面 Chrome 3/3；正式域名有界面 Chrome 增量 3/3。此前完整 39/39 业务回归对应 `134ff99`，本次没有把增量测试冒充再次完整回归。
- 修复后的本地 HTTP 318/318、4233/4233 条断言；生产 HTTP 319/319、4234/4234 条断言，均 0 失败、0 警告、0 重试。
- [GitHub Verify 36237344680](https://github.com/cuilinhao/rngdle-code/actions/runs/36237344680) 成功；Vercel `dpl_8vuJWLD8N1WcW4zQ7ocFV1Z7yHDV` 于 `2026-09-26T10:57:52.577Z` 达到生产 READY，Git SHA 及正式域名别名均已核实。
- 林豪浏览器中的 [Google 富媒体复测](https://search.google.com/test/rich-results/result?id=eHeXVCRPTyWUDuHrSiuzHw) 于北京时间 19:00:02 成功：Article、Breadcrumb、Carousel 共 3 项有效内容，日期警告消失，无工具报告的错误或非严重问题。
- 首页、methodology、palindrome、harshad、repdigit 五个 URL 均已完成 URL Inspection，并分别显示“已请求编入索引”。检查时五页均尚未收录，请求接收不代表已收录、获得排名或 AI 引用。

本次新增应用代码已推送 GitHub `main`；后续只含验收文件的提交不改变应用内容。

最终证据：[部署身份](verification/release-date-fix-deployment.json)、[生产 HTTP](verification/release-date-fix-production-http.json)、[Google UI 记录](verification/release-google-checks.json)、[逐项验收](verification/release-acceptance.md)。
