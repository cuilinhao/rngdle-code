# rngdle.art 从 Vercel 迁移到 Cloudflare Pages

- 文档日期：2026-09-30（北京时间）
- 背景：Vercel 于 2026-10-13 到期且不续费，此后不可用。本次迁移需要一次完成，彻底去除对 Vercel 的依赖。
- 目标：网站 `rngdle.art` 与 `www.rngdle.art` 改由 Cloudflare Pages 托管，DNS 改由 Cloudflare 管理，每日答案自动发布改走 Cloudflare。域名、URL、页面内容、SEO/GEO 表现保持不变。
- 操作环境：isabel 的 Chrome（已登录 Cloudflare、Namecheap、GitHub `cuilinhao`、Vercel）；代码直接提交到 GitHub `cuilinhao/rngdle-code` 的 `main` 分支。

## 1. 现状与迁移后对照

| 职责 | 迁移前（Vercel） | 迁移后（Cloudflare） |
|---|---|---|
| 构建与托管 | Vercel 连接 GitHub，push `main` 自动构建 `dist` | Cloudflare Pages 连接 GitHub，push `main` 自动构建 `dist` |
| 构建命令 / 输出 | `npm run build` / `dist`，Node 22 | 相同；Node 版本由 `.nvmrc`（22）决定 |
| URL 规则 | `vercel.json`：`cleanUrls: true`、`trailingSlash: false`，`404.html` | Pages 默认省略 `.html` 并使用 `404.html`；与 Vercel 的差异用 `public/_redirects` 补齐 |
| 响应头 | `vercel.json` 的安全头、缓存头；Vercel 自动附加 HSTS | `public/_headers`，包括 HSTS（`max-age=63072000`，与 Vercel 相同） |
| DNS | Namecheap BasicDNS：`@` A 216.150.1.1 / 216.150.16.1，`www` CNAME 到 Vercel | Cloudflare DNS：`@`、`www` 由 Pages 自定义域名接管 |
| HTTPS 证书 | Vercel 自动签发 | Cloudflare 自动签发 |
| 每日答案发布 | GitHub Actions 提交快照后调用 `VERCEL_DEPLOY_HOOK` | GitHub Actions 提交快照，Pages 收到 push 自动构建；不再需要 Deploy Hook 与 secret |
| 备用地址 | `rngdle-art.vercel.app` | `<项目名>.pages.dev`（返回 `X-Robots-Tag: noindex`） |

不受影响：GA4（`G-FN1KFQ0VMX`，按域名统计）、GSC 域名资源 `sc-domain:rngdle.art`（DNS TXT 验证，迁移时原样保留）、应用代码与内容。项目无环境变量、无服务端函数、未使用 Vercel 专有服务。

## 2. 已确认的决策

1. 托管选 Cloudflare Pages（Git 集成），不用 Workers。
2. `rngdle.art` 与 `www.rngdle.art` 都直接返回 200，保持现状，不做 www 跳转。
3. 域名未使用邮件转发，不需要 MX；新增 SPF `v=spf1 -all` 与 DMARC `p=reject` 防止冒用。
4. Namecheap 若开启 DNSSEC，先关闭再更换 nameserver。
5. Cloudflare 不屏蔽 AI 爬虫，不启用托管 robots.txt，Bot Fight Mode 关闭。
6. 关闭会改写 HTML 的功能：Email Address Obfuscation、Rocket Loader、Automatic HTTPS Rewrites、Web Analytics 自动注入。验收脚本逐字节比对 HTML，任何改写都会导致失败。
7. pages.dev 备用地址返回 `X-Robots-Tag: noindex`，避免重复内容。
8. 去掉 Deploy Hook，每日发布依赖 push 触发构建，GitHub 不再保存任何部署密钥。
9. 不保留观察期：切换后当天完成 Vercel 清理；Vercel 项目本身不删除，到期自然停用。

## 3. SEO / GEO 保护措施

