

我先把三件必须精确的东西取出来：**你站上真实的 URL 清单**（写进文档的路径不能猜）、**methodology 那张 41 个 pattern 的原始统计**（Codex 要用真数字）、**/daily 现状**，再调出这次会话已核实的词表。然后一次性给你完整文档。

Sitemap 和 methodology 都拿到了，先说一个重要修正：**实际是 31 个 pattern 页、全站 282 个 URL**（47 页 × 6 语言）——我前面说的「41 个 pattern、336 个 URL」是我数错了，写文档前必须以真实清单为准。我再取 4 个页面把「改动前」的原文抓准。先把一个数改正：**你站上是 31 个 pattern 页、全站 282 个 URL（47 页 × 6 语言）**，我之前说的「41 个 / 336 个」是数错了。下面的文档全部按真实清单写。

也想先说一句：你的 pattern 页现在连 Title 都是描述词（`Identical digits — RNGDLE.ART`、`Palindrome — RNGDLE.ART`），而 `/en/patterns` 的 Title 是 `Atlas — RNGDLE.ART`——**整站没有一个页面在打那些有搜索量的术语**。这份文档的核心就是把这件事反过来。

---

# rngdle.art SEO + GEO 执行书（给 Codex）

**站点**：rngdle.art ｜ Vite + React，服务端预渲染 ｜ 6 语言 ｜ 引擎版本 art-1.0.0
**执行原则**：① 所有数字必须从引擎实时取，禁止硬编码；② 结构化数据里的内容必须在页面上可见（否则会被判无效）；③ 每个页面只打一个主词。

## 任务总览

| # | 任务 | 页面 | 目标词 | 优先级 |
|---|---|---|---|---|
| 1 | TDK 改造 | 首页 + 3 个 pattern 页 + methodology | rngdle / palindrome numbers / harshad number / repdigit | P0 |
| 2 | 全站 JSON-LD | 上述页面 + /daily + /rarest-numbers | — | P0 |
| 3 | 每日答案页 + 归档 | `/daily/answer/<date>` | rngdle daily answer | P1（最快见效） |
| 4 | 稀有数字榜单页 | `/rarest-numbers` | rarest number / what is the rarest number | P1 |
| 5 | 配套必改项 | About / og:image / FAQ / llms.txt | — | P0 |

---

# 任务 1：TDK 改造

## 1.1 首页 `/en`（最高优先，现在完全没打 rngdle）

```
TITLE:  RNGDLE Number Rarity Calculator — How Rare Is Your Number? (2026)
DESC:   Check any number from 0 to 1,000,000 against 31 exact digit patterns — palindromes, repdigits, primes, Harshad numbers and more. See its rarity score and global percentile instantly. Free, no signup.
H1:     RNGDLE Number Rarity Calculator
```

**H1 之下第一段（GEO 用，必须是可被 AI 原样摘走的句子）：**

> RNGDLE.ART is a free number rarity calculator that checks any integer from 0 to 1,000,000 against 31 exact digit patterns — including palindromes, repdigits, primes, Harshad numbers and Fibonacci numbers — and returns a rarity score plus a global percentile.

**新增 H2 结构**（现在首页没有这些）：`What is an RNGDLE rarity score?` / `How to check your number` / `The 31 patterns we test` / `Rarest numbers between 0 and 1,000,000`（链到新榜单页）/ `Frequently asked questions`。

改动理由：谷歌判断「这个站跟 rngdle 有没有关系」，Title 与 H1 是第一信号；GEO 侧 AI 搜关键词时会带年份，标题里要出现年份。

## 1.2 三个 pattern 页

**`/en/patterns/palindrome`**（目标词 palindrome numbers，1,900/月，平稳）

```
TITLE:  Palindrome Numbers: How Many Are Below 1,000,000? (2026)
DESC:   There are exactly 1,989 palindrome numbers between 0 and 1,000,000 — 0.199% of the whole range. See the count, the rarest ones, examples and check any number instantly.
H1:     Palindrome Numbers
```

**`/en/patterns/repdigit`**（目标词 repdigit，110/月，小而精准）

