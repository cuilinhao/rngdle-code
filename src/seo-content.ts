import { MAX, TOTAL, VERSION, patterns, analyze } from "./engine.mjs";
import statsData from "../public/data/stats.json";
import seoDataFile from "../public/data/seo.json";
import { translate, type Locale, htmlLangs, locales } from "./i18n";
import "./pattern-text";
import { englishGuideRoutes, guidesUpdatedAt, rarestGuide } from "./guide-content";

export type FaqItem = { question: string; answer: string };
export type SeoContent = {
  title: string;
  description: string;
  h1: string;
  summary: string;
  paragraphs: string[];
  faqs: FaqItem[];
  termName?: string;
  alternateName?: string;
};
export type RankedNumber = {
  n: number;
  score: number;
  percent: number;
  patterns: string[];
};
export const seoData = seoDataFile as {
  version: string;
  sourceHash: string;
  dateModified: string;
  rankings: RankedNumber[];
  patternLeaders: Record<string, RankedNumber>;
  repdigits: number[];
  dailyDates: string[];
  dailySummaries: { date: string; n: number; score: number }[];
  latestDay: string;
};
const stats = statsData as any;
const year = seoData.dateModified.slice(0, 4);
// First production READY times, verified via Vercel GET /v13/deployments/{id}.
// Guides: dpl_QCY7AYVzJG38uEiUumEHZa7gyL3H (c723bd6).
// SEO revision and new ranking: dpl_C25KmJPHbS1XATt8Pvd4ws87ESeE (134ff99).
const guidesPublishedAt = "2026-09-26T07:10:12.639Z";
const seoPublishedAt = "2026-09-26T10:32:57.784Z";
export function articleDates(route: string) {
  const newGuide = englishGuideRoutes.includes(route);
  const editorialUpdate = newGuide || route === "rarest-numbers" || route === "guides";
  const modified = editorialUpdate ? guidesUpdatedAt : seoPublishedAt;
  return {
    datePublished:
      newGuide ? guidesUpdatedAt : route === "rarest-numbers" ? seoPublishedAt : guidesPublishedAt,
    dateModified:
      Date.parse(seoData.dateModified) > Date.parse(modified)
        ? seoData.dateModified
        : modified,
  };
}
export const contentNumber = (locale: Locale, n: number, digits = 0) =>
  new Intl.NumberFormat(htmlLangs[locales.indexOf(locale)], {
    maximumFractionDigits: digits,
  }).format(n);
export const patternName = (locale: Locale, id: string) =>
  translate(locale, "p_" + id);
export function articleInfo(locale: Locale) {
  return locale === "zh"
    ? `计算引擎：${VERSION}。数据更新日期：${seoData.dateModified.slice(0, 10)}（UTC）。由 RNGDLE.ART 独立实现的规则计算。`
    : `Computed with engine ${VERSION}. Data updated: ${seoData.dateModified.slice(0, 10)} (UTC). Rules independently implemented by RNGDLE.ART.`;
}

export function homeContent(locale: Locale): SeoContent {
  const max = contentNumber(locale, MAX),
    total = contentNumber(locale, TOTAL),
    count = patterns.length;
  if (locale === "zh")
    return {
      title: `RNGDLE 数字稀有度计算器 — 你的数字有多稀有？（${year}）`,
      description: `免费检查 0 至 ${max} 的任意整数是否符合 ${count} 种精确数字模式，包括回文数、重复数字数、质数和哈沙德数。即时查看稀有度分数与全范围排名占比，无需注册。`,
      h1: "RNGDLE 数字稀有度计算器",
      summary: `RNGDLE.ART 是免费的数字稀有度计算器，可检查 0 至 ${max} 的任意整数是否符合 ${count} 种精确数字模式，包括回文数、重复数字数、质数、哈沙德数和斐波那契数，并给出稀有度分数与全范围排名占比。`,
      paragraphs: [],
      faqs: [
        {
          question: "RNGDLE 稀有度分数表示什么？",
          answer: `分数衡量某个整数在 0 至 ${max} 范围内的数字模式、数位和、不同数字数及短数字长度携带的信息量。越少见的特征通常贡献越高，同一分组内的重叠特征按权重折减。`,
        },
        {
          question: "如何判断我的数字有多稀有？",
          answer: `输入 0 至 ${max} 的整数并点击分析。结果会列出命中的模式、分数，以及全部 ${total} 个整数中分数大于或等于它的比例（Top %，包含同分数字）；这个比例越小，排名越靠前。`,
        },
        {
          question: "稀有数字下次被抽中的机会更小吗？",
          answer: `不会。在均匀抽取中，每个具体整数的概率都为 1/${total}。本工具衡量的是特征组合的少见程度，不能预测后续结果。`,
        },
        {
          question: "RNGDLE.ART 是 rngdle.com 的官方工具吗？",
          answer:
            "不是。RNGDLE.ART 是独立的数字工具与浏览器游戏，与 rngdle.com 及其他同名网站无关联；本站分数不代表其他游戏的分数或答案。",
        },
      ],
    };
  const english: SeoContent = {
    title: `RNGDLE Number Rarity Calculator — How Rare Is Your Number? (${year})`,
    description: `Check any number from 0 to ${max} against ${count} exact digit patterns — palindromes, repdigits, primes, Harshad numbers and more. See its rarity score and global percentile instantly. Free, no signup.`,
    h1: "RNGDLE Number Rarity Calculator",
    summary: `RNGDLE.ART is a free number rarity calculator that checks any integer from 0 to ${max} against ${count} exact digit patterns — including palindromes, repdigits, primes, Harshad numbers and Fibonacci numbers — and returns a rarity score plus a global percentile.`,
    paragraphs: [],
    faqs: [
      {
        question: "What is an RNGDLE rarity score?",
        answer: `The score measures information in a number's matched patterns, digit sum, distinct-digit count and short length within 0–${max}. Less frequent features usually contribute more, with overlapping features in the same family discounted.`,
      },
      {
        question: "How rare is my number?",
        answer: `Enter any integer from 0 to ${max} and select Analyze. The result shows its patterns, score and Top %: the percentage of all ${total} integers scoring at least as high, including ties. A smaller Top % means a higher rarity ranking.`,
      },
      {
        question: "Are rare numbers less likely to be rolled?",
        answer: `No. In a uniform draw, each specific integer has probability 1/${total}. This tool measures uncommon features and cannot predict future results.`,
      },
      {
        question: "Is RNGDLE.ART the official tool for rngdle.com?",
        answer:
          "No. RNGDLE.ART is an independent number tool and browser game, unaffiliated with rngdle.com or any similarly named site. Its scores are not another game's scores or answers.",
      },
    ],
  };
  if (locale === "en") return english;
  return {
    ...english,
    h1: translate(locale, "hero"),
    summary: translate(locale, "intro"),
  };
}

