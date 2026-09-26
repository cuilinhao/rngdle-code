# SEO / GEO 与绿色主题发布逐项验收

验证日期：2026-09-26。发布范围：按 [seo+GEO.md](../seo+GEO.md) 完成的站内 SEO / GEO、每日答案归档及远端绿色主题的合并版本。本文是本次发布记录；[旧 VERIFICATION.md](../VERIFICATION.md) 和 [SEO 实施文档中的早期验收](../docs/SEO-GEO.md) 保留历史意义，不能替代本次生产复验。

最终应用提交为 **`c13184b1122f22e181ee4f49670f9312d9293224`**，已推送 main，Vercel 生产 Ready、GitHub Verify 成功；最终线上 288 页全量 HTTP 为 **319/319 项、4234/4234 条断言通过**。Google Rich Results Test 日期问题已修复，最终 **3 个有效项目、0 严重错误、0 非严重警告**；GSC 新 sitemap 成功处理并发现 100 页，五个指定 URL 均已成功请求编入索引，**尚无已收录证据**。

测试分两轮：`134ff99...` 完成 31 项单测、6 项静态 SEO 及本地/线上各 **39 项真实 Chrome 全量回归**；`c13184b...` 仅修正 Article 日期及对应可见署名/测试，从隔离工作区构建，完成 **7 项静态 SEO、本地和线上各 3 项有界面 Chrome 增量回归**，并重新执行全量 HTTP。不能把上一轮 39 项写成最终提交再次执行了 39 项。每日发布工作流已在基线提交上完成一次成功的手动全流程，16 个步骤通过；归档与每日快照逻辑未被日期修复改变。

## 发布身份与本次证据

