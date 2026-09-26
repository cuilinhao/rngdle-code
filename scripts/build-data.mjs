import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  MAX,
  TOTAL,
  VERSION,
  patterns,
  features,
  sieve,
  scoreFeature,
} from "../src/engine.mjs";
const hash = createHash("sha256")
  .update(readFileSync("src/engine.mjs"))
  .digest("hex");
if (
  existsSync("public/data/stats.json") &&
  JSON.parse(readFileSync("public/data/stats.json")).sourceHash === hash &&
  existsSync("public/data/scores.bin") &&
  existsSync("public/data/patterns.bin")
) {
  console.log("Exact distribution is current.");
  process.exit(0);
}
console.time("Full range");
const spf = sieve(),
  masks = new Uint32Array(TOTAL),
  sums = new Uint8Array(TOTAL),
  unique = new Uint8Array(TOTAL),
  lengths = new Uint8Array(TOTAL);
const stats = {
  version: VERSION,
  sourceHash: hash,
  total: TOTAL,
  counts: Object.fromEntries(patterns.map((p) => [p.id, 0])),
  sums: Array(55).fill(0),
  unique: Array(11).fill(0),
  length: Array(8).fill(0),
  histogram: [],
  atLeast: [],
  top: [],
  bottom: [],
  examples: {},
};
for (const p of patterns) stats.examples[p.id] = [];
for (let n = 0; n <= MAX; n++) {
  const f = features(n, spf);
  masks[n] = f.mask;
  sums[n] = f.sum;
  unique[n] = f.unique;
  lengths[n] = f.len;
  stats.sums[f.sum]++;
  stats.unique[f.unique]++;
  stats.length[f.len]++;
  for (const p of patterns)
    if ((f.mask >>> p.index) & 1) {
      stats.counts[p.id]++;
      if (n >= 1000 && stats.examples[p.id].length < 12)
        stats.examples[p.id].push(n);
    }
}
const scores = new Uint16Array(TOTAL);
let maxScore = 0;
for (let n = 0; n <= MAX; n++) {
  const score = scoreFeature(
    { mask: masks[n], sum: sums[n], unique: unique[n], len: lengths[n] },
    stats,
  );
  scores[n] = score;
  stats.histogram[score] = (stats.histogram[score] ?? 0) + 1;
  maxScore = Math.max(maxScore, score);
}
let tail = 0;
for (let score = maxScore; score >= 0; score--) {
  tail += stats.histogram[score] ?? 0;
  stats.atLeast[score] = tail;
  stats.histogram[score] ??= 0;
}
const ordered = Array.from({ length: MAX - 999 }, (_, i) => i + 1000).sort(
  (a, b) => scores[b] - scores[a] || a - b,
);
stats.top = ordered.slice(0, 100).map((n) => ({ n, score: scores[n] }));
stats.bottom = ordered
  .slice(-100)
  .reverse()
  .map((n) => ({ n, score: scores[n] }));
stats.maxScore = maxScore;
mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/stats.json", JSON.stringify(stats));
writeFileSync("public/data/scores.bin", Buffer.from(scores.buffer));
writeFileSync("public/data/patterns.bin", Buffer.from(masks.buffer));
console.timeEnd("Full range");
console.log(
  JSON.stringify(
    {
      maxScore,
      score142857: scores[142857],
      score524287: scores[524287],
      counts: stats.counts,
    },
    null,
    2,
  ),
);