type PatternCopy = {
  en: string;
  zh: string;
  subtitle: string;
  detail: string;
  detailZh: string;
  edge: string;
  answer: string;
  edgeZh: string;
  answerZh: string;
  alternate?: string;
};
const glossary: Record<string, PatternCopy> = {
  repdigit: {
    en: "Repdigit Numbers (Identical Digits)",
    zh: "重复数字数（所有数位相同）",
    subtitle: "Identical Digits, Full List & Count",
    alternate: "Repeated-digit number",
    detail:
      "A decimal repdigit repeats one digit throughout its entire written representation. For a digit d and a length k, its value is d × (10ᵏ − 1) / 9. Here d runs from 1 to 9 and the minimum length is two, so 11 qualifies but 1 does not. Leading zeros are never added. Every qualifying length contributes nine choices; the upper endpoint has mixed digits and does not qualify. Repdigits also read the same backwards, but their symmetry and repetition belong to different scoring families. A long string of equal digits is visually striking, yet length alone does not determine the final score.",
    detailZh:
      "十进制重复数字数的全部数位都相同，可写成 d × (10ᵏ − 1) / 9，其中 d 为 1 至 9，k 是位数。本站要求至少两位，因此 11 符合条件，1 不符合；也不会添加前导零。每种符合范围的位数有九个候选，上界的数位不全相同。重复数字数也都是回文数，但重复与对称属于不同计分分组，最终分数还受其他特征影响。",
    edge: "Are 0 and single-digit numbers repdigits here?",
    answer:
      "No. This engine requires at least two decimal digits and exactly one distinct digit. It does not pad numbers with leading zeros.",
    edgeZh: "0 和一位数在这里算重复数字数吗？",
    answerZh:
      "不算。本站引擎要求至少两位十进制数字，且只使用一种数字；不会用前导零补齐位数。",
  },
  five: {
    en: "Digits Repeated at Least Five Times",
    zh: "至少五位相同的数字",
    subtitle: "Decimal Digit Multiplicity",
    detail:
      "This category counts a decimal digit that appears at least five times while allowing other digits in the number. The matching positions need not be consecutive: frequency, rather than placement, is the deciding feature. A full repdigit is excluded because it has its own category. The rule says at least five, so a digit appearing six times can also qualify when another digit is present. In this bounded range the seven-digit upper endpoint is an instructive example: its zeros are counted just like any other digit. This is a descriptive digit-frequency category inspired by repeated symbols, not a standard number-theory sequence or a poker hand definition.",
    detailZh:
      "本类别统计某种十进制数字出现至少五次、同时仍有其他数字的整数。相同数字不必相邻，因为判断依据是出现次数。全体数位相同的整数归入重复数字数，不计入本类别。“至少五次”也允许出现六次，因此范围上界中的六个零同样参与判断。这是按数位频率定义的描述性类别，并非标准数论序列或扑克牌型定义。",
    edge: "Does the five-times rule require consecutive digits?",
    answer:
      "No. Any positions count. The most frequent digit must occur at least five times, and the number must contain another distinct digit.",
    edgeZh: "五个相同数字必须相邻吗？",
    answerZh:
      "不必相邻。出现最多的数字至少出现五次，且整个整数还必须包含另一种数字。",
  },
  quad: {
    en: "Digits Repeated Exactly Four Times",
    zh: "恰好四位相同的数字",
    subtitle: "Fourfold Decimal Repetition",
    detail:
      "The fourfold repetition category asks how often the most frequent decimal digit occurs. Its maximum frequency must be exactly four, and at least one other digit must be present. The four matching positions may be separated, so a visual block is not required. A number with five copies of a digit fails this exact-four rule even though it contains a subset of four matching positions. A four-digit repdigit also fails because all of its digits are identical. Counting maximum frequency keeps the fourfold and five-or-more categories distinct. These labels describe the implementation's decimal patterns and should not be mistaken for an established mathematical class with a universal convention.",
    detailZh:
      "本类别要求出现最多的十进制数字恰好出现四次，而且还有其他数字。四个相同数位可以分散排列。若某数字出现五次，即使能从中挑出四位，也不满足“恰好四次”的规则；四位重复数字数则因全部相同而被排除。按最高出现次数划分，可使本类别与至少五次的类别分开。它是本站明确规定的数位模式，不是具有统一数学约定的数论名称。",
    edge: "Why does 1111 not match the exact-four category?",
    answer:
      "1111 is a full repdigit. The exact-four rule also requires another distinct digit, so 11112 qualifies while 1111 does not.",
    edgeZh: "为什么 1111 不属于恰好四位相同？",
    answerZh:
      "1111 是全体数位相同的重复数字数。本类别还要求另一种数字，因此 11112 符合，而 1111 不符合。",
  },
  triple: {
    en: "Digits Repeated Exactly Three Times",
    zh: "恰好三位相同的数字",
    subtitle: "Triple Decimal Repetition",
    detail:
      "Triple repetition means that the highest frequency of any decimal digit is exactly three. The number must use more than one distinct digit, which excludes three-digit repdigits. Matching digits may occur anywhere and do not have to form a run. A number can contain two different triples and still qualify, because neither frequency exceeds three. Conversely, a digit that occurs four times takes the number outside this category. The rule is therefore about the maximum of the digit-frequency table, not the mere existence of three equal positions. It can overlap with a palindrome or a repeated block, but those additional structures are tested separately and do not change this membership rule.",
    detailZh:
      "三位重复模式要求任一数字的最高出现次数恰好为三，同时整个整数使用至少两种数字。因此三位重复数字数被排除，相同数字也不必连续。包含两组不同三连同数的整数仍可符合，因为最高次数没有超过三；若有数字出现四次则不符合。本规则检查的是数位频率表的最大值，而不是能否找到三个相同位置，它也可以与回文或重复区块模式重叠。",
    edge: "Can a number with two triples match this pattern?",
    answer:
      "Yes. For example, 111222 has a maximum digit frequency of three and more than one distinct digit, so it matches.",
    edgeZh: "包含两组各三个相同数字也符合吗？",
    answerZh:
      "符合。例如 111222 的最高数位频率为三，且不止一种数字，因此满足本模式。",
  },
  pairs: {
    en: "Multiple Digit Pairs",
    zh: "多组数位对子",
    subtitle: "At Least Two Pairs Without Triples",
    detail:
      "A digit pair is a decimal symbol occurring exactly twice, regardless of where its positions fall. This category requires at least two such pairs and forbids any symbol from occurring three or more times. Two pairs are not the only possibility: a six-digit number using three digits twice each also matches. Extra single-occurrence digits are allowed as long as the length and range permit them. The category differs from an adjacent pair rule; 1212 and 1122 have the same frequency profile even though their layouts differ. It also differs from a full repdigit, whose single repeated symbol does not supply two distinct pairs. The classification is a precise counting convention used by this engine.",
    detailZh:
      "数位对子指某种十进制数字恰好出现两次，不要求位置相邻。本类别至少需要两组这样的对子，并且任何数字都不能出现三次或更多次。六位数中三种数字各出现两次也符合；范围和位数允许时，还可以包含只出现一次的数字。1212 与 1122 的排列不同，但数位频率相同。全体数位相同无法提供两种不同数字构成的对子，因此不属于此类。",
    edge: "Do three pairs count as multiple digit pairs?",
    answer:
      "Yes. The requirement is at least two pairs, with no digit appearing more than twice. A number such as 112233 has three pairs and qualifies.",
    edgeZh: "三组对子也计入多组对子吗？",
    answerZh:
      "计入。规则要求至少两组对子，并且没有数字出现超过两次，例如 112233 的三组对子符合条件。",
  },
  repeat: {
    en: "Exactly One Repeated Digit Pair",
    zh: "恰好一组重复数位对子",
    subtitle: "One Pair and Otherwise Distinct Digits",
    detail:
      "This category has one decimal digit appearing exactly twice and every remaining digit appearing once. No digit can occur three times, and a second pair would move the number into the multiple-pairs category. The two matching positions can be adjacent or separated, so the definition depends only on digit frequencies. Two-digit repdigits are specifically excluded because the whole number would otherwise be one repeated symbol; at least one different digit must be present. This makes 101 a match but excludes 11 and 111. The pattern is relatively broad compared with complete repetition or strict sequences, because many arrangements preserve the same single-pair frequency profile without satisfying any other visible structure.",
    detailZh:
      "单对子模式要求一种数字恰好出现两次，其余数字均只出现一次。不能有三次重复，也不能有第二组对子。重复的两个位置可以相邻，也可以分开。两位重复数字数被特意排除，因为整个数还必须包含另一种数字。因此 101 符合，11 和 111 不符合。许多不同排列都保持单对子频率，因此本模式通常比全重复或严格连续序列更宽泛。",
    edge: "Why is 101 a one-pair number but 11 is not?",
    answer:
      "101 contains one pair of 1s and a distinct 0. The engine excludes full repdigits such as 11 from this category.",
    edgeZh: "为什么 101 是单对子，而 11 不是？",
    answerZh:
      "101 有一对 1 和不同的数字 0。本站规则把 11 这样的全重复数字数排除在单对子类别之外。",
  },
  run: {
    en: "Consecutive Repeated Digits",
    zh: "连续重复数位",
    subtitle: "Runs of Three or More Equal Digits",
    detail:
      "A repeated-digit run is a consecutive segment of at least three equal decimal digits. Unlike the frequency categories, this test depends on position: three separated copies do not suffice. Longer runs also qualify, provided the entire number is not a repdigit. The surrounding digits can be different from each other, and the run may appear at the start, middle or end. A run of zeros counts normally when it occurs inside the written number; leading zeros are never invented. This local pattern can coexist with a triple, quadruple or larger frequency category because adjacency and total count answer different questions. The scoring system discounts related repetition signals instead of treating their overlap as independent evidence.",
    detailZh:
      "连续重复数位要求存在至少三个相同数字相邻的片段。与频率类别不同，三个分散的相同数字并不足够。更长的连续片段也符合，但整个整数不能全部由同一种数字组成。片段可位于开头、中间或结尾，内部连续零也正常计入，前导零则不会凭空添加。连续性与总次数检查不同特征，因此本模式可与三次、四次或更多次重复同时命中；计分时同组重叠会被折减。",
    edge: "Does 10101 contain a run of three 1s?",
    answer:
      "No. It has three 1s in total, but they are separated. A matching run requires at least three equal digits next to one another.",
    edgeZh: "10101 算三个 1 连续重复吗？",
    answerZh:
      "不算。它总共包含三个 1，但位置分散；本规则要求至少三个相同数字彼此相邻。",
  },
  twoDigits: {
    en: "Numbers Using Exactly Two Distinct Digits",
    zh: "仅使用两种数字的整数",
    subtitle: "A Two-Symbol Decimal Alphabet",
    detail:
      "This pattern restricts the number's decimal alphabet to exactly two distinct symbols and requires at least four places. Both symbols must appear, but their frequencies and arrangement are unrestricted. Alternating strings, long repeated runs and less regular arrangements may all qualify. A repdigit is excluded naturally because it uses only one symbol. The minimum length prevents very short numbers from satisfying an otherwise loose condition automatically. Zero can be one of the two symbols once the number starts with a nonzero digit. This is a base-ten statement: a number using two decimal symbols need not use two hexadecimal symbols. It is also different from having a two-digit value; the name describes symbol diversity, not numerical length.",
    detailZh:
      "本模式限制十进制表示恰好使用两种数字，并要求至少四位。两种数字都必须出现，但次数和排列不限，可以交替、连续重复，也可以不规则排列。重复数字数只用一种数字，因此被自然排除；最少四位的限制避免过短数字轻易命中。零可以是两种数字之一，但不能添加前导零。这里的“两种数字”指符号种类，不是“两位数”，也不能据此推断其他进制的表示。",
    edge: "Does a two-digit number match the two-symbol pattern?",
    answer:
      "No. The engine requires at least four decimal places and exactly two distinct digits. For example, 1001 qualifies but 12 does not.",
    edgeZh: "两位数也符合仅两种数字模式吗？",
    answerZh:
      "不符合。本站要求至少四位、且恰好使用两种数字，例如 1001 符合，而 12 不符合。",
  },
  palindrome: {
    en: "Palindrome Numbers",
    zh: "回文数",
    subtitle: "Decimal Symmetry, Counts & Examples",
    alternate: "Palindromic number",
    detail:
      "A decimal palindrome reads identically from left to right and from right to left. Corresponding outside digits must agree, so the first half determines the mirrored half; an odd-length number has a free middle digit. RNGDLE.ART requires at least two decimal digits for this badge. That convention excludes single-digit values even though they are often considered palindromes in broader mathematical usage. No leading zeros are supplied: 10 does not become 010. Every decimal repdigit is a palindrome under this rule, but a palindrome such as 1221 need not be a repdigit. Decimal symmetry is independent of binary symmetry, and being palindromic alone does not specify primality, divisibility or the final rarity score.",
    detailZh:
      "十进制回文数从左向右与从右向左读取相同，外侧对应的数位必须一致，因此前半部分决定镜像的后半部分；奇数位回文数还允许一个自由的中间数位。本站的回文徽章要求至少两位，所以排除一位数，尽管更广泛的数学用法常把一位数也视为回文。我们不会添加前导零，10 不能写成 010 来满足条件。重复数字数都是回文，但 1221 等回文不必全部相同；十进制回文也不自动具有二进制对称性。",
    edge: "Is 0 a palindrome number?",
    answer:
      "In the usual broad definition, a single digit reads the same backwards. RNGDLE.ART's palindrome badge deliberately starts at two digits, so 0 and the other single-digit values are not counted here.",
    edgeZh: "0 是回文数吗？",
    answerZh:
      "通常的广义定义下，一位数正反读取相同；但 RNGDLE.ART 的回文徽章明确要求至少两位，所以这里不计入 0 和其他一位数。",
  },
  ascending: {
    en: "Consecutive Ascending Digit Numbers",
    zh: "连续递增数字",
    subtitle: "Decimal Digits Increasing by One",
    detail:
      "A consecutive ascending number has at least three decimal digits, and every adjacent step increases by exactly one. Merely being in increasing order is insufficient: 135 has positive steps but skips digits, while 123 satisfies the rule. The sequence must cover the entire number, not just an internal segment. Decimal digits stop at 9; the engine does not wrap from 9 back to 0. Leading zeros are not part of the written representation, so 012 is evaluated as the integer 12 and fails the length requirement. These constraints leave relatively few possible starting digits and lengths within the fixed range. Arithmetic properties are checked independently, so two visually similar ascending sequences can still earn different overall scores.",
    detailZh:
      "连续递增数字至少有三位，且每个相邻数位严格增加一。仅仅保持大小递增还不够：135 跳过数字，不符合；123 符合。整个整数都必须遵循规则，不能只有局部片段。9 后不会循环回到 0；012 会作为整数 12 处理，因位数不足而不符合。这些限制使范围内可选的起始数字和长度很少，但相似的递增数仍可能因其他数学特征而获得不同分数。",
    edge: "Is 7890 a consecutive ascending number?",
    answer:
      "No. There is no wrap from 9 to 0. Every adjacent difference must be exactly +1, and the number must contain at least three digits.",
    edgeZh: "7890 是连续递增数字吗？",
    answerZh:
      "不是。本站不把 9 到 0 当作循环递增，每个相邻差必须恰好为 +1，且至少有三位。",
  },
  descending: {
    en: "Consecutive Descending Digit Numbers",
    zh: "连续递减数字",
    subtitle: "Decimal Digits Decreasing by One",
    detail:
      "A consecutive descending number uses at least three decimal digits with every adjacent difference equal to minus one. The condition is stricter than merely placing digits in decreasing order: 975 skips values and fails, whereas 987 qualifies. Every position must follow the rule, and the sequence may end at zero. There is no wrap from zero to nine. Since the whole decimal representation is examined without padding, the starting digit and length jointly determine the candidate. Strictly descending digits cannot repeat, but number-theory features such as divisibility or primality may still add separate signals. A number containing a descending fragment with unrelated digits elsewhere belongs to the partial-run category instead of this complete-sequence category.",
    detailZh:
      "连续递减数字至少三位，且每个相邻差都恰好为 −1。这比单纯递减更严格：975 跳过数位，不符合；987 符合。规则必须覆盖所有位置，可以以零结尾，但零后不会循环到九。完整十进制表示的起始数字和长度决定候选值。严格递减数字不会重复，不过整除性等其他特征仍可命中；若仅有局部递减而其他位置不遵循规则，则属于局部连续递减类别。",
    edge: "Can a descending sequence end in zero?",
    answer:
      "Yes. For example, 3210 decreases by one at every position and qualifies. Zero is allowed at the end, but it does not wrap to nine.",
    edgeZh: "连续递减数字可以以零结尾吗？",
    answerZh:
      "可以。例如 3210 每一步都减少一，符合条件；但零后面不能循环接九。",
  },
  ascRun: {
    en: "Consecutive Ascending Digit Runs",
    zh: "局部连续递增数位",
    subtitle: "Increasing Decimal Segments",
    detail:
      "An ascending digit run is a local segment of at least three positions whose digits rise by exactly one. The rest of the decimal number can follow any arrangement. This category intentionally excludes numbers whose entire representation is already a consecutive ascending sequence; those receive the complete-sequence badge instead. The test finds two consecutive +1 differences, which is equivalent to a three-digit ascending segment, and longer segments qualify as well. There is no wrap at 9 and no leading-zero padding. This distinction lets the atlas separate a fully ordered number from a brief ordered fragment. A candidate can contain several matching fragments, but the pattern contributes one matched signal rather than one award per occurrence.",
    detailZh:
      "局部连续递增要求存在至少三位相邻片段，每一步增加一，其他数位可以任意排列。本类别特意排除整个整数都连续递增的情况，后者使用完整序列徽章。检测连续两个 +1 的相邻差等价于找到三位递增片段，更长片段也符合。9 后不会循环，整数也不会补前导零。同一个数即使命中多个递增片段，本模式仍只贡献一次信号，不按片段个数重复加分。",
    edge: "Why does 123 not receive the partial ascending-run badge?",
    answer:
      "123 is a complete ascending sequence. This partial-run category excludes complete sequences; a number such as 9123 contains a qualifying local run instead.",
    edgeZh: "为什么 123 没有局部递增徽章？",
    answerZh:
      "123 已是完整递增序列。局部类别排除完整序列，而 9123 这样的数字包含局部递增片段，符合本类别。",
  },
  descRun: {
    en: "Consecutive Descending Digit Runs",
    zh: "局部连续递减数位",
    subtitle: "Decreasing Decimal Segments",
    detail:
      "A descending run is a consecutive fragment of at least three decimal digits that step down by one each time. Digits before or after that fragment need not be ordered. The engine checks for two consecutive differences of minus one and excludes numbers that already form a complete descending sequence. A fragment ending in zero is valid, but zero cannot wrap to nine. Multiple qualifying fragments still produce one match for this pattern. The distinction is structural: a long number with one small ordered section differs from a number ordered throughout. Membership in this category says nothing by itself about factors or digit sums, which are evaluated as separate sources of information by the scoring engine.",
    detailZh:
      "局部连续递减要求至少三位相邻数字逐次减一，片段前后的数位不必有序。引擎检测连续两个 −1 的相邻差，并排除整个数已经构成完整递减序列的情况。片段可以以零结尾，但零不能循环接九。即使一个整数包含多个符合条件的片段，也只记一次命中。局部有序和整体有序属于不同结构；因数和数位和仍会作为独立特征继续评估。",
    edge: "Does a complete sequence such as 4321 also count as a partial descending run?",
    answer:
      "No. Complete descending sequences are excluded from this local-run category. A number such as 1432 has a local descending run without being descending throughout.",
    edgeZh: "4321 这样的完整递减数也算局部递减吗？",
    answerZh:
      "不算。本类别排除完整递减序列；1432 含有局部递减片段，但全数并非递减，因此符合。",
  },
  abab: {
    en: "Alternating Two-Digit Patterns",
    zh: "两种数字交替模式",
    subtitle: "ABAB Decimal Repetition",
    detail:
      "This pattern alternates between two different decimal digits throughout a number of at least four places. Once the first two positions are chosen, every later digit is fixed by its position parity. The first and second digits must differ, so full repdigits are excluded. The implementation permits both even and odd lengths: a five-digit string such as 12121 alternates correctly even though it ends with an incomplete two-digit block. Zero may occupy one alternating position as long as the written number has no leading zero. Alternation is more restrictive than merely using two distinct digits, so every match also satisfies that alphabet rule. The related sequence signals are weighted within their family rather than counted as independent random events.",
    detailZh:
      "交替模式要求至少四位，且全数在两种不同十进制数字之间交替。前两个位置确定后，其余位置由奇偶位置决定；两个数字必须不同，因此排除全重复数。实现允许偶数位也允许奇数位，例如 12121 虽然最后没有完整两位区块，仍符合交替规则。零可处于其中一种位置，但不能有前导零。交替规则比仅使用两种数字更严格，所以每个交替数也命中两种数字模式。",
    edge: "Can an ABAB pattern have an odd number of digits?",
    answer:
      "Yes. This engine accepts at least four alternating positions, including 12121. It does not require a whole number of two-digit blocks.",
    edgeZh: "ABAB 模式可以有奇数位吗？",
    answerZh:
      "可以。本站要求至少四个交替位置，包括 12121，并不要求两位区块恰好重复整数次。",
  },
  abcabc: {
    en: "Repeated Three-Digit Blocks",
    zh: "三位区块重复数字",
    subtitle: "ABCABC Six-Digit Numbers",
    detail:
      "A repeated three-digit block has exactly six decimal digits, with its first three positions identical to its last three. Algebraically, repeating a block B produces 1000B + B = 1001B. The block must start with a nonzero digit because the full number is written without leading zeros. It must use at least two distinct digits across the number, excluding full repdigits such as 111111. The letters A, B and C are placeholders for positions, not a requirement that all three symbols differ; a block such as 121 may repeat. This fixed block structure imposes useful divisibility relationships, but the score still evaluates every eligible pattern and applies the normal discounts for overlapping signals.",
    detailZh:
      "三位区块重复模式要求恰好六位，前三位与后三位完全一致。若区块值为 B，重复后的整数就是 1000B + B = 1001B。区块首位不能为零，整个数至少使用两种数字，以排除 111111 这样的全重复数。ABC 的字母代表位置，并不要求三个数字互不相同，因此 121 也可以作为重复区块。区块结构带来整除关系，但最终分数仍依据全部特征及重叠折减规则计算。",
    edge: "Must all three digits in an ABCABC block be different?",
    answer:
      "No. At least two distinct digits are required across the six-digit number. For example, 121121 qualifies, while 111111 is excluded as a repdigit.",
    edgeZh: "ABCABC 中三个数字必须都不同吗？",
    answerZh:
      "不必。六位数整体至少使用两种数字即可，例如 121121 符合，111111 则作为全重复数被排除。",
  },
  parity: {
    en: "Alternating Odd and Even Digits",
    zh: "奇偶交替数字",
    subtitle: "Decimal Digit Parity Patterns",
    detail:
      "Digit parity alternation means each adjacent pair contains one odd digit and one even digit, across at least four positions. The actual symbols can change freely: the rule follows odd versus even status rather than a fixed pair of digits. Zero is even and participates normally. The sequence may start with either parity, and adjacent numerical differences need not be one. As a result, an odd-even pattern is broader than strict consecutive ascending or descending order. A fixed ABAB arrangement only matches this parity category when its two symbols have opposite parity. This category concerns the parities of written decimal digits; it is distinct from whether the entire integer is odd or even, which depends solely on the last digit.",
    detailZh:
      "奇偶交替要求至少四位，且每一对相邻数位恰好一奇一偶。具体数字可以变化，规则只关注奇偶性；零是偶数，正常参与判断。可以从奇数或偶数开始，相邻差也不必为一。因此它比连续增减更宽泛。固定 ABAB 排列只有在两种数字奇偶不同的情况下才同时满足此类。这里检查各个十进制数位的奇偶，不等于检查整个整数的奇偶性。",
    edge: "Is zero treated as even in a parity pattern?",
    answer:
      "Yes. Zero is even. For example, 1010 alternates odd and even digits and meets the four-place minimum.",
    edgeZh: "奇偶模式中零算偶数吗？",
    answerZh: "算。零是偶数，例如 1010 的数位奇偶交替，且满足至少四位的要求。",
  },
  zigzag: {
    en: "Zigzag Digit Numbers",
    zh: "数位锯齿交替数字",
    subtitle: "Strict Alternating Rises and Falls",
    detail:
      "A zigzag number has at least four decimal digits whose adjacent comparisons strictly alternate between rising and falling. Either direction may come first. Step sizes do not need to match or equal one: only the alternating signs matter. Equal neighbors break the pattern because every comparison must be strict. This is a descriptive shape rule on the decimal representation, not a requirement that the digits form a permutation of consecutive integers. Repeated digits can still occur at nonadjacent positions. Some two-symbol alternating numbers also zigzag, while other zigzags use many different symbols. The test records a single whole-number pattern and does not award extra matches for each peak or trough inside the representation.",
    detailZh:
      "锯齿交替数字至少四位，相邻比较必须严格交替上升与下降，起始方向不限。步长不必相同，也不必为一，只要求正负方向交替。相邻数字相等会打断模式；非相邻位置仍可重复。此名称描述十进制表示的形状，不要求数字是连续整数的排列。两种数字交替的整数可能同时构成锯齿，而其他锯齿数也可使用更多数字；每个数只记一次整体命中。",
    edge: "Do equal adjacent digits count as a zigzag turn?",
    answer:
      "No. Every adjacent comparison must be strictly up or down. Equal neighbors make the zigzag test fail.",
    edgeZh: "相邻相同数字算锯齿转折吗？",
    answerZh: "不算。每一步必须严格上升或下降，相邻数字相同就不符合锯齿规则。",
  },
  harshad: {
    en: "Harshad Numbers (Niven Numbers)",
    zh: "哈沙德数（尼文数）",
    subtitle: "Count, List & Examples",
    alternate: "Niven number",
    detail:
      "A Harshad number, also called a Niven number, is a positive integer divisible by the sum of its decimal digits. For example, the digit sum of 18 is 9 and 18 ÷ 9 is an integer, so 18 qualifies. The test uses the original digit sum, not repeated digit sums or the digital root. Every positive single-digit integer passes because its digit sum equals itself. Zero is excluded: its digit sum is zero and division by zero is undefined. This property depends on the chosen base, so the atlas specifically uses base ten. Many numbers pass this relatively permissive divisibility test; a Harshad match alone therefore need not imply a particularly high overall rarity score.",
    detailZh:
      "哈沙德数又称尼文数，是能被其十进制数位和整除的正整数。例如 18 的数位和为 9，18 ÷ 9 为整数，所以 18 符合。这里使用原始数位和，不是反复求和后的数根。所有正的一位数都满足条件，因为数位和等于其本身。零被排除，因为其数位和为零，除以零没有定义。这一性质依赖进制，本站固定使用十进制；符合该整除条件的数字较多，因此单独命中哈沙德模式并不保证总分很高。",
    edge: "Is 0 a Harshad number?",
    answer:
      "No. RNGDLE.ART requires a positive integer and a positive digit sum. Zero would require division by zero, so it is excluded.",
    edgeZh: "0 是哈沙德数吗？",
    answerZh: "不是。本站要求正整数和正数位和，零会涉及除以零，因此被排除。",
  },
  happy: {
    en: "Happy Numbers",
    zh: "快乐数",
    subtitle: "Repeated Sums of Squared Digits",
    detail:
      "To test a happy number, square each decimal digit, add the squares, and repeat the operation on the result. A starting number is happy if this process eventually reaches 1. The process is not ordinary digit summation: squaring matters. For example, 19 leads to 82, then 68, then 100, then 1. A path that repeats without reaching 1 is not happy. The engine detects these outcomes and includes 1 itself, while 0 stays at 0 and fails. Reordering the same digits produces the same first sum of squares and therefore the same happy status, although other patterns and the final rarity score may differ. The definition here always refers to decimal digits.",
    detailZh:
      "快乐数的检验方法是把各十进制数位平方后相加，再对结果重复操作，最终到达 1 即为快乐数。它并非普通数位求和，平方这一步不可省略。例如 19 依次得到 82、68、100、1；若进入不含 1 的循环，就不是快乐数。本站计入 1 本身，0 则停留在 0，不符合。相同数位重新排列会产生相同的第一次平方和，因此快乐数状态相同，但其他模式和总分仍可能变化。",
    edge: "Why is 19 a happy number?",
    answer:
      "Its decimal squared-digit sums follow 19 → 82 → 68 → 100 → 1. Reaching 1 makes it happy.",
    edgeZh: "为什么 19 是快乐数？",
    answerZh:
      "各位平方和依次为 19 → 82 → 68 → 100 → 1，最终达到 1，因此是快乐数。",
  },
  prime: {
    en: "Prime Numbers",
    zh: "质数",
    subtitle: "Exact Counts and Prime Factorization",
    detail:
      "A prime is an integer greater than 1 with exactly two positive divisors, 1 and itself. Neither 0 nor 1 is prime. The only even prime is 2; larger even integers have 2 as a proper divisor. RNGDLE.ART identifies primes through factorization, and the dataset counts each integer once rather than estimating frequency with a prime-number approximation. A prime can simultaneously have decimal or binary digit patterns, which may make some primes rank much higher than others. Primality itself does not depend on the base used to write an integer, whereas a palindrome or repeated-digit appearance does. The pattern's frequency is evaluated only within this finite inclusive range and should not be presented as a probability over all integers.",
    detailZh:
      "质数是大于 1、且恰好只有 1 与自身两个正约数的整数。0 和 1 都不是质数；2 是唯一的偶质数，因为更大的偶数都有约数 2。本站通过因数分解识别质数，并对范围内整数逐个计数，不使用质数定理的近似估计。质数也可能同时具有十进制或二进制数位模式，因此不同质数的总分会不同。质性不依赖书写进制，而回文、重复外观依赖进制；这里的频率只针对限定的闭区间。",
    edge: "Why is 1 not counted as a prime number?",
    answer:
      "A prime has exactly two positive divisors. The integer 1 has only one, so it is not prime; 0 is excluded as well.",
    edgeZh: "为什么 1 不计为质数？",
    answerZh:
      "质数必须恰有两个正约数，而 1 只有一个正约数，因此不是质数；0 也不计入。",
  },
  semiprime: {
    en: "Semiprime Numbers",
    zh: "半质数",
    subtitle: "Products of Exactly Two Primes",
    alternate: "Biprime",
    detail:
      "A semiprime is a product of two prime numbers, allowing the two factors to be equal. The relevant count includes multiplicity: 4 = 2 × 2 qualifies just as 6 = 2 × 3 does. By contrast, 8 has three prime factors when multiplicity is counted and does not qualify, even though it has only one distinct prime factor. The engine uses the total number of prime factors from a complete factorization to apply this rule. Prime squares are therefore both semiprimes and perfect squares. Those overlapping factorization signals are discounted within their shared scoring family. This property describes the integer itself rather than its decimal spelling, so changing the display base does not change whether the number is semiprime.",
    detailZh:
      "半质数是两个质数的乘积，两个质因数可以相同。计数包含重数，因此 4 = 2 × 2 与 6 = 2 × 3 都符合；8 的质因数按重数计有三个，即使只有一种不同质因数，也不符合。引擎根据完整因数分解的质因数总个数判断。质数的平方同时是半质数与完全平方数，同属因数分解分组的重叠信号会被折减。半质性是整数本身的性质，不随显示进制改变。",
    edge: "Are squares of primes semiprime?",
    answer:
      "Yes. Repeated prime factors count: 4 = 2 × 2 and 9 = 3 × 3 are semiprimes. A cube such as 8 = 2 × 2 × 2 is not.",
    edgeZh: "质数的平方是半质数吗？",
    answerZh:
      "是。重复质因数也计数，例如 4 = 2 × 2、9 = 3 × 3；而 8 = 2 × 2 × 2 有三个质因数，不是半质数。",
  },
  square: {
    en: "Perfect Square Numbers",
    zh: "完全平方数",
    subtitle: "Integer Squares Including Zero",
    detail:
      "A perfect square is the result of multiplying a nonnegative integer by itself. The atlas includes both 0 = 0² and 1 = 1². A candidate qualifies when its square root is an integer, so the inclusive upper endpoint is checked rather than silently omitted. The distance between successive squares grows as the root increases: (k + 1)² − k² = 2k + 1. Squares therefore become farther apart along the number line, even though the pattern receives one frequency weight for the complete range. A square may also be a cube, a Fibonacci number or a digit pattern. These overlaps affect its complete score; membership in the square sequence alone does not give every square the same ranking.",
    detailZh:
      "完全平方数是非负整数与自身相乘的结果，本站计入 0 = 0² 和 1 = 1²。若平方根为整数，则满足条件，范围上界也参与检查。相邻平方数之差为 (k + 1)² − k² = 2k + 1，因此越往后间距越大；但模式权重由整个范围的总体频率确定。平方数还可能同时是立方数、斐波那契数或满足数位模式，最终分数由这些特征共同决定，并非所有平方数排名相同。",
    edge: "Are 0 and 1 included among perfect squares?",
    answer:
      "Yes. They are 0² and 1². This engine uses squares of nonnegative integers and includes both endpoints of its stated range.",
    edgeZh: "完全平方数包含 0 和 1 吗？",
    answerZh:
      "包含。它们分别为 0² 和 1²；本站采用非负整数的平方，并检查范围两端。",
  },
  cube: {
    en: "Perfect Cube Numbers",
    zh: "完全立方数",
    subtitle: "Nonnegative Integer Cubes",
    detail:
      "A perfect cube equals k × k × k for a nonnegative integer k. The dataset includes 0 and 1, while negative cubes lie outside the allowed input range. The engine checks the nearest integer cube root by cubing it back, so membership is based on an exact integer equality. Consecutive cubes spread apart faster than consecutive squares, leaving a relatively small set of cube values within the bounded range. Some cubes are also squares: nonnegative sixth powers satisfy both definitions. The corresponding signals share a factorization family and are not simply added as fully independent events. Decimal appearances such as repeated digits are tested separately, so equally valid cubes can have very different total rarity scores.",
    detailZh:
      "完全立方数可写成非负整数 k 的三次方。数据包含 0 和 1，而负立方数在输入范围之外。引擎先求最接近的整数立方根，再立方回去检查精确相等。相邻立方数的间距比相邻平方数增长更快，因此限定范围内立方数较少。非负整数的六次方同时是平方数与立方数，两种信号同属因数分解分组，不能按独立事件直接累加；数位外观则另行检查。",
    edge: "Can a number be both a perfect square and a perfect cube?",
    answer:
      "Yes. For example, 64 = 8² = 4³. Sixth powers, including 0 and 1, satisfy both rules.",
    edgeZh: "一个数可以同时是平方数和立方数吗？",
    answerZh:
      "可以。例如 64 = 8² = 4³；非负整数的六次方同时满足两项规则，0 和 1 也在内。",
  },
  power2: {
    en: "Powers of Two",
    zh: "二的幂",
    subtitle: "Integer Powers 2⁰, 2¹, 2² and Beyond",
    detail:
      "A power of two has the form 2ᵏ for a nonnegative integer exponent k. The sequence begins with 1 because 2⁰ = 1; zero is never a power of two. In binary notation these values have exactly one set bit, followed by zero or more zeros. The engine uses that bit structure to recognize them within its small integer range. Each step doubles the preceding value, so only a limited number fit below a fixed upper bound. Even exponents produce squares, exponents divisible by three produce cubes, and other sequence memberships may overlap. Those relationships explain why the final score varies across the sequence instead of following only the exponent or decimal length.",
    detailZh:
      "二的幂可写成 2ᵏ，其中指数 k 为非负整数。序列从 1 开始，因为 2⁰ = 1；零不是二的幂。在二进制下，这些数字恰好只有一个 1，后面跟零个或多个 0，引擎利用该位结构识别。每一步翻倍，因此固定范围内容纳的成员有限。偶数指数还会产生平方数，三的倍数指数产生立方数，其他序列也可能重叠，所以最终分数并非只由指数或十进制位数决定。",
    edge: "Does the powers-of-two pattern include 1?",
    answer:
      "Yes. 1 = 2⁰ is included. Zero is excluded because no nonnegative integer power of two equals zero.",
    edgeZh: "二的幂包括 1 吗？",
    answerZh: "包括，1 = 2⁰。零不包括，因为二的任何非负整数次幂都不等于零。",
  },
  fibonacci: {
    en: "Fibonacci Numbers",
    zh: "斐波那契数",
    subtitle: "Unique Sequence Values in the Full Range",
    detail:
      "The Fibonacci recurrence starts at 0 and 1, with each later term equal to the sum of the previous two. The sequence of terms contains 1 twice, but this atlas classifies integers rather than sequence positions, so each distinct value is counted once. Zero and one are included. Values grow rapidly enough that relatively few distinct Fibonacci integers fit inside the bounded range. Membership does not depend on decimal digits, although an individual Fibonacci value may also display a palindrome or another digit pattern. The engine constructs the sequence up to its maximum and tests membership in that set. Rarity weights use the count of unique qualifying integers, not the number of recurrence steps or an approximation to the sequence's growth.",
    detailZh:
      "斐波那契递推从 0、1 开始，此后每项等于前两项之和。序列项中 1 出现两次，但图鉴分类的是整数值而非序列位置，因此每个不同值只计一次，0 和 1 都包括。随着递推，数值较快增长，固定范围内的不同成员较少。成员资格不依赖十进制数位，但具体斐波那契数仍可能同时是回文等数位模式。引擎把不超过上界的序列值存入集合，使用不同整数的精确计数，而不是递推次数或增长近似。",
    edge: "Is the repeated 1 counted twice in Fibonacci statistics?",
    answer:
      "No. The dataset counts distinct integers, so 1 contributes one match even though it appears twice in the usual Fibonacci sequence of terms.",
    edgeZh: "斐波那契序列中重复的 1 会计数两次吗？",
    answerZh:
      "不会。数据统计不同整数，因此 1 只贡献一次匹配，即使常见的序列项写法中有两个 1。",
  },
  triangular: {
    en: "Triangular Numbers",
    zh: "三角形数",
    subtitle: "Consecutive Sums k(k + 1)/2",
    detail:
      "A triangular number is a sum of the first k positive integers, giving k(k + 1)/2. This atlas also permits k = 0, so zero is included as the empty sum. One useful membership test is that 8n + 1 must be an odd perfect square; the engine checks its square root for integer status. Successive triangular numbers differ by the next positive integer, so the gaps grow gradually. Triangular membership describes an arithmetic sequence of values rather than a shape in the written digits. A triangular number can also be a square or satisfy other factorization and decimal patterns. These extra matches help determine the final score, while the triangular frequency is computed across the complete inclusive range.",
    detailZh:
      "三角形数是前 k 个正整数之和，公式为 k(k + 1)/2。本站允许 k = 0，所以空和 0 也包括。判断 n 是否为三角形数的一种方法是检查 8n + 1 是否为奇完全平方数，引擎检查其平方根是否为整数。相邻三角形数的差依次增长。这一名称描述数值序列，不是数字外形；三角形数可以同时是平方数或满足其他模式，最终分数还取决于这些额外特征。",
    edge: "Why does the triangular-number list include 0?",
    answer:
      "The formula k(k + 1)/2 gives 0 when k = 0. RNGDLE.ART explicitly includes this empty-sum case.",
    edgeZh: "为什么三角形数列表包含 0？",
    answerZh: "当 k = 0 时，公式 k(k + 1)/2 等于 0；本站明确计入这个空和情形。",
  },
  factorial: {
    en: "Factorial Numbers",
    zh: "阶乘数",
    subtitle: "Values of k! in the Allowed Range",
    detail:
      "A factorial value is the product of the positive integers from 1 through k. Both 0! and 1! equal 1, and the atlas counts that integer only once. Zero itself is not a factorial value. Repeated multiplication makes factorials grow very quickly, so only a small finite list stays inside this calculator's range. Factorial membership is different from being divisible by a factorial: many multiples of 24 are not themselves factorial values. The engine builds the set of actual products up to the maximum and checks for exact membership. Factorials often have several other arithmetic properties, but shared factorization signals receive the usual within-family discounts when the full rarity score is assembled.",
    detailZh:
      "阶乘数是从 1 到 k 的正整数乘积。0! 与 1! 都等于 1，图鉴只把整数 1 计一次；零本身不是阶乘值。连续相乘使阶乘增长很快，因此范围内只有少量实际阶乘值。“是阶乘”不同于“能被某个阶乘整除”，例如许多 24 的倍数并非阶乘。引擎构造不超过上界的乘积集合，并按精确成员资格判断。阶乘常与其他算术性质重叠，同组信号在最终计分时仍会折减。",
    edge: "Do 0! and 1! create two factorial matches?",
    answer:
      "No. Both equal the integer 1, which is counted once. Zero is not itself a factorial value.",
    edgeZh: "0! 和 1! 会形成两个阶乘匹配吗？",
    answerZh: "不会。它们都等于整数 1，只计一次；整数零本身不是阶乘值。",
  },
  divisible: {
    en: "Numbers with at Least 100 Divisors",
    zh: "至少有 100 个正约数的整数",
    subtitle: "A High Divisor-Count Threshold",
    detail:
      "This category requires at least 100 distinct positive divisors. For a positive integer with prime factorization p₁ᵃ¹ × p₂ᵃ² × …, the divisor count is (a₁ + 1)(a₂ + 1)… . The engine computes that count from prime exponents and applies the stated threshold. This is not the standard definition of a highly composite number: that term concerns record divisor counts relative to all smaller positive integers. A threshold match need not set a record. Zero is excluded by the engine's factorization convention, rather than being treated as having an infinite count. A large divisor count can coexist with many other properties, but the badge records only whether the threshold is reached.",
    detailZh:
      "本类别要求至少有 100 个不同的正约数。若正整数的质因数分解指数依次为 a₁、a₂ 等，约数个数为 (a₁ + 1)(a₂ + 1)…，引擎据此计算并应用门槛。它不等同于标准“高度合成数”：后者要求约数数量超过所有更小的正整数，是纪录条件；达到本门槛的数不必创造纪录。按引擎约定，零被排除，而不会作为约数无限多来处理。徽章只表示是否达到门槛。",
    edge: "Are all numbers with 100 divisors highly composite numbers?",
    answer:
      "No. The badge uses a fixed threshold of at least 100 positive divisors. A highly composite number must instead have more divisors than every smaller positive integer.",
    edgeZh: "有至少 100 个约数就一定是高度合成数吗？",
    answerZh:
      "不一定。本徽章是固定门槛；标准高度合成数还必须比所有更小的正整数拥有更多约数。",
  },
  binaryPal: {
    en: "Binary Palindrome Numbers",
    zh: "二进制回文数",
    subtitle: "Palindromic Base-Two Representations",
    detail:
      "A binary palindrome reads the same in both directions when written in base two without leading zeros. The representation must contain at least two bits, so the single-bit values 0 and 1 are excluded by this badge's convention. Since every nonzero binary representation starts with 1, a qualifying palindrome must also end with 1 and therefore be odd. Decimal and binary symmetry are separate tests: neither implies the other. For example, the decimal integer 9 is 1001 in binary and satisfies this rule despite having only one decimal digit. Binary all-ones numbers automatically qualify as binary palindromes, but the two representation signals overlap and receive discounted contributions within their scoring family.",
    detailZh:
      "二进制回文要求不带前导零的二进制表示正反相同，且至少有两位，因此单比特的 0 与 1 不计入。非零二进制首位为 1，若要对称，末位也必须为 1，所以符合的数都是奇数。十进制与二进制回文分别检测，互不保证。例如十进制 9 的二进制是 1001，虽然只有一位十进制数字，仍符合本模式。二进制全 1 必然也是二进制回文，相关信号同组计分时会折减。",
    edge: "Can an even positive integer be a binary palindrome?",
    answer:
      "Not under the unpadded multi-bit rule. An even binary integer ends in 0 but begins in 1, so its first and last bits cannot match.",
    edgeZh: "正偶数可能是二进制回文数吗？",
    answerZh:
      "在不补零且至少两位的规则下不可能。正偶数的二进制末位为 0，首位为 1，无法首尾对称。",
  },
  binaryOnes: {
    en: "Mersenne Numbers (Binary All Ones)",
    zh: "梅森数（二进制全为 1）",
    subtitle: "Numbers of the Form 2ᵏ − 1",
    alternate: "Binary repunit",
    detail:
      "A binary all-ones number has the form 2ᵏ − 1, called a Mersenne number, with k at least two for this badge. The binary digits then contain nothing but 1s. The minimum length excludes 1, even though some broader sequence conventions include it. A Mersenne number is not necessarily a Mersenne prime: 15 has binary representation 1111 but is composite. Every qualifying value is odd and is also a binary palindrome. These related representation properties share a scoring family, so their information contributions are discounted for overlap. The values nearly double at successive lengths, leaving only a small set inside a fixed upper bound, while other arithmetic matches determine differences in their overall ranking.",
    detailZh:
      "二进制全 1 的数可写成 2ᵏ − 1，称为梅森数；本站徽章要求 k 至少为二，因此排除 1，虽然更宽泛的序列约定可能包含它。梅森数并不一定是梅森质数，例如 15 的二进制为 1111，但 15 是合数。符合的值都是奇数，也都是二进制回文，相关进制信号同组计分时会折减。随着位数增加，这些值近似翻倍，因此固定范围内数量有限，而其他算术特征影响其最终排名。",
    edge: "Are binary all-ones numbers always prime?",
    answer:
      "No. They are Mersenne numbers, not necessarily Mersenne primes. For example, 15 = 2⁴ − 1 is 1111 in binary and equals 3 × 5.",
    edgeZh: "二进制全 1 的数都是质数吗？",
    answerZh:
      "不是。它们是梅森数，但不一定是梅森质数。例如 15 = 2⁴ − 1，二进制为 1111，同时 15 = 3 × 5。",
  },
  hexRepeat: {
    en: "Hexadecimal Repdigit Numbers",
    zh: "十六进制重复数字数",
    subtitle: "Equal Digits in Base Sixteen",
    detail:
      "A hexadecimal repdigit uses at least two identical symbols in its base-sixteen representation. The possible nonzero symbols include 1 through 9 and A through F; letters stand for digit values ten through fifteen. The leading symbol cannot be zero because representations are not padded. Repeating a hexadecimal digit d for k places gives d × (16ᵏ − 1) / 15. Decimal appearance can be completely different: the integer 255 is FF in hexadecimal and qualifies. The test requires every hexadecimal position to match, not merely one repeated pair inside a longer mixed string. This base-specific property is evaluated separately from decimal repdigits, and a number may satisfy one without satisfying the other.",
    detailZh:
      "十六进制重复数字数要求其十六进制表示至少两位、且全部符号相同。非零符号包括 1 至 9 与 A 至 F，字母分别表示十至十五；不补前导零，因此首位不能是零。十六进制数字 d 重复 k 位的值为 d × (16ᵏ − 1) / 15。十进制外观可以完全不同，例如 255 写成十六进制为 FF，符合条件。本规则要求所有位置相同，不是只在混合字符串内出现一对重复符号。",
    edge: "Can letters such as A or F form a hexadecimal repdigit?",
    answer:
      "Yes. They are hexadecimal digits. For example, decimal 255 is hexadecimal FF and matches; the displayed decimal number need not be a repdigit.",
    edgeZh: "A 或 F 这样的字母也能构成十六进制重复数字吗？",
    answerZh:
      "可以，它们是十六进制数字。例如十进制 255 的十六进制表示是 FF，符合条件，十进制外观不必重复。",
  },
};

