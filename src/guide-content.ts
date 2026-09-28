import type { FaqItem } from "./seo-content";
import statsData from "../public/data/stats.json";
import seoData from "../public/data/seo.json";
import { TOTAL, patterns } from "./engine.mjs";

// First production READY: dpl_N8cGt8yQRpaV5giu8mdgLpmhqWS1 (5bb8a5b).
export const guidesUpdatedAt = "2026-09-28T02:07:06.956Z";
export const featuredPatternIds = [
  "fibonacci", "repdigit", "palindrome", "prime", "harshad",
];
export const patternCount = (id: string) =>
  (statsData.counts as Record<string, number>)[id];
export const enNumber = (n: number, digits = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: digits });
export const patternShare = (id: string) =>
  enNumber((patternCount(id) / TOTAL) * 100, 4) + "%";

export type GuideContent = {
  route: string;
  title: string;
  h1: string;
  description: string;
  summary: string;
  image: string;
  stepsTitle: string;
  steps: string[];
  faqs: FaqItem[];
};

export const rarityGuide: GuideContent = {
  route: "guides/how-rarity-works",
  title: "RNGdle Rarity Explained: How the Rarity Score Works (2026)",
  h1: "RNGdle Rarity Explained: How the Rarity Score Works",
  description: "Understand RNGdle rarity, exact pattern counts and RNGDLE.ART's independent score. Learn how to check your number and how the score differs from official EP.",
  summary: "RNGdle rarity describes unusual patterns in a rolled number. On RNGDLE.ART, the score measures how uncommon those features are in a fixed number space. A number can have surprising structure without being any less likely than another exact number in a uniform draw.",
  image: "guide-how-rarity-works",
  stepsTitle: "Step by step: check your number's rarity in 60 seconds",
  steps: [
    "Open the RNGDLE.ART analyzer and enter your exact number, from 0 through 1,000,000.",
    "Read the tier, score and Top % first. A smaller Top % means fewer numbers score at least as highly; ties are included.",
    "Scan the pattern list. Separate low-frequency hits such as repdigits and Fibonacci numbers from more common ones such as primes and Harshad numbers.",
    "Use Compare to put two candidates side by side if you are choosing what to share.",
    "Open the linked pattern pages to see each rule, exact count and share of the range.",
  ],
  faqs: [
    {
      question: "Is RNGdle rarity random?",
      answer: "A roll can be random, but RNGDLE.ART's analysis is deterministic: the same number and engine version give the same score. The score describes features and does not predict a future roll.",
    },
    {
      question: "Why is my score low even though my number is a palindrome?",
      answer: `Our palindrome rule matches ${enNumber(patternCount("palindrome"))} numbers, about ${patternShare("palindrome")} of the range. The final score also depends on other patterns, digit sum, digit diversity and short length, with overlapping signals discounted. One badge alone does not determine a tier.`,
    },
    {
      question: "Does the game use AI to decide rarity?",
      answer: `RNGDLE.ART uses ${patterns.length} implemented pattern rules and exact feature distributions, not an AI judgment. This describes our calculator, not the internal implementation of rngdle.com.`,
    },
    {
      question: "Can I raise my rarity score?",
      answer: "You cannot change a past number's score under the same engine. You can analyze other numbers and learn which features contribute to their scores. Official rolls and EP remain under the official game's rules.",
    },
  ],
};