| 风险 | 措施 | 验证方式 |
|---|---|---|
| Cloudflare 默认屏蔽 AI 爬虫或改写 robots.txt | 添加域名时选择允许 AI 爬虫，不启用托管 robots.txt | 线上 `robots.txt` 与构建产物逐字节一致；以 GPTBot / ClaudeBot UA 请求返回 200 |
| URL 行为变化（跳转、404、重复地址） | 切换前在 pages.dev 与 Vercel 逐条比对状态码和 `Location`，差异写入 `_redirects` | 比对脚本输出为零差异 |
| HTML 被 CDN 改写 | 关闭第 2 节第 6 条列出的功能 | `verify-deployment.mjs` 逐页 sha256 全部通过 |
| 切换期间报错 | 先让 Cloudflare 接管 DNS 且记录仍指向 Vercel，再切到 Pages；切换窗口仅几分钟 | 切换前后持续请求正式域名 |
| 每日发布中断 | 工作流改为 push 触发，手动运行验证 | 手动运行成功；次日 08:05（北京时间）定时运行由用户观察 |
| pages.dev 重复内容 | `X-Robots-Tag: noindex`（仅 pages.dev 主机） | 响应头检查：pages.dev 有、正式域名没有 |
| GSC 验证失效 | 保留 `google-site-verification` TXT | 从 Cloudflare 权威 DNS 查询到该 TXT |

## 4. 执行步骤与验收标准

### 阶段 0：准备
- 连接 isabel 的 Chrome，存档 Namecheap 现有 DNS 记录、nameserver、DNSSEC 状态，以及 Vercel 项目域名配置。
- 验收：存档内容记入第 6 节。

### 阶段 1：建 Pages 项目并在测试地址验收
- Cloudflare → Workers & Pages → 创建 Pages 项目 → 连接 GitHub `cuilinhao/rngdle-code`，生产分支 `main`，构建命令 `npm run build`，输出目录 `dist`。
- 验收：
  - 构建成功，记录构建耗时。
  - 对 pages.dev 运行 `BASE_URL=https://<项目>.pages.dev node scripts/verify-deployment.mjs`，全部通过。
  - 对 pages.dev 运行 Playwright 浏览器测试，全部通过。
  - URL 行为比对：对 `/`、`/en`、`/zh`、`/zh/`、`/zh.html`、`/en/methodology/`、`/en/methodology.html`、`/index.html`、不存在的路径、`/data/*`、`/robots.txt`、`/sitemap.xml`、`/llms.txt` 等，Vercel 与 pages.dev 的状态码和 `Location` 一致。

### 阶段 2：第一次提交
- 新增 `public/_headers`：全站安全头与 HSTS，`/assets/*` 长期缓存，`/data/*` 必须重新验证，pages.dev 主机加 `X-Robots-Tag: noindex`。
- 按阶段 1 的比对结果决定是否新增 `public/_redirects`。
- 这两个文件对 Vercel 无影响，可在切换前推送。
- 验收：Pages 重新构建后，pages.dev 的响应头符合预期；再次运行验收脚本全部通过。

### 阶段 3：DNS 迁到 Cloudflare
- Cloudflare 添加站点 `rngdle.art`，Free 套餐；按第 2 节设置 AI 爬虫与 HTML 改写选项。
- 核对导入的记录：保留 Google 验证 TXT；指向 Vercel 的 A/CNAME 暂时保留并设为"仅 DNS"；删除 Namecheap 停放页残留；设置 SPF 与 DMARC。
- Namecheap：若开启 DNSSEC 则先关闭；nameserver 改为 Custom DNS，填写 Cloudflare 分配的两个地址。
- 验收：Cloudflare 显示站点 Active；公共 DNS 查询 NS 为 Cloudflare；网站在此期间持续可访问。

### 阶段 4：切流量
- Pages 项目 → 自定义域名，添加 `rngdle.art` 与 `www.rngdle.art`；Cloudflare 将两条记录替换为指向 Pages。
- 验收：
  - 两个域名证书有效，HTTPS 返回 200，响应头来自 Cloudflare。
  - 对 `https://rngdle.art` 运行完整 HTTP 验收与浏览器测试，全部通过。
  - `robots.txt`、`sitemap.xml`、`llms.txt` 与构建产物一致；AI 爬虫 UA 请求返回 200。
  - pages.dev 返回 noindex，正式域名不返回。

### 阶段 5：第二次提交（去 Vercel 化）
- 删除 `vercel.json`、`.vercelignore`。
- `.github/workflows/daily-answers.yml`：删除 Deploy Hook 检查与调用两步；按阶段 1 实测构建耗时调整部署等待上限（如超过 300 秒，同步放宽 `scripts/verify-deployment.mjs` 的上限）。
- 更新 `README.md`、`DEPLOYMENT.md` 中的部署说明；`verification/` 下的历史验收记录保持原样。
- 验收：GitHub `Verify` 工作流通过；Pages 构建成功；手动触发 `Publish daily answers` 工作流成功。

