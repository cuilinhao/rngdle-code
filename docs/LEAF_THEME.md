# Leaf 主题落地开发文档

> 给 Claude Code 的任务说明。目标：把 RNGDLE.ART 的界面改成参考站 <https://catskills-showcase.pages.dev/> 的视觉风格（浅叶绿底、森林绿字、橄榄绿胶囊按钮、衬线大标题、深绿色通栏），并保证构建、测试、可访问性全部通过。
>
> 预览稿（设计意图的最终参照）：<https://claude.ai/artifact/N8QikMts9rMcqSLYRaPc19>

---

## 1. 当前状态：已实施并验证（2026-09-30）

最初以下 5 个文件按本文档第 2 节的规范改过，随后执行了第 3 节的 T1–T4、T6、T7（T5 未做）。验证结果见第 3 节之后的「执行记录」。

| 文件 | 改了什么 |
| --- | --- |
| `src/style.css` | ① 文件开头的 `:root` token 块整体替换：默认浅色（pale leaf），`:root[data-theme="dark"]` 为深色；删掉原来的 `:root[data-theme="light"]` 块。② `body` 去掉网格背景。③ 大号数字改用衬线字体，小号数据改用正文字体 + `tabular-nums`（原来是 monospace）。④ 在第一个 `@media (min-width: 1000px)` 之前插入一段注释为 “Leaf theme component layer” 的组件样式。⑤ 调大了 1120px / 600px 断点里的 `h1`、`.brand`、`.big-number`、`.metrics strong`、`.eyebrow`、`.number-heading .badge`、`.feature-card h3` 字号 |
| `index.html` | `theme-color` 改为 `#eaefd1`；加入 Google Fonts（Instrument Sans 400/500/600、Instrument Serif 常规+斜体）的 preconnect 和 stylesheet |
| `src/main.tsx` | `readStorage("theme", "dark")` → `readStorage("theme", "light")` |
| `scripts/prerender.mjs` | 预渲染 HTML 上的 `data-theme="dark"` → `data-theme="light"` |
| `tests/browser/acceptance.spec.ts` | A12/A13 用例原先假设默认深色、点击「浅色主题」；现在改为点击「深色主题」并断言 reload 后为 `dark` |

T1–T7 中追加的修改：

| 文件 | 任务 | 改了什么 |
| --- | --- | --- |
| `src/style.css` | T1 | ① `.header` 背景由 `color-mix()` 改为新 token `--header-bg`（`theme.spec.ts` 的颜色解析器读不懂 `color(srgb …)`，会把半透明页头当成近黑色）。② 徽章底色由半透明 `color-mix()` 改为不透明 token `--ts0…--ts6`（面板上）/ `--tbs0…--tbs6`（通栏上，`.number-heading` 内重映射），对比度不再随所在底色变化。③ 深色 `--t5` / `--tb5` 由 `#f29a74` 提亮为 `#f3a482`（色相不变），修正深色面板上 Extreme 徽章 4.43:1 的问题。④ `.brand` 加 `min-width: 0; overflow: hidden`、`.header-controls` 加 `flex-shrink: 0`，并新增 `@media (max-width: 360px)` 把品牌字缩到 1.2rem：网页字体未加载（回退衬线更宽）时，320px 宽度下页头原本会横向溢出 12px |
| `index.html` | T3 | `<head>` 里、样式表之前加入读取 `rngdle.art.theme` 的内联脚本，首帧即为用户选择的主题 |
| `index.html`、`src/main.tsx`、`package.json`、`package-lock.json` | T4 | 删除 3 行 Google Fonts `<link>`；安装 `@fontsource/instrument-sans`、`@fontsource/instrument-serif`，在 `main.tsx` 顶部引入 5 个字重/样式 |
| `public/site.webmanifest` | T6 | `theme_color`、`background_color` 由 `#223a28` 改为 `#eaefd1` |
| `README.md`、本文档 | T7 | 更新简介（默认浅色 leaf 主题，可切换深色）与字体来源（SIL OFL，自托管）；更新 token 表与本表 |

---

## 2. 设计规范

### 2.1 颜色 token（`src/style.css` 顶部）

所有颜色只能来自这些变量。组件里不要写死颜色（`tree-share-dialog` 例外，见第 4 节）。

