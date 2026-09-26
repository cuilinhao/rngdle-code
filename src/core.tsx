import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translate, type Locale, htmlLangs, locales } from "./i18n";
import statsData from "../public/data/stats.json";
export const stats: any = statsData;
export const AppContext = createContext({
  locale: "en" as Locale,
  navigate: (_to: string) => {},
  notify: (_text: string) => {},
  share: (_n: number) => {},
});
export function useApp() {
  const context = useContext(AppContext);
  return {
    ...context,
    t: (key: string, args: Record<string, string | number> = {}) =>
      translate(context.locale, key, args),
    fmt: (n: number, digits = 0) =>
      new Intl.NumberFormat(htmlLangs[locales.indexOf(context.locale)], {
        maximumFractionDigits: digits,
      }).format(n),
  };
}
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem("rngdle.art." + key);
    if (s === null) return fallback;
    const val = JSON.parse(s);
    if (Array.isArray(fallback))
      return (Array.isArray(val) ? val : fallback) as T;
    if (fallback !== null && typeof fallback === "object") {
      if (!val || Array.isArray(val) || typeof val !== "object")
        return fallback;
      if (Object.keys(fallback).length === 0) return val;
      const result: any = { ...fallback };
      for (const k of Object.keys(fallback)) {
        const def = (fallback as any)[k],
          v = val[k];
        if (Array.isArray(def)) {
          if (Array.isArray(v)) result[k] = v;
        } else if (typeof v === typeof def && v !== null) result[k] = v;
      }
      return result;
    }
    return typeof val === typeof fallback ? val : fallback;
  } catch {
    return fallback;
  }
}
export function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem("rngdle.art." + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("rngdle-storage", { detail: key }));
    return true;
  } catch {
    return false;
  }
}
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState(() => readStorage(key, fallback));
  useEffect(() => {
    const listener = () => setValue(readStorage(key, fallback));
    window.addEventListener("rngdle-storage", listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener("rngdle-storage", listener);
      window.removeEventListener("storage", listener);
    };
  }, [key]);
  const update = (next: T | ((old: T) => T)) => {
    const val =
      typeof next === "function"
        ? (next as (old: T) => T)(readStorage(key, fallback))
        : next;
    writeStorage(key, val);
    setValue(val);
  };
  return [value, update] as const;
}
export function validNumbers(items: unknown[]): number[] {
  return items.filter(
    (n): n is number =>
      typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 1000000,
  );
}
export function recordRecent(n: number) {
  const old = validNumbers(readStorage<unknown[]>("recent", []));
  writeStorage("recent", [n, ...old.filter((x) => x !== n)].slice(0, 20));
}
let scoresPromise: Promise<Uint16Array> | undefined,
  maskPromise: Promise<Uint32Array> | undefined;
export function getScores() {
  return (scoresPromise ??= fetch("/data/scores.bin")
    .then(async (r) => {
      if (!r.ok) throw Error("Scores unavailable");
      const buf = await r.arrayBuffer();
      if (buf.byteLength !== 2000002) throw Error("Score index corrupt");
      return new Uint16Array(buf);
    })
    .catch((e) => {
      scoresPromise = undefined;
      throw e;
    }));
}
export function getMasks() {
  return (maskPromise ??= fetch("/data/patterns.bin")
    .then(async (r) => {
      if (!r.ok) throw Error("Patterns unavailable");
      const buf = await r.arrayBuffer();
      if (buf.byteLength !== 4000004) throw Error("Pattern index corrupt");
      return new Uint32Array(buf);
    })
    .catch((e) => {
      maskPromise = undefined;
      throw e;
    }));
}
export function useScores() {
  const [scores, setScores] = useState<Uint16Array | null>(null),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    getScores()
      .then((v) => active && setScores(v))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [retry]);
  return { scores, error, retry: () => setRetry((n) => n + 1) };
}
export function A({
  to,
  children,
  className = "",
  ...rest
}: {
  to: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const { locale, navigate } = useApp();
  const href = "/" + locale + (to === "/" ? "" : to);
  return (
    <a
      href={href}
      className={className}
      {...rest}
      onClick={(e) => {
        if (
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          e.button === 0
        ) {
          e.preventDefault();
          navigate(to);
        }
      }}
    >
      {children}
    </a>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-head">
      <div className="eyebrow">
        <span className="tiny-cross">✳</span> {eyebrow}
      </div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
export function LoadState({
  error,
  retry,
}: {
  error: boolean;
  retry: () => void;
}) {
  const { t } = useApp();
  return (
    <div className="panel load-state" role={error ? "alert" : "status"}>
      <p>{t(error ? "loadError" : "loading")}</p>
      {error && <button onClick={retry}>{t("retry")}</button>}
    </div>
  );
}
