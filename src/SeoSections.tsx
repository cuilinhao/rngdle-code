import type { ReactNode } from "react";
import { A, useApp } from "./core";
import { MAX, TOTAL, patterns } from "./engine.mjs";
import { homeContent, seoData, type FaqItem } from "./seo-content";
import { locales } from "./i18n";

export function RarestLink({
  children,
  className = "text-link",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { locale } = useApp();
  return locale === "en" || locale === "zh" ? (
    <A to="/rarest-numbers" className={className}>
      {children}
    </A>
  ) : (
    <a href="/en/rarest-numbers" className={className}>
      {children}
    </a>
  );
}

export function Faq({ items }: { items: FaqItem[] }) {
  const { locale } = useApp();
  const heading = [
    "Frequently asked questions",
    "常见问题",
    "よくある質問",
    "자주 묻는 질문",
    "Häufige Fragen",
    "Questions fréquentes",
  ][locales.indexOf(locale)];
  return (
    <section className="faq-section" aria-label={heading}>
      <h2>{heading}</h2>
      {items.map(({ question, answer }) => (
        <div className="faq-item" key={question}>
          <h3>{question}</h3>
          <p>{answer}</p>
        </div>
      ))}
    </section>
  );
}

export function HomeSeoSections() {
  const { locale, fmt, t } = useApp();
  const content = homeContent(locale),
    zh = locale === "zh";
  if (locale !== "en" && !zh)
    return (
      <section className="panel seo-sections article">
        <h2>{t("patterns")}</h2>
        <p>{t("atlasIntro")}</p>
        <div className="filter-chips">
          {patterns.map((pattern) => (
            <A
              key={pattern.id}
              to={"/patterns/" + pattern.id}
              className="button"
            >
              {t("p_" + pattern.id)}
            </A>
          ))}
        </div>
        <A to="/methodology" className="text-link">
          {t("methodology")} →
        </A>
      </section>
    );
  return (
    <div className="panel seo-sections article">
      <section>
        <h2>
          {zh ? "RNGDLE 稀有度分数是什么？" : "What is an RNGDLE rarity score?"}
        </h2>
        <p>{content.faqs[0].answer}</p>
        <p>
          {zh
            ? `概率来自对全部 ${fmt(TOTAL)} 个整数的完整枚举，分数不是对下一次随机结果的预测。Top % 包括所有同分数字，比例越小，稀有度排名越高。`
            : `Probabilities come from an exhaustive count of all ${fmt(TOTAL)} integers. Scores do not predict the next random result. Top % includes every tied score; a smaller percentage means a higher rarity ranking.`}
        </p>
        <A to="/methodology" className="text-link">
          {t("methodology")} →
        </A>
      </section>
      <section>
        <h2>{zh ? "如何检查你的数字" : "How to check your number"}</h2>
        <ol>
          <li>
            {zh
              ? `在上方输入 0 至 ${fmt(MAX)} 的任意整数；不添加前导零。`
              : `Enter any integer from 0 to ${fmt(MAX)} above; leading zeros are not part of the analysis.`}
          </li>
          <li>
            {zh
              ? "点击分析，查看稀有度分数、Top % 与命中的模式。"
              : "Select Analyze to see the rarity score, Top % and matched patterns."}
          </li>
          <li>
            {zh
              ? "打开模式详情了解规则，或使用比较工具查看两个数字的差别。"
              : "Open a pattern to read its rule, or compare two numbers to inspect their differences."}
          </li>
        </ol>
        <A to="/compare" className="text-link">
          {t("compare")} →
        </A>
      </section>
      <section>
        <h2>
          {zh
            ? `我们检测的 ${patterns.length} 种模式`
            : `The ${patterns.length} patterns we test`}
        </h2>
        <p>
          {zh
            ? "图鉴包含重复、对称、序列、算术、因数分解和进制表示。每个模式页都提供明确规则、全范围精确数量、示例与最高分代表。"
            : "The atlas covers repetition, symmetry, sequences, arithmetic, factorization and numeral representations. Every pattern page gives its precise rule, exact full-range count, examples and highest-scoring representative."}
        </p>
        <div className="filter-chips">
          {patterns.map((pattern) => (
            <A
              key={pattern.id}
              to={"/patterns/" + pattern.id}
              className="button"
            >
              {t("p_" + pattern.id)}
            </A>
          ))}
        </div>
      </section>
      <section>
        <h2>
          {zh
            ? `0 至 ${fmt(MAX)} 最稀有的数字`
            : `Rarest numbers between 0 and ${fmt(MAX)}`}
        </h2>
        <p>
          {zh
            ? `当前全范围首位是 ${fmt(seoData.rankings[0].n)}，分数为 ${fmt(seoData.rankings[0].score)}。完整榜单覆盖 0 与一位数，展示前 100 名，以及每个模式的最高分代表。`
            : `The current full-range leader is ${fmt(seoData.rankings[0].n)}, scoring ${fmt(seoData.rankings[0].score)}. The complete ranking includes 0 and single-digit numbers, with the top 100 and the highest-scoring representative of each pattern.`}
        </p>
        <A to="/rarest-numbers" className="text-link">
          {zh ? "查看完整稀有数字榜单" : "View the full rarest-numbers ranking"}{" "}
          →
        </A>
      </section>
      <Faq items={content.faqs} />
    </div>
  );
}