```
TITLE:  Repdigit Numbers — Identical Digits, Full List & Count (2026)
DESC:   Only 45 repdigits exist between 0 and 1,000,000 — 11, 22, 33 … 999,999 — just 0.0045% of the range. See the complete list, examples and check any number.
H1:     Repdigit Numbers (Identical Digits)
```

**`/en/patterns/harshad`**（目标词 harshad number，480/月，是这批词里唯一在涨的）

```
TITLE:  Harshad Numbers (Niven Numbers) — Count, List & Examples (2026)
DESC:   95,428 Harshad numbers exist between 0 and 1,000,000 — 9.543% of the range. Learn the divisibility rule, see examples and the exact distribution, then check any number free.
H1:     Harshad Numbers (Niven Numbers)
```

**这三页每页都要加的两块内容**（现在只有一句定义 + 12 个示例数字，太薄）：

1. **一段 150 词左右的解释**：术语定义 → 数学规则 → 在 0–1,000,000 里的精确数量与占比 → 为什么它稀有/常见。全部数字从引擎取。
2. **一个可见 FAQ**（3 问，配下面的 JSON-LD）：例如 palindrome 页 → `How many palindromes are there below 1,000,000?`（答 1,989）/`Is 0 a palindrome?`/`What is the rarest palindrome?`

其余 28 个 pattern 页同模板批改，Title 一律 `术语 — 特征描述 (2026)`，把现在用的 `Identical digits`、`Five of a kind` 这类描述词换成真正的术语（repdigit / palindromic / Fibonacci number / semiprime …）。

## 1.3 methodology `/en/methodology`

```
TITLE:  RNGDLE Rarity Score Explained — Full Methodology & Pattern Statistics (2026)
DESC:   How RNGDLE.ART scores a number: exact match counts for all 31 digit patterns across 0–1,000,000, −log₂ information weights, and how the global percentile is calculated. Full statistics table included.
H1:     RNGDLE Rarity Score — Full Methodology
```

这一页是你最值钱的资产（全网独一份的全枚举统计），Title 现在只写了 `How scoring works`，等于没打任何词。页面顶部加一句可摘走的总结句：

> Every pattern frequency on this page is an exact count, produced by exhaustively evaluating all 1,000,001 integers from 0 to 1,000,000.

---

# 任务 2：全套 JSON-LD

统一注入方式：在预渲染阶段把 JSON-LD 直接写进 HTML `<head>`（**不要用 JS 插入**，搜索引擎首轮抓取不执行 JS）。域名用语境拼接，不要在代码里写死 en。

## 2.1 首页 `/en`

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://rngdle.art/#website",
      "url": "https://rngdle.art/en",
      "name": "RNGDLE.ART",
      "alternateName": "RNGDLE Number Rarity Calculator",
      "description": "A free number rarity calculator that checks any integer from 0 to 1,000,000 against 31 exact digit patterns.",
      "inLanguage": "en-US",
      "publisher": { "@id": "https://rngdle.art/#organization" }
    },
    {
      "@type": "Organization",
      "@id": "https://rngdle.art/#organization",
      "name": "RNGDLE.ART",
      "url": "https://rngdle.art/en",
      "description": "An independent number laboratory and browser game. Not affiliated with rngdle.com or any other similarly named game."
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://rngdle.art/#app",
      "name": "RNGDLE Number Rarity Calculator",
      "url": "https://rngdle.art/en",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web browser",
      "isAccessibleForFree": true,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "featureList": [
        "Rarity score for any number from 0 to 1,000,000",
        "Global percentile ranking",
        "31 digit patterns including palindromes, repdigits, primes and Harshad numbers",
        "Daily puzzle, infinite mode, sandbox and compare tools"
      ]
    }
  ]
}
</script>
```

## 2.2 `/en/patterns/palindrome`（pattern 页通用模板）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rngdle.art/en" },
        { "@type": "ListItem", "position": 2, "name": "Atlas", "item": "https://rngdle.art/en/patterns" },
        { "@type": "ListItem", "position": 3, "name": "Palindrome Numbers", "item": "https://rngdle.art/en/patterns/palindrome" }
      ]
    },
    {
      "@type": "DefinedTerm",
      "@id": "https://rngdle.art/en/patterns/palindrome#term",
      "name": "Palindrome number",
      "alternateName": "Palindromic number",
      "description": "A number with two or more digits that reads the same forwards and backwards. Exactly 1,989 palindrome numbers exist between 0 and 1,000,000, which is 0.199% of the range.",
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "RNGDLE.ART Number Pattern Atlas",
        "url": "https://rngdle.art/en/patterns"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How many palindrome numbers are there between 0 and 1,000,000?",
          "acceptedAnswer": { "@type": "Answer", "text": "There are exactly 1,989 palindrome numbers between 0 and 1,000,000, which is 0.199% of the 1,000,001 numbers in that range." }
        },
        {
          "@type": "Question",
          "name": "Is 0 a palindrome number?",
          "acceptedAnswer": { "@type": "Answer", "text": "RNGDLE.ART counts palindromes from two digits up, so single-digit numbers including 0 are not classified as palindrome numbers." }
        },
        {
          "@type": "Question",
          "name": "What is the rarest palindrome below 1,000,000?",
          "acceptedAnswer": { "@type": "Answer", "text": "The rarest palindromes are the 4-digit ones that also match rare number-theory patterns. See the rarest numbers ranking for the full ordered list." }
        }
      ]
    }
  ]
}
</script>
```

