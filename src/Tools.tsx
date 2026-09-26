import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Shuffle,
  Search,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  A,
  useApp,
  stats,
  PageHead,
  getMasks,
  useStored,
  recordRecent,
} from "./core";
import {
  analyze,
  parseNumber,
  randomNumber,
  bestEdit,
  patterns,
  MAX,
  TOTAL,
} from "./engine.mjs";
import { NumberForm, Result, ScoreSummary, Traits, Badge } from "./components";
import Daily, { Specimen } from "./Daily";
export function Compare() {
  const { t, fmt } = useApp(),
    params = new URLSearchParams(location.search),
    [tab, setTab] = useState("compare"),
    [a, setA] = useState(params.get("a") ?? "142857"),
    [b, setB] = useState(params.get("b") ?? "123456"),
    [pair, setPair] = useState<number[] | null>(null),
    [error, setError] = useState(false);
  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const x = parseNumber(a),
      y = parseNumber(b);
    setError(x === null || y === null);
    if (x !== null && y !== null) setPair([x, y]);
  }
  function randomize() {
    const x = randomNumber(),
      y = randomNumber();
    setA(String(x));
    setB(String(y));
    setPair([x, y]);
    setError(false);
  }
  return (
    <>
      <PageHead
        eyebrow={t("compare")}
        title={t("compareTitle")}
        description={t("compareIntro")}
      />
      <div className="narrow">
        <div className="tabs" role="tablist">
          {["compare", "battle", "quiz"].map((key) => (
            <button
              role="tab"
              aria-selected={tab === key}
              key={key}
              onClick={() => {
                setTab(key);
                if (key === "battle") randomize();
              }}
            >
              {t(key)}
            </button>
          ))}
        </div>
        {tab === "quiz" ? (
          <Daily standalone />
        ) : (
          <>
            <form className="panel compare-form" onSubmit={submit} noValidate>
              <div className="compare-inputs">
                <label>
                  {t("first")}
                  <input
                    inputMode="numeric"
                    value={a}
                    onChange={(e) => setA(e.target.value)}
                    aria-invalid={error}
                  />
                </label>
                <span className="versus">↔</span>
                <label>
                  {t("second")}
                  <input
                    inputMode="numeric"
                    value={b}
                    onChange={(e) => setB(e.target.value)}
                    aria-invalid={error}
                  />
                </label>
              </div>
              {error && (
                <p className="error" role="alert">
                  {t("invalid", { max: fmt(MAX) })}
                </p>
              )}
              <div className="actions">
                <button className="primary" type="submit">
                  {t("compare")}
                  <ArrowRight size={16} />
                </button>
                <button type="button" onClick={randomize}>
                  <Shuffle size={16} />
                  {t("battle")}
                </button>
              </div>
            </form>
            {pair && (
              <>
                <div
                  className="comparison-verdict"
                  data-testid="comparison-result"
                >
                  {analyze(pair[0], stats).score ===
                  analyze(pair[1], stats).score
                    ? t("tie")
                    : t("winner", {
                        n: fmt(
                          analyze(pair[0], stats).score >
                            analyze(pair[1], stats).score
                            ? pair[0]
                            : pair[1],
                        ),
                      })}
                </div>
                <div className="two-col comparison-cards">
                  {pair.map((n, i) => (
                    <div key={i}>
                      <ScoreSummary n={n} compact />
                      <A to={"/?n=" + n} className="text-link">
                        {t("analyze")}
                        <ArrowUpRight size={16} />
                      </A>
                      <Traits n={n} all={false} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
export function Sandbox() {
  const { t, fmt, notify } = useApp();
  const initial =
    parseNumber(
      new URLSearchParams(location.search).get("n") ?? "524287",
      999999,
    ) ?? 524287;
  const [n, setN] = useState(initial),
    [base, setBase] = useState(initial);
  const digits = String(n).split(""),
    refs = useRef<(HTMLButtonElement | null)[]>([]);
  const best = useMemo(() => bestEdit(n, stats), [n]);
  function change(index: number, value: number) {
    const ds = [...digits];
    if (index === 0 && ds.length > 1 && value === 0) value = 1;
    ds[index] = String((value + 10) % 10);
    setN(Number(ds.join("")));
  }
  function step(index: number, delta: number) {
    let value = Number(digits[index]) + delta;
    if (index === 0 && digits.length > 1) {
      if (value > 9) value = 1;
      if (value < 1) value = 9;
    }
    change(index, value);
  }
  return (
    <>
      <PageHead
        eyebrow={t("sandbox")}
        title={t("sandboxTitle")}
        description={t("sandboxIntro")}
      />
      <div className="narrow">
        <div className="panel">
          <NumberForm
            initial={base}
            max={999999}
            onChange={(value) => {
              setN(value);
              setBase(value);
            }}
          />
          <div className="length-control">
            <span>{t("digits")}</span>
            <button
              className="icon-button"
              disabled={digits.length <= 1}
              aria-label={t("decrease", { n: 0 })}
              onClick={() => setN(Math.floor(n / 10))}
            >
              <Minus size={16} />
            </button>
            <strong>{digits.length}</strong>
            <button
              className="icon-button"
              disabled={digits.length >= 6}
              aria-label={t("increase", { n: 0 })}
              onClick={() => setN(n === 0 ? 10 : n * 10)}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="digit-editor">
            {digits.map((d, i) => (
              <div key={i}>
                <button
                  className="icon-button"
                  aria-label={t("increase", { n: i + 1 })}
                  onClick={() => step(i, 1)}
                >
                  <ChevronUp size={21} />
                </button>
                <button
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  className="editable-digit"
                  aria-label={t("digit", { n: i + 1 })}
                  onKeyDown={(e) => {
                    if (
                      [
                        "ArrowUp",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowRight",
                      ].includes(e.key) ||
                      /^\d$/.test(e.key)
                    )
                      e.preventDefault();
                    if (e.key === "ArrowUp") step(i, 1);
                    if (e.key === "ArrowDown") step(i, -1);
                    if (e.key === "ArrowLeft")
                      refs.current[Math.max(0, i - 1)]?.focus();
                    if (e.key === "ArrowRight")
                      refs.current[Math.min(digits.length - 1, i + 1)]?.focus();
                    if (/^\d$/.test(e.key)) change(i, Number(e.key));
                  }}
                >
                  {d}
                </button>
                <button
                  className="icon-button"
                  aria-label={t("decrease", { n: i + 1 })}
                  onClick={() => step(i, -1)}
                >
                  <ChevronDown size={21} />
                </button>
              </div>
            ))}
          </div>
          <p className="small muted">{t("keyboardNote")}</p>
          <div className="actions">
            <button
              onClick={() => {
                let x = randomNumber();
                while (x > 999999) x = randomNumber();
                setN(x);
              }}
            >
              <Shuffle size={16} />
              {t("random")}
            </button>
            <button onClick={() => setN(base)}>{t("reset")}</button>
            <button
              onClick={async () => {
                const url = location.origin + location.pathname + "?n=" + n;
                try {
                  await navigator.clipboard.writeText(url);
                  notify(t("copied"));
                } catch {
                  notify(url);
                }
              }}
            >
              {t("copy")}
            </button>
          </div>
        </div>
        <section className="panel improvement">
          <div>
            <h2>{t("bestEdit")}</h2>
            {best.index < 0 ? (
              <p className="small muted">{t("localMax")}</p>
            ) : (
              <p className="mono">
                {fmt(n)} → <strong>{fmt(best.n)}</strong>{" "}
                <span className="badge">
                  +{best.score - analyze(n, stats).score}
                </span>
              </p>
            )}
          </div>
          {best.index >= 0 && (
            <button onClick={() => setN(best.n)}>
              {t("apply")}
              <ArrowUpRight size={16} />
            </button>
          )}
        </section>
        <Result n={n} />
      </div>
    </>
  );
}
export function Explore() {
  const { t, fmt, navigate } = useApp();
  const params = new URLSearchParams(location.search),
    [pattern, setPattern] = useState(
      patterns.some((p) => p.id === params.get("pattern"))
        ? params.get("pattern")!
        : "palindrome",
    ),
    [minLength, setMinLength] = useState(1),
    [minSum, setMinSum] = useState("0"),
    [results, setResults] = useState<number[] | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const worker = useRef<Worker | null>(null),
    job = useRef(0);
  useEffect(() => () => worker.current?.terminate(), []);
  async function search() {
    const sum = parseNumber(minSum, 54);
    if (sum === null) {
      setError(t("invalid", { max: 54 }));
      return;
    }
    const id = ++job.current;
    setBusy(true);
    setError("");
    setResults(null);
    try {
      const masks = await getMasks();
      if (id !== job.current) return;
      worker.current?.terminate();
      const w = new Worker(new URL("./explorer.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.current = w;
      w.onmessage = (e) => {
        if (id !== job.current) return;
        setResults(Array.from(e.data as Uint32Array));
        setBusy(false);
        w.terminate();
      };
      w.onerror = () => {
        setError(t("loadError"));
        setBusy(false);
        w.terminate();
      };
      w.postMessage({
        masks,
        pattern: patterns.find((p) => p.id === pattern)!.index,
        minLength,
        minSum: sum,
      });
    } catch {
      setError(t("loadError"));
      setBusy(false);
    }
  }
  function changed() {
    job.current++;
    worker.current?.terminate();
    setBusy(false);
    setResults(null);
    setError("");
  }
  return (
    <>
      <PageHead
        eyebrow={t("explore")}
        title={t("exploreTitle")}
        description={t("exploreIntro")}
      />
      <div className="narrow">
        <form
          className="panel explorer-form"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
          noValidate
        >
          <div className="explorer-fields">
            <label>
              {t("pattern")}
              <select
                value={pattern}
                onChange={(e) => {
                  setPattern(e.target.value);
                  changed();
                }}
              >
                {patterns.map((p) => (
                  <option value={p.id} key={p.id}>
                    {t("p_" + p.id)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("minLength")}
              <select
                value={minLength}
                onChange={(e) => {
                  setMinLength(Number(e.target.value));
                  changed();
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              {t("minSum")}
              <input
                inputMode="numeric"
                value={minSum}
                onChange={(e) => {
                  setMinSum(e.target.value);
                  changed();
                }}
              />
            </label>
          </div>
          <div className="actions">
            <button className="primary" disabled={busy} type="submit">
              <Search size={16} />
              {t(busy ? "scanning" : "count")}
            </button>
            {results && results.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const index = Math.floor(
                    (crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) *
                      results.length,
                  );
                  navigate("/?n=" + results[index]);
                }}
              >
                {t("randomMatch")}
                <ArrowUpRight size={16} />
              </button>
            )}
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>
        {busy && (
          <div className="panel" role="status">
            {t("scanning")}
          </div>
        )}
        {results && (
          <section
            className="panel explorer-results"
            data-testid="explorer-result"
          >
            <span className="label">{t("p_" + pattern)}</span>
            <h2>{t("matches", { n: fmt(results.length) })}</h2>
            <p className="muted">
              {results.length ? t("d_" + pattern) : t("noMatches")}
            </p>
            <div className="number-grid">
              {results.slice(0, 60).map((n) => (
                <A to={"/?n=" + n} key={n} className="number-chip">
                  {fmt(n)}
                  <ArrowUpRight size={13} />
                </A>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
export function Atlas({ id }: { id?: string }) {
  const { t, fmt } = useApp(),
    [filter, setFilter] = useState("all"),
    [atlas] = useStored<Record<string, number>>("atlas", {});
  const selected = patterns.find((p) => p.id === id);
  if (id && !selected) return <NotFound />;
  return (
    <>
      <PageHead
        eyebrow={t("patterns")}
        title={selected ? t("p_" + selected.id) : t("atlasTitle")}
        description={selected ? t("d_" + selected.id) : t("atlasIntro")}
      />
      <div className={selected ? "narrow" : ""}>
        {selected ? (
          <>
            <div className="panel pattern-detail">
              <div className="metrics">
                <div>
                  <span>{t("matches", { n: "" })}</span>
                  <strong>{fmt(stats.counts[selected.id])}</strong>
                </div>
                <div>
                  <span>{t("frequency")}</span>
                  <strong>
                    {fmt((stats.counts[selected.id] / TOTAL) * 100, 4)}%
                  </strong>
                </div>
              </div>
              <p>{t(selected.group)}</p>
              <h2>{t("examples")}</h2>
              <div className="number-grid">
                {stats.examples[selected.id].map((n: number) => (
                  <A key={n} to={"/?n=" + n} className="number-chip">
                    {fmt(n)}
                  </A>
                ))}
              </div>
              <A
                className="button primary"
                to={"/explore?pattern=" + selected.id}
              >
                {t("explore")}
                <ArrowUpRight size={16} />
              </A>
            </div>
            <A to="/patterns" className="text-link">
              ← {t("patterns")}
            </A>
          </>
        ) : (
          <>
            <div className="atlas-record panel">
              <div>
                <span className="label">{t("fieldRecord")}</span>
                <h2>
                  {
                    Object.keys(atlas).filter((key) =>
                      patterns.some((p) => p.id === key),
                    ).length
                  }
                  <span className="muted"> / 31</span>
                </h2>
                <p className="small muted">{t("atlasNote")}</p>
              </div>
              <A to="/infinite" className="button">
                {t("specimen")}
                <ArrowUpRight size={16} />
              </A>
            </div>
            <div className="filter-chips">
              {[
                "all",
                "repetition",
                "symmetry",
                "sequence",
                "arithmetic",
                "factorization",
                "representation",
              ].map((g) => (
                <button
                  className={filter === g ? "active" : ""}
                  key={g}
                  aria-pressed={filter === g}
                  onClick={() => setFilter(g)}
                >
                  {t(g)}
                </button>
              ))}
            </div>
            <div className="atlas-grid">
              {patterns
                .filter((p) => filter === "all" || p.group === filter)
                .map((p, i) => (
                  <A
                    to={"/patterns/" + p.id}
                    className="atlas-card panel"
                    key={p.id}
                  >
                    <div className="atlas-card-top">
                      <span className="label">{t(p.group)}</span>
                      <span className="small">
                        {atlas[p.id] !== undefined ? (
                          <Check size={16} />
                        ) : (
                          <span aria-hidden="true">○</span>
                        )}
                      </span>
                    </div>
                    <div className="atlas-glyph" aria-hidden="true">
                      {
                        (
                          {
                            repetition: "∞",
                            symmetry: "◇",
                            sequence: "⌁",
                            arithmetic: "∑",
                            factorization: "÷",
                            representation: "01",
                          } as any
                        )[p.group]
                      }
                    </div>
                    <h2>{t("p_" + p.id)}</h2>
                    <p className="small muted">{t("d_" + p.id)}</p>
                    <div className="atlas-card-bottom">
                      <span className="mono small">
                        {t("matches", { n: fmt(stats.counts[p.id]) })}
                      </span>
                      <ArrowUpRight size={17} />
                    </div>
                    <span className="small muted">
                      {t(atlas[p.id] !== undefined ? "recorded" : "unrecorded")}
                    </span>
                  </A>
                ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
export function NotFound() {
  const { t } = useApp();
  return (
    <div className="not-found">
      <span className="mono">404</span>
      <h1>{t("notFound")}</h1>
      <A to="/" className="button primary">
        {t("home")}
        <ArrowRight size={18} />
      </A>
    </div>
  );
}