| 项目 | 已核实结果 | 证据 |
|---|---|---|
| 最终 main 应用提交 | `c13184b1122f22e181ee4f49670f9312d9293224`，标题「修复文章发布时间格式并通过富媒体日期回归检查」；父提交 `134ff99...` 为绿色主题与 SEO 合并版本 | [最终 CI / Vercel 身份](release-date-fix-deployment.json)、[基线部署身份](release-vercel-deployment.json) |
| 最终 Vercel 生产部署 | `dpl_8vuJWLD8N1WcW4zQ7ocFV1Z7yHDV`；production READY，main，SHA 精确匹配；`2026-09-26T10:57:52.577Z` Ready | [经过鉴权的部署查询结果](release-date-fix-deployment.json) |
| 最终 GitHub Verify | [run 36237344680](https://github.com/cuilinhao/rngdle-code/actions/runs/36237344680)，push 事件、`headSha=c13184b...`，success，14 个步骤全部成功 | [CI / 部署联合证据](release-date-fix-deployment.json) |
| 正式访问地址 | [rngdle.art](https://rngdle.art)；部署别名包括 apex、www 和 Vercel 域名。新版 HTTP 全量验收实际针对 apex，不据此宣称所有别名均重新完成全套验收 | [部署别名](release-date-fix-deployment.json)、[最终生产 HTTP](release-date-fix-production-http.json) |
| 基线本地构建与规则测试 | `134ff99...` TypeScript、浏览器/SSR 构建、预渲染通过；规则/数据单测 **31/31**，静态 SEO **6/6** | [基线构建及测试](release-local-build.log) |
| 基线本地真实浏览器 | `134ff99...` 有界面 Google Chrome **39/39**，含原业务 30 项、SEO 3 项和主题 6 项 | [基线本地浏览器](release-local-browser.log)、[浏览器配置](../playwright.config.ts) |
| 基线生产真实浏览器 | `134ff99...` 正式域名 Google Chrome **39/39**，0 失败、0 跳过、0 flaky；始于 `2026-09-26T10:37:27.126Z`，约 65 秒 | [基线生产日志](release-production-browser.log)、[基线结果 JSON](release-production-browser-results.json) |
| 日期修复本地增量 | 隔离工作区安装/构建通过，静态 SEO **7/7**，有界面 Chrome **3/3**；修复过程中另有 31/31 单测及先失败后通过的日期回归记录 | [隔离构建与增量浏览器](release-date-fix-isolated.log)、[日期修复过程日志](release-date-fix-local.log) |
| 日期修复生产增量 | `c13184b...` 正式域名有界面 Chrome **3/3**，0 失败、0 跳过、0 flaky；始于 `2026-09-26T11:00:13.191Z` | [最终生产增量日志](release-date-fix-production-browser.log)、[结果 JSON](release-date-fix-production-browser-results.json) |
| 最终本地 HTTP | `c13184b...` **318/318 项、4233/4233 条断言**，0 失败、0 warning、0 网络重试；`2026-09-26T11:01:42.746Z` | [最终本地 HTTP](release-date-fix-local-http.json) |
| 最终生产 HTTP | `c13184b...` **319/319 项、4234/4234 条断言**，0 失败、0 warning、0 网络重试；`2026-09-26T11:01:45.848Z`，Node 22.23.3 / curl | [最终生产 HTTP](release-date-fix-production-http.json) |
| 生产页面规模 | **288 个预渲染 HTML，100 个 sitemap URL**；仅 en / zh 可索引 | [预渲染清单](prerender.json)、[生产 HTTP 报告](release-date-fix-production-http.json) |
| 基线多日归档夹具 | 基于 `134ff99...` 的独立临时目录中真实 SSR / 预渲染，31 个合成日期、30/1 分页，**6/6** 检查通过；F06 为真实无头 Chromium en/zh 点击、刷新、相邻日期与边界检查；未加入正式站，也未在日期修复后重跑整套夹具 | [夹具说明](release-archive-fixture.md)、[夹具机器证据](release-archive-fixture.json) |
| 每日发布工作流 | [run 36236434586](https://github.com/cuilinhao/rngdle-code/actions/runs/36236434586) 的 `workflow_dispatch` 执行 **success**，16 个步骤全部成功，验收产物已上传；绑定 main 的 Hook 创建 `dpl_FNF83Zm1ZgqP66XzhaszPMBkA71d`，production READY，SHA 与 `134ff99...` 一致 | [GitHub / Vercel 联合证据](release-daily-workflow.json) |

生产 HTTP 报告不仅检查响应 200，还对每页 HTML、JS/CSS 响应和引擎/每日数据做 SHA256 比对，核对可见 FAQ、JSON-LD、canonical、hreflang、404、sitemap、robots、llms.txt 和 PNG 尺寸。`localExpectedCommit` 仅表示验收的本地预期提交；确切线上提交身份由独立 Vercel 部署记录提供。

[最终本地 HTTP](release-date-fix-local-http.json) 和 [最终生产 HTTP](release-date-fix-production-http.json) 均记录 `c13184b...`。本地 318/4233 与生产 319/4234 的差异仅是生产运行启用了额外的 `deployment-readiness` / `published-input-hashes` 等待检查，**不是根重定向检查，也不是少验一个业务页面**。基线 [本地 HTTP](release-local-http.json) 和 [生产 HTTP](release-production-http.json) 仍保留为 `134ff99...` 的历史证据；不同提交的记录不混用。未重新运行的历史审计、其他浏览器测试不移植为最终版本通过项。

每日工作流在 `2026-09-26T10:39:47Z` 完成；Hook 创建的部署于 `10:39:57.733Z` Ready。当天内容未变时，原有同 SHA 生产内容可以先满足工作流的内容等待检查，因此本次又通过鉴权查询独立确认 **Hook 新部署** Ready、来源 Hook/分支正确、生产别名存在及 SHA 匹配，见 [工作流联合证据](release-daily-workflow.json)。本次事件是手动 `workflow_dispatch`，不声称已经实际等到下一次 UTC 00:05 cron。

## seo+GEO.md 逐项验收

表中「线上静态通过」使用最终 `c13184b...` 全量 HTTP 与隔离构建的一致性及相应断言；31/6 单测与 39 项交互为 `134ff99...` 基线回归，日期相关功能另经最终 7 项 SEO 和本地/生产各 3 项交互增量复验。通过不等于 Google 已收录、已在搜索结果显示富结果或已获得排名。

| 编号 / 需求位置 | 验收项目与实际实现 | 本地结果 | 线上结果 | 本次证据 |
|---|---|---|---|---|
| S01 · 执行原则 | 0–1,000,000 含两端，共 1,000,001 个整数；31 个模式的数量、概率、榜单由独立引擎和全量数据生成 | 31 项单测通过；榜单包含零及小整数，逐模式榜首覆盖全区间 | 数据 SHA256 及 Dataset 全部 31 项计数通过 | [构建/单测](release-local-build.log)、[线上 HTTP](release-date-fix-production-http.json)、[SEO 数据测试](../tests/seo-data.test.mjs) |
| S02 · 1.1 首页 TDK | 英文 Title 为 `RNGDLE Number Rarity Calculator — How Rare Is Your Number? (2026)`；H1、摘要及五组主题内容明确站点用途，包含榜单入口与 FAQ | 静态 SEO、客户端切换测试通过 | `/en` Title/H1/description/可见 FAQ 与构建一致 | [本地浏览器](release-local-browser.log)、[线上 HTTP](release-date-fix-production-http.json) |
| S03 · 1.2 Palindrome | 术语标题/H1，1,989 个的真实口径，解释及三问 FAQ；说明单数字不属于本站回文徽章统计 | 静态 SEO 通过 | `/en/patterns/palindrome` 初始 HTML 通过 | [静态测试](../tests/seo/html.test.mjs)、[线上 HTTP](release-date-fix-production-http.json) |
| S04 · 1.2 Repdigit | `Repdigit Numbers` 标题，45 个重复数字、完整列表、解释及三问 FAQ | 全范围 repdigit 列表测试与静态 SEO 通过 | `/en/patterns/repdigit` 初始 HTML 通过 | [构建/单测](release-local-build.log)、[线上 HTTP](release-date-fix-production-http.json) |
| S05 · 1.2 Harshad | `Harshad Numbers (Niven Numbers)`，95,428 个、可整除规则、解释及三问 FAQ | 静态 SEO 通过 | `/en/patterns/harshad` 初始 HTML 通过 | [构建/SEO](release-local-build.log)、[线上 HTTP](release-date-fix-production-http.json) |
| S06 · 1.2 其余模式 | 全部 31 个英文模式页有术语标题、每页至少 150 英文词解释、每页三问 FAQ，计数来自引擎；en / zh 内容与标记共用模型 | 31 页深度、可见 FAQ 和计数断言通过 | 全部 31 个模式页及其中文页面静态通过 | [静态测试](../tests/seo/html.test.mjs)、[线上 HTTP](release-date-fix-production-http.json) |
| S07 · 1.3 Methodology | 稀有度评分关键词 TDK；完整评分来源、重叠权重、数字长度/位数分布、Top X% 与并列口径 | 引擎测试及静态 SEO 通过 | 方法论 Title/H1/正文/结构化数据通过 | [构建/单测](release-local-build.log)、[线上 HTTP](release-date-fix-production-http.json) |
| S08 · 2.1 首页 JSON-LD | WebSite、Organization、SoftwareApplication 直接在 HTML head 中，费用和应用说明对应可见内容 | 静态 SEO 通过 | 初始 HTML JSON-LD 与本地模型一致 | [构建/SEO](release-local-build.log)、[线上 HTTP](release-date-fix-production-http.json) |
| S09 · 2.2 模式 JSON-LD | BreadcrumbList、DefinedTerm、每页专属 FAQPage；问题和答案在正文中可见，相关榜单链接实际存在 | FAQ/可见正文一致性和内部链接通过 | 所有模式页对应图谱及可见 FAQ 通过 | [静态测试](../tests/seo/html.test.mjs)、[线上 HTTP](release-date-fix-production-http.json) |
| S10 · 2.3 Dataset | Methodology 包含 BreadcrumbList、Dataset、FAQ；`variableMeasured` 完整生成 31 项而非只复制示例六项 | 精确计数测试通过 | Dataset 31 项与引擎逐项一致 | [线上 HTTP](release-date-fix-production-http.json)、[SEO 模型](../src/seo.ts) |
| S11 · 2.4 其他页面 | Atlas 的 CollectionPage/ItemList，指南 Article 及日期，Daily 的 WebPage/isPartOf，每日答案 Article，榜单 Article/ItemList/FAQPage，AboutPage/Organization | 预渲染及图谱测试通过；最终日期回归要求含时间/时区、可见 `<time>` 与 Article 一致且修改时间不早于发布 | 最终所有页面完整 JSON-LD 与隔离构建一致，Article 日期修复通过 | [最终线上 HTTP](release-date-fix-production-http.json)、[隔离日期回归](release-date-fix-isolated.log)、[SEO 模型](../src/seo.ts) |
| S12 · 2b.1 About | 明确 RNGDLE.ART 是独立站，与 rngdle.com 或同名站无隶属关系；不声称复用其他站算法/答案 | 构建与内容审查通过 | About HTML 与本地构建 SHA256 一致 | [线上 HTTP](release-date-fix-production-http.json)、[说明页](../src/Guides.tsx) |
| S13 · 2b.2 分享图 | 全站 og:image / twitter:card；默认图与每日日期图为真实 1200×630 PNG；浏览器分享复用卡片绘制器 | 静态尺寸、实际 PNG 下载、主题下可读性测试通过 | 图片 HTTP 200、PNG 签名/尺寸和 metadata 通过；不宣称跨系统 PNG 字节完全相同 | [本地浏览器](release-local-browser.log)、[线上 HTTP](release-date-fix-production-http.json)、[卡片生成器](../scripts/build-social-images.mjs) |
| S14 · 2b.3 llms.txt | 包含独立站定位、完整 31 个模式 URL、方法论、范围/版本/Top 口径、每日答案与归档路径 | 静态测试通过 | `/llms.txt`、完整模式链接和最新答案入口通过 | [线上 HTTP](release-date-fix-production-http.json) |
| S15 · 2b.4 多语言收敛 | en / zh 可索引；ja / ko / de / fr 保持可访问但 `noindex,follow`，移出 sitemap / hreflang | 静态 SEO 与六语言客户端切换测试通过 | 六语言 robots、仅 en/zh/x-default 的 alternate、100 个 sitemap URL 通过 | [本地浏览器](release-local-browser.log)、[线上 HTTP](release-date-fix-production-http.json) |
| S16 · 2b.5 GSC | 正式站上线后检查并请求首页、methodology、palindrome、harshad、repdigit 编入索引 | 不适用 | **已完成要求的检查与请求**：sitemap 成功处理、发现 100 页；五个 URL 均“已请求编入索引”，进入优先抓取队列；尚无实际收录证据 | [Google UI 记录](release-google-checks.json)、[Google 与最终发布结果](#google-与最终发布结果) |
| S17 · 3.1 日期 URL / SSR | `/en/daily/answer` 与 `/zh/daily/answer`、`/daily/answer/YYYY-MM-DD`，日期统一 UTC，答案无需 JS 即可读取 | SSR 与无 JS 浏览器测试通过 | 首日答案 en / zh 初始 HTML、Article、内嵌快照通过 | [本地浏览器](release-local-browser.log)、[线上 HTTP](release-date-fix-production-http.json) |
| S18 · 3.2 完整答案数据 | Draft 5 个候选/胜者/得分；Quiz 10 对选项/胜者/得分；Hunt 30 张牌及最高分；top_number、百分比、命中模式与每日模式精选 | 与实际 `makeDaily()`、`analyze()`、游戏评分逐项核对通过 | 发布快照与 Git 提交及本地数据 SHA256 一致；页面内嵌数据一致 | [构建/单测](release-local-build.log)、[首日快照](../public/data/daily/2026-09-26.json)、[线上 HTTP](release-date-fix-production-http.json) |
| S19 · 3.3 当天 TDK | 日期由实际快照生成；首日 Title 为 `RNGDLE Daily Answer — September 26, 2026 (Numbers & Solutions)`，H1 带对应日期 | SSR / SEO 测试通过 | 两语言 Title/H1/description/Article 与快照日期一致 | [线上 HTTP](release-date-fix-production-http.json) |
| S20 · 3.4 答案页结构 | 可引用答案句、三模式答案、命中模式内链、计算说明/方法论、FAQ、归档入口齐全；正式轮换模式与其他 seed 解答明确区分 | 页面与无 JS 测试通过 | 首日 HTML、FAQ 可见性、全部站内链接通过 | [本地浏览器](release-local-browser.log)、[线上 HTTP](release-date-fix-production-http.json) |
| S21 · 3.4 前后导航 | 仅对已发布的前后日期生成链接；上线首日不虚构昨日/明日，不把未发布日期链接到 404 | 31 天 SSR 夹具的全部边界及相邻链接通过；F06 真实 Chromium 在 en/zh 点击中间日期前后链接，核对最旧/最新边界，无页面异常 | 当前仅 2026-09-26；无前后日期符合上线日边界，未发布/非法日期返回真实 404 + noindex | [归档夹具](release-archive-fixture.md)、[线上 HTTP](release-date-fix-production-http.json) |
| S22 · 3.5 归档 | 月分组、每条日期/Draft 最稀有数字/得分，30 条一页，分页可爬；仅 en / zh 生成 | 31 日夹具精确 30/1 拆分、页 2 canonical/H1、互链、sitemap 通过；F06 en/zh 真实点击页 1→页 2→刷新→页 1，行数为 30→1→1→30 | 首日归档页面通过；当前无真实第 2 页，不能声称生产多日分页已实测 | [夹具 JSON](release-archive-fixture.json)、[线上 HTTP](release-date-fix-production-http.json) |
| S23 · 3.6 日期结构化数据 | Article 的 headline、datePublished、dateModified、作者/发布者、语言及页面实体对应实际快照 | 静态图谱与快照测试通过 | Article 与首日实际发布时间 `2026-09-26T09:54:01.518Z` 一致，未伪装成示例 00:05 | [首日快照](../public/data/daily/2026-09-26.json)、[线上 HTTP](release-date-fix-production-http.json) |
| S24 · 3.7 历史留存 | 历史快照不重写；日期覆盖运行保留后来已发布日期；未来日期拒绝；引擎变更保留历史，来源不明的过去日期不虚构回填 | 字节不变、日期覆盖、引擎升级、今日答案冲突阻断测试通过；夹具确认正式数据未改 | 当前一条已提交快照通过哈希；长期留存需后续实际运行积累，当前不冒充多日运行事实 | [构建/单测](release-local-build.log)、[SEO 数据测试](../tests/seo-data.test.mjs)、[夹具 JSON](release-archive-fixture.json) |
| S25 · 3.7 每日发布 | GitHub Actions cron `5 0 * * *`，UTC 00:05；先构建/测试、保存快照、检查 main 未前移，再请求 Vercel 并等待/验收生产内容 | 工作流和失败条件代码审查完成；GitHub 五字段 cron 等价于需求的 00:05 | **通过（手动首次完整运行）**：[run 36236434586](https://github.com/cuilinhao/rngdle-code/actions/runs/36236434586) 16 步骤 success，产物已上传，Hook 新部署同 SHA 且 READY；不声称已实际触发次日 cron 或写入次日快照 | [工作流联合证据](release-daily-workflow.json)、[每日工作流](../.github/workflows/daily-answers.yml)、[部署验收脚本](../scripts/verify-deployment.mjs) |
| S26 · 4.1–4.2 榜单 | Rarest Numbers TDK、首段直接给答案、Top 100、模式链接、全部 31 个分类榜首、短数字解释、四问 FAQ 和 Analyze 入口 | 全区间排序/榜首/FAQ/链接测试通过 | `/en/rarest-numbers` 与 `/zh/rarest-numbers` HTTP 200、初始 HTML 和 100 项图谱通过 | [构建/单测](release-local-build.log)、[线上 HTTP](release-date-fix-production-http.json)、[榜单数据](../public/data/seo.json) |
| S27 · 4.3 榜单标记 / 版本 | Article、BreadcrumbList、100 项 ItemList、FAQPage；注明引擎 `art-1.0.0`，排名元数据随引擎/生成器变化更新 | 最终 Article 使用可追溯首次生产 Ready 时间，正文显示 UTC，保留完整 ISO datetime；榜单数据未变 | 图谱及数据哈希通过；第一名 3、得分 1677；外部 Google 日期警告已消除 | [SEO 数据生成器](../scripts/build-seo-data.mjs)、[最终线上 HTTP](release-date-fix-production-http.json)、[日期修复记录](release-date-fix-local.log) |
| S28 · 5.1 外部 Rich Results | 对要求中的结构化数据执行 Google Rich Results Test，分别记录支持类型、可选建议和错误 | 初测 `datePublished=2026-09-26` 的 2 条非严重问题已修复并作为回归测试纳入最终 7 项 SEO | **最终通过**：2026-09-26 19:00:02（Asia/Shanghai）重测 `c13184b...`，Article、BreadcrumbList、Carousel 共 3 个有效项目，0 严重错误、0 非严重警告 | [Google 最终结果](https://search.google.com/test/rich-results/result?id=eHeXVCRPTyWUDuHrSiuzHw)、[Google UI 记录](release-google-checks.json) |
| S29 · 5.2 HTTP 验收命令 | 首页标题/JSON-LD、repdigit 标题、榜单和归档状态码、sitemap 数量、og:image | 构建输出均存在 | 对应项目全部通过。原文 94 是旧页面收敛后的基数；加榜单、归档、首日答案各两种语言后是 100，不要求凑到约 200 | [线上 HTTP](release-date-fix-production-http.json)、[预渲染清单](prerender.json) |
| S30 · 5.3–5.4 后续推进 | 站外推荐目录、两篇外部分发文章、下月关键词复核属后续内容/运营动作；本次站内 FAQ 采用可验证数字 | 站内实现已验；站外动作不在此次发布范围 | **非本次范围**，未声称已发布站外内容、获得排名或 AI 引用 | [原需求](../seo+GEO.md)、[实施边界](../docs/SEO-GEO.md) |

## 原 VERIFICATION A01–A18 回归矩阵

以下沿用原编号以便对照。业务交互全量通过依据为 `134ff99...` 的 [生产浏览器日志](release-production-browser.log) 和 [结果 JSON](release-production-browser-results.json)；最终 `c13184b...` 只变更 Article 日期，另有 [生产 SEO 增量 3/3](release-date-fix-production-browser.log) 和 [最终全量 HTTP](release-date-fix-production-http.json)。本表不声称最终版本重新执行了 39 项有界面 Chrome 全量交互，也不使用更早旧报告的“线上通过”替代这两轮证据。

| ID | 验收项目 | 本次本地结果 | 本次线上结果 | 证据 |
|---|---|---|---|---|
| A01 | 页面、导航、直达刷新及 404 恢复 | 通过；六语言主路由、31 个模式详情、404 恢复及新 SEO 路由 | 通过；静态页面、16 个非法路径及浏览器交互/刷新通过 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log)、[生产 HTTP](release-date-fix-production-http.json) |
| A02 | 空值、负数、小数、上下界与非法输入 | 通过；规则与真实输入操作 | 通过；正式域名真实输入操作 | [构建/单测](release-local-build.log)、[本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log) |
| A03 | 数学特征、评分和百分比 | 通过；规则、全量排序、样本、极小概率显示不为零 | 通过；31 项 Dataset、全量数据、Top 100 与计算器交互 | [构建/单测](release-local-build.log)、[生产浏览器](release-production-browser.log)、[生产 HTTP](release-date-fix-production-http.json) |
| A04 | 单次/批量/自动抽取、停止 | 基线自动化通过；另在“林豪”Chrome 的本地生产预览真实切换标签，返回后“开始自动抽取”、计数停在 1,840，补验通过 | 基线生产自动化通过；页面隐藏仍为模拟事件。真实标签切换补验仅发生在本地，不宣称线上人工补验 | [基线本地浏览器](release-local-browser.log)、[基线生产浏览器](release-production-browser.log)、[本地真实标签补验](release-google-checks.json) |
| A05 | 收藏、最近记录、刷新与新会话 | 通过；收藏/新会话与记录保持 | 通过；正式域名刷新与新会话操作 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log) |
| A06 | 三类每日挑战与锁定 | 通过；Draft/Hunt/Quiz 经界面续玩、完成、练习与锁定 | 通过；三模式实际界面操作及发布快照/答案一致性 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log)、[生产 HTTP](release-date-fix-production-http.json) |
| A07 | UTC 跨日、倒计时、续玩、练习与连续记录 | 通过；浏览器时钟控制和规则单测；不声称真实等待跨日 | 通过（受控时钟）；续玩/练习与跨日检查通过；每日定时发布另见 S25 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log)、[构建/单测](release-local-build.log) |
| A08 | 对比、随机对决、独立测验 | 通过；胜负、随机数字与完整测验 | 通过；正式域名完整操作 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log) |
| A09 | 探索筛选、精确计数、空结果、随机匹配 | 通过；全范围筛选及约束场景 | 通过；正式域名筛选和随机匹配 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log) |
| A10 | 沙盒键盘、位数、重置、最佳修改 | 通过；键盘和最佳单数位修改 | 通过；正式域名完整操作 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log) |
| A11 | 图鉴、每日样本记录及说明页 | 通过；每个模式的数量/示例、仅每日样本盖章及刷新保持 | 通过；静态详情、样本记录交互和刷新保持 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log)、[生产 HTTP](release-date-fix-production-http.json) |
| A12 | 六语言、默认英语与偏好记忆 | 通过；默认英语、已保存选择、路径参数/锚点保留 | 通过；静态语言/metadata 及正式域名偏好交互 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log)、[生产 HTTP](release-date-fix-production-http.json) |
| A13 | 绿色明暗主题、对比度及刷新记忆 | 通过；包含新合并的六项主题测试、实际文字/按钮/层级对比度、主题记忆 | 通过；绿色主题资源哈希、实际对比度、显示和偏好操作 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log)、[主题测试](../tests/browser/theme.spec.ts) |
| A14 | 分享链接、剪贴板、PNG、对话框焦点 | 通过；真实 PNG 下载/尺寸/文字、复制受限时手动复制、Esc 焦点恢复 | 通过；静态分享图及实际复制、下载、焦点恢复和复制受限分支 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log)、[生产 HTTP](release-date-fix-production-http.json) |
| A15 | 桌面/平板/手机、键盘与减少动态效果 | 通过；1440/768/390px、六语言、绿色明暗主题几何布局/溢出、键盘与减少动态效果 | 通过；正式域名相同视口、主题与交互检查 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log) |
| A16 | 损坏存储、加载失败恢复、错误与构建 | 通过；损坏存储、预期数据失败后重试、类型检查/完整构建 | 通过；正常/非法静态请求以及损坏存储、预期数据失败恢复 | [构建日志](release-local-build.log)、[生产浏览器](release-production-browser.log)、[生产 HTTP](release-date-fix-production-http.json) |
| A17 | metadata、canonical、alternate、sitemap、robots | 通过；客户端语言/路由切换与全部静态 SEO | 通过；288 页、100 个索引候选 URL、4 种语言 noindex 和客户端路由/语言切换 | [本地浏览器](release-local-browser.log)、[生产浏览器](release-production-browser.log)、[生产 HTTP](release-date-fix-production-http.json) |
| A18 | GitHub main、Vercel、正式 HTTPS | 基线全量回归与最终日期修复隔离构建/增量通过；最终 SHA 明确 | 最终 `c13184b...` production READY、确切 SHA 匹配、GitHub Verify success、apex 全量 HTTP 通过；基线每日工作流 16 步骤 success，Hook 新部署独立核验 READY | [最终部署 / CI](release-date-fix-deployment.json)、[最终生产 HTTP](release-date-fix-production-http.json)、[基线每日工作流](release-daily-workflow.json) |

