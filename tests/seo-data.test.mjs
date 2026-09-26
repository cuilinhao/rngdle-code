import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { analyze, makeDaily, patterns, TOTAL, utcDay } from "../src/engine.mjs";
import { grade, emptyAttempt, revealSpecimen } from "../src/games.mjs";
import * as helpers from "../src/seo-data.mjs";

// These tests catch a missing archive boundary, mismatched game seed, inverted
// percentile, truncated ranking range, and rewriting already published answers.
const stats = JSON.parse(
  readFileSync(new URL("../public/data/stats.json", import.meta.url)),
);
const raw = readFileSync(new URL("../public/data/scores.bin", import.meta.url));
const scores = new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
const maskRaw = readFileSync(
  new URL("../public/data/patterns.bin", import.meta.url),
);
const masks = new Uint32Array(
  maskRaw.buffer,
  maskRaw.byteOffset,
  maskRaw.byteLength / 4,
);

test("SEO archive accepts only actual published UTC calendar days", () => {
  assert.equal(
    typeof helpers.archiveDays,
    "function",
    "archive date validation must exist",
  );
  assert.deepEqual(helpers.archiveDays("2026-09-28", "2026-09-28"), [
    "2026-09-26",
    "2026-09-27",
    "2026-09-28",
  ]);
  for (const day of [
    "2026-02-30",
    "2026-9-26",
    "2026-09-25",
    "2026-09-29",
    "../../etc/passwd",
    "2026-09-26T00:00:00Z",
  ]) {
    assert.throws(
      () => helpers.archiveDays(day, "2026-09-28"),
      RangeError,
      day,
    );
  }
  assert.deepEqual(helpers.archiveDays("2028-03-01", "2028-03-01").slice(-3), [
    "2028-02-28",
    "2028-02-29",
    "2028-03-01",
  ]);
});

test("SEO historical rebuild keeps later published dates while excluding future or invalid snapshots", () => {
  assert.equal(typeof helpers.publishedDays, "function");
  assert.deepEqual(
    helpers.publishedDays(
      "2026-09-26",
      ["2026-09-27", "2026-09-28", "2026-09-29", "2026-02-30", "2026-09-25"],
      "2026-09-28",
    ),
    ["2026-09-26", "2026-09-27", "2026-09-28"],
  );
});

test("SEO same-day snapshots fail safely when the live engine changes their game answers", () => {
  assert.equal(typeof helpers.assertCurrentDailySnapshot, "function");
  const snapshot = helpers.makeDailySnapshot("2026-09-26", scores, stats, {
    publishedAt: "2026-09-26T00:05:00Z",
  });
  assert.doesNotThrow(() =>
    helpers.assertCurrentDailySnapshot(snapshot, "2026-09-26", scores, stats),
  );
  for (const mutate of [
    (data) => {
      data.version = "previous-engine";
    },
    (data) => {
      data.sourceHash = "previous-engine-source";
    },
    (data) => {
      data.modes.draft.numbers[0].n++;
    },
    (data) => {
      data.modes.hunt.numbers[0].score++;
    },
    (data) => {
      data.modes.quiz.rounds[0].winnerIndex =
        1 - data.modes.quiz.rounds[0].winnerIndex;
    },
  ]) {
    const changed = structuredClone(snapshot);
    mutate(changed);
    const before = JSON.stringify(changed);
    assert.throws(
      () =>
        helpers.assertCurrentDailySnapshot(
          changed,
          "2026-09-26",
          scores,
          stats,
        ),
      /next UTC day/,
    );
    assert.equal(JSON.stringify(changed), before);
    assert.doesNotThrow(() =>
      helpers.assertCurrentDailySnapshot(changed, "2026-09-27", scores, stats),
    );
  }
});

test("SEO engine upgrades preserve published history and skip unknown historical seeds", () => {
  assert.equal(typeof helpers.planDailyArchive, "function");
  const current = { version: stats.version, sourceHash: stats.sourceHash };
  const old = {
    date: "2026-09-26",
    version: "old-version",
    sourceHash: "old-hash",
  };
  const changed = helpers.planDailyArchive(
    "2026-09-28",
    [old],
    old,
    current,
    "2026-09-28",
  );
  assert.deepEqual(changed.dates, ["2026-09-26", "2026-09-28"]);
  assert.deepEqual(changed.skippedDates, ["2026-09-27"]);
  const unchanged = helpers.planDailyArchive(
    "2026-09-28",
    [{ ...current, date: "2026-09-26" }],
    current,
    current,
    "2026-09-28",
  );
  assert.deepEqual(unchanged.dates, ["2026-09-26", "2026-09-27", "2026-09-28"]);
  assert.deepEqual(unchanged.skippedDates, []);
  // A previously upgraded manifest does not erase the older snapshot provenance.
  assert.deepEqual(
    helpers.planDailyArchive(
      "2026-09-28",
      [old],
      current,
      current,
      "2026-09-28",
    ).dates,
    changed.dates,
  );
});

test("SEO archive pagination keeps all 31 dates reachable without duplicating page boundaries", () => {
  assert.equal(typeof helpers.archivePage, "function");
  const rows = Array.from({ length: 31 }, (_, id) => ({ id }));
  const first = helpers.archivePage(rows, 1);
  const second = helpers.archivePage(rows, 2);
  assert.equal(first.pages, 2);
  assert.deepEqual(
    first.items.map((row) => row.id),
    Array.from({ length: 30 }, (_, id) => id),
  );
  assert.deepEqual(second.items, [{ id: 30 }]);
  assert.equal(first.nextPage, 2);
  assert.equal(first.previousPage, null);
  assert.equal(second.previousPage, 1);
  assert.equal(second.nextPage, null);
  for (const page of [0, 3, -1, 1.5])
    assert.throws(() => helpers.archivePage(rows, page), RangeError);
});