export function patternContent(locale: Locale, id: string): SeoContent {
  const copy = glossary[id];
  if (!copy) throw new Error("Unknown pattern: " + id);
  const n = contentNumber(locale, stats.counts[id]),
    total = contentNumber(locale, TOTAL),
    max = contentNumber(locale, MAX);
  const frequency = contentNumber(locale, (stats.counts[id] / TOTAL) * 100, 6);
  const leader = seoData.patternLeaders[id];
  const leaderNumber = contentNumber(locale, leader.n),
    score = contentNumber(locale, leader.score);
  const top = contentNumber(locale, leader.percent, 6);
  const display =
    locale === "zh"
      ? copy.zh
      : locale === "en"
        ? copy.en
        : patternName(locale, id);
  const summary =
    locale === "zh"
      ? `在 0 至 ${max}（含两端）的 ${total} 个整数中，按本站规则精确计得 ${n} 个「${display}」，占全范围的 ${frequency}%。${translate(locale, "d_" + id)}`
      : `There are exactly ${n} matches for ${copy.en.toLowerCase()} among the ${total} integers from 0 to ${max}, inclusive: ${frequency}% of the range. ${translate("en", "d_" + id)}`;
  const leaderAnswer =
    locale === "zh"
      ? `全范围榜单中，该模式分数最高的代表是 ${leaderNumber}，稀有度分数为 ${score}，位于 Top ${top}%。这使用所有特征的总分，并非只计算本模式；若同分，以较小整数优先展示。`
      : `The highest-scoring representative is ${leaderNumber}, with a rarity score of ${score} and Top ${top}%. This uses its complete score across all features, not just this pattern. Equal scores are displayed in ascending numerical order.`;
  const paragraphs =
    locale === "zh"
      ? [
          copy.detailZh,
          `以上数量通过完整枚举全部 ${total} 个整数得到，不是抽样估算。每个符合条件的整数只为该模式计数一次，即使它包含多个符合片段。模式占比 ${frequency}% 表示均匀随机整数命中这一项的概率，并不等于某个成员在总分榜上的 Top %。不同模式可能重叠，因此各模式计数不能相加当作不同整数总数。`,
          `该模式的信息量为 −log₂(${n} / ${total})。计分时，同一分组内的信号按信息量排序并折减，再与其他分组、数位和、不同数字数以及短数字长度特征合并。所有成员共享这一模式频率，但完整得分可以不同。${leaderAnswer}`,
        ]
      : [
          copy.detail,
          `The exact count, ${n}, comes from evaluating all ${total} integers from 0 through ${max}, including both endpoints. It is not a sample or an estimate. Each matching integer is counted once for this category, even if it contains multiple qualifying segments. Its frequency of ${frequency}% describes the chance that a uniformly chosen integer passes this one test. It is not the global score percentile of every member, and overlapping pattern counts must not be added as if they represented disjoint sets.`,
          `The pattern supplies −log₂(${n} / ${total}) bits before its within-family weight is applied. Other matched patterns, digit sum, distinct-digit count and short-length signals can change the complete score. Consequently, members of this category need not share a ranking. ${leaderAnswer}`,
        ];
  let title = `${copy.en} — ${copy.subtitle} (${year})`;
  if (id === "palindrome")
    title = `Palindrome Numbers: How Many Are Below ${max}? (${year})`;
  if (id === "repdigit")
    title = `Repdigit Numbers — Identical Digits, Full List & Count (${year})`;
  if (id === "harshad")
    title = `Harshad Numbers (Niven Numbers) — Count, List & Examples (${year})`;
  if (locale === "zh") title = `${copy.zh} — 精确数量、规则与示例（${year}）`;
  if (locale !== "en" && locale !== "zh")
    title = `${display} — RNGDLE.ART (${year})`;
  return {
    title,
    description:
      locale === "zh"
        ? `0 至 ${max} 中共有 ${n} 个${copy.zh}，占 ${frequency}%。了解判定规则、边界约定、真实榜首与示例，并免费检查任意整数。`
        : `Exactly ${n} matches for ${copy.en.toLowerCase()} between 0 and ${max}: ${frequency}% of the range. See the rule, exact count, examples and highest-scoring match.`,
    h1: display,
    summary,
    paragraphs,
    termName: display,
    alternateName: copy.alternate,
    faqs: [
      {
        question:
          locale === "zh"
            ? `0 至 ${max} 之间有多少个${copy.zh}？`
            : `How many ${copy.en.toLowerCase()} are there between 0 and ${max}?`,
        answer: summary,
      },
      {
        question: locale === "zh" ? copy.edgeZh : copy.edge,
        answer: locale === "zh" ? copy.answerZh : copy.answer,
      },
      {
        question:
          locale === "zh"
            ? `哪个${copy.zh}的稀有度分数最高？`
            : `What is the highest-scoring ${copy.en.toLowerCase()} representative?`,
        answer: leaderAnswer,
      },
    ],
  };
}