export const rarestGuide: GuideContent = {
  route: "rarest-numbers",
  title: "What Is the Rarest Number in RNGdle? Pattern Odds Ranked (and the Worst Roll)",
  h1: "What Is the Rarest Number in RNGdle?",
  description: "Compare exact pattern counts across 0–1,000,000, explore RNGDLE.ART's top 100 numbers, and learn what makes a low-scoring roll. Independent of official EP.",
  summary: `There is no universal rarest number without a scoring rule. In RNGDLE.ART's current full-range ranking, ${enNumber(seoData.rankings[0].n)} leads with a score of ${enNumber(seoData.rankings[0].score)}. That is our independent result, not an official RNGdle EP record. Every exact integer is equally likely in a uniform draw; what varies is the frequency of its features.`,
  image: "guide-rarest-numbers",
  stepsTitle: "Step by step: find out how rare your number is",
  steps: [
    "Paste your number into the RNGDLE.ART analyzer.",
    "Note the tier, score, Top % and all matched patterns.",
    "Compare your hits with the pattern table, remembering that it is a selection of patterns rather than the complete atlas.",
    "Use the complete score and Top % to judge the combination. Overlapping patterns are not independent odds.",
    "Open Compare to put your roll next to a friend's, using the same scoring rules for both.",
  ],
  faqs: [
    {
      question: "Has anyone rolled the rarest number?",
      answer: "This page ranks every number mathematically; it does not track official player histories. A position in the table is not evidence that someone rolled that number on rngdle.com.",
    },
    {
      question: "Is 0 or 1 the rarest number?",
      answer: `Neither leads our current ranking: ${enNumber(seoData.rankings[0].n)} does. Short numbers can score highly because they are scarce in the fixed range and can match several features. The answer depends on the scoring system.`,
    },
    {
      question: "What's the rarest RNGdle badge?",
      answer: `Our independent atlas's least frequent pattern is Factorial, with ${enNumber(patternCount("factorial"))} matching integers out of ${enNumber(TOTAL)}. That does not establish the rarest official RNGdle badge, because the official rules and roll distribution are separate.`,
    },
    {
      question: "Do all rare patterns count equally?",
      answer: "No. RNGDLE.ART weights features by their exact information content and discounts overlaps within a family. The complete score also includes digit-sum, distinct-digit and short-length information, so badge count alone cannot rank numbers.",
    },
  ],
};

export const howToPlayGuide: GuideContent = {
  route: "guides/how-to-play",
  title: "How to Play RNGdle: Beginner's Guide, Badges & Daily Answer (Step by Step)",
  h1: "How to Play RNGdle: A Beginner's Guide",
  description: "Learn the official RNGdle daily roll, badges and EP, then analyze your number. Understand how RNGDLE.ART's separate daily challenges and answers work.",
  summary: "RNGdle, at rngdle.com, is a daily random number game: roll a number and discover its badges and EP. RNGDLE.ART is an independent calculator and browser game that helps explain number patterns. Its scores and daily answers belong to a separate system.",
  image: "guide-how-to-play",
  stepsTitle: "Step by step: your first roll",
  steps: [
    "Open rngdle.com and sign up or sign in if you want to save your roll and appear on its leaderboard.",
    "Use the official daily roll and read the result shown for your account. Do not assume another player's number is your answer.",
    "Read the badge list and inspect the properties that made the number interesting.",
    "Check the displayed EP and leaderboard information on the official site.",
    "If the number is within 0–1,000,000, paste it into RNGDLE.ART to inspect our independent pattern counts and score.",
    "Return when the official site makes your next daily roll available. Use its own reset indicator for timing.",
  ],
  faqs: [
    {
      question: "How many rolls do I get?",
      answer: "The official RNGdle homepage describes one roll per day. RNGDLE.ART's Infinite Roll and seeded daily challenges are separate modes with their own rules.",
    },
    {
      question: "Where do I find the daily answer?",
      answer: "For the official RNGdle game, check your own roll on rngdle.com; this guide does not supply a shared official answer. RNGDLE.ART's Daily Answers archive covers only our seeded number draft, comparison and hunt challenges.",
    },
    {
      question: "Is RNGdle free?",
      answer: "You can try the daily roll on the official homepage, which asks you to sign up to save it and join the leaderboard. RNGDLE.ART's analyzer is free and does not require an account.",
    },
    {
      question: "Is RNGdle the same as RNG games?",
      answer: "RNG means random number generator and is used in many kinds of games. RNGdle's daily number roll is a particular game, while games built around random items or gacha have different rules.",
    },
  ],
};

export const guideArticles = [rarityGuide, rarestGuide, howToPlayGuide];
export const englishGuideRoutes = [rarityGuide.route, howToPlayGuide.route];
export const guideContent = (route: string) =>
  guideArticles.find((article) => article.route === route);