| Token | 浅色（默认） | 深色 | 用途 |
| --- | --- | --- | --- |
| `--bg` | `#eaefd1` | `#1d3123` | 页面底色（pale leaf / 深森林） |
| `--panel` | `#f6f8ec` | `#25402c` | 卡片、面板 |
| `--panel-2` | `#e4eac8` | `#2e4c36` | 次级面板、hover |
| `--fg` | `#223a28` | `#eaefd1` | 正文 |
| `--muted` | `#51624f` | `#b0bdaf` | 次要文字 |
| `--line` | `#cbd4ae` | `#3e5c45` | 边框、分隔线 |
| `--input-bg` | `#ffffff` | `#15241a` | 输入框底色 |
| `--strong` | `#587707` | `#a9c84a` | 主按钮底色（橄榄绿） |
| `--on-strong` | `#ffffff` | `#15241a` | 主按钮文字 |
| `--strong-hover` | `#32573b` | `#c3dd72` | 主按钮 hover |
| `--accent` | `#4a6606` | `#bcd865` | 链接、强调文字、图标 |
| `--accent-soft` | `#eef3d8` | `#2a4630` | 强调色浅底 |
| `--accent-border` | `#8aa64a` | `#7d9855` | 强调色边框 |
| `--gold` / `--gold-soft` / `--gold-border` | `#7e5a02` / `#f7ecc9` / `#c9a95e` | `#ebc063` / `#3e3a22` / `#8f7a45` | 赭石色点缀 |
| `--error` | `#a3321f` | `#ffb7a8` | 错误提示 |
| `--band` | `#223a28` | `#132118` | 深绿通栏：结果卡头部、页脚 |
| `--on-band` / `--on-band-muted` | `#eaefd1` / `#b9c6ad` | `#eaefd1` / `#b0bdaf` | 通栏上的文字 |
| `--band-line` | `rgba(234,239,209,.2)` | `rgba(234,239,209,.16)` | 通栏上的分隔线 |
| `--header-bg` | `rgba(234,239,209,.92)` | `rgba(29,49,35,.92)` | 半透明页头（即 92% 的 `--bg`） |

**稀有度 7 级色**（Standard → Singular，对应 `.badge.tier-0` … `.badge.tier-6`）：

| 级别 | `--tN` 浅色 | `--tN` 深色 / `--tbN`（通栏上，两种主题相同） |
| --- | --- | --- |
| 0 Standard | `#5a665c` | `#b3bdb5` |
| 1 Notable | `#586c2c` | `#c7d796` |
| 2 Distinct | `#4a6606` | `#b5d24f` |
| 3 Rare | `#1d6049` | `#7fd0aa` |
| 4 Exceptional | `#7e5a02` | `#ebbe5e` |
| 5 Extreme | `#973c19` | `#f3a482` |
| 6 Singular | `#6c3361` | `#e2a9d2` |

**徽章底色**（不透明，等于 10% 级别色叠在底色上；`.badge` 通过 `--tsc` 取用）：

| 级别 | `--tsN` 浅色（叠 `--panel`） | `--tsN` 深色（叠 `--panel`） | `--tbsN` 浅色主题（叠 `--band`） | `--tbsN` 深色主题（叠 `--band`） |
| --- | --- | --- | --- | --- |
| 0 | `#e6e9de` | `#334c3a` | `#304736` | `#233128` |
| 1 | `#e6ead9` | `#354f37` | `#324a33` | `#253325` |
| 2 | `#e5e9d5` | `#334f30` | `#31492c` | `#23331e` |
| 3 | `#e0e9dc` | `#2e4e39` | `#2b4935` | `#1e3227` |
| 4 | `#eae8d5` | `#394d31` | `#36472d` | `#29311f` |
| 5 | `#ece5d7` | `#3a4a35` | `#374531` | `#292e23` |
| 6 | `#e8e4de` | `#384a3d` | `#354539` | `#282f2b` |

改了 `--tN`、`--tbN`、`--panel` 或 `--band` 之后要重新计算这张表。

`.number-heading` 会在内部把 `--muted`、`--line`、`--t0…--t6`、`--ts0…--ts6` 重映射成通栏版本，`footer` 会把 `--fg`、`--muted`、`--line`、`--accent` 重映射成通栏版本，所以里面的子元素照常用 token 即可。

**对比度**（已按 `tests/browser/theme.spec.ts` 的算法核算）：正文和次要文字相对 `--bg`、`--panel`、`--panel-2` 都 ≥ 4.5:1；按钮文字相对按钮底色，浅色 5.2:1、深色 8.5:1；徽章文字相对自身底色，浅色 4.76–7.26:1、深色 4.72–5.84:1、通栏上 5.07–8.61:1。**改任何颜色前后都要保证这些不低于 4.5:1。**