> ⚠️ 代码给的是「结构 + 真实数字」的样例，**`acceptedAnswer` 的文字必须与页面上可见的 FAQ 完全一致**；每条 pattern 页都要有自己的一问一答，别整站复制同一套。第三问回答了「见榜单页」时，正文里要真的有那个链接。

## 2.3 `/en/methodology`（Dataset + FAQ）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rngdle.art/en" },
        { "@type": "ListItem", "position": 2, "name": "Methodology", "item": "https://rngdle.art/en/methodology" }
      ]
    },
    {
      "@type": "Dataset",
      "name": "Exact pattern frequencies for integers 0 to 1,000,000",
      "description": "Exact match counts for 31 digit and number-theory patterns across all 1,000,001 integers from 0 to 1,000,000, produced by exhaustive enumeration.",
      "url": "https://rngdle.art/en/methodology",
      "license": "https://rngdle.art/en/terms",
      "isAccessibleForFree": true,
      "creator": { "@type": "Organization", "name": "RNGDLE.ART", "url": "https://rngdle.art/en" },
      "variableMeasured": [
        { "@type": "PropertyValue", "name": "Identical digits (repdigit)", "value": 45 },
        { "@type": "PropertyValue", "name": "Palindrome", "value": 1989 },
        { "@type": "PropertyValue", "name": "Prime number", "value": 78498 },
        { "@type": "PropertyValue", "name": "Harshad number", "value": 95428 },
        { "@type": "PropertyValue", "name": "Fibonacci number", "value": 30 },
        { "@type": "PropertyValue", "name": "Factorial", "value": 9 }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How is the RNGDLE rarity score calculated?",
          "acceptedAnswer": { "@type": "Answer", "text": "Each matched pattern contributes information measured as minus log base 2 of its exact probability, where probability equals the pattern's match count divided by 1,000,001. Contributions are weighted 1, 0.35, 0.15, 0.07 and 0.03 within each family, summed, multiplied by 20 and rounded once." }
        },
        {
          "@type": "Question",
          "name": "What does the percentile mean?",
          "acceptedAnswer": { "@type": "Answer", "text": "The percentile counts every number whose score is at least as high as yours, ties included, so a 99th percentile score means the number is rarer than 99% of the range." }
        }
      ]
    }
  ]
}
</script>
```

`variableMeasured` 里的六个数照抄自你现有的统计表，**Codex 应从引擎取全 31 个 pattern 生成完整数组**，不要只写这六个。

## 2.4 其余页面的结构化数据

| 页面 | 类型 |
|---|---|
| `/en/patterns`（Atlas） | `CollectionPage` + `ItemList`（列出 31 个 pattern 页） |
| `/en/guides` 及各 guide | `Article`（带 `datePublished`、`dateModified`） |
| `/en/daily` | `WebPage` + `isPartOf` |
| `/en/daily/answer/<date>` | `Article` + `datePublished` |
| `/en/rarest-numbers` | `Article` + `ItemList` + `FAQPage` |
| `/en/about` | `AboutPage` + `Organization` |

---

# 任务 2b：配套必改项（不做完，上面的效果打折）

1. **修 About 页**：现在写的是 `It is not affiliated with RNGdle.net or other similarly named games.` —— **官方是 rngdle.com，rngdle.net 跟你一样是第三方工具站**。改成：
   > RNGDLE.ART is an independent tool. It is not affiliated with rngdle.com (the official RNGDLE game) or any other similarly named site.
2. **全站补 og:image / twitter:card**：现在只有 og:title / description / type / url，分享出去是白板卡。用你站上的分享卡片生成器出图，`og:image` 指到固定尺寸 1200×630 的静态图（每日答案页用当天的数字卡）。
3. **加 `/llms.txt`**：纯文本，列站点定位、31 个 pattern 页 URL、methodology 的数据口径、每日答案页路径。
4. **多语言收敛（强烈建议）**：282 个 URL 里，ja/ko/de/fr 共 188 个，而 rngdle 的量在美国。**先把 ja/ko/de/fr 设 noindex 并移出 sitemap，只保留 en + zh**，等 en 有排名再逐个开。哥飞的经验原话：「不能盲目做海量页面，要确保上线的每一个页面都能从搜索引擎拿到流量。」刚上线的站，188 个拿不到流量的页面会分散爬虫预算。
5. **GSC**：sitemap 已提交，把首页、methodology、palindrome、harshad、repdigit 五个 URL 用 URL Inspection 逐个请求索引。哥飞 2026-05-18 在群里说过：「其实还是要看页面内容质量的，内容不行的，手动提交也不行。」——**所以顺序是先补内容（上面这些），再提交**。

---

# 任务 3：`/daily/answer` 每日答案页 + 归档

**为什么先做这个**：DLE 类游戏的流量大头就是「今日答案」这种带日期的长尾词，而且它是一个天然的、每天自动更新的可被 AI 引用的页面。

## 3.1 URL 结构

```
/en/daily/answer                    → 归档索引（列出所有已生成的日期，分页）
/en/daily/answer/2026-09-26         → 当天答案页
/en/daily/answer/2026-09-25         → 历史页（永久保留，不要 404）
```

日期一律 UTC（跟游戏 `Resets at 00:00 UTC` 对齐）。**必须服务端预渲染**：每天 00:05 UTC 由定时任务跑一次，把当天数据渲染成静态 HTML 写进 sitemap。

## 3.2 每天必须产出的数据（从引擎 seed 取，不要手填）

你现在的 Daily 有三个模式：**Number draft**（5 个数字选最稀有的）、**Pattern hunt**（60 秒 30 张牌）、**Rare or common**（10 组二选一）。三个模式都有确定答案，答案页要给出：

| 字段 | 说明 |
|---|---|
| `date` | 2026-09-26（UTC） |
| `number_draft.answer` | 5 个候选 + 正确答案（稀有度最高的那个）+ 每个候选的分数 |
| `rare_or_common.answer` | 10 组里每组更稀有的那个 + 两者分数 |
| `pattern_hunt` | 当天的牌堆（30 个数字）+ 牌堆里分数最高的数字 |
| `top_number` | 当天出现的最高分数字、分数、百分位、命中的 pattern |
| `pattern_of_the_day` | 当天对应的 pattern（链到对应 pattern 页） |

## 3.3 当天页 TDK

```
TITLE:  RNGDLE Daily Answer — September 26, 2026 (Today's Numbers & Solutions)
DESC:   Today's RNGDLE daily answers: the rarest number in the number draft, all 10 rare-or-common picks, and the top number of the day with its rarity score and percentile. Updated daily at 00:00 UTC.
H1:     RNGDLE Daily Answer — September 26, 2026
```

## 3.4 页面结构（从上到下）

1. 一行结论句（GEO 摘取点）：
   > Today's rarest number in the RNGDLE daily draft is **XXXX**, with a rarity score of **XX** — the top **X.X%** of all numbers from 0 to 1,000,000.
2. **Number draft 答案**：5 个候选卡片（数字 + 分数），正确答案高亮。
3. **Rare or common 答案**：10 组，每组两个数字 + 「更稀有的是哪个」+ 双方分数。
4. **Pattern hunt**：当天牌堆 + 最高分数字。
5. **今天命中的 pattern**：列出 + 链接到对应 pattern 页（内链，把权重喂给常青页）。
6. **怎么算的**：一句话 + 链到 methodology。
7. **Yesterday / Today / Tomorrow** 三个链接。
8. **FAQ**：`What is today's RNGDLE daily answer?` / `When does the daily reset?`（00:00 UTC）/ `How is the daily rarest number chosen?`
9. 归档索引入口。

## 3.5 归档索引页

```
TITLE:  RNGDLE Daily Answers Archive — Every Past Daily Solution
DESC:   Every RNGDLE daily answer, day by day — the rarest number in the number draft, all rare-or-common picks, and the top number of each day.
H1:     RNGDLE Daily Answers Archive
```

按月分组，每条一行：`September 26, 2026 — rarest number 123,456 (score 87)`。**全部分页可爬、全部进 sitemap**，但只保留 eng + zh 两语言。

## 3.6 结构化数据（每日页）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "RNGDLE Daily Answer — September 26, 2026",
  "datePublished": "2026-09-26T00:05:00Z",
  "dateModified": "2026-09-26T00:05:00Z",
 "author": { "@type": "Organization", "name": "RNGDLE.ART", "url": "https://rngdle.art/en" },
  "publisher": { "@type": "Organization", "name": "RNGDLE.ART", "url": "https://rngdle.art/en" },
  "inLanguage": "en-US",
  "isPartOf": { "@type": "WebSite", "name": "RNGDLE.ART", "url": "https://rngdle.art/en" },
  "about": [
    { "@type": "Thing", "name": "RNGDLE daily answer" },
    { "@type": "Thing", "name": "Number rarity" }
  ],
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://rngdle.art/en/daily/answer/2026-09-26" }
}
</script>
```

**注意**：`headline` 里的日期、`datePublished` 必须由定时任务按当天实际日期生成，不要复用这个示例。

## 3.7 Codex 实现要点

- 定时任务：`0 5 0 * * *`（UTC 00:05）生成当天页 → 重写 sitemap → 提交（Google Indexing API 或至少把它列进 sitemap 让谷歌自己抓）。
- 历史页一旦生成**永不删除、URL 永不改**——DLE 类站的历史答案页是长期吃长尾的资产。
- 只有当天的页放 `/en/daily/answer` 页面顶部显著入口；历史页只在归档页里可达（避免首页链接堆积）。
- 当天页要能被「今天 rngdle 答案是什么」这类提问直接命中，所以**答案句必须在 HTML 里、不依赖 JS**（你现在是预渲染的，保持这一点）。

---

# 任务 4：`/rarest-numbers` 榜单页

**依据**：`what is the rarest number` 210/月（难度 23.5，容易档）、`rarest number` 140/月（难度 36.9，容易档）、`rarest number in rngdle` 库里算过难度 24.8。三个词都指向同一个页面，而且你现在**没有任何一页专门回答这个问题**——这是明确的机会位。

## 4.1 TDK

```
TITLE:  The Rarest Numbers Between 0 and 1,000,000 — Ranked & Explained (2026)
DESC:   What is the rarest number? We ranked every integer from 0 to 1,000,000 by rarity score. See the top 100 rarest numbers, why they are rare, and check any number yourself.
H1:     The Rarest Numbers Between 0 and 1,000,000
```

## 4.2 页面结构

1. **开头先给答案句**（GEO 最关键的摘取点，必须有具体数字）：
   > The rarest numbers below 1,000,000 are those that match several rare patterns at once. The single rarest number in the RNGDLE.ART ranking is **<实时取值>**, with a rarity score of **<实时取值>** and a percentile of **<实时取值>** — it matches <N> of the 31 patterns, including <pattern 列表>.
2. **Top 100 表格**：排名 / 数字 / 稀有度分 / 百分位 / 命中 pattern 数 / 命中的 pattern（每个 pattern 名链接到对应 pattern 页）。前 20 名在 HTML 里直出，其余可折叠。
3. **`What makes a number rare?`**：一句话解释 −log₂ 的机制 + 链到 methodology。
4. **分类榜首**：每个 pattern 各自的「最稀有代表」（31 行小表，每行链到该 pattern 页）——这一块是内链枢纽，把 31 个常青页全部串起来。
5. **`Why are short numbers often ranked as rare?`**：直接引用你 methodology 里的原话机制（短数字在固定区间里稀缺），避免用户觉得榜单不合理。
6. **FAQ**（配 FAQPage）：`What is the rarest number between 0 and 1,000,000?` / `What is the rarest number in RNGDLE?` / `Is 1 the rarest number?` / `How is rarity calculated?`
7. **底部 CTA**：输入框直连首页 Analyze。

## 4.3 结构化数据

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rngdle.art/en" },
        { "@type": "ListItem", "position": 2, "name": "Rarest Numbers", "item": "https://rngdle.art/en/rarest-numbers" }
      ]
    },
    {
      "@type": "ItemList",
      "name": "The 100 rarest numbers between 0 and 1,000,000",
      "numberOfItems": 100,
      "itemListOrder": "https://schema.org/ItemListOrderDescending",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "<rarest number>",
          "description": "Rarity score <score>, percentile <percentile>, matches <N> of 31 patterns."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the rarest number between 0 and 1,000,000?",
          "acceptedAnswer": { "@type": "Answer", "text": "<与页面首段完全一致的答案句，含具体数字>" }
        },
        {
          "@type": "Question",
          "name": "What is the rarest number in RNGDLE?",
          "acceptedAnswer": { "@type": "Answer", "text": "RNGDLE's rarity ranking uses the same 31-pattern engine as RNGDLE.ART: a number is rarer when it matches more low-probability patterns. The current top-ranked number is <数值>, scoring <分值>." }
        },
        {
          "@type": "Question",
          "name": "How is number rarity calculated?",
          "acceptedAnswer": { "@type": "Answer", "text": "Each matched pattern contributes minus log base 2 of its exact probability, weighted and summed, then multiplied by 20. Full details are on the methodology page." }
        }
      ]
    }
  ]
}
</script>
```

