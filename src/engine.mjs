export const MAX = 1_000_000;
export const TOTAL = MAX + 1;
export const VERSION = "art-1.0.0";
export const groups = [
  "repetition",
  "symmetry",
  "sequence",
  "arithmetic",
  "factorization",
  "representation",
];
export const patterns = [
  ["repdigit", "repetition"],
  ["five", "repetition"],
  ["quad", "repetition"],
  ["triple", "repetition"],
  ["pairs", "repetition"],
  ["repeat", "repetition"],
  ["run", "repetition"],
  ["twoDigits", "repetition"],
  ["palindrome", "symmetry"],
  ["ascending", "sequence"],
  ["descending", "sequence"],
  ["ascRun", "sequence"],
  ["descRun", "sequence"],
  ["abab", "sequence"],
  ["abcabc", "sequence"],
  ["parity", "sequence"],
  ["zigzag", "sequence"],
  ["harshad", "arithmetic"],
  ["happy", "arithmetic"],
  ["prime", "factorization"],
  ["semiprime", "factorization"],
  ["square", "factorization"],
  ["cube", "factorization"],
  ["power2", "factorization"],
  ["fibonacci", "factorization"],
  ["triangular", "factorization"],
  ["factorial", "factorization"],
  ["divisible", "factorization"],
  ["binaryPal", "representation"],
  ["binaryOnes", "representation"],
  ["hexRepeat", "representation"],
].map(([id, group], index) => ({ id, group, index }));
const fib = new Set([0, 1]);
let a = 0,
  b = 1;