### 阶段 6：清理 Vercel
- Vercel：从 `linhaos-projects/rngdle-art` 移除 `rngdle.art`、`www.rngdle.art`，断开 Git 连接。项目不删除。
- GitHub：删除仓库 secret `VERCEL_DEPLOY_HOOK`；移除 Vercel GitHub App 对本仓库的访问。
- 验收：Vercel 项目不再绑定域名与仓库；GitHub 仓库中不再有 Vercel 相关 secret 与应用授权。

### 最终线上验收
- 对正式域名重新运行完整 HTTP 验收与浏览器测试；发现问题即修复、重新部署、重新验收，直到全部通过。

## 5. 回退方案

- 阶段 4 之后、阶段 6 之前：在 Cloudflare DNS 中将 `@`、`www` 改回 Vercel 的原记录（见第 6 节存档），几分钟内恢复。
- 阶段 6 之后：Vercel 已解绑，回退需要重新在 Vercel 添加域名；10 月 13 日后不可回退，问题只能在 Cloudflare 上修复。
- nameserver 可随时改回 Namecheap BasicDNS，但生效较慢，仅作为最后手段。

## 6. 执行记录

执行过程中的实际配置、存档与结果记录在本节。

### 6.1 迁移前存档（2026-09-30）

Namecheap（BasicDNS，nameserver `dns1/dns2.registrar-servers.com`，DNSSEC 关闭）：

| 类型 | 主机 | 值 | TTL |
|---|---|---|---|
| A | @ | 216.150.1.1 | 30 min |
| A | @ | 216.150.16.1 | Automatic |
| CNAME | www | ca491a073f28d8ac.vercel-dns-016.com. | 30 min |
| TXT | @ | google-site-verification=glu6f0r_tQELGN47bhlHbBOgofWRoFm8xuCrm__BkgU | Automatic |
| TXT（邮件设置，Email Forwarding 自动生成） | @ | v=spf1 include:spf.efwd.registrar-servers.com ~all | Automatic |

Vercel 项目 `linhaos-projects/rngdle-art`（Pro）绑定域名：`rngdle.art`、`www.rngdle.art`、`rngdle-art.vercel.app`，均为 Production。

### 6.2 Cloudflare Pages

- 账号：Cuilinhao2021（account `8021c9867ba6881cf688f0a25af0d32f`）。
- GitHub App「Cloudflare Workers and Pages」安装在 `cuilinhao` 个人账号，仅授权 `rngdle-code` 一个仓库。
- 项目 `rngdle-art`：生产分支 `main`，构建命令 `npm run build`，输出 `dist`，环境变量 `NODE_VERSION=22`。地址 https://rngdle-art.pages.dev 。
- 构建耗时约 1 分钟，低于每日工作流 300 秒的部署等待上限，上限无需调整。

### 6.3 pages.dev 验收（提交 `2f88df2`）

- 远程验收工作流 `Remote acceptance` 运行 36704803640，全部通过：
  - URL 行为：180 个地址与当前 Vercel 生产一致（含两类已审阅差异，见 `scripts/compare-hosts.mjs`）。
  - 响应头：安全头、HSTS、`/assets` 长缓存、`/data` 重新验证、pages.dev `X-Robots-Tag: noindex` 均符合预期。
  - 爬虫：Googlebot、Bingbot、GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot、Google-Extended 访问 `/robots.txt`、`/en`、`/llms.txt` 均为 200，robots.txt 未被改写。
  - 内容：345 项、4436/4436 条检查通过（HTML sha256、canonical、hreflang、JSON-LD、sitemap、llms.txt 等）。
  - 浏览器：Playwright 75/75 通过，0 flaky，0 skipped。
- 首轮验收（运行 36704046975）发现 `/<语言>/index.html` 在 Pages 返回 404、Vercel 返回 308，已用 `public/_redirects` 补齐。

### 6.4 添加站点受阻

- Cloudflare 后台「连接域名」流程在提交前会调用域名注册检查接口 `registrar/domains/batch_check?id=rngdle.art`，该接口对 `.art` 返回 422，页面一直停在加载状态，未发出创建站点请求。自动导入与手动输入 DNS 两种方式均复现。