export function methodologyContent(locale: Locale): SeoContent {
  const max = contentNumber(locale, MAX),
    total = contentNumber(locale, TOTAL),
    count = patterns.length;
  if (locale === "zh")
    return {
      title: `RNGDLE 稀有度分数详解 — 完整方法与模式统计（${year}）`,
      description: `了解 RNGDLE.ART 如何对 0 至 ${max} 的整数评分：${count} 种模式的精确计数、−log₂ 信息量、同组权重与包含同分数字的 Top %，附完整统计表。`,
      h1: "RNGDLE 稀有度分数 — 完整计算方法",
      summary: `本页每项模式频率都来自完整枚举 0 至 ${max} 的全部 ${total} 个整数，是精确计数而非抽样估计。`,
      paragraphs: [
        `我们检查 0 至 ${max} 的每个整数，不补前导零。模式概率等于精确匹配数量除以 ${total}，${count} 种模式的完整数量列在下表中。`,
        "每个模式的信息量为 −log₂(概率)。数位和、不同数字数也按照各自的完整频率分布计算信息量，一至四位数的长度另设分组。这里的分数是约定的特征信息量指标，不是互相独立事件的联合概率。",
        "同一分组内按信息量从高到低排序，依次使用 1、0.35、0.15、0.07、0.03 权重，第六项及以后的权重为零。各项加权信息量相加，乘以 20，最后统一四舍五入一次。逐项显示的四舍五入数值相加，可能与最终总分略有差异。",
        `Top % = 分数大于或等于当前分数的整数个数 ÷ ${total} × 100，包含所有同分数字，数值越小代表排名越靠前。例如 Top 1% 表示约 1% 的整数达到或超过该分数，不是“第 1 百分位”，也不应写成“第 99 百分位”的同义词。`,
        `短数字因在固定范围内较少而常获高分。原有最高与最低分榜只展示 1,000 至 ${max} 的整数；新的最稀有数字榜覆盖完整的 0 至 ${max}。两者都使用相同的全范围频率与 Top %，只是展示候选范围不同。`,
      ],
      faqs: [
        {
          question: "RNGDLE 稀有度分数如何计算？",
          answer: `各项信息量为 −log₂(匹配数量 / ${total})；模式、数位和、不同数字数以及一至四位长度均按各自分布处理。同一分组按信息量排序，依次乘以 1、0.35、0.15、0.07、0.03，其余为零；合计乘以 20，最后统一四舍五入。`,
        },
        {
          question: "Top % 和百分位是什么意思？",
          answer: `Top % 是全部 ${total} 个整数中分数大于或等于当前分数的比例，包含并列；比例越小越靠前。Top 1% 表示约 1% 达到或超过该分数，不是“第 1 百分位”。`,
        },
        {
          question: "模式统计是抽样还是完整枚举？",
          answer: `所有 ${count} 项都是完整枚举 0 至 ${max} 的 ${total} 个整数得到的精确匹配数量；多个模式可以同时命中同一个整数。`,
        },
      ],
    };
  return {
    title: `RNGDLE Rarity Score Explained — Full Methodology & Pattern Statistics (${year})`,
    description: `How RNGDLE.ART scores a number: exact match counts for all ${count} digit patterns across 0–${max}, −log₂ information weights, and how the global percentile is calculated. Full statistics table included.`,
    h1:
      locale === "en"
        ? "RNGDLE Rarity Score — Full Methodology"
        : translate(locale, "methodology"),
    summary: `Every pattern frequency on this page is an exact count, produced by exhaustively evaluating all ${total} integers from 0 to ${max}.`,
    paragraphs: [
      `We examine every integer from 0 through ${max}, written without leading zeros. Each pattern's probability is its exact match count divided by ${total}. The table includes every one of the ${count} patterns.`,
      "Information is −log₂(probability). Digit sum and distinct-digit count also supply information from their exact distributions; lengths of one to four digits form a separate group. The score is a defined feature-information measure, not a joint probability computed from independent events.",
      "Within each family, signals are sorted by information and weighted 1, 0.35, 0.15, 0.07 and 0.03. The sixth and later signals have zero weight. All weighted information is added, multiplied by 20 and rounded once. Individually rounded displayed contributions can differ slightly from the final total.",
      `Top % = the count of integers scoring at least as high ÷ ${total} × 100. All tied scores are included, and a smaller value means a higher rarity ranking. Top 1% means about 1% of integers reach or exceed that score. It is an upper-tail percentage, not the first percentile or an interchangeable label for the 99th percentile.`,
      `Short numbers often score highly because they are scarce in this fixed range. The existing highest and lowest leaderboards display only 1,000 through ${max}; the rarest-numbers ranking covers the whole range from 0 through ${max}. Both use the same full-range frequencies and Top %; their displayed candidate ranges differ.`,
    ],
    faqs: [
      {
        question: "How is the RNGDLE rarity score calculated?",
        answer: `Each signal contributes −log₂(match count / ${total}). Patterns, digit sum, distinct-digit count and lengths of one to four digits use their respective distributions. Within each family, signals are sorted by information and weighted 1, 0.35, 0.15, 0.07 and 0.03; later weights are zero. The weighted total is multiplied by 20 and rounded once.`,
      },
      {
        question: "What does the percentile or Top % mean?",
        answer: `Top % is the percentage of all ${total} integers whose score is at least as high as yours, including ties. Smaller is rarer. Top 1% means about 1% reach or exceed that score; it does not mean the first percentile.`,
      },
      {
        question: "Are the pattern statistics sampled or exhaustive?",
        answer: `All ${count} counts are exact results of evaluating every integer from 0 through ${max}, a total of ${total} values. Several patterns can match the same integer.`,
      },
    ],
  };
}