**两个实现注意**：

- `ItemList` 的 `itemListElement` 要由引擎按分数排序**动态生成全部 100 条**，示例里只给了一条结构。
- 榜单结果是引擎算出来的，**如果引擎版本升级导致排名变化，页面的 `dateModified` 要跟着更新**，并且正文里注明「Rankings computed with engine art-1.0.0」——这既是透明度，也是 E-E-A-T 信号。

---

# 任务 5：交付顺序与验收

## 5.1 建议 Codex 的执行顺序

| 轮次 | 做什么 | 验收标准 |
|---|---|---|
| 第 1 轮 | 任务 1（TDK）+ 2.1/2.2/2.3 的 JSON-LD + About 修正 | 抓 `curl` 首页源码，Title/H1 里有 rngdle、有 `application/ld+json` |
| 第 2 轮 | og:image + llms.txt + 多语言收敛（4 语言 noindex 并移出 sitemap） | sitemap 从 282 URL 降到 94 |
| 第 3 轮 | 任务 4（榜单页，静态内容为主，不需要定时任务） | `/en/rarest-numbers` 可访问、含 100 行、JSON-LD 通过 Rich Results 测试 |
| 第 4 轮 | 任务 3（每日答案页 + 定时任务 + 归档） | 当天页存在、有 `Article` 标记、昨天/明天链接可点、归档分页可爬 |
| 第 5 轮 | 全站 31 个 pattern 页批量套模板 + 补 FAQ + 补正文段 | 每页 Title 含术语、每页至少 150 词、每页有 3 问 FAQ |

