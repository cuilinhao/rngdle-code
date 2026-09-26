import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Copy, Flame, RotateCcw, Timer } from "lucide-react";
import { makeDaily, utcDay, nextStreak, analyze } from "./engine.mjs";
import {
  emptyAttempt,
  validateAttempt,
  finishAttempt,
  revealSpecimen,
} from "./games.mjs";
import {
  A,
  useApp,
  useScores,
  LoadState,
  PageHead,
  useStored,
  readStorage,
  writeStorage,
  stats,
} from "./core";
import { Badge, ScoreSummary } from "./components";
export function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
export function Specimen() {
  const { t, fmt } = useApp(),
    day = utcDay(useNow()),
    n = revealSpecimen(day);
  const [atlas, setAtlas] = useStored<Record<string, number>>("atlas", {}),
    [days, setDays] = useStored<string[]>("specimens", []);
  const shown = days.includes(day);
  return (
    <section className="panel specimen">
      <div className="specimen-symbol" aria-hidden="true">
        ✦
      </div>
      <div>
        <div className="label">
          {t("specimen")} · {day}
        </div>
        <h3>{shown ? fmt(n) : "?"}</h3>
        <p className="small muted">{t("specimenNote")}</p>
      </div>
      {shown ? (
        <A to={"/?n=" + n} className="button">
          {t("analyze")}
          <ArrowRight size={15} />
        </A>
      ) : (
        <button
          onClick={() => {
            const a = analyze(n, stats);
            const next = { ...atlas };
            a.signals.forEach((s: any) => {
              if (s.value === null) next[s.id] = n;
            });
            setAtlas(next);
            setDays([...days.slice(-366), day]);
          }}
        >
          {t("reveal")}
          <ArrowRight size={15} />
        </button>
      )}
    </section>
  );
}
export default function Daily({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const { t, locale } = useApp(),
    { scores, error, retry } = useScores(),
    now = useNow(),
    day = utcDay(now);
  return (
    <>
      {!standalone && (
        <PageHead
          eyebrow={t("daily")}
          title={t("dailyTitle")}
          description={t("dailyIntro")}
        />
      )}
      <div className="narrow">
        {!standalone && (locale === "en" || locale === "zh") && (
          <p className="center">
            <A to="/daily/answer">
              {locale === "zh"
                ? "查看每日答案与归档（含剧透）"
                : "Daily answers and archive (spoilers)"}
            </A>
          </p>
        )}
        {!scores ? (
          <LoadState error={error} retry={retry} />
        ) : (
          <Game
            key={day + (standalone ? "quiz" : "")}
            day={day}
            now={now}
            scores={scores}
            standalone={standalone}
          />
        )}
        <p className="small muted center">{t("localNote")}</p>
      </div>
    </>
  );
}
function Game({
  day,
  now,
  scores,
  standalone,
}: {
  day: string;
  now: number;
  scores: Uint16Array;
  standalone: boolean;
}) {
  const { t, fmt, notify } = useApp(),
    [practice, setPractice] = useState(""),
    [lastFeedback, setLastFeedback] = useState<boolean | null>(null);
  const puzzle = useMemo(
    () => makeDaily(day, scores, standalone ? "quiz" : undefined, practice),
    [day, scores, standalone, practice],
  );
  const key = (standalone ? "comparison-quiz." : "daily.") + day;
  const [stored, setStored] = useStored<any>(
    key,
    emptyAttempt(day, puzzle.type),
  );
  const [practiceAttempt, setPracticeAttempt] = useState<any>(
    emptyAttempt(day, puzzle.type),
  );
  const attempt = validateAttempt(
    practice ? practiceAttempt : stored,
    day,
    puzzle.type,
  );
  const attemptRef = useRef(attempt);
  attemptRef.current = attempt;
  const [streak, setStreak] = useStored("streak", {
    lastDay: "",
    current: 0,
    best: 0,
  });
  function update(next: any) {
    attemptRef.current = next;
    if (practice) setPracticeAttempt(next);
    else setStored(next);
  }
  function finish(next: any) {
    if (attemptRef.current.finished) return;
    const done = finishAttempt(puzzle, next, scores);
    update(done);
    if (!practice && !standalone) {
      const current = readStorage("streak", {
        lastDay: "",
        current: 0,
        best: 0,
      });
      const result = nextStreak(
        current.lastDay,
        day,
        current.current,
        current.best,
      );
      setStreak({ ...result, lastDay: day });
    }
  }
  const seconds = attempt.started
    ? Math.max(0, 60 - Math.floor((now - attempt.startedAt) / 1000))
    : 60;
  useEffect(() => {
    if (
      puzzle.type === "hunt" &&
      attempt.started &&
      !attempt.finished &&
      seconds <= 0
    )
      finish(attemptRef.current);
  }, [seconds, attempt.started, attempt.finished, puzzle.type]);
  const remaining = Math.max(
    0,
    Math.floor((Date.parse(day + "T00:00:00Z") + 86400000 - now) / 1000),
  );
  const countdown = [
    Math.floor(remaining / 3600),
    Math.floor(remaining / 60) % 60,
    remaining % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
  function quizPick(pick: number) {
    const current = attemptRef.current;
    if (current.finished || !current.started) return;
    const i = current.position,
      correct =
        scores[puzzle.numbers[i * 2 + pick]] >
        scores[puzzle.numbers[i * 2 + 1 - pick]];
    setLastFeedback(correct);
    const next = { ...current, answers: [...current.answers, pick] };
    if (i === 9) finish(next);
    else update({ ...next, position: i + 1 });
  }
  function practiceAgain() {
    const token = ":" + Date.now() + ":" + Math.random();
    setPractice(token);
    setPracticeAttempt({
      ...emptyAttempt(day, puzzle.type),
      started: true,
      startedAt: Date.now(),
    });
    setLastFeedback(null);
  }
  const chosen =
    puzzle.type === "draft"
      ? puzzle.numbers[attempt.choice]
      : puzzle.type === "hunt"
        ? puzzle.numbers[attempt.position]
        : null;
  return (
    <>
      <section className="daily-board panel">
        <div className="board-top">
          <span className="label">
            {practice ? t("practice") : day + " · " + t("utc")}
          </span>
          <span aria-hidden="true">
            {puzzle.type === "draft" ? "◇" : puzzle.type === "hunt" ? "⌖" : "⇄"}
          </span>
        </div>
        <h2>{t(puzzle.type)}</h2>
        <p className="muted game-rules">{t(puzzle.type + "Rules")}</p>
        {practice && <p className="small muted">{t("practiceNote")}</p>}
        {!attempt.started && !attempt.finished && (
          <button
            className="primary large"
            onClick={() =>
              update({ ...attempt, started: true, startedAt: Date.now() })
            }
          >
            {t("start")}
            <ArrowRight size={18} />
          </button>
        )}
        {attempt.started && !attempt.finished && puzzle.type === "draft" && (
          <>
            <div className="draft-options">
              {puzzle.numbers.map((n: number, i: number) => (
                <button
                  key={i}
                  data-testid={"draft-" + i}
                  className={
                    "draft-option " + (attempt.choice === i ? "selected" : "")
                  }
                  aria-pressed={attempt.choice === i}
                  onClick={() => update({ ...attempt, choice: i })}
                >
                  <span className="label">0{i + 1}</span>
                  <strong>{fmt(n)}</strong>
                  {attempt.choice === i && <Check size={16} />}
                </button>
              ))}
            </div>
            <button
              className="primary"
              disabled={attempt.choice < 0}
              onClick={() => finish(attempt)}
            >
              {t("lock")}
              <Check size={16} />
            </button>
          </>
        )}
        {attempt.started && !attempt.finished && puzzle.type === "hunt" && (
          <>
            <div className="hunt-status">
              <span>{t("round", { n: attempt.position + 1, total: 30 })}</span>
              <span className="mono">
                <Timer size={16} />
                {t("seconds", { n: seconds })}
              </span>
            </div>
            <div className="hunt-number" data-testid="hunt-number">
              {fmt(puzzle.numbers[attempt.position])}
            </div>
            <Badge
              tier={analyze(puzzle.numbers[attempt.position], stats).tier}
            />
            <div className="actions centered">
              <button className="primary" onClick={() => finish(attempt)}>
                {t("bank")}
                <Check size={17} />
              </button>
              <button
                onClick={() => {
                  const current = attemptRef.current;
                  if (current.position >= 29) {
                    finish(current);
                    return;
                  }
                  update({ ...current, position: current.position + 1 });
                }}
              >
                {t("next")}
                <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}
        {attempt.started && !attempt.finished && puzzle.type === "quiz" && (
          <>
            <div className="quiz-progress">
              <span>{t("round", { n: attempt.position + 1, total: 10 })}</span>
              <div className="progress-track">
                <i style={{ width: attempt.position * 10 + "%" }} />
              </div>
            </div>
            <div className="quiz-options">
              {[0, 1].map((i) => (
                <button
                  key={i}
                  className="quiz-number"
                  data-testid={"quiz-" + i}
                  onClick={() => quizPick(i)}
                >
                  {fmt(puzzle.numbers[attempt.position * 2 + i])}
                  <ArrowUpRightIcon />
                </button>
              ))}
            </div>
            {lastFeedback !== null && (
              <p role="status" className="small muted">
                {t(lastFeedback ? "correct" : "incorrect")}
              </p>
            )}
          </>
        )}
        {attempt.finished && (
          <div className="daily-complete" data-testid="daily-complete">
            <span className="label">{t("complete")}</span>
            <div className="result-score">
              {attempt.result}
              <span>/ 100</span>
            </div>
            {chosen !== null && chosen !== undefined && (
              <div className="daily-pick">
                <span className="muted small">{t("yourChoice")}</span>
                <A to={"/?n=" + chosen}>{fmt(chosen)} ↗</A>
              </div>
            )}
            {puzzle.type === "draft" && (
              <div className="result-options">
                {puzzle.numbers.map((n: number, i: number) => (
                  <div key={n} className={i === attempt.choice ? "chosen" : ""}>
                    <span>{fmt(n)}</span>
                    <strong>{fmt(scores[n])}</strong>
                  </div>
                ))}
              </div>
            )}
            {puzzle.type === "quiz" && (
              <div className="quiz-grid" aria-label={t("result")}>
                {attempt.answers.map((pick: number, i: number) => (
                  <span
                    key={i}
                    title={t(
                      scores[puzzle.numbers[i * 2 + pick]] >
                        scores[puzzle.numbers[i * 2 + 1 - pick]]
                        ? "correct"
                        : "incorrect",
                    )}
                  >
                    {scores[puzzle.numbers[i * 2 + pick]] >
                    scores[puzzle.numbers[i * 2 + 1 - pick]]
                      ? "●"
                      : "○"}
                  </span>
                ))}
              </div>
            )}
            <div className="actions centered">
              <button
                onClick={async () => {
                  const text =
                    "RNGDLE.ART · " +
                    day +
                    "\n" +
                    t(puzzle.type) +
                    " " +
                    attempt.result +
                    "/100\n" +
                    (puzzle.type === "quiz"
                      ? attempt.answers
                          .map((p: number, i: number) =>
                            scores[puzzle.numbers[i * 2 + p]] >
                            scores[puzzle.numbers[i * 2 + 1 - p]]
                              ? "■"
                              : "□",
                          )
                          .join("")
                      : "") +
                    "\n" +
                    location.origin +
                    "/" +
                    (location.pathname.split("/")[1] || "en") +
                    "/daily";
                  try {
                    await navigator.clipboard.writeText(text);
                    notify(t("copied"));
                  } catch {
                    notify(text);
                  }
                }}
              >
                <Copy size={16} />
                {t("copyResult")}
              </button>
              <button className="primary" onClick={practiceAgain}>
                <RotateCcw size={16} />
                {t("practice")}
              </button>
            </div>
          </div>
        )}
        <div className="board-footer">
          <Timer size={14} />
          {t("nextDaily", { time: countdown })}
        </div>
      </section>
      {!standalone && (
        <div className="streak-grid">
          <div>
            <Flame size={20} />
            <span>{t("streak")}</span>
            <strong>
              {t("days", {
                n:
                  streak.lastDay === day ||
                  streak.lastDay ===
                    utcDay(Date.parse(day + "T00:00:00Z") - 86400000)
                    ? streak.current
                    : 0,
              })}
            </strong>
          </div>
          <div>
            <span aria-hidden="true">✦</span>
            <span>{t("bestStreak")}</span>
            <strong>{t("days", { n: streak.best })}</strong>
          </div>
        </div>
      )}
    </>
  );
}
function ArrowUpRightIcon() {
  return (
    <span className="quiz-arrow" aria-hidden="true">
      ↗
    </span>
  );
}