while (b <= MAX) {
  fib.add(b);
  [a, b] = [b, a + b];
}
const fact = new Set([1]);
let f = 1;
for (let i = 2; (f *= i) <= MAX; i++) fact.add(f);
const happyCache = new Uint8Array(600);
for (let i = 0; i < 600; i++) {
  let n = i;
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    let sum = 0;
    while (n) {
      sum += (n % 10) ** 2;
      n = Math.floor(n / 10);
    }
    n = sum;
  }
  happyCache[i] = n === 1 ? 1 : 0;
}
export function sieve(max = MAX) {
  const p = new Uint32Array(max + 1);
  for (let n = 2; n <= max; n++)
    if (!p[n]) {
      p[n] = n;
      if (n * n <= max)
        for (let k = n * n; k <= max; k += n) if (!p[k]) p[k] = n;
    }
  return p;
}
export function factorize(n, spf) {
  if (n < 2) return { factors: [], divisors: n === 1 ? 1 : 0, omega: 0 };
  const factors = [];
  let d = 2,
    omega = 0,
    divisors = 1;
  while (n > 1) {
    if (spf) d = spf[n];
    else {
      while (d * d <= n && n % d !== 0) d++;
      if (d * d > n) d = n;
    }
    let e = 0;
    while (n % d === 0) {
      n /= d;
      e++;
      omega++;
    }
    factors.push([d, e]);
    divisors *= e + 1;
  }
  return { factors, divisors, omega };
}
export function features(n, spf) {
  if (!Number.isInteger(n) || n < 0 || n > MAX)
    throw new RangeError("Expected an integer in 0–1,000,000");
  const s = String(n),
    len = s.length,
    digits = Array.from(s, Number),
    freq = new Uint8Array(10);
  let sum = 0,
    squares = 0;
  for (const d of digits) {
    freq[d]++;
    sum += d;
    squares += d * d;
  }
  const unique = freq.filter((x) => x > 0).length,
    highest = Math.max(...freq),
    pairs = freq.filter((x) => x === 2).length;
  const { factors, divisors, omega } = factorize(n, spf);
  const delta = digits.slice(1).map((d, i) => d - digits[i]);
  const asc = len >= 3 && delta.every((d) => d === 1),
    desc = len >= 3 && delta.every((d) => d === -1);
  const binary = n.toString(2),
    hex = n.toString(16);
  const tests = [
    len >= 2 && unique === 1,
    highest >= 5 && unique > 1,
    highest === 4 && unique > 1,
    highest === 3 && unique > 1,
    highest === 2 && pairs >= 2,
    highest === 2 && pairs === 1 && unique > 1,
    /(\d)\1\1/.test(s) && unique > 1,
    len >= 4 && unique === 2,
    len >= 2 && s === [...s].reverse().join(""),
    asc,
    desc,
    !asc && delta.some((d, i) => i > 0 && d === 1 && delta[i - 1] === 1),
    !desc && delta.some((d, i) => i > 0 && d === -1 && delta[i - 1] === -1),
    len >= 4 &&
      digits[0] !== digits[1] &&
      digits.every((d, i) => d === digits[i % 2]),
    len === 6 && s.slice(0, 3) === s.slice(3) && unique > 1,
    len >= 4 && delta.every((d) => Math.abs(d) % 2 === 1),
    len >= 4 &&
      delta.every((d, i) => d !== 0 && (i === 0 || d * delta[i - 1] < 0)),
    n > 0 && sum > 0 && n % sum === 0,
    Boolean(happyCache[squares]),
    omega === 1,
    omega === 2,
    Number.isInteger(Math.sqrt(n)),
    Math.round(Math.cbrt(n)) ** 3 === n,
    n > 0 && (n & (n - 1)) === 0,
    fib.has(n),
    Number.isInteger(Math.sqrt(8 * n + 1)),
    fact.has(n),
    divisors >= 100,
    binary.length >= 2 && binary === [...binary].reverse().join(""),
    n >= 3 && (n & (n + 1)) === 0,
    hex.length >= 2 && [...hex].every((d) => d === hex[0]),
  ];
  let mask = 0;
  for (let i = 0; i < tests.length; i++) if (tests[i]) mask |= 1 << i;
  return {
    n,
    len,
    sum,
    unique,
    digits,
    freq: Array.from(freq),
    odd: digits.filter((d) => d % 2).length,
    root: n === 0 ? 0 : 1 + ((n - 1) % 9),
    factors,
    divisors,
    omega,
    binary,
    hex,
    mask: mask >>> 0,
  };
}
export function signals(feature, stats) {
  const signals = [];
  if (feature.len <= 4)
    signals.push({
      id: "length",
      group: "range",
      value: feature.len,
      count: stats.length[feature.len],
    });
  signals.push(
    {
      id: "sum",
      group: "arithmetic",
      value: feature.sum,
      count: stats.sums[feature.sum],
    },
    {
      id: "unique",
      group: "repetition",
      value: feature.unique,
      count: stats.unique[feature.unique],
    },
  );
  for (const p of patterns)
    if ((feature.mask >>> p.index) & 1)
      signals.push({
        id: p.id,
        group: p.group,
        value: null,
        count: stats.counts[p.id],
      });
  for (const s of signals) s.bits = -Math.log2(s.count / TOTAL);
  const weights = [1, 0.35, 0.15, 0.07, 0.03];
  for (const group of ["range", ...groups]) {
    const list = signals
      .filter((s) => s.group === group)
      .sort((a, b) => b.bits - a.bits);
    list.forEach((s, i) => {
      s.weight = weights[i] ?? 0;
      s.points = s.bits * 20 * s.weight;
    });
  }
  return signals.sort((a, b) => b.points - a.points);
}
export function scoreFeature(feature, stats) {
  return Math.round(signals(feature, stats).reduce((a, s) => a + s.points, 0));
}
export function percentile(score, stats) {
  return (100 * (stats.atLeast[score] ?? 0)) / TOTAL;
}
export function tierFor(p) {
  return p <= 0.1
    ? 6
    : p <= 1
      ? 5
      : p <= 5
        ? 4
        : p <= 10
          ? 3
          : p <= 25
            ? 2
            : p <= 50
              ? 1
              : 0;
}
export function analyze(n, stats) {
  const feat = features(n),
    items = signals(feat, stats);
  const score = Math.round(items.reduce((a, s) => a + s.points, 0)),
    percent = percentile(score, stats);
  return { ...feat, signals: items, score, percent, tier: tierFor(percent) };
}
export function randomNumber(cryptoObj = globalThis.crypto) {
  const span = TOTAL,
    limit = Math.floor(2 ** 32 / span) * span;
  const x = new Uint32Array(1);
  do {
    cryptoObj.getRandomValues(x);
  } while (x[0] >= limit);
  return x[0] % span;
}
export function parseNumber(value, max = MAX) {
  const s = String(value).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) && n <= max ? n : null;
}
export function utcDay(time = Date.now()) {
  return new Date(time).toISOString().slice(0, 10);
}
export function seedRandom(seed) {
  let h = 2166136261;
  for (const c of seed) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function makeDaily(day, scores, mode, seedSuffix = "") {
  const index = Math.floor(Date.parse(day + "T00:00:00Z") / 86400000),
    type = mode ?? ["draft", "hunt", "quiz"][((index % 3) + 3) % 3];
  const rng = seedRandom(
      "rngdle.art:" + VERSION + ":" + day + ":" + type + seedSuffix,
    ),
    next = () => Math.floor(rng() * TOTAL);
  let numbers = [];
  if (type === "draft") {
    while (numbers.length < 5) {
      const n = next();
      if (!numbers.some((k) => scores[k] === scores[n])) numbers.push(n);
    }
  }
  if (type === "hunt") numbers = Array.from({ length: 30 }, next);
  if (type === "quiz")
    for (let i = 0; i < 10; i++) {
      let a = next(),
        b = next(),
        tries = 0;
      while (Math.abs(scores[a] - scores[b]) < 35 && tries++ < 500) b = next();
      numbers.push(a, b);
    }
  return { day, type, numbers };
}
export function nextStreak(lastDay, currentDay, current, best) {
  if (lastDay === currentDay) return { current, best };
  const yesterday = utcDay(Date.parse(currentDay + "T00:00:00Z") - 86400000);
  const value = lastDay === yesterday ? current + 1 : 1;
  return { current: value, best: Math.max(best, value) };
}
export function bestEdit(n, stats) {
  const s = String(n);
  let best = { n, score: analyze(n, stats).score, index: -1 };
  for (let i = 0; i < s.length; i++)
    for (let d = 0; d < 10; d++) {
      if ((i === 0 && s.length > 1 && d === 0) || Number(s[i]) === d) continue;
      const changed = Number(s.slice(0, i) + d + s.slice(i + 1));
      if (changed > 999999) continue;
      const score = analyze(changed, stats).score;
      if (score > best.score) best = { n: changed, score, index: i };
    }
  return best;
}
