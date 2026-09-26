import { A, PageHead, useApp } from "./core";
import { patterns, MAX } from "./engine.mjs";
import { NumberForm } from "./components";
import { Faq } from "./SeoSections";
import { rarestContent, seoData, articleInfo } from "./seo-content";

export function RarestNumbers() {
  const { locale, t, fmt, navigate } = useApp();
  const zh = locale === "zh",
    content = rarestContent(locale);
  return (
    <>
      <PageHead
        eyebrow="RNGDLE.ART"
        title={content.h1}
        description={content.summary}
      />
      <article className="article panel seo-sections">
        <p className="small muted">{articleInfo(locale)}</p>
        <section>
          <h2>{zh ? "最稀有的 100 个数字" : "The 100 rarest numbers"}</h2>
          <p>{content.paragraphs[0]}</p>
          <div className="table-scroll">
            <table data-testid="rarest-ranking">
              <thead>
                <tr>
                  <th>{zh ? "位置" : "Position"}</th>
                  <th>{t("number")}</th>
                  <th>{t("score")}</th>
                  <th>Top %</th>
                  <th>{zh ? "模式数" : "Matches"}</th>
                  <th>{t("patterns")}</th>
                </tr>
              </thead>
              <tbody>
                {seoData.rankings.map((row, index) => (
                  <tr key={row.n}>
                    <td>{index + 1}</td>
                    <td>
                      <A to={"/?n=" + row.n}>{fmt(row.n)}</A>
                    </td>
                    <td className="mono">{fmt(row.score)}</td>
                    <td className="mono">{fmt(row.percent, 6)}%</td>
                    <td>{row.patterns.length}</td>
                    <td>
                      {row.patterns.length
                        ? row.patterns.map((id, i) => (
                            <span key={id}>
                              {i > 0 && " · "}
                              <A to={"/patterns/" + id}>{t("p_" + id)}</A>
                            </span>
                          ))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>{zh ? "什么让一个数字稀有？" : "What makes a number rare?"}</h2>
          <p>{content.paragraphs[1]}</p>
          <A to="/methodology" className="text-link">
            {t("methodology")} →
          </A>
        </section>
        <section>
          <h2>
            {zh
              ? `${patterns.length} 种模式的最高分代表`
              : `Highest-scoring representatives of all ${patterns.length} patterns`}
          </h2>
          <p>
            {zh
              ? `每行从 0 至 ${fmt(MAX)} 的所有匹配数字中取总分最高者；若同分，展示较小整数。分类表并非额外的独立概率，代表数字也可能重复出现。`
              : `Each row selects the highest complete score among all matching integers from 0 through ${fmt(MAX)}. Tied leaders are displayed using the smaller integer. These categories overlap, so the same number can lead several patterns.`}
          </p>
          <div className="table-scroll">
            <table data-testid="pattern-leaders">
              <thead>
                <tr>
                  <th>{t("pattern")}</th>
                  <th>{t("number")}</th>
                  <th>{t("score")}</th>
                  <th>Top %</th>
                </tr>
              </thead>
              <tbody>
                {patterns.map((pattern) => {
                  const row = seoData.patternLeaders[pattern.id];
                  return (
                    <tr key={pattern.id}>
                      <td>
                        <A to={"/patterns/" + pattern.id}>
                          {t("p_" + pattern.id)}
                        </A>
                      </td>
                      <td>
                        <A to={"/?n=" + row.n}>{fmt(row.n)}</A>
                      </td>
                      <td className="mono">{fmt(row.score)}</td>
                      <td className="mono">{fmt(row.percent, 6)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>
            {zh
              ? "为什么短数字经常排名靠前？"
              : "Why are short numbers often ranked as rare?"}
          </h2>
          <p>{content.paragraphs[2]}</p>
          <A to="/leaderboard" className="text-link">
            {zh
              ? "查看从 1,000 开始的原有榜单"
              : "View the existing leaderboard starting at 1,000"}{" "}
            →
          </A>
        </section>
        <Faq items={content.faqs} />
        <section>
          <h2>{zh ? "检查你的数字" : "Check your number"}</h2>
          <NumberForm
            initial={seoData.rankings[0].n}
            onChange={(n) => navigate("/?n=" + n)}
          />
        </section>
      </article>
    </>
  );
}
