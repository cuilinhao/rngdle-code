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
2. 在 Vercel 项目创建绑定 `main` 的生产 Deploy Hook，将完整 hook URL 保存为 GitHub Actions secret `VERCEL_DEPLOY_HOOK`。不将 URL 写入仓库或日志。
3. 仓库允许 Actions 的 `contents: write`，分支策略允许工作流提交快照；否则该步骤会明确失败。
4. 手动运行一次 Publish daily answers，确认保存快照、构建及测试通过、Vercel 部署成功，并检查当天 URL 和 sitemap。

工作流先构建与验收，再以中文提交信息保存快照与清单，最后请求生产重建。若 main 在测试期间变化，push 会安全失败，应重跑工作流以验证最新代码，不将未测试的 rebase 结果发布。

构建只读已有快照；引擎版本变动不改历史日期记录。历史日期页面显示当时的引擎版本。当前常青榜单随引擎源码和生成器变更重新计算。

当已有今日快照与新引擎的 seed / 分数不一致时，构建会阻止部署，需恢复匹配引擎或等待下一个 UTC 日期再升级。发现历史中存在不同引擎版本时，缺失的过去日期不使用新引擎伪造补齐；保留归档空缺，只有找回对应日期的原始引擎后才做明确回填。

## 上线后的 GSC 检查

只有生产部署确认成功后才操作：

- 检查 `https://rngdle.art/sitemap.xml` 仅列 en/zh。
- 通过已有 Domain 属性 `sc-domain:rngdle.art` 的 URL Inspection，分别检查 `/en`、`/en/methodology`、`/en/patterns/palindrome`、`/en/patterns/harshad`、`/en/patterns/repdigit`，再请求编入索引。
- 提交成功只代表请求已接收；收录、排名、AI 引用均需之后观察，不能由本地测试证明。

文档中要求用户后续推进的站外文章分发与新 GitHub 推荐目录，不作为本次站内代码工作的自动发布动作。

## 本次实际验收记录（2026-09-26）

- 分支：`codex/seo-geo`，实现保留在本地工作区，未部署生产。
- Node 22.23.3：完整构建通过，生成 288 个 HTML，sitemap 收录候选 100 个，仅 en / zh。
- 引擎与数据单测 31/31；静态 SEO 测试 6/6；真实 Chrome 浏览器验收 33/33。
- 本地 HTTP 检查 296/296，含全部页面、sitemap、robots、llms、PNG 及无效日期/分页的 404。
- 31 个英文模式页的解释正文最少 257 词；所有 FAQ 标记均能在可见正文中逐字找到。
- 288 个页面的标题、H1、canonical 和 JSON-LD 无重复；所有静态内部链接存在；图片均为 1200×630。
- 独立审查已完成，未遗留需要修复的 SEO 功能问题。
- GitHub CLI 当前未登录，未设置或核实远程 Deploy Hook secret；未执行部署或 GSC URL Inspection。

日志：`verification/seo-build-tests.log`、`verification/seo-browser.log`、`verification/seo-http-results.json`。
