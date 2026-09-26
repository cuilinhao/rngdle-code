import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { TOTAL, VERSION, patterns, utcDay } from "../src/engine.mjs";
import {
  SEO_SCHEMA_VERSION,
  publishedDays,
  planDailyArchive,
  assertCurrentDailySnapshot,
  buildRankingData,
  makeDailySnapshot,
} from "../src/seo-data.mjs";

const now = new Date();
const today = utcDay(now.getTime());
const day = process.env.SEO_DATE || today;
const archived = existsSync("public/data/daily")
  ? readdirSync("public/data/daily")
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.slice(0, -5))
  : [];
const candidateDates = publishedDays(day, archived, today);
const stats = JSON.parse(readFileSync("public/data/stats.json", "utf8"));
const sourceHash = createHash("sha256")
  .update(readFileSync("src/engine.mjs"))
  .digest("hex");
if (stats.sourceHash !== sourceHash || stats.version !== VERSION)
  throw new Error(
    "Run npm run data before building SEO data; the engine statistics are stale",
  );
const scoreBytes = readFileSync("public/data/scores.bin");
const maskBytes = readFileSync("public/data/patterns.bin");
if (scoreBytes.byteLength !== TOTAL * 2 || maskBytes.byteLength !== TOTAL * 4)
  throw new Error("The complete engine data indexes are required");
const scores = new Uint16Array(scoreBytes.buffer, scoreBytes.byteOffset, TOTAL);
const masks = new Uint32Array(maskBytes.buffer, maskBytes.byteOffset, TOTAL);
const previous = existsSync("public/data/seo.json")
  ? JSON.parse(readFileSync("public/data/seo.json", "utf8"))
  : null;
const existing = new Map();
for (const date of candidateDates) {
  const path = "public/data/daily/" + date + ".json";
  if (!existsSync(path)) continue;
  const snapshot = JSON.parse(readFileSync(path, "utf8"));
  if (
    snapshot.date !== date ||
    !snapshot.topNumber ||
    !snapshot.modes ||
    !snapshot.version ||
    !snapshot.sourceHash
  )
    throw new Error("Invalid immutable daily snapshot: " + path);
  assertCurrentDailySnapshot(snapshot, today, scores, stats);
  existing.set(date, snapshot);
}
const { dates, skippedDates } = planDailyArchive(
  day,
  [...existing.values()],
  previous,
  { version: VERSION, sourceHash },
  today,
);
if (skippedDates.length)
  console.warn(
    `Skipped ${skippedDates.length} unpublished historical date(s): prior engine provenance differs. An intentional backfill must use the engine version originally active on those dates. Today's snapshot may still be generated.`,
  );
const dataBuilderHash = createHash("sha256")
  .update(readFileSync(new URL(import.meta.url)))
  .update(readFileSync(new URL("../src/seo-data.mjs", import.meta.url)))
  .digest("hex");
const cacheCurrent =
  previous?.sourceHash === sourceHash &&
  previous?.schemaVersion === SEO_SCHEMA_VERSION &&
  previous?.dataBuilderHash === dataBuilderHash;
const ranking =
  cacheCurrent &&
  previous?.rankings?.length === 100 &&
  Object.keys(previous?.patternLeaders ?? {}).length === patterns.length
    ? {
        rankings: previous.rankings,
        patternLeaders: previous.patternLeaders,
        repdigits: previous.repdigits,
      }
    : buildRankingData(scores, masks, stats);

mkdirSync("public/data/daily", { recursive: true });
const snapshots = [];
let created = 0;
for (const date of dates) {
  const path = "public/data/daily/" + date + ".json";
  if (!existsSync(path)) {
    const snapshot = makeDailySnapshot(date, scores, stats, {
      publishedAt: now.toISOString(),
    });
    writeFileSync(path, JSON.stringify(snapshot, null, 2) + "\n", {
      flag: "wx",
    });
    created++;
  }
  const snapshot = existing.get(date) ?? JSON.parse(readFileSync(path, "utf8"));
  if (
    snapshot.date !== date ||
    !snapshot.topNumber ||
    !snapshot.modes ||
    !snapshot.version ||
    !snapshot.sourceHash
  )
    throw new Error("Invalid immutable daily snapshot: " + path);
  snapshots.push(snapshot);
}
snapshots.reverse();
const result = {
  schemaVersion: SEO_SCHEMA_VERSION,
  dataBuilderHash,
  version: VERSION,
  sourceHash,
  dateModified:
    cacheCurrent && previous?.dateModified
      ? previous.dateModified
      : now.toISOString(),
  ...ranking,
  dailyDates: snapshots.map((snapshot) => snapshot.date),
  dailySummaries: snapshots.map((snapshot) => ({
    date: snapshot.date,
    n: snapshot.modes.draft.winner.n,
    score: snapshot.modes.draft.winner.score,
  })),
  latestDay: snapshots[0]?.date ?? null,
};
writeFileSync("public/data/seo.json", JSON.stringify(result, null, 2) + "\n");
console.log(
  `SEO data: ${result.rankings.length} full-range rankings, ${snapshots.length} archived days (${created} new).`,
);