export function rarestContent(locale: Locale): SeoContent {
  const top = seoData.rankings[0],
    max = contentNumber(locale, MAX),
    total = contentNumber(locale, TOTAL);
  const n = contentNumber(locale, top.n),
    score = contentNumber(locale, top.score),
    percent = contentNumber(locale, top.percent, 6);
  const names = top.patterns
    .map((id) => patternName(locale, id))
    .join(locale === "zh" ? "、" : ", ");
  const one = analyze(1, stats);
  const oneRank = seoData.rankings.findIndex((row) => row.n === 1) + 1;
  const summary =
    locale === "zh"
      ? `RNGDLE.ART 在 0 至 ${max} 的全范围榜单中，首位数字是 ${n}，稀有度分数为 ${score}，位于 Top ${percent}%；它命中 ${patterns.length} 种模式中的 ${top.patterns.length} 种，包括${names}。这是本站引擎下的特征稀有度排名。`
      : `The top-ranked number in RNGDLE.ART's complete 0–${max} range is ${n}, with a rarity score of ${score} and Top ${percent}%. It matches ${top.patterns.length} of the ${patterns.length} patterns, including ${names}. This ranking measures feature rarity under this site's engine.`;
  if (locale === "zh")
    return {
      title: `0 至 ${max} 最稀有的数字 — 排名与解释（${year}）`,
      description: `哪个数字最稀有？我们对 0 至 ${max} 的所有整数按稀有度分数排序。查看完整前 100 名、${patterns.length} 类模式榜首、稀有原因，并检查你的数字。`,
      h1: `0 至 ${max} 最稀有的数字`,
      summary,
      paragraphs: [
        `榜单从全部 ${total} 个整数中选出分数最高的 100 个，按分数降序排列，同分按数字升序展示。Top % 始终包含全范围内所有同分数字，因此相邻显示位置不一定代表不同的稀有度。`,
        "少见的特征通过 −log₂(匹配概率) 提供较大的信息量，同一分组的重叠信号折减后合计形成分数。数字越大不一定越稀有，命中模式越多也不保证分数更高。",
        `短数字在 0 至 ${max} 中数量有限，一至四位数还会获得长度信号。这里包含 0 与一位数；原有最高与最低分榜从 1,000 开始，所以榜首可能不同。`,
      ],
      faqs: [
        { question: `0 至 ${max} 最稀有的数字是什么？`, answer: summary },
        {
          question: "RNGDLE 中最稀有的数字是什么？",
          answer: `按 RNGDLE.ART 独立实现的引擎，当前全范围首位是 ${n}，分数 ${score}。这不代表 rngdle.com 或其他同名游戏的排名；本站不声称共享其官方引擎。`,
        },
        {
          question: "1 是最稀有的数字吗？",
          answer: `在本站当前引擎中，1 的分数是 ${contentNumber(locale, one.score)}，位于 Top ${contentNumber(locale, one.percent, 6)}%${oneRank ? `，在此表显示为第 ${oneRank} 位` : ""}。当前首位数字是 ${n}；这个结论只适用于本范围与计分规则。`,
        },
        {
          question: "数字稀有度如何计算？",
          answer: `根据全部 ${total} 个整数的精确频率计算 −log₂ 信息量，同组按权重折减，再乘以 20 并统一四舍五入。Top % 计算所有分数大于或等于当前值的整数比例，包含同分。`,
        },
      ],
    };
  return {
    title: rarestGuide.title,
    description: rarestGuide.description,
    h1: rarestGuide.h1,
    summary: rarestGuide.summary,
    paragraphs: [
      `The table selects the highest-scoring 100 of all ${total} integers, ordered by descending score and then ascending integer for equal scores. Top % includes every tied score in the full range, so adjacent display positions do not necessarily represent different rarity levels.`,
      "Uncommon features contribute more information through −log₂(match probability), with related signals discounted within each family. A larger number is not automatically rarer, and matching more patterns does not guarantee a higher score.",
      `Short numbers are scarce within 0–${max}, and lengths of one to four digits supply an additional signal. This ranking includes 0 and single-digit values. The existing highest and lowest leaderboards begin at 1,000, so their leaders may differ.`,
    ],
    faqs: [
      ...rarestGuide.faqs,
      {
        question: `What is the rarest number between 0 and ${max}?`,
        answer: summary,
      },
      {
        question: "What is the rarest number in RNGDLE?",
        answer: `Under RNGDLE.ART's independently implemented engine, the current full-range leader is ${n}, scoring ${score}. This does not establish the ranking for rngdle.com or any other similarly named game; we do not claim to share their official engine.`,
      },
      {
        question: "Is 1 the rarest number?",
        answer: `In this engine, 1 scores ${contentNumber(locale, one.score)} with Top ${contentNumber(locale, one.percent, 6)}%${oneRank ? ` and appears at position ${oneRank} in this table` : ""}. The current first-listed number is ${n}. This conclusion is specific to this range and scoring system.`,
      },
      {
        question: "How is number rarity calculated?",
        answer: `Exact frequencies across ${total} integers supply −log₂ information. Signals are weighted within their families, summed, multiplied by 20 and rounded once. Top % counts all integers scoring at least as high, including ties.`,
      },
    ],
  };
}
