import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Copy,
  Download,
  X,
  Shuffle,
  Bookmark,
  Check,
  Trash2,
  QrCode,
  Trees,
  Flower2,
  Sun,
  Leaf,
} from "lucide-react";
import { analyze, parseNumber, randomNumber, TOTAL } from "./engine.mjs";
import {
  A,
  useApp,
  stats,
  useStored,
  validNumbers,
  recordRecent,
} from "./core";
import { tierKeys } from "./i18n";
import { drawTreeShareCard } from "./share-card.mjs";
import { createShareQr, drawShareQr } from "./share-qr.mjs";
export function Badge({ tier }: { tier: number }) {
  const { t } = useApp();
  return (
    <span className={"badge tier-" + tier}>
      <span aria-hidden="true">
        {["○", "◔", "◑", "◕", "●", "◆", "✦"][tier]}
      </span>{" "}
      {t(tierKeys[tier])}
    </span>
  );
}
export function NumberForm({
  initial = 142857,
  onChange,
  max = 1000000,
}: {
  initial?: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  const { t, fmt } = useApp(),
    [value, setValue] = useState(String(initial)),
    [error, setError] = useState(false);
  useEffect(() => setValue(String(initial)), [initial]);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseNumber(value, max);
    setError(n === null);
    if (n !== null) onChange(n);
  }
  return (
    <form className="number-form" onSubmit={submit} noValidate>
      <label htmlFor="number-input">{t("enter")}</label>
      <div className="input-row">
        <input
          id="number-input"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          aria-invalid={error}
          aria-describedby={error ? "number-error" : "number-range"}
        />
        <button className="primary" type="submit">
          {t("analyzeNumber")}
          <ArrowUpRight size={18} />
        </button>
        <button
          className="icon-button"
          type="button"
          title={t("random")}
          aria-label={t("random")}
          onClick={() => {
            let n = randomNumber();
            while (n > max) n = randomNumber();
            setValue(String(n));
            setError(false);
            onChange(n);
          }}
        >
          <Shuffle size={19} />
        </button>
      </div>
      <p
        className={"small " + (error ? "error" : "muted")}
        id={error ? "number-error" : "number-range"}
      >
        {error ? t("invalid", { max: fmt(max) }) : t("range")}
      </p>
    </form>
  );
}
export function ScoreSummary({
  n,
  compact = false,
}: {
  n: number;
  compact?: boolean;
}) {
  const { t, fmt } = useApp();
  const a = analyze(n, stats);
  return (
    <div
      className={"score-summary " + (compact ? "compact" : "")}
      data-testid="score-summary"
    >
      <div className="number-heading">
        <div>
          <span className="label">{t("number")}</span>
          <div className="big-number">{fmt(n)}</div>
        </div>
        <Badge tier={a.tier} />
      </div>
      <div className="metrics">
        <div>
          <span>{t("score")}</span>
          <strong data-testid="rarity-score">{fmt(a.score)}</strong>
        </div>
        <div>
          <span>{t("percentile")}</span>
          <strong>
            {t("top", {
              p: fmt(a.percent, a.percent < 0.01 ? 4 : a.percent < 0.1 ? 3 : 2),
            })}
          </strong>
        </div>
        <div>
          <span>{t("traits")}</span>
          <strong>{a.signals.length}</strong>
        </div>
      </div>
    </div>
  );
}
export function NumberDNA({ n }: { n: number }) {
  const { t } = useApp();
  const s = String(n),
    width = 480,
    pad = 32,
    step = (width - pad * 2) / Math.max(1, s.length - 1);
  return (
    <section className="dna panel">
      <h2 className="label">{t("dna")}</h2>
      <svg viewBox="0 0 480 128" role="img" aria-label={t("dna") + ": " + s}>
        <defs>
          <linearGradient id="dna-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="16"
            x2="464"
            y1={14 + i * 28}
            y2={14 + i * 28}
            className="grid-line"
          />
        ))}
        <path
          d={
            "M " +
            [...s]
              .map(
                (d, i) =>
                  (s.length === 1 ? 240 : pad + i * step) +
                  "," +
                  (96 - Number(d) * 8),
              )
              .join(" L ") +
            ` L ${s.length === 1 ? 240 : width - pad},110 L ${s.length === 1 ? 240 : pad},110 Z`
          }
          fill="url(#dna-fill)"
        />
        <polyline
          points={[...s]
            .map(
              (d, i) =>
                (s.length === 1 ? 240 : pad + i * step) +
                "," +
                (96 - Number(d) * 8),
            )
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {[...s].map((d, i) => (
          <g key={i}>
            <line
              x1={s.length === 1 ? 240 : pad + i * step}
              x2={s.length === 1 ? 240 : pad + i * step}
              y1={96 - Number(d) * 8}
              y2={110}
              className="grid-line"
            />
            <circle
              cx={s.length === 1 ? 240 : pad + i * step}
              cy={96 - Number(d) * 8}
              r={4}
              fill="var(--bg)"
              stroke="currentColor"
              strokeWidth="2"
            />
            <text
              x={s.length === 1 ? 240 : pad + i * step}
              y={125}
              textAnchor="middle"
              fill="currentColor"
              fontSize="12"
            >
              {d}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
export function Traits({ n, all = true }: { n: number; all?: boolean }) {
  const { t, fmt } = useApp();
  const a = analyze(n, stats);
  return (
    <section>
      <div className="section-heading">
        <h2>{t("drivers")}</h2>
        <span className="muted small">
          {a.signals.length} {t("traits")}
        </span>
      </div>
      <div className="traits-grid">
        {a.signals.slice(0, all ? 99 : 4).map((s: any) => (
          <article className="trait panel" key={s.id}>
            <div className="trait-top">
              <div className="pattern-icon" aria-hidden="true">
                {
                  (
                    {
                      repetition: "∞",
                      symmetry: "◇",
                      sequence: "⌁",
                      arithmetic: "∑",
                      factorization: "÷",
                      representation: "01",
                      range: "#",
                    } as any
                  )[s.group]
                }
              </div>
              <div>
                <h3>
                  {t(s.value === null ? "p_" + s.id : s.id, {
                    value: s.value ?? "",
                  })}
                </h3>
                <span className="label">
                  {t(s.group === "range" ? "rangeGroup" : s.group)}
                </span>
              </div>
              <strong className="points">+{Math.round(s.points)}</strong>
            </div>
            {s.value === null && (
              <p className="small muted">{t("d_" + s.id)}</p>
            )}
            <div className="trait-bottom">
              <span className="digit-chips" aria-hidden="true">
                {String(n)
                  .split("")
                  .map((d, i) => (
                    <i key={i}>{d}</i>
                  ))}
              </span>
              <span className="mono small">
                {s.count / TOTAL < 0.001
                  ? t("oneIn", { n: fmt(TOTAL / s.count) })
                  : fmt((s.count / TOTAL) * 100, 2) + "%"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export function Result({
  n,
  details = true,
}: {
  n: number;
  details?: boolean;
}) {
  const { t, fmt, share } = useApp();
  const a = analyze(n, stats);
  return (
    <div className="analysis-result">
      <ScoreSummary n={n} />
      <p className="small muted score-note">{t("scoreNote")}</p>
      <div className="actions">
        <A to={"/compare?a=" + n + "&b=123456"} className="button">
          {t("compare")}
          <ArrowUpRight size={15} />
        </A>
        {n <= 999999 && (
          <A to={"/sandbox?n=" + n} className="button">
            {t("sandbox")}
            <ArrowUpRight size={15} />
          </A>
        )}
        <button onClick={() => share(n)}>
          {t("shareCard")}
          <ArrowUpRight size={15} />
        </button>
      </div>
      {details && (
        <>
          <NumberDNA n={n} />
          <div className="two-col">
            <section className="panel">
              <h2 className="label">{t("profile")}</h2>
              <dl>
                {[
                  [t("digits"), a.len],
                  [t("distinct"), a.unique],
                  [t("digitSum"), a.sum],
                  [t("oddEven"), a.odd + " / " + (a.len - a.odd)],
                  [t("root"), a.root],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="panel">
              <h2 className="label">{t("math")}</h2>
              <dl>
                <div>
                  <dt>{t("divisors")}</dt>
                  <dd>{n === 0 ? "∞" : a.divisors}</dd>
                </div>
                <div>
                  <dt>{t("factors")}</dt>
                  <dd>
                    {n < 2
                      ? t("none")
                      : a.factors
                          .map(
                            ([p, e]: number[]) =>
                              fmt(p) + (e > 1 ? "^" + e : ""),
                          )
                          .join(" × ")}
                  </dd>
                </div>
                <div>
                  <dt>{t("binary")}</dt>
                  <dd className="break mono">{a.binary}</dd>
                </div>
                <div>
                  <dt>{t("hex")}</dt>
                  <dd className="mono">{a.hex.toUpperCase()}</dd>
                </div>
              </dl>
            </section>
          </div>
          <Traits n={n} />
          <A to="/methodology" className="text-link">
            {t("methodology")}
            <ArrowUpRight size={16} />
          </A>
        </>
      )}
    </div>
  );
}
export function Recent() {
  const { t, fmt } = useApp();
  const [recent] = useStored<number[]>("recent", []);
  return (
    <div className="recent">
      <span className="label">{t("recent")}</span>
      {validNumbers(recent)
        .slice(0, 8)
        .map((n) => (
          <A key={n} to={"/?n=" + n} className="number-chip">
            {fmt(n)}
          </A>
        ))}
      {recent.length === 0 && (
        <span className="small muted">{t("emptyRecent")}</span>
      )}
    </div>
  );
}
export function SaveButton({ n }: { n: number }) {
  const { t, notify } = useApp(),
    [raw, setSaved] = useStored<number[]>("saved", []);
  const saved = validNumbers(raw),
    exists = saved.includes(n);
  return (
    <button
      disabled={exists}
      onClick={() => {
        if (saved.length >= 50) {
          notify(t("fullSaved"));
          return;
        }
        setSaved([...saved, n]);
      }}
    >
      {exists ? <Check size={16} /> : <Bookmark size={16} />}{" "}
      {t(exists ? "savedAlready" : "save")}
    </button>
  );
}
export function SavedNumbers() {
  const { t, fmt } = useApp(),
    [raw, setSaved] = useStored<number[]>("saved", []);
  const saved = validNumbers(raw);
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>{t("saved")}</h2>
        <span className="mono muted">{saved.length}/50</span>
      </div>
      {saved.length === 0 ? (
        <p className="muted">{t("emptySaved")}</p>
      ) : (
        <div className="saved-grid">
          {saved.map((n) => (
            <div key={n} className="saved-number">
              <A to={"/?n=" + n}>{fmt(n)}</A>
              <button
                className="icon-button"
                aria-label={t("remove") + " " + n}
                onClick={() => setSaved(saved.filter((x) => x !== n))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="small muted">{t("localNote")}</p>
    </section>
  );
}
export function ShareDialog({
  n,
  onClose,
}: {
  n: number;
  onClose: () => void;
}) {
  const { t, fmt, locale, notify } = useApp(),
    ref = useRef<HTMLDialogElement>(null),
    [renderedCard, setRenderedCard] = useState<{ key: string; source: string | null; image: string } | null>(null),
    [snapshot, setSnapshot] = useState<{ key: string; image: string | null } | null>(null),
    [treeReady, setTreeReady] = useState(false),
    [view, setView] = useState<"tree" | "qr">("tree"),
    [season, setSeason] = useState<"spring" | "summer" | "autumn">("summer"),
    [failed, setFailed] = useState(false),
    [Tree, setTree] = useState<typeof import("./ShareTree").default | null>(null);
  const url = new URL("/" + locale + "?n=" + n, location.origin).href;
  const exportKey = url + "|" + season;
  const currentSnapshot = snapshot?.key === exportKey ? snapshot : null;
  const canExport = failed || currentSnapshot !== null;
  const treeImage = failed ? null : currentSnapshot?.image ?? null;
  // A prior season or an in-flight snapshot must never remain downloadable.
  const image = canExport && renderedCard?.key === exportKey && renderedCard.source === treeImage
    ? renderedCard.image : "";
  const a = analyze(n, stats);
  const handleCapture = useCallback((image: string | null, capturedSeason: "spring" | "summer" | "autumn") => {
    setSnapshot({ key: url + "|" + capturedSeason, image });
  }, [url]);
  const handleTreeError = useCallback(() => setFailed(true), []);
  const handleTreeReady = useCallback(() => setTreeReady(true), []);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.showModal();
    let active = true;
    import("./ShareTree").then((module) => {
      if (active) setTree(() => module.default);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; previous?.focus(); };
  }, []);
  useEffect(() => {
    if (!canExport) return;
    let active = true;
    async function renderCard() {
      await document.fonts.ready;
      let tree: HTMLImageElement | undefined;
      if (treeImage) {
        const decoded = new Image();
        decoded.src = treeImage;
        try { await decoded.decode(); tree = decoded; } catch { /* QR export remains available. */ }
      }
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = 630;
      drawTreeShareCard(c.getContext("2d")!, {
        number: fmt(n),
        score: fmt(a.score),
        percent: t("top", { p: fmt(a.percent, a.percent < 0.01 ? 4 : 3) }),
        label: t("lab"),
        subtitle: t(tierKeys[a.tier]),
        scoreLabel: t("score"),
        percentLabel: t("percentile"),
        qrLabel: t("scanResult"),
        url,
        treeImage: tree,
      });
      if (active) setRenderedCard({ key: exportKey, source: treeImage, image: c.toDataURL("image/png") });
    }
    void renderCard();
    return () => { active = false; };
  }, [n, locale, treeImage, url, exportKey, canExport]);
  const toggleLabel = t(view === "tree" ? "showQr" : "showTree");
  return (
    <dialog
      className="tree-share-dialog"
      aria-labelledby="share-dialog-title"
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-head">
        <div>
          <p className="share-eyebrow">RNGDLE.ART <span>/</span> {t("share")}</p>
          <h2 id="share-dialog-title">{t("shareTreeTitle")}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label={t("close")}>
          <X size={20} />
        </button>
      </div>
      <div className="tree-share-card">
        <div className="share-result">
          <p className="share-result-label">{t("lab")}</p>
          <div className="share-number">{fmt(n)}</div>
          <span className="share-tier"><span aria-hidden="true">✦</span> {t(tierKeys[a.tier])}</span>
          <p className="share-story">{t("shareTreeStory")}</p>
          <div className="share-metrics">
            <div><span>{t("score")}</span><strong>{fmt(a.score)}</strong></div>
            <div><span>{t("percentile")}</span><strong>{t("top", { p: fmt(a.percent, a.percent < 0.01 ? 4 : 3) })}</strong></div>
          </div>
        </div>
        <div className="share-art">
          <div className="share-tree-viewport">
            {failed ? (
              <ShareQrFallback url={url} label={t("scanResult")} />
            ) : (
              <>
                {Tree ? (
                  <Tree key={url} url={url} view={view} season={season} onCapture={handleCapture} onReady={handleTreeReady} onError={handleTreeError} />
                ) : <div className="share-tree-loading" role="status">{t("growingTree")}</div>}
                <button
                  className="share-tree-toggle"
                  aria-label={toggleLabel}
                  disabled={!treeReady}
                  onClick={() => setView(view === "tree" ? "qr" : "tree")}
                >
                  <span>{view === "tree" ? <QrCode size={16} /> : <Trees size={16} />}{toggleLabel}</span>
                </button>
              </>
            )}
          </div>
          {!failed && <div className="share-seasons" role="group" aria-label={t("treeSeason")}>
            {(["spring", "summer", "autumn"] as const).map((value, index) => {
              const Icon = [Flower2, Sun, Leaf][index];
              return <button key={value} aria-pressed={season === value} onClick={() => setSeason(value)}>
                <Icon size={17} />{t(value)}
              </button>;
            })}
          </div>}
          <p className="share-art-caption" aria-live="polite">{t(failed || view === "qr" ? "scanResult" : "treeHint")}</p>
        </div>
      </div>
      <div className="share-footer">
        <label className="share-link-label" htmlFor="share-result-url">{t("copyManual")}</label>
        <div className="share-link-row">
          <input id="share-result-url" aria-label={t("copy")} readOnly value={url} onFocus={(e) => e.target.select()} />
          <button onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              notify(t("copied"));
            } catch {
              ref.current?.querySelector("input")?.focus();
              ref.current?.querySelector("input")?.select();
            }
          }}><Copy size={16} />{t("copy")}</button>
          {image && <a className="button primary" href={image} download={"rngdle-art-" + n + ".png"}>
            <Download size={16} />{t("download")}
          </a>}
        </div>
      </div>
    </dialog>
  );
}
function ShareQrFallback({ url, label }: { url: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (canvas) drawShareQr(canvas.getContext("2d")!, createShareQr(url), 0, 0, 400);
  }, [url]);
  return <canvas className="share-fallback" ref={ref} width={400} height={400} role="img" aria-label={label} />;
}
export function TierTable() {
  const { t } = useApp();
  return (
    <section className="tier-section">
      <h2>{t("tiers")}</h2>
      <div className="tier-table">
        {tierKeys.map((key, i) => (
          <div key={key}>
            <span className="tier-index mono">0{i + 1}</span>
            <Badge tier={i} />
            <span className="mono">
              {i === 0
                ? "50–100%"
                : t("top", { p: [50, 50, 25, 10, 5, 1, 0.1][i] })}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