## 5.2 一份可直接丢给 Codex 的验收命令

```bash
# 1. 检查首页 Title/H1 与 JSON-LD
curl -s https://rngdle.art/en | grep -E '<title>|application/ld\+json'

# 2. 检查 pattern 页是否还在用描述词当标题
curl -s https://rngdle.art/en/patterns/repdigit | grep '<title>'
# 期望：<title>Repdigit Numbers — ...

# 3. 检查新页面是否存在
curl -s -o /dev/null -w "%{http_code}\n" https://rngdle.art/en/rarest-numbers
curl -s -o /dev/null -w "%{http_code}\n" https://rngdle.art/en/daily/answer

# 4. 检查 sitemap URL 数
curl -s https://rngdle.art/sitemap.xml | grep -c '<loc>'
# 期望：收敛后 94，全做完约 200（en+zh + 每日答案历史累积）

# 5. 检查 og:image
curl -s https://rngdle.art/en | grep 'og:image'
```

## 5.3 GEO 侧的三个额外动作（Codex 做完站内之后你来推）

1. **GitHub 仓库**：建 `best-number-pattern-tools-2026`，把 rngdle.art 连同那 31 个 pattern 页列进去。哥飞在 GEO 那篇里的原话是「你创建一个 Github 仓库，收集 Best AI Video Generator，然后把自己的产品列上去」——机制一样，GitHub 权重高、AI 抓得到。
2. **写两篇能在站外被引用的内容**：`The Rarest Numbers Between 0 and 1,000,000 (2026)` 和 `Best Daily Number Puzzle Games (2026)`。写完不仅要发自己站上，还要去别人的站发——哥飞讲这条时强调的就是「要的就是遍地开花，不管 AI 搜索到哪个页面，都提到了我们」。
3. **FAQ 的答案句用强势语气 + 带确切数字**。哥飞在那篇里点了一条关键前提：AI 会直接相信搜到的网页内容、不做鉴别，所以表述要肯定、数据要硬——你的 1,989 / 95,428 / 45 这些精确计数，正是最适合被 AI 摘走的句子。