**注意**：`theme.spec.ts` 的颜色解析器只认 `rgb()/rgba()`。`color-mix()` 在 Chrome 里计算为 `color(srgb …)`，会被误读成近黑色。所以凡是背后有文字的背景色，都不要用 `color-mix()`，要预先算好写成 token（边框、阴影不受影响）。

### 2.2 字体

- 正文 `font-family`：`"Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans", "Noto Sans", Arial, sans-serif`（写在 `:root`）
- 展示字体 `--font-display`：`"Instrument Serif", Georgia, "Songti SC", "Hiragino Mincho ProN", "Noto Serif CJK SC", "Noto Serif", serif`
- Instrument Serif 只有 400 一个字重，所有用它的地方都要显式写 `font-weight: 400`（`:root` 里有 `font-synthesis: none`，不会伪加粗）
- 用衬线的元素：`h1`、`h2`、`.brand`、`.big-number`、`.metrics strong`、`.input-row input`、`.compare-inputs input`、`.editable-digit`、`.roll-digits > span`、`.quiz-number`、`.hunt-number`、`.result-score`、`.atlas-record h2`、`.specimen h3`、`.trait-top h3`（斜体）、`.points`、`.pattern-icon`、`.feature-card h3`
- `h3` 默认仍用正文字体 600
- `.label`、`.eyebrow` 取消全大写，改为 sentence case、`letter-spacing: .01em`、字重 500

### 2.3 形状与组件

- **按钮**：`button, .button` 为胶囊（`border-radius: 9999px`），`.icon-button` 为圆形；大块可点按的卡片（`.quiz-number`、`.draft-option`、`.share-tree-toggle`）用 20px 圆角
- **输入框 / 下拉**：胶囊形、`1.5px` 边框、`--input-bg` 底色；focus 时边框变 `--fg`，外加 4px 橄榄绿光圈
- **面板**：`.panel`、`.score-summary`、`.tier-table`、`dialog` 为 24px 圆角，无阴影（`--shadow: none`）
- **页头 `.page-head`**：`h1` 上方有一条波浪线（`h1::before` 用 CSS mask 画，颜色跟随 `currentColor`）；导语用 `--fg`，1.125rem
- **Header**：半透明底色加 blur；品牌字为衬线 “RNGDLE”，后接斜体、小写的 “.art”（`--accent` 色）；隐藏 `.brand-mark`；当前导航项用下划线表示，不再用小圆点；主题切换和菜单按钮为橄榄绿实心圆
- **结果卡**：`.number-heading` 用 `--band` 深绿底，大数字 3–5rem 衬线
- **徽章 `.badge`**：胶囊形，文字为对应级别色 `--tc`，底色是 10% 的级别色，边框是 50% 的级别色
- **页脚**：`--band` 深绿底，顶部两角 40px 圆角
- **toast**：胶囊形

### 2.4 硬性约束（来自现有测试）

1. 切换主题**不能改变任何元素的尺寸和位置**（`theme.spec.ts` 的 geometry 用例，容差 0.5px）。所以字号、边框宽度、内边距不能随主题变化，只能换颜色。
2. 任何路由、任何主题下，在 390 / 768 / 1440px 宽度都**不能出现横向滚动**。
3. 文字对比度 ≥ 4.5:1（≥ 24px 或粗体 ≥ 18.66px 的文字 ≥ 3:1）。

---

## 3. 任务清单（按顺序执行）

### T1 验证构建与测试（必做）

```bash
npm ci            # 如果 node_modules 已是最新可以跳过
npm run typecheck
npm test
npm run test:seo
npm run build
npx playwright test tests/browser/theme.spec.ts tests/browser/acceptance.spec.ts
npx playwright test   # 全量
```

**验收**：全部通过。

失败时这样处理：
- 对比度失败：调整对应 token 的明度，保持色相不变，并更新第 2.1 节的表格。
- geometry 失败：找出随主题变化的尺寸属性，改成两种主题共用。
- 其他测试失败：先判断是不是本次改动引起的。不是的话，在总结里报告，不要顺手去修。

### T2 视觉走查（必做）

先 `npm run dev`，然后逐一检查下面这些页面：浅色和深色各看一遍，宽度分别用 390 和 1440。

`/en`、`/en/infinite`、`/en/daily`、`/en/compare`、`/en/explore`、`/en/sandbox`、`/en/patterns`、`/en/guides`、任意一篇 guide 文章、`/en/rarest-numbers`、`/en/daily/answer`、`/zh`（检查中文衬线回退到宋体后是否协调）。