test("SEO daily answers reproduce actual rotating and forced-mode games including grading", () => {
  assert.equal(
    typeof helpers.makeDailySnapshot,
    "function",
    "daily snapshot builder must exist",
  );
  for (const day of ["2026-09-26", "2026-09-27", "2026-09-28"]) {
    const snapshot = helpers.makeDailySnapshot(day, scores, stats, {
      publishedAt: day + "T00:05:00Z",
    });
    assert.equal(snapshot.officialMode, makeDaily(day, scores).type);
    assert.equal(snapshot.specimen.n, revealSpecimen(day));
    const all = [];
    for (const type of ["draft", "hunt", "quiz"]) {
      const puzzle = makeDaily(day, scores, type);
      const mode = snapshot.modes[type];
      const rows =
        type === "quiz"
          ? mode.rounds.flatMap((round) => round.options)
          : mode.numbers;
      assert.deepEqual(
        rows.map((row) => row.n),
        puzzle.numbers,
      );
      for (const row of rows) {
        const real = analyze(row.n, stats);
        assert.equal(row.score, real.score);
        assert.equal(row.percent, real.percent);
        assert.deepEqual(
          row.patterns,
          patterns.filter((p) => (real.mask >>> p.index) & 1).map((p) => p.id),
        );
      }
      all.push(...rows);
      const attempt = {
        ...emptyAttempt(day, type),
        started: true,
        startedAt: 1,
      };
      if (type === "quiz")
        attempt.answers = mode.rounds.map((round) => round.winnerIndex);
      else if (type === "draft") attempt.choice = mode.winnerIndices[0];
      else attempt.position = mode.winnerIndices[0];
      assert.equal(grade(puzzle, attempt, scores), 100, `${day} ${type}`);
    }
    assert.equal(snapshot.modes.draft.numbers.length, 5);
    assert.equal(snapshot.modes.quiz.rounds.length, 10);
    assert.equal(snapshot.modes.hunt.numbers.length, 30);
    assert.equal(
      snapshot.topNumber.score,
      Math.max(...all.map((row) => row.score)),
    );
  }
});

test("SEO ranking includes zero and small integers and finds each pattern leader over the full range", () => {
  assert.equal(
    typeof helpers.buildRankingData,
    "function",
    "full range rankings must exist",
  );
  const data = helpers.buildRankingData(scores, masks, stats);
  const ordered = Array.from({ length: TOTAL }, (_, n) => n).sort(
    (a, b) => scores[b] - scores[a] || a - b,
  );
  assert.deepEqual(
    data.rankings.map((row) => row.n),
    ordered.slice(0, 100),
  );
  assert(data.rankings.some((row) => row.n < 1000));
  assert.equal(
    data.rankings[0].percent,
    (100 * stats.atLeast[data.rankings[0].score]) / TOTAL,
  );
  for (const pattern of patterns) {
    const first = ordered.find((n) => (masks[n] >>> pattern.index) & 1);
    assert.equal(data.patternLeaders[pattern.id].n, first);
  }
  assert.equal(data.repdigits.length, stats.counts.repdigit);
  assert.deepEqual(data.repdigits.slice(0, 3), [11, 22, 33]);
  assert.equal(data.repdigits.at(-1), 999999);
});

test("SEO generator preserves historical answer bytes and rejects future dates", () => {
  const directory = mkdtempSync(join(tmpdir(), "rngdle-seo-"));
  const script = new URL("../scripts/build-seo-data.mjs", import.meta.url)
    .pathname;
  try {
    mkdirSync(join(directory, "src"));
    mkdirSync(join(directory, "public/data"), { recursive: true });
    copyFileSync(
      new URL("../src/engine.mjs", import.meta.url),
      join(directory, "src/engine.mjs"),
    );
    for (const file of ["stats.json", "scores.bin", "patterns.bin"])
      copyFileSync(
        new URL("../public/data/" + file, import.meta.url),
        join(directory, "public/data/" + file),
      );
    const run = (day) =>
      execFileSync(process.execPath, [script], {
        cwd: directory,
        env: { ...process.env, SEO_DATE: day },
        stdio: "pipe",
      });
    run("2026-09-26");
    const path = join(directory, "public/data/daily/2026-09-26.json");
    const first = readFileSync(path, "utf8");
    run("2026-09-26");
    assert.equal(readFileSync(path, "utf8"), first);
    const seo = JSON.parse(
      readFileSync(join(directory, "public/data/seo.json")),
    );
    assert.deepEqual(seo.dailyDates, ["2026-09-26"]);
    assert.equal(seo.latestDay, "2026-09-26");
    assert.equal(
      seo.dailySummaries[0].n,
      JSON.parse(first).modes.draft.winner.n,
    );
    assert.equal(
      seo.dailySummaries[0].score,
      JSON.parse(first).modes.draft.winner.score,
    );
    assert.equal(typeof seo.schemaVersion, "number");
    assert.match(seo.dataBuilderHash, /^[a-f0-9]{64}$/);
    const olderSnapshot = JSON.parse(first);
    olderSnapshot.version = "historic-engine";
    olderSnapshot.sourceHash = "historic-source";
    writeFileSync(path, JSON.stringify(olderSnapshot));
    if (utcDay() === "2026-09-26")
      assert.throws(() => run("2026-09-26"), /next UTC day/);
    else run("2026-09-26");
    assert.equal(JSON.parse(readFileSync(path)).version, "historic-engine");
    assert.equal(JSON.parse(readFileSync(path)).sourceHash, "historic-source");
    const tomorrow = utcDay(Date.parse(utcDay() + "T00:00:00Z") + 86400000);
    assert.throws(() => run(tomorrow), /future/i);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