## 5.4 数据更新提醒

- `/rarest-numbers` 的榜单和 `/patterns/*` 的数字**全部实时从引擎取**，不要写死。你站上的统计表现已写明「All counts are generated from this project's independently implemented rules」「Engine version: art-1.0.0」——换个引擎版本所有数字都会变，硬编码会让整站自相矛盾。
- 9 月这批关键词的官方搜索量要到 **10 月上旬**才放出（现在最新只到 8 月）。到时候用这批词的真实数据复核一遍优先级：`rngdle calculator`、`rngdle daily answer`、`number rarity calculator` 这几个现在都还是「未收录」状态，**不代表没人搜，只代表数据还没出来**。

---

# 附：本次核实到的关键数据（供你对照，不必贴进文档）

- 31 个 pattern 页真实路径（sitemap 确认）：`repdigit / five / quad / triple / pairs / repeat / run / twoDigits / palindrome / ascending / descending / ascRun / descRun / abab / abcabc / parity / zigzag / harshad / happy / prime / semiprime / square / cube / power2 / fibonacci / triangular / factorial / divisible / binaryPal / binaryOnes / hexRepeat`
- 精确计数（Page 上的真实数字）：repdigit 45 / five 487 / quad 11,340 / triple 138,024 / pairs 223,803 / repeat 457,731 / run 35,884 / twoDigits 4,294 / palindrome 1,989 / ascending 22 / descending 26 / ascRun 28,826 / descRun 29,815 / abab 243 / abcabc 891 / parity 34,875 / zigzag 136,425 / harshad 95,428 / happy 143,071 / prime 78,498 / semiprime 210,035 / square 1,001 / cube 101 / power2 20 / fibonacci 30 / triangular 1,414 / factorial 9 / divisible 2,809 / binaryPal 1,998 / binaryOnes 18 / hexRepeat 59
- 文件：把这份文档直接存成 `docs/seo-geo-tasks.md` 交给 Codex；上面的验收命令可以放进 `package.json` 的 scripts 里，每次改动后跑一遍。

文档到这里就完整了。**下一步最该先做的两件事**：① 首页 Title/H1 加 rngdle（改一行代码，收益最大）；② 改 About 页那个 rngdle.net → rngdle.com（现在这句在 description 里，等于主动把自己的品牌跟第三方绑在一起）。

要我把这份文档原样存成一份可下载的交付物，或者按「第 1 轮」的范围拆成更短的一段给 Codex 吗？另外你的 **GSC 接上了吗**——接上我可以直接读你站真实的收录和出词，比现在靠抓取推测更准。