## 必须保留的事实口径与验收边界

1. **最稀有数字与 Top 的定义。** 本次全区间榜单第一名是 **3，得分 1677**；`percent` 为 `0.0000999999000001%`，显示约 **Top 0.0001%**。它统计得分大于或等于该数的整数占比，包含并列；数值越小表示得分越稀有。不能改写成“99th percentile”或认为某个具体整数被均匀抽到的概率更低。数据取自 [已提交 seo.json](../public/data/seo.json)，生产数据哈希已匹配。
2. **模式定义服从实际引擎。** 十进制回文徽章从两位数开始，repdigit 也不计单数字；零是否匹配须按每个模式规则判断。原文的示例不能覆盖引擎事实。本站与 rngdle.com 的玩法、算法及答案不能互相冒充。
3. **首日和未来日期。** 项目归档起点是 2026-09-26；本次正式站只有首日快照。没有昨日/明日已发布页时不造链接；31 日多页/前后导航结论来自基线 `134ff99...` 的隔离夹具，不是生产已有 31 天记录。夹具 6/6 包含真实无头 Chromium `153.0.8010.12` 的 en/zh 点击、刷新、相邻日期和边界测试；测试时钟固定为 2026-10-26，浏览器、临时服务和目录均已清理。与最终 `c13184b...` 比对，夹具七个源码/数据指纹中 `src/seo.ts` 因 Article 日期修复而变化，另外六项仍匹配，不能声称全部指纹匹配或最终重跑过整套夹具。每日归档逻辑、日期页面组件、SSR/预渲染脚本、SEO 数据及已发布快照均未改变。
4. **重置与发布不是同一时刻。** 游戏 UTC 00:00 重置；任务计划 UTC 00:05 生成并发布，构建队列可能延迟。首日快照使用真实生成时间，不能把 00:05 示例当作已执行事实。
5. **Google FAQ 富结果已取消。** Google 官方更新记录明确 FAQ 富结果从 **2026-05-07** 起不再展示，并于 2026-06-15 移除相关文档。因此 FAQPage 仍可作为与正文一致的语义标记，但“Rich Results 没有 FAQ 项”本身不等于本次标记错误，也不能承诺 FAQ 富结果。来源：[Google Search 官方更新记录](https://developers.google.com/search/updates)。本次最终 Google 重测识别 3 个有效项目，初测的两条日期格式提示已消除；这也不保证搜索页面实际展示富结果。
6. **GEO 与搜索效果。** llms.txt 已按需求提供；Google 官方说明它不会正向或负向影响 Google 搜索可见性/排名。站内通过不等于已收录、获得关键词排名或被 AI 引用；GSC 请求已接收与实际收录必须分开记录。来源：[Google Search 官方更新记录](https://developers.google.com/search/updates)。
7. **浏览器与外部系统边界。** 本地及正式域名的主交互验收均为真实 Chrome；跨日场景使用受控时钟，自动隐藏场景使用模拟隐藏事件。另有本地真实标签切换补验，但不能扩写成生产人工验证；无头 Chromium 31 日测试仅为隔离夹具。Google 外部 UI 检查另有独立记录。未覆盖的其他浏览器、独立安全审计不标成通过；站外目录创建、文章分发和下月搜索量复核不属于本次发布。

## Google 与最终发布结果

外部检查由 Codex 在用户指定的“林豪”Chrome profile 内实际操作，结果由可访问性输出转录，完整记录见 [release-google-checks.json](release-google-checks.json)。

| 项目 / URL | 本次实际结果 | 含义与证据 |
|---|---|---|
| GSC sitemap | `sc-domain:rngdle.art` 下提交 [sitemap.xml](https://rngdle.art/sitemap.xml) 成功；处理状态“成功”，2026-09-26 最后读取，发现 100 页 | 新版处理记录，不复用旧 282 页；发现不等于收录 |
| `/en` | 请求前“已发现 - 尚未编入索引”；请求后“已请求编入索引” | 已加入优先抓取队列，尚无收录证据 |
| `/en/methodology` | 请求前“已发现 - 尚未编入索引”；请求后“已请求编入索引” | 已加入优先抓取队列，尚无收录证据 |
| `/en/patterns/palindrome` | 请求前“Google 无法识别此网址”；请求后“已请求编入索引” | 已加入优先抓取队列，尚无收录证据 |
| `/en/patterns/harshad` | 请求前“已发现 - 尚未编入索引”；请求后“已请求编入索引” | 已加入优先抓取队列，尚无收录证据 |
| `/en/patterns/repdigit` | 请求前“已发现 - 尚未编入索引”；请求后“已请求编入索引” | 已加入优先抓取队列，尚无收录证据 |
| Rich Results 初测 | `/en/rarest-numbers`，2026-09-26 18:47:20（Asia/Shanghai）；3 个有效项目，2 条非严重 `datePublished` 时间/时区问题 | [保留初测记录](https://search.google.com/test/rich-results/result?id=_vC3oHLQJn2qiIMB3rBEdw)，问题已在 `c13184b...` 修复 |
| Rich Results 最终重测 | 同一 URL，2026-09-26 19:00:02（Asia/Shanghai）；**Article、BreadcrumbList、Carousel 共 3 个有效项目，0 严重错误、0 非严重警告** | [最终结果](https://search.google.com/test/rich-results/result?id=eHeXVCRPTyWUDuHrSiuzHw)；Article 详情确认原 2 条问题不再显示 |
| 最终发布身份 | main `c13184b1122f22e181ee4f49670f9312d9293224`，Vercel `dpl_8vuJWLD8N1WcW4zQ7ocFV1Z7yHDV` production READY；GitHub Verify `36237344680` success | [最终部署 / CI](release-date-fix-deployment.json)；只发布隔离工作区中的 Article 日期修复 |
| 最终内容/浏览器复验 | 生产全量 HTTP **319/4234** 全过；生产有界面 Chrome 增量 **3/3**、0 skipped/failed/flaky | [最终 HTTP](release-date-fix-production-http.json)、[生产增量结果](release-date-fix-production-browser-results.json)；基线 39 项全量交互仍单独保留 |

要求中的站内实现、发布、工作流首次手动运行和本次 Google 检查均已有明确结果。搜索收录、排名、AI 引用及下一次实际 UTC 定时运行属于后续自然状态，不写成已实现的效果。
