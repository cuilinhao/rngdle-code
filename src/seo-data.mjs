import {
  TOTAL,
  VERSION,
  analyze,
  makeDaily,
  patterns,
  percentile,
  utcDay,
} from "./engine.mjs";
import { revealSpecimen } from "./games.mjs";

export const LAUNCH_DAY = "2026-09-26";
export const ARCHIVE_PAGE_SIZE = 30;
export const SEO_SCHEMA_VERSION = 1;
const DAY = 86400000;

export function validDay(day) {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const time = Date.parse(day + "T00:00:00Z");
  return Number.isFinite(time) && utcDay(time) === day;
}

export function archiveDays(end, today) {
  if (!validDay(end) || !validDay(today))
    throw new RangeError("Expected a valid UTC calendar date (YYYY-MM-DD)");
  if (end < LAUNCH_DAY)
    throw new RangeError("Daily answers cannot precede the project launch");
  if (end > today)
    throw new RangeError("Daily answers cannot be generated for a future date");
  const days = [];
  for (
    let time = Date.parse(LAUNCH_DAY + "T00:00:00Z");
    time <= Date.parse(end + "T00:00:00Z");
    time += DAY
  )
    days.push(utcDay(time));
  return days;
}

export function publishedDays(end, archived, today) {
  return [
    ...new Set([
      ...archiveDays(end, today),
      ...archived.filter(
        (day) => validDay(day) && day >= LAUNCH_DAY && day <= today,
      ),
    ]),
  ].sort();
}

export function planDailyArchive(end, snapshots, previous, current, today) {
  const requested = archiveDays(end, today);
  const published = snapshots.filter(
    (snapshot) =>
      validDay(snapshot.date) &&
      snapshot.date >= LAUNCH_DAY &&
      snapshot.date <= today,
  );
  const provenances = [...published, ...(previous ? [previous] : [])];
  const mayBackfill = provenances.every(
    (source) =>
      source.version === current.version &&
      source.sourceHash === current.sourceHash,
  );
  const existing = new Set(published.map((snapshot) => snapshot.date));
  const skippedDates = requested.filter(
    (date) => date < today && !existing.has(date) && !mayBackfill,
  );
  const dates = publishedDays(end, [...existing], today).filter(
    (date) => !skippedDates.includes(date),
  );
  return { dates, skippedDates };
}

export function assertCurrentDailySnapshot(snapshot, today, scores, stats) {
  if (snapshot.date !== today) return;
  const fail = () => {
    throw new Error(
      `The immutable daily snapshot for ${today} conflicts with the current game engine. Keep the snapshot and defer this engine deployment until the next UTC day, or restore the matching engine version. Do not overwrite today's published answers.`,
    );
  };
  if (snapshot.version !== VERSION || snapshot.sourceHash !== stats.sourceHash)
    fail();
  const expected = makeDailySnapshot(today, scores, stats, {
    publishedAt: snapshot.datePublished,
  });
  const signature = (data) => {
    const row = (number) =>
      number ? [number.n, number.score, number.percent, number.patterns] : null;
    const deck = (mode) => [
      mode.numbers.map(row),
      row(mode.winner),
      mode.winnerIndices,
    ];
    return JSON.stringify([
      data.officialMode,
      deck(data.modes.draft),
      deck(data.modes.hunt),
      data.modes.quiz.rounds.map((round) => [
        round.round,
        round.options.map(row),
        row(round.winner),
        round.winnerIndex,
      ]),
    ]);
  };
  let actual;
  try {
    actual = signature(snapshot);
  } catch {
    fail();
  }
  if (actual !== signature(expected)) fail();
}

export function archivePage(rows, page) {
  const pages = Math.max(1, Math.ceil(rows.length / ARCHIVE_PAGE_SIZE));
  if (!Number.isInteger(page) || page < 1 || page > pages)
    throw new RangeError("Archive page does not exist");
  return {
    page,
    pages,
    items: rows.slice((page - 1) * ARCHIVE_PAGE_SIZE, page * ARCHIVE_PAGE_SIZE),
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < pages ? page + 1 : null,
  };
}

function ids(mask) {
  return patterns
    .filter((pattern) => (mask >>> pattern.index) & 1)
    .map((pattern) => pattern.id);
}

export function buildRankingData(scores, masks, stats) {
  if (scores.length !== TOTAL || masks.length !== TOTAL)
    throw new RangeError("A complete score and pattern index is required");
  const ordered = Array.from({ length: TOTAL }, (_, n) => n).sort(
    (a, b) => scores[b] - scores[a] || a - b,
  );
  const row = (n) => ({
    n,
    score: scores[n],
    percent: percentile(scores[n], stats),
    patterns: ids(masks[n]),
  });
  const patternLeaders = {};
  for (const pattern of patterns) {
    const n = ordered.find(
      (candidate) => (masks[candidate] >>> pattern.index) & 1,
    );
    if (n !== undefined) patternLeaders[pattern.id] = row(n);
  }
  const repdigits = [];
  const index = patterns.find((pattern) => pattern.id === "repdigit").index;
  for (let n = 0; n < TOTAL; n++)
    if ((masks[n] >>> index) & 1) repdigits.push(n);
  return {
    rankings: ordered.slice(0, 100).map(row),
    patternLeaders,
    repdigits,
  };
}

export function makeDailySnapshot(day, scores, stats, { publishedAt }) {
  if (!validDay(day) || day < LAUNCH_DAY)
    throw new RangeError("Expected a daily answer date on or after launch");
  if (scores.length !== TOTAL)
    throw new RangeError("A complete score index is required");
  if (!Number.isFinite(Date.parse(publishedAt)))
    throw new RangeError("A publication timestamp is required");
  const cache = new Map();
  const row = (n) => {
    if (!cache.has(n)) {
      const result = analyze(n, stats);
      if (result.score !== scores[n])
        throw new Error("Score index and engine disagree for " + n);
      cache.set(n, {
        n,
        score: result.score,
        percent: result.percent,
        patterns: ids(result.mask),
      });
    }
    return cache.get(n);
  };
  const modes = {};
  const all = [];
  for (const type of ["draft", "hunt", "quiz"]) {
    const numbers = makeDaily(day, scores, type).numbers.map(row);
    all.push(...numbers);
    if (type === "quiz") {
      modes[type] = {
        rounds: Array.from({ length: 10 }, (_, index) => {
          const options = numbers.slice(index * 2, index * 2 + 2);
          const winnerIndex =
            options[0].score === options[1].score
              ? null
              : options[0].score > options[1].score
                ? 0
                : 1;
          return {
            round: index + 1,
            options,
            winner: winnerIndex === null ? null : options[winnerIndex],
            winnerIndex,
          };
        }),
      };
    } else {
      const bestScore = Math.max(...numbers.map((number) => number.score));
      const winnerIndices = numbers.flatMap((number, index) =>
        number.score === bestScore ? [index] : [],
      );
      modes[type] = {
        numbers,
        winner: numbers[winnerIndices[0]],
        winnerIndices,
      };
    }
  }
  const topNumber = all.sort((a, b) => b.score - a.score || a.n - b.n)[0];
  const patternOfDay =
    [...topNumber.patterns].sort(
      (a, b) => stats.counts[a] - stats.counts[b] || a.localeCompare(b),
    )[0] ?? null;
  return {
    date: day,
    version: VERSION,
    sourceHash: stats.sourceHash,
    datePublished: publishedAt,
    dateModified: publishedAt,
    officialMode: makeDaily(day, scores).type,
    topNumber,
    patternOfDay,
    modes,
    specimen: row(revealSpecimen(day)),
  };
}
