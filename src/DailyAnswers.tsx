import { useEffect, useRef, useState } from "react";
import { A, LoadState, PageHead, useApp } from "./core";
import { archivePage, LAUNCH_DAY, validDay } from "./seo-data.mjs";
import { utcDay } from "./engine.mjs";
import {
  archiveContent,
  dailyContent,
  dailyDate,
  dailyText,
  type DailySnapshot,
  type NumberRow,
} from "./daily-content";
import seo from "../public/data/seo.json";

export { dailyContent, archiveContent } from "./daily-content";

function NumberLink({ row }: { row: NumberRow }) {
  const { fmt } = useApp();
  return <A to={"/?n=" + row.n}>{fmt(row.n)}</A>;
}

export function DailyAnswer({
  day,
  data,
  onData,
}: {
  day: string;
  data?: DailySnapshot | null;
  onData?: (data: DailySnapshot) => void;
}) {
  const { locale, t, fmt } = useApp();
  const [loaded, setLoaded] = useState<DailySnapshot | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const callback = useRef(onData);
  callback.current = onData;
  const available = validDay(day) && day >= LAUNCH_DAY && day <= utcDay();
  const snapshot =
    data?.date === day ? data : loaded?.date === day ? loaded : null;
  useEffect(() => {
    if (!available || data?.date === day) return;
    let active = true;
    setError(false);
    fetch("/data/daily/" + day + ".json")
      .then(async (response) => {
        if (!response.ok) throw new Error("Daily answer unavailable");
        const result = await response.json();
        if (result.date !== day || !result.modes || !result.topNumber)
          throw new Error("Invalid daily answer");
        if (active) {
          setLoaded(result);
          callback.current?.(result);
        }
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [day, data, available, attempt]);
  if (!available) return <PageHead eyebrow="404" title={t("notFound")} />;
  if (!snapshot)
    return (
      <div className="narrow">
        <LoadState
          error={error}
          retry={() => setAttempt((value) => value + 1)}
        />
      </div>
    );
  const tr = (key: string, values: Record<string, string | number> = {}) =>
    dailyText(locale, key, values);
  const content = dailyContent(locale, snapshot);
  const current = seo.dailyDates.indexOf(day);
  const previous = current >= 0 ? seo.dailyDates[current + 1] : null;
  const next = current > 0 ? seo.dailyDates[current - 1] : null;
  const modeOrder = [
    snapshot.officialMode,
    ...(["draft", "quiz", "hunt"] as const).filter(
      (mode) => mode !== snapshot.officialMode,
    ),
  ];
  return (
    <>
      <PageHead
        eyebrow={t("daily")}
        title={content.h1}
        description={content.description}
      />
      <article className="panel article daily-answer">
        <p className="seo-summary">{content.draftSummary}</p>
        <p>{content.summary}</p>
        <p className="small muted">
          {tr("published")}:{" "}
          <time dateTime={snapshot.datePublished}>
            {snapshot.datePublished.replace("T", " ").replace("Z", " UTC")}
          </time>
          <br />
          {tr("modified")}:{" "}
          <time dateTime={snapshot.dateModified}>
            {snapshot.dateModified.replace("T", " ").replace("Z", " UTC")}
          </time>
        </p>
        <p className="small muted">{tr("scope")}</p>
        <p>
          <A to="/daily">{t("start")} →</A> ·{" "}
          <A to="/daily/answer">{tr("archive")}</A>
        </p>
        {modeOrder.map((mode) => (
          <section key={mode} aria-labelledby={"answer-" + mode}>
            <h2 id={"answer-" + mode}>{t(mode)}</h2>
            <p className="label">
              {tr(mode === snapshot.officialMode ? "active" : "seeded")}
            </p>
            <p>{t(mode + "Rules")}</p>
            <div className="table-scroll">
              {mode === "quiz" ? (
                <table>
                  <caption>
                    {t(mode)} — {tr("result")}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">{tr("round")}</th>
                      <th scope="col">
                        {tr("number")} A · {tr("score")}
                      </th>
                      <th scope="col">
                        {tr("number")} B · {tr("score")}
                      </th>
                      <th scope="col">{tr("result")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.modes.quiz.rounds.map((round) => (
                      <tr key={round.round}>
                        <th scope="row">{round.round}</th>
                        {round.options.map((option, index) => (
                          <td key={index}>
                            <NumberLink row={option} /> · {fmt(option.score)}
                          </td>
                        ))}
                        <td>
                          {round.winner ? (
                            <strong>
                              <NumberLink row={round.winner} />
                            </strong>
                          ) : (
                            tr("tie")
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table>
                  <caption>
                    {t(mode)} — {tr("result")}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">{tr("card")}</th>
                      <th scope="col">{tr("number")}</th>
                      <th scope="col">{tr("score")}</th>
                      <th scope="col">{tr("result")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.modes[mode].numbers.map((row, index) => (
                      <tr
                        key={index}
                        data-winner={
                          snapshot.modes[mode].winnerIndices.includes(index) ||
                          undefined
                        }
                      >
                        <th scope="row">{index + 1}</th>
                        <td>
                          <NumberLink row={row} />
                        </td>
                        <td>{fmt(row.score)}</td>
                        <td>
                          {snapshot.modes[mode].winnerIndices.includes(
                            index,
                          ) ? (
                            <strong>✓ {tr("winner")}</strong>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        ))}
        <section>
          <h2>{tr("top")}</h2>
          <p>{content.topSummary}</p>
          <h3>{tr("matched")}</h3>
          <ul>
            {snapshot.topNumber.patterns.map((id) => (
              <li key={id}>
                <A to={"/patterns/" + id}>{t("p_" + id)}</A>
              </li>
            ))}
          </ul>
          {snapshot.patternOfDay && (
            <>
              <h3>
                {tr("highlight")}:{" "}
                <A to={"/patterns/" + snapshot.patternOfDay}>
                  {t("p_" + snapshot.patternOfDay)}
                </A>
              </h3>
              <p>{tr("highlightNote")}</p>
            </>
          )}
        </section>
        <section>
          <h2>{tr("how")}</h2>
          <p>{tr("calculation")}</p>
          <p>
            <A to="/methodology">{t("methodology")} →</A>
          </p>
          <p className="small muted">
            {tr("version")}: {snapshot.version} · UTC {snapshot.date}
          </p>
        </section>
        <section>
          <h2>{tr("faq")}</h2>
          {content.faqs.map((faq) => (
            <div key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </section>
        <nav aria-label={tr("archive")} className="answer-navigation">
          {previous && (
            <A to={"/daily/answer/" + previous}>← {tr("previous")}</A>
          )}
          <A to="/daily/answer">{tr("archive")}</A>
          {next && <A to={"/daily/answer/" + next}>{tr("next")} →</A>}
          {seo.latestDay !== day && (
            <A to={"/daily/answer/" + seo.latestDay}>{tr("latest")}</A>
          )}
        </nav>
      </article>
    </>
  );
}

export function DailyArchive({ page = 1 }: { page?: number }) {
  const { locale, t, fmt } = useApp();
  const content = archiveContent(locale, page);
  let pagination;
  try {
    pagination = archivePage(seo.dailySummaries, page);
  } catch {
    return <PageHead eyebrow="404" title={t("notFound")} />;
  }
  const { pages } = pagination;
  const summaries = pagination.items as typeof seo.dailySummaries;
  const months = new Map<string, typeof summaries>();
  for (const row of summaries) {
    const month = row.date.slice(0, 7);
    months.set(month, [...(months.get(month) ?? []), row]);
  }
  const tr = (key: string, values: Record<string, string | number> = {}) =>
    dailyText(locale, key, values);
  const pagePath = (number: number) =>
    "/daily/answer" + (number === 1 ? "" : "/page/" + number);
  return (
    <>
      <PageHead
        eyebrow={t("daily")}
        title={content.h1}
        description={content.description}
      />
      <article className="panel article daily-archive">
        <p>{content.summary}</p>
        {page === 1 && seo.latestDay && (
          <p>
            <A to={"/daily/answer/" + seo.latestDay} className="button primary">
              {tr("latest")} · {dailyDate(locale, seo.latestDay)} →
            </A>
          </p>
        )}
        {Array.from(months, ([month, rows]) => (
          <section key={month}>
            <h2>{dailyDate(locale, month + "-01", true)}</h2>
            <ul className="archive-list">
              {rows.map((row) => (
                <li key={row.date}>
                  <A to={"/daily/answer/" + row.date}>
                    <time dateTime={row.date}>
                      {dailyDate(locale, row.date)}
                    </time>{" "}
                    — {tr("draftWinner")}: {fmt(row.n)} ({tr("score")}:{" "}
                    {fmt(row.score)})
                  </A>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {pages > 1 && (
          <nav aria-label={tr("archive")} className="answer-navigation">
            {page > 1 && <A to={pagePath(page - 1)}>← {tr("newer")}</A>}
            <span>
              {tr("page", { page })} / {pages}
            </span>
            {page < pages && <A to={pagePath(page + 1)}>{tr("older")} →</A>}
          </nav>
        )}
        <p>
          <A to="/daily">{t("start")} →</A>
        </p>
      </article>
    </>
  );
}
