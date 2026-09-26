import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  features,
  analyze,
  patterns,
  MAX,
  TOTAL,
  parseNumber,
  randomNumber,
  makeDaily,
  utcDay,
  nextStreak,
  bestEdit,
  scoreFeature,
} from "../src/engine.mjs";
import {
  emptyAttempt,
  validateAttempt,
  grade,
  finishAttempt,
  revealSpecimen,
} from "../src/games.mjs";
const stats = JSON.parse(
  readFileSync(new URL("../public/data/stats.json", import.meta.url)),
);
const raw = readFileSync(new URL("../public/data/scores.bin", import.meta.url));
const scores = new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
const has = (n, id) =>
  Boolean(features(n).mask & (1 << patterns.find((p) => p.id === id).index));
test("A03 exact reference counts for all 31 independently implemented patterns", () => {
  assert.deepEqual(stats.counts, {
    repdigit: 45,
    five: 487,
    quad: 11340,
    triple: 138024,
    pairs: 223803,
    repeat: 457731,
    run: 35884,
    twoDigits: 4294,
    palindrome: 1989,
    ascending: 22,
    descending: 26,
    ascRun: 28826,
    descRun: 29815,
    abab: 243,
    abcabc: 891,
    parity: 34875,
    zigzag: 136425,
    harshad: 95428,
    happy: 143071,
    prime: 78498,
    semiprime: 210035,
    square: 1001,
    cube: 101,
    power2: 20,
    fibonacci: 30,
    triangular: 1414,
    factorial: 9,
    divisible: 2809,
    binaryPal: 1998,
    binaryOnes: 18,
    hexRepeat: 59,
  });
});
test("A03 complete score index has exactly one entry per supported integer and exact cumulative distribution", () => {
  assert.equal(scores.length, TOTAL);
  const histogram = Array(stats.histogram.length).fill(0);
  for (const s of scores) histogram[s]++;
  assert.deepEqual(histogram, stats.histogram);
  let tail = 0;
  for (let s = histogram.length - 1; s >= 0; s--) {
    tail += histogram[s];
    assert.equal(stats.atLeast[s], tail);
  }
  assert.equal(tail, TOTAL);
  assert.equal(stats.maxScore, 1677);
  assert.equal(histogram.filter(Boolean).length, 807);
});
test("A03 reference samples and independently checked mathematical edge cases", () => {
  assert.equal(analyze(142857, stats).score, 222);
  assert.equal(analyze(524287, stats).score, 625);
  assert.equal(features(142857).divisors, 32);
  assert.deepEqual(features(49).factors, [[7, 2]]);
  assert.equal(has(49, "semiprime"), true);
  assert.equal(has(1, "prime"), false);
  assert.equal(has(0, "prime"), false);
  assert.equal(has(0, "square"), true);
  assert.equal(has(0, "cube"), true);
  assert.equal(has(0, "harshad"), false);
  assert.equal(has(19, "happy"), true);
  assert.equal(has(4, "happy"), false);
  assert.equal(has(12321, "palindrome"), true);
  assert.equal(has(12345, "palindrome"), false);
  assert.equal(has(1111, "quad"), false);
  assert.equal(has(1000000, "five"), true);
  assert.equal(features(1000000).len, 7);
});
test("A03 runtime score agrees with precomputed data on boundaries and deterministic sample", () => {
  for (const n of [
    0, 1, 2, 9, 10, 99, 100, 999, 1000, 9999, 10000, 99999, 100000, 999999,
    1000000,
  ])
    assert.equal(analyze(n, stats).score, scores[n]);
  for (let i = 0; i < 3000; i++) {
    const n = (i * 7919) % TOTAL;
    assert.equal(analyze(n, stats).score, scores[n]);
  }
});
test("A02 strict numeric validation covers invalid, boundary and leading-zero input", () => {
  for (const x of [
    "",
    null,
    " ",
    "-1",
    "1.5",
    "1e3",
    "Infinity",
    "NaN",
    "1000001",
    "abc",
  ])
    assert.equal(parseNumber(x), null, String(x));
  for (const [x, n] of [
    ["0", 0],
    ["1", 1],
    ["1000000", MAX],
    ["0007", 7],
    [" 42 ", 42],
  ])
    assert.equal(parseNumber(x), n);
  assert.throws(() => features(-1), RangeError);
  assert.throws(() => features(1.5), RangeError);
});
test("A04 rejection sampling discards out-of-range entropy instead of introducing modulo bias", () => {
  const values = [4294967295, 1000000];
  const mock = {
    getRandomValues(a) {
      a[0] = values.shift();
    },
  };
  assert.equal(randomNumber(mock), 1000000);
  assert.equal(values.length, 0);
  for (let i = 0; i < 1000; i++) {
    const n = randomNumber();
    assert(n >= 0 && n <= MAX);
  }
});
test("A06 deterministic daily types and grade for draft/hunt/quiz", () => {
  for (const type of ["draft", "hunt", "quiz"]) {
    const puzzle = makeDaily("2026-09-26", scores, type);
    assert.deepEqual(puzzle, makeDaily("2026-09-26", scores, type));
    assert.notDeepEqual(
      puzzle.numbers,
      makeDaily("2026-09-27", scores, type).numbers,
    );
    const attempt = {
      ...emptyAttempt(puzzle.day, type),
      started: true,
      startedAt: 1,
    };
    if (type === "draft") {
      attempt.choice = puzzle.numbers.reduce(
        (best, n, i) => (scores[n] > scores[puzzle.numbers[best]] ? i : best),
        0,
      );
      assert.equal(new Set(puzzle.numbers.map((n) => scores[n])).size, 5);
    }
    if (type === "hunt")
      attempt.position = puzzle.numbers.reduce(
        (best, n, i) => (scores[n] > scores[puzzle.numbers[best]] ? i : best),
        0,
      );
    if (type === "quiz") {
      attempt.answers = Array.from({ length: 10 }, (_, i) =>
        scores[puzzle.numbers[i * 2]] > scores[puzzle.numbers[i * 2 + 1]]
          ? 0
          : 1,
      );
      for (let i = 0; i < 10; i++)
        assert(
          Math.abs(
            scores[puzzle.numbers[i * 2]] - scores[puzzle.numbers[i * 2 + 1]],
          ) >= 35,
        );
    }
    assert.equal(grade(puzzle, attempt, scores), 100);
    assert.equal(finishAttempt(puzzle, attempt, scores).finished, true);
  }
});
test("A07 UTC date, same-day streak idempotency, gaps and corrupted attempts", () => {
  assert.equal(utcDay(Date.parse("2026-09-26T23:59:59Z")), "2026-09-26");
  assert.equal(utcDay(Date.parse("2026-09-27T00:00:00Z")), "2026-09-27");
  assert.deepEqual(nextStreak("2026-09-25", "2026-09-26", 4, 9), {
    current: 5,
    best: 9,
  });
  assert.deepEqual(nextStreak("2026-09-26", "2026-09-26", 5, 9), {
    current: 5,
    best: 9,
  });
  assert.deepEqual(nextStreak("2026-09-24", "2026-09-26", 4, 9), {
    current: 1,
    best: 9,
  });
  assert.deepEqual(
    validateAttempt({ position: 999 }, "2026-09-26", "hunt"),
    emptyAttempt("2026-09-26", "hunt"),
  );
});
test("A10 exhaustive one-digit neighborhood yields genuine best edit without leading zeros", () => {
  for (const n of [0, 1, 42, 142857, 524287, 999999]) {
    const best = bestEdit(n, stats);
    let max = scores[n];
    const str = String(n);
    for (let i = 0; i < str.length; i++)
      for (let d = 0; d < 10; d++) {
        if (i === 0 && str.length > 1 && d === 0) continue;
        const v = Number(str.slice(0, i) + d + str.slice(i + 1));
        max = Math.max(max, scores[v]);
      }
    assert.equal(best.score, max);
    assert.equal(String(best.n).length, String(n).length);
  }
});
test("A11 deterministic specimen is in range and changes across days", () => {
  assert.equal(revealSpecimen("2026-09-26"), revealSpecimen("2026-09-26"));
  assert.notEqual(revealSpecimen("2026-09-26"), revealSpecimen("2026-09-27"));
  assert(
    revealSpecimen("2026-09-26") >= 0 && revealSpecimen("2026-09-26") <= MAX,
  );
});
