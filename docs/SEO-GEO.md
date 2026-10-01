# SEO / GEO 实施与运维

需求来源：项目根目录 `seo+GEO.md`。原文不改动，示例数据必须与实际引擎核对。

## 已实现的站内功能

- 首页、31 个模式页、方法论的关键词标题、H1、可引用摘要和可见 FAQ；英文与中文内容优先。
- HTML head 直接预渲染 JSON-LD，FAQ 正文与标记从同一模型生成；客户端导航同步 metadata。
- WebSite、Organization、SoftwareApplication、DefinedTerm、Dataset（全部模式）、Article、ItemList、BreadcrumbList、FAQPage、AboutPage。
- 全范围 0–1,000,000 的 Top 100 和全部模式榜首；现有从 1,000 开始的旧 leaderboard 保留，注明口径。
- `daily/answer` 及按日期页面、30 条一页的月分组归档。当天轮换模式与另外两个确定性 seed 解答分开标注。
- 每日快照存入 `public/data/daily/YYYY-MM-DD.json`；从项目上线日开始补齐漏日，禁止未来日期，不重写历史快照。
- `/llms.txt`、1200×630 PNG、Open Graph / Twitter 卡片、canonical / hreflang、XML sitemap。
- en / zh 可索引；ja / ko / de / fr 可访问但 noindex,follow，且不列入 sitemap / hreflang。

## 口径修正

