# 每日归档合成夹具验收

- 实际执行：2026-09-26T10:23:21.313Z；Node v22.23.3。
- 结果：PASS，5 组检查。
- 合成日期：2026-09-26 至 2026-10-26，共 31 条；固定测试时钟为 2026-10-26T12:00:00.000Z。
- 方法：将源码复制至独立临时目录，使用原引擎生成合成快照，编译 SSR 并运行原预渲染脚本。未来日期仅存在于测试夹具，未写入正式归档。临时副本已删除。

- F01：PASS — archivePage returns 30 and 1 rows, no overlap or missing dates, with correct previous/next page boundaries.
- F02：PASS — English and Chinese SSR archives render exact 30/1 date split, crawlable reciprocal page links, unique page-2 H1/canonical, month groups, and indexable metadata.
- F03：PASS — Every one of the 31 dates in both languages has correct previous/next published-day links; oldest/latest boundaries omit unavailable neighbors and historical pages link to the latest answer.
- F04：PASS — Real prerender creates both page-2 HTML files and all 62 dated HTML files; sitemap contains all of them and excludes nonexistent page 3.
- F05：PASS — Production SEO source, manifest, and existing daily snapshot bytes are unchanged by this isolated fixture.

夹具输出：350 个 HTML、162 个 sitemap URL、62 个日期 HTML。

边界：本次验证为真实 SSR/预渲染与导航链接检查，不声称浏览器点击或实际等待 31 天。正式站当前仍只有上线日快照。机器证据与源码指纹见同目录 release-archive-fixture.json。