重点排查以下风险点：
- [ ] 全局把 `h2` 改成了衬线 1.6rem，要确认弹窗标题、文章页、`.improvement h2`、`.session .section-heading h2`、表格区域、SEO 段落里的 h2 没有过大或挤压
- [ ] 页脚栏目标题是 `h2.label`，应该显示为正文字体的小号字（`.label` 设置了 `font-family: inherit`）
- [ ] 所有按钮都成了胶囊形。检查 `.filter-chips button`、`.tabs button`、`.batch-actions button`、`.specimen button`、`.saved-number` 里的按钮，大块卡片式按钮如果变形，就加入第 2.3 节的 20px 圆角白名单
- [ ] 语言下拉框（`.language-control select`）左侧的地球图标没有被新的 `padding-inline` 盖住
- [ ] Compare 页 `.compact` 结果卡的深绿头部在两列布局下正常
- [ ] `.roll-digits`、`.editable-digit` 的衬线数字垂直居中
- [ ] 移动端菜单（≤950px 的 `.navigation.open`）的底色和当前项高亮清晰可辨
- [ ] 广告位 `.ad-slot` 的标签在深绿页脚附近仍然可读

**验收**：给上面每个页面在两种主题、两种宽度下各截一张图，没有溢出、重叠、文字截断或不可读的地方。

### T3 修复首屏主题闪烁（必做）

预渲染 HTML 固定是 `data-theme="light"`，选过深色的用户打开页面时会先闪一下浅色。在 `index.html` 的 `<head>` 里、样式表之前加一段内联脚本：

```html
<script>try{var t=JSON.parse(localStorage.getItem("rngdle.art.theme"));if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}</script>
```

存储键是 `rngdle.art.theme`，值是 JSON 字符串，见 `src/core.tsx` 里的 `readStorage` / `writeStorage`。改完后确认 `tests/seo/html.test.mjs` 和 `scripts/prerender.mjs` 仍然正常（prerender 会读取 `dist/index.html`）。如果 SEO 测试禁止内联脚本，就按测试的要求调整，并在总结里说明。

**验收**：在 localStorage 里存入 `"dark"` 后刷新页面，首帧即为深色。

### T4 字体自托管（推荐）

Google Fonts 在中国大陆访问慢或被阻断。改用 npm 包自托管：

```bash
npm i @fontsource/instrument-sans @fontsource/instrument-serif
```

在 `src/main.tsx` 顶部引入：

```ts
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
```

然后删掉 `index.html` 里的 3 行 Google Fonts `<link>`。

**验收**：build 之后 `dist/` 里包含 woff2 文件，页面没有任何发往 `fonts.googleapis.com` 或 `fonts.gstatic.com` 的请求，字体正常显示。

### T5 分享卡与 OG 图（可选）

- `scripts/build-social-images.mjs` 目前注册的是 `assets/fonts/Inter.ttf`。可以把 Instrument Serif 的 TTF 放进 `assets/fonts/` 并注册，用在大数字上；其余文字保留 Inter。
- `src/share-card.mjs` 的配色本来就是 leaf 色系，不需要改。
- **验收**：`npm run data:seo` 能正常生成图片，`tests/share-card.test.mjs` 通过，A14 分享图对比度用例通过。

### T6 站点图标与 manifest（可选）

- 检查 `public/site.webmanifest` 里的 `theme_color` 和 `background_color`，建议改为 `#eaefd1`。
- favicon 继续用森林绿底，不需要改。

### T7 文档（必做）

- `README.md` 的简介里有 “pale-leaf and forest light/dark themes”，更新为 “默认浅色 leaf 主题，可切换深色”，并说明字体来源（Instrument Sans / Instrument Serif，SIL OFL）。
- 本文档第 1 节的表格补上 T3–T6 实际修改过的文件。

---

## 4. 不要改动的地方

- `src/engine.mjs`、`src/games.mjs`、`src/i18n.ts` 的文案和计算逻辑
- `.tree-share-dialog`（分享树弹窗）的暖色纸张配色，它是刻意独立的一套视觉
- 路由、SEO 结构、广告位尺寸（`src/ads.css` 里固定的 320×50、300×250）
- 除本文档列出的改动之外，不要做无关的重构或格式化

---

## 5. 完成标准

- [ ] T1 的所有命令都通过
- [ ] T2 的截图没有视觉问题
- [ ] T3 首屏不闪烁
- [ ] T7 文档已更新
- [ ] 最后给出总结：改了哪些文件、做了哪些可选任务、遗留了什么问题
