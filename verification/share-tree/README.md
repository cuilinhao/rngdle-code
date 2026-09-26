# 3D 树分享卡：发布前验收

2026-09-26。隔离分支基于 main `188643d`，仅包含分享卡代码、依赖及测试，不包含同时进行的广告改动。

## 验证环境与结果

- Node 22：生产构建、34/34 单元测试、7/7 静态 SEO 检查通过，见 [构建记录](local-build.log)。
- Codex 独立 Chromium 浏览器会话：生产静态服务器 `http://127.0.0.1:5175`，完整浏览器回归 **59/59 通过，0 失败、0 跳过**，见 [日志](local-browser.log)、[逐项机器结果](local-browser-results.json)。
- Codex 内置浏览器实际打开并操作：中文数字 142857，树与 QR 切换、季节切换、复制到真实剪贴板、390px 布局和关闭焦点恢复。实际截图二维码成功解码为当前本地链接，见 [桌面](local-codex-autumn.png)、[手机](local-codex-mobile-qr.png)。

## 分享卡验收清单

| 项目 | 本地结果 |
|---|---|
| 真正 WebGL 3D 树、树 ↔ 二维码动画 | 通过；有中间 transition 状态及两端稳定状态 |
| 快速反向切换、动画中关闭再打开 | 通过；最终 QR 可解码，无 pageerror |
| 春、夏、秋配色及导出同步 | 通过；实际 PNG 树冠像素与季节变化，QR 视图中换季仍导出树 |
| 初始加载与换季期间不下载占位/旧图片 | 通过；延迟 chunk 和图片解码回归 |
| 可见二维码对应当前数字与语言 | 通过；直接解码整个可见舞台截图（包含覆盖按钮） |
| PNG 下载、1200×630 尺寸和文字对比度 | 通过；实际保存文件并解码 QR，验证真实树像素及文字墨迹 |
| 复制链接、受限时手动复制、Esc 焦点恢复 | 通过 |
| 六语言、320px 短屏、390/768/1440px、浅深主题 | 通过；窄屏 QR 可读，复制与下载可滚动触达 |
| 系统减少动态效果及动画中切换设置 | 通过 |
| 懒加载、chunk 请求失败、WebGL 不支持/上下文丢失 | 通过；回退到可扫描 QR 与可下载卡片 |
| 树截图导出失败 | 通过；保留 3D/QR 切换并提供二维码降级卡片 |
| 原业务 A01–A17 与 SEO 路由回归 | 通过；纳入上述 59 项全量浏览器回归及静态测试 |

## 发现与修复

1. 修复手机 QR 下缘被切换按钮干扰，增加留白。
2. 将场景 ready 与截图导出结果分离，截图失败时仍可切换 QR。
3. URL/语言变化重建独立 canvas，避免复用已失效 WebGL context。
4. 调整导出小字颜色，实测对比度达到 5.33:1。
5. 延迟加载与换季测试发现能下载占位图/上一季图片；现在 PNG 绑定当前 URL、季节和截图，等待正确成图后开放下载。两条回归测试先失败后通过。
6. 改用 Three.js 当前支持的 PCFShadowMap，消除弃用警告。

初次使用 Vite preview 跑完整回归时为 49/50：唯一失败是未知日期 HTTP 预期 404、实际 200。Vite SPA fallback 不模拟生产路由，已切换仓库现有 `scripts/serve-production.mjs`，未放宽断言；SEO 3/3、最终完整 59/59 通过。保留 [首次结果](first-vite-preview-results.json)。

## 验证边界

这里记录的是本地发布前结果；生产部署需另行核验。浏览器覆盖 Codex IAB 与 Chromium；手机为视口模拟，未使用真实 iOS/Android 硬件或 Safari。扫码结论来自实际渲染截图和下载 PNG 的软件解码，未宣称摄像头实扫。懒加载 Three chunk 约 135 KB gzip，仍有 Vite 500 KB 未压缩体积提示，不阻塞构建。

## 第一轮生产复验（应用提交 96d8c64）

已推送 GitHub main；Vercel `dpl_6jCRfQtr2ezb1n8XRVCXgH9LS6JB` production READY，SHA 精确匹配，正式域名为 https://rngdle.art。

- 正式域名 Chromium 完整回归 **59/59，0 失败、0 跳过、0 flaky**，97 秒。上述分享卡各项与原 A01–A17 同一套用例在线上全部通过。见 [生产逐项结果](production-browser-results.json)、[日志](production-browser.log)。
- 288 页全量 HTTP、资源哈希与 SEO 校验 **318/318 项、4233/4233 条断言通过**；有 1 次 patterns.bin 下载超时重试，重试后完整内容哈希一致，0 warning。见 [HTTP 报告](production-http.json)。
- 已逐张查看正式站 [桌面树形](production-tree.png)、[二维码](production-qr.png)、[手机界面](production-mobile.png)，并读取实际下载 PNG 的树冠像素与二维码。[秋季下载卡片](production-downloaded-autumn-card.png)、[春季下载卡片](production-spring-card.png)。
- Codex IAB 已完成本地实际交互；正式域名的 IAB 会话连接超时，本轮线上结果来自 Codex 启动的独立 Chromium 实际页面和下载，不宣称在线 IAB 人工复验成功。
- GitHub Linux CI 首轮为 **57/59**：两个检查在 click 返回时已错过 1.25 秒的中间 transition 状态。已保留 [真实失败记录](initial-ci-animation-failure.log)，后续测试改用受控时钟精确停在动画中途；未删测试、未放宽为终态、未添加重试。产品代码无变更。此处不能把首轮 CI 写成通过，修复后最终结果需另行记录。
