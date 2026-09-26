# Adsterra 广告接入

按[航海教程](https://scys.com/activity/10092/course/182?chapterId=13042)接入三个非弹窗广告位。Adsterra 网站 ID 为 `6078332`，域名为 `rngdle.art`。2026-09-26 创建后，后台三个单元均显示 **Active**；成人广告关闭，没有创建 Popunder、Smartlink 或 Social Bar。

| 首页位置 | 类型 | 后台名称 | 单元 ID |
| --- | --- | --- | --- |
| 页面顶部 | Banner 320×50 | 320x50_1 | 31419719 |
| 数字结果和等级表下方 | Banner 300×250 | 300x250_1 | 31419718 |
| 内容底部 | Native Banner | NativeBanner_1 | 31419717 |

六种语言的首页都使用这三个位置。其他页面不展示广告。`src/ad-units.ts` 保存后台 Get Code 提供的公开投放 Key 和完整 HTTPS 脚本地址；它们是网站公开代码的一部分，不是后台登录凭证。替换单元时须使用后台对应的完整脚本地址，不能猜测或统一替换脚本域名。

`src/Ads.tsx` 在客户端且广告位进入视口附近时挂载脚本。`src/ads-runtime.mjs` 只允许 production 构建在 `rngdle.art` 与 `www.rngdle.art` 加载广告；localhost 与 Vercel 预览域名仅显示预留空间。数字输入和主题切换不会自动刷新广告。离开首页会清理广告容器，返回首页会重新挂载。

两个 Banner 按顺序加载，防止共用 `window.atOptions` 导致尺寸或 Key 混淆；使用供应商提供的 `format: iframe`，不另行包裹外层 iframe。Native Banner 使用后台指定的容器 ID，脚本在页面生命周期内加载一次，保留供应商自己的 SPA 导航监听；切换语言时保留首页和广告容器。所有位置有独立广告标签并预留空间，小于340px的窗口将顶部320px广告等比显示为300px，以容纳经典滚动条并保留完整内容。广告不覆盖数字输入、抽取或导航按钮。

验证包括 Node 单元测试、TypeScript、生产构建、静态 SEO 检查和页面检查。后台 Active 仅代表单元启用，不代表已经产生展示或收入；实际填充还取决于投放地区、可用广告及浏览器拦截情况。不要点击自己的广告或反复刷新来制造展示。

本地及线上发布验证按 [广告发布验收清单](../verification/ads-release-checklist.md) 逐项记录；后台开通和第一轮集成记录见 [初始验收记录](../verification/advertising-acceptance.md)。

2026-09-26 已发布到 main 和 Vercel。应用及布局验收通过，但独立 Chromium 与稳定 Chrome 的实际供应商请求返回403，三个位置未显示素材；真实展示未通过验收，详见发布清单。