- `percentile()` 返回同分或更高分的占比，即 Top X%；较小的 X 更稀有。并非数值越大越稀有的传统百分位。
- 每个具体数字在均匀抽取时等概率；本站比较的是数字特征的稀缺性，不预测中奖概率。
- 独立 RNGDLE.ART 的算法和答案不代表 rngdle.com 或其他同名游戏。
- 当天只有一个轮换模式。答案页同时展示三个模式的确定性解答，并明确哪些是当天正式挑战。
- 未发布的明日不生成空页，也不链接到 404。已有前后日期才提供导航；上线首日没有昨日历史。
- Google Indexing API 仅适用于招聘与特定直播页面，本站通过 sitemap / GSC 提交，见[官方适用范围](https://developers.google.com/search/apis/indexing-api/v3/quickstart)。
- Google 已于 2026-05 取消 FAQ 富媒体搜索展示；FAQPage 可保留供语义消费者使用，但 Rich Results 无 FAQ 展示不等于无效。llms.txt 不影响 Google 搜索排名，见[官方更新记录](https://developers.google.com/search/updates)。

## 本地验证

使用 Node 22：

```sh
npm ci
npm run build
npm test
npm run test:seo
node scripts/serve-production.mjs
# 另一个终端
BASE_URL=http://127.0.0.1:4173 npm run test:browser
```

`npm run build` 顺序：全范围引擎数据 → SEO 与每日数据 → 社交 PNG → 类型检查 → 浏览器 bundle → SSR bundle → HTML、sitemap 和 llms.txt。

`verification/prerender.json` 分别记录总 HTML 数与可索引 URL 数。初次完成包含原有 94 个 en/zh URL，加榜单、归档、首日答案各 2 个，共 100 个索引 URL；之后随历史积累增长。

## 每日自动发布

仓库工作流 `.github/workflows/daily-answers.yml` 每天 UTC 00:05 运行，也支持手动触发。GitHub Actions 的调度可能排队或延迟，[官方调度说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。

启用条件：

1. 将已验证的实现合入仓库默认分支 `main`。
2. Cloudflare Pages 项目 `rngdle-art` 连接本仓库 `main`。工作流推送快照提交即触发生产构建，无需 Deploy Hook 或 secret。（2026-10-01 前使用 Vercel Deploy Hook，见下方历史记录。）
3. 仓库允许 Actions 的 `contents: write`，分支策略允许工作流提交快照；否则该步骤会明确失败。
4. 手动运行一次 Publish daily answers，确认保存快照、构建及测试通过、Cloudflare Pages 部署成功，并检查当天 URL 和 sitemap。

工作流先构建与验收，再以中文提交信息保存快照与清单；推送即触发 Cloudflare Pages 生产构建，最后等待并核验正式域名内容。若 main 在测试期间变化，push 会安全失败，应重跑工作流以验证最新代码，不将未测试的 rebase 结果发布。

构建只读已有快照；引擎版本变动不改历史日期记录。历史日期页面显示当时的引擎版本。当前常青榜单随引擎源码和生成器变更重新计算。

当已有今日快照与新引擎的 seed / 分数不一致时，构建会阻止部署，需恢复匹配引擎或等待下一个 UTC 日期再升级。发现历史中存在不同引擎版本时，缺失的过去日期不使用新引擎伪造补齐；保留归档空缺，只有找回对应日期的原始引擎后才做明确回填。

## 上线后的 GSC 检查

只有生产部署确认成功后才操作：

- 检查 `https://rngdle.art/sitemap.xml` 仅列 en/zh。
- 通过已有 Domain 属性 `sc-domain:rngdle.art` 的 URL Inspection，分别检查 `/en`、`/en/methodology`、`/en/patterns/palindrome`、`/en/patterns/harshad`、`/en/patterns/repdigit`，再请求编入索引。
- 提交成功只代表请求已接收；收录、排名、AI 引用均需之后观察，不能由本地测试证明。

文档中要求用户后续推进的站外文章分发与新 GitHub 推荐目录，不作为本次站内代码工作的自动发布动作。

## 早期本地验收记录（历史；2026-09-26 上线前）

以下是合并绿色主题与生产发布之前的过程记录，保留供追溯；当前结论以末尾的本次上线记录和最终报告为准。

- 分支：`codex/seo-geo`，实现保留在本地工作区，未部署生产。
- Node 22.23.3：完整构建通过，生成 288 个 HTML，sitemap 收录候选 100 个，仅 en / zh。
- 引擎与数据单测 31/31；静态 SEO 测试 6/6；真实 Chrome 浏览器验收 33/33。
- 本地 HTTP 检查 296/296，含全部页面、sitemap、robots、llms、PNG 及无效日期/分页的 404。
- 31 个英文模式页的解释正文最少 257 词；所有 FAQ 标记均能在可见正文中逐字找到。
- 288 个页面的标题、H1、canonical 和 JSON-LD 无重复；所有静态内部链接存在；图片均为 1200×630。
- 独立审查已完成，未遗留需要修复的 SEO 功能问题。
- GitHub CLI 当前未登录，未设置或核实远程 Deploy Hook secret；未执行部署或 GSC URL Inspection。

日志：`verification/seo-build-tests.log`、`verification/seo-browser.log`、`verification/seo-http-results.json`。

## 本次实际上线与验收记录（2026-09-26）

- 应用已合入并推送 `main`：`134ff99db40726757a191d6d83000a642391eaa6`，包含 SEO / GEO、每日答案归档及绿色主题。
- Node 22 完整构建与 TypeScript 检查通过；引擎/数据单测 **31/31**，静态 SEO **6/6**。本地与正式域名真实 Chrome 各 **39/39**，生产测试 0 失败、0 跳过、0 flaky。
- 当前生成 **288 个 HTML、100 个 sitemap URL**；仅 en / zh 可索引，其余四语言仍可访问并标记 `noindex,follow`。
- 最新本地 HTTP **318/318 项、4233/4233 条断言**；正式域名 HTTP **319/319 项、4234/4234 条断言**，均 0 失败、0 警告、0 网络重试。线上额外执行部署内容等待检查，因此比本地多一项、一条断言。每页 HTML、JS/CSS、引擎数据及每日快照均按构建或 Git 提交核对 SHA256。
- 首次正式部署 `dpl_C25KmJPHbS1XATt8Pvd4ws87ESeE` 已确认为 `production / READY`，Git SHA 与上述提交一致；随后由每日 Hook 创建的 `dpl_FNF83Zm1ZgqP66XzhaszPMBkA71d` 也已 `READY`，同一 SHA，并关联 `rngdle.art` 与 `www.rngdle.art`。
- 通过林豪浏览器的已登录界面创建绑定 `main` 的 `RNGDLE Daily Answers` Deploy Hook，并成功添加 GitHub 仓库 secret `VERCEL_DEPLOY_HOOK`。文档与验收记录不保存 Hook 密钥 URL。
- 每日自动发布已配置为 **UTC 00:05（北京时间 08:05）**。首次手动运行 [Publish daily answers #36236434586](https://github.com/cuilinhao/rngdle-code/actions/runs/36236434586) 已成功，全部 **16 个步骤**通过，包含构建、测试、快照保存检查、main 一致性检查、请求部署、生产内容验收和附件上传。该记录证明手动完整链路已运行，不声称已经实际等到下一次 cron 时点；调度及构建仍可能排队。
- 本次已重新提交 `https://rngdle.art/sitemap.xml`，GSC 界面确认 **成功、已发现 100 个网页**。早期的 282 是旧版本记录，不是当前 sitemap 数量；“已发现”不等于已经收录。
- 五个指定 URL 已逐项完成 Inspection 和索引请求；Google 富媒体初测发现的两条日期警告已修复，复测 3 项有效内容且无警告。具体结果及未实际收录的边界见下文。

完整逐项结论见[本次发布最终报告](../verification/release-acceptance.md)。原始证据：[构建与测试](../verification/release-local-build.log)、[本地 Chrome](../verification/release-local-browser.log)、[生产 Chrome](../verification/release-production-browser-results.json)、[本地 HTTP](../verification/release-local-http.json)、[生产 HTTP](../verification/release-production-http.json)、[首次部署身份](../verification/release-vercel-deployment.json)、[每日工作流及 Hook 部署](../verification/release-daily-workflow.json)。

## Google 实测修复与最终应用版本

最终应用提交为 `c13184b1122f22e181ee4f49670f9312d9293224`。Google Rich Results 初测发现 Article 的 `datePublished` 只有日期，产生“无效日期时间/缺时区”两条非严重警告；已改用有 Vercel 首次生产记录依据的 UTC 发布时间，正文 `<time>` 与 JSON-LD 共用来源，历史每日快照保持原样。

- 在隔离工作区复验构建、7/7 静态 SEO、本地有界面 Chrome 3/3；正式域名有界面 Chrome 增量 3/3。此前完整 39/39 业务回归对应 `134ff99`，本次没有把增量测试冒充再次完整回归。
- 修复后的本地 HTTP 318/318、4233/4233 条断言；生产 HTTP 319/319、4234/4234 条断言，均 0 失败、0 警告、0 重试。
- [GitHub Verify 36237344680](https://github.com/cuilinhao/rngdle-code/actions/runs/36237344680) 成功；Vercel `dpl_8vuJWLD8N1WcW4zQ7ocFV1Z7yHDV` 于 `2026-09-26T10:57:52.577Z` 达到生产 READY，Git SHA 及正式域名别名均已核实。
- 林豪浏览器中的 [Google 富媒体复测](https://search.google.com/test/rich-results/result?id=eHeXVCRPTyWUDuHrSiuzHw) 于北京时间 19:00:02 成功：Article、Breadcrumb、Carousel 共 3 项有效内容，日期警告消失，无工具报告的错误或非严重问题。
- 首页、methodology、palindrome、harshad、repdigit 五个 URL 均已完成 URL Inspection，并分别显示“已请求编入索引”。检查时五页均尚未收录，请求接收不代表已收录、获得排名或 AI 引用。

本次新增应用代码已推送 GitHub `main`；后续只含验收文件的提交不改变应用内容。

最终证据：[隔离构建与浏览器](../verification/release-date-fix-isolated.log)、[生产浏览器](../verification/release-date-fix-production-browser.log)、[生产 HTTP](../verification/release-date-fix-production-http.json)、[Google UI 记录](../verification/release-google-checks.json)。
