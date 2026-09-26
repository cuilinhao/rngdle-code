import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  FastForward,
  Pause,
  Play,
  Shuffle,
  RotateCcw,
} from "lucide-react";
import { analyze, randomNumber, tierFor, percentile } from "./engine.mjs";
import {
  A,
  useApp,
  stats,
  useStored,
  readStorage,
  writeStorage,
  validNumbers,
  PageHead,
  useScores,
  LoadState,
} from "./core";
import { Badge, Result, SaveButton, SavedNumbers, Recent } from "./components";
import { Specimen } from "./Daily";
import { tierKeys } from "./i18n";
const fresh = { count: 0, total: 0, best: -1, last: -1, dry: 0, rare: 0 };
export default function Infinite() {
  const { t, fmt, share } = useApp(),
    { scores, error, retry } = useScores();
  const [session, setSession] = useStored("session", fresh),
    [lifetime, setLifetime] = useStored("best", -1),
    [effects, setEffects] = useStored("effects", true),
    [targets, setTargets] = useStored("targets", { tier: -1, score: "" });
  const [turbo, setTurbo] = useState(false),
    [revealing, setRevealing] = useState(false),
    [confirm, setConfirm] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    rollRef = useRef<(count: number, animate?: boolean) => void>(() => {}),
    dialog = useRef<HTMLDialogElement>(null);
  const last =
    Number.isInteger(session.last) &&
    session.last >= 0 &&
    session.last <= 1000000
      ? session.last
      : -1;
  const result = last >= 0 ? analyze(last, stats) : null;
  function roll(count = 1, animate = false) {
    if (!scores) return;
    const old = readStorage("session", fresh);
    const next = { ...old };
    let recent = validNumbers(readStorage<number[]>("recent", [])),
      personal = readStorage("best", -1),
      hit = false;
    for (let i = 0; i < count; i++) {
      const n = randomNumber(),
        score = scores[n],
        tier = tierFor(percentile(score, stats));
      next.last = n;
      next.count++;
      next.total += score;
      if (next.best < 0 || next.best > 1000000 || score > scores[next.best])
        next.best = n;
      if (personal < 0 || personal > 1000000 || score > scores[personal])
        personal = n;
      if (tier >= 3) {
        next.rare++;
        next.dry = 0;
      } else next.dry++;
      recent = [n, ...recent.filter((x) => x !== n)].slice(0, 20);
      const targetScore =
        targets.score.trim() === "" ? null : Number(targets.score);
      if (
        (targets.tier >= 0 && tier >= targets.tier) ||
        (targetScore !== null &&
          Number.isFinite(targetScore) &&
          score >= targetScore)
      ) {
        hit = true;
        break;
      }
    }
    setSession(next);
    writeStorage("recent", recent);
    setLifetime(personal);
    if (hit) setTurbo(false);
    if (
      animate &&
      effects &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setRevealing(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setRevealing(false), 850);
    }
  }
  rollRef.current = roll;
  useEffect(() => {
    if (!turbo) return;
    const id = setInterval(() => rollRef.current(20), 120);
    const pause = () => {
      if (document.hidden) setTurbo(false);
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [turbo]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (confirm) dialog.current?.showModal();
  }, [confirm]);
  return (
    <>
      <PageHead
        eyebrow={t("infinite")}
        title={t("rollTitle")}
        description={t("rollIntro")}
      />
      <div className="narrow">
        {!scores ? (
          <LoadState error={error} retry={retry} />
        ) : (
          <>
            <section className="roll-board panel">
              <div className="board-top">
                <span className="label">{t("infinite")}</span>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={effects}
                    onChange={(e) => setEffects(e.target.checked)}
                  />
                  {t("effects")}
                </label>
              </div>
              <div
                className={"roll-digits " + (revealing ? "revealing" : "")}
                aria-live="polite"
                data-testid="roll-digits"
              >
                {(last < 0 ? "??????" : String(last)).split("").map((d, i) => (
                  <span key={i} style={{ animationDelay: i * 60 + "ms" }}>
                    {revealing ? "?" : d}
                  </span>
                ))}
              </div>
              <div className="roll-badge">
                {result && !revealing ? (
                  <>
                    <Badge tier={result.tier} />
                    <span className="mono">
                      {fmt(result.score)}{" "}
                      <span className="muted small">{t("score")}</span>
                    </span>
                  </>
                ) : (
                  <span className="muted">{t("emptyRecent")}</span>
                )}
              </div>
              <button
                className="primary roll-button"
                onClick={() => roll(1, true)}
                disabled={turbo || revealing}
              >
                <Shuffle size={21} />
                {t(revealing ? "rolling" : "roll")}
                <ArrowUpRight size={21} />
              </button>
              {revealing && (
                <button
                  className="text-button"
                  onClick={() => {
                    clearTimeout(timer.current);
                    setRevealing(false);
                  }}
                >
                  {t("skipReveal")}
                </button>
              )}
              <p className="small muted">{t("range")}</p>
              <div className="batch-actions">
                <button disabled={turbo || revealing} onClick={() => roll(10)}>
                  {t("batch", { n: 10 })}
                </button>
                <button disabled={turbo || revealing} onClick={() => roll(100)}>
                  {t("batch", { n: 100 })}
                </button>
                <button
                  disabled={revealing}
                  onClick={() => setTurbo((v) => !v)}
                >
                  {turbo ? <Pause size={16} /> : <FastForward size={16} />}{" "}
                  {t(turbo ? "stop" : "turbo")}
                </button>
              </div>
              <details>
                <summary>{t("more")}</summary>
                <div className="two-col settings">
                  <label>
                    {t("stopTier")}
                    <select
                      value={targets.tier}
                      onChange={(e) =>
                        setTargets({ ...targets, tier: Number(e.target.value) })
                      }
                    >
                      <option value={-1}>{t("disabled")}</option>
                      {tierKeys.map((key, i) => (
                        <option key={key} value={i}>
                          {t(key)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t("stopScore")}
                    <input
                      type="number"
                      min="0"
                      max={stats.maxScore}
                      value={targets.score}
                      onChange={(e) =>
                        setTargets({ ...targets, score: e.target.value })
                      }
                      placeholder={"0 – " + stats.maxScore}
                    />
                  </label>
                </div>
                <p className="small muted">{t("stopNote")}</p>
              </details>
            </section>
            <section className="session panel">
              <div className="section-heading">
                <h2>{t("session")}</h2>
                <button
                  className="text-button"
                  onClick={() => {
                    setTurbo(false);
                    setConfirm(true);
                  }}
                >
                  <RotateCcw size={14} />
                  {t("newSession")}
                </button>
              </div>
              <div className="metrics session-metrics">
                <div>
                  <span>{t("totalRolls")}</span>
                  <strong data-testid="roll-count">{fmt(session.count)}</strong>
                </div>
                <div>
                  <span>{t("best")}</span>
                  <strong>{session.best >= 0 ? fmt(session.best) : "—"}</strong>
                </div>
                <div>
                  <span>{t("average")}</span>
                  <strong>
                    {session.count
                      ? fmt(session.total / session.count, 1)
                      : "—"}
                  </strong>
                </div>
              </div>
              {last >= 0 && (
                <div className="actions">
                  <SaveButton n={last} />
                  <button onClick={() => share(last)}>
                    {t("share")}
                    <ArrowUpRight size={15} />
                  </button>
                  <A to={"/?n=" + last} className="button">
                    {t("analyze")}
                  </A>
                </div>
              )}
              <p className="small muted">
                {t("dryStreak")}: {fmt(session.dry)}
              </p>
              {lifetime >= 0 && (
                <p className="small muted">
                  ✦ {t("best")}: <A to={"/?n=" + lifetime}>{fmt(lifetime)}</A>
                </p>
              )}
            </section>
            <Specimen />
            <SavedNumbers />
            <Recent />
            {last >= 0 && !revealing && <Result n={last} />}
          </>
        )}
        {confirm && (
          <dialog ref={dialog} onCancel={() => setConfirm(false)}>
            <h2>{t("newSession")}</h2>
            <p>{t("resetAsk")}</p>
            <div className="actions">
              <button onClick={() => setConfirm(false)}>{t("cancel")}</button>
              <button
                className="primary"
                onClick={() => {
                  setSession(fresh);
                  setConfirm(false);
                }}
              >
                {t("confirm")}
              </button>
            </div>
          </dialog>
        )}
      </div>
    </>
  );
}
