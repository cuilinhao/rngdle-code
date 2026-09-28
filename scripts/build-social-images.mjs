import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { drawShareCard } from "../src/share-card.mjs";
import { analyze } from "../src/engine.mjs";
const seo = JSON.parse(readFileSync("public/data/seo.json", "utf8"));
const stats = JSON.parse(readFileSync("public/data/stats.json", "utf8"));
if (!GlobalFonts.registerFromPath("assets/fonts/Inter.ttf", "RngdleInter"))
  throw new Error("Social-card font could not be loaded");
mkdirSync("public/og", { recursive: true });
function card(file, row, label, subtitle) {
  const canvas = createCanvas(1200, 630);
  drawShareCard(canvas.getContext("2d"), {
    number: row.n.toLocaleString("en-US"),
    score: row.score.toLocaleString("en-US"),
    percent: `Top ${row.percent.toLocaleString("en-US", { maximumFractionDigits: 6 })}%`,
    label,
    subtitle,
    scoreLabel: "Rarity score",
    percentLabel: "Global upper-tail share (ties included)",
    fontFamily: "RngdleInter",
  });
  writeFileSync(`public/og/${file}.png`, canvas.toBuffer("image/png"));
}
card(
  "default",
  seo.rankings[0],
  "NUMBER RARITY CALCULATOR",
  "The rarest number in the full-range ranking",
);
const guideCards = [
  {
    file: "guide-how-rarity-works",
    row: analyze(777777, stats),
    label: "RNGDLE RARITY EXPLAINED",
    subtitle: "How the RNGDLE.ART rarity score works",
  },
  {
    file: "guide-rarest-numbers",
    row: seo.rankings[0],
    label: "THE RAREST NUMBER",
    subtitle: "Explore the independent RNGDLE.ART ranking",
  },
  {
    file: "guide-how-to-play",
    row: analyze(123456, stats),
    label: "HOW TO PLAY RNGDLE",
    subtitle: "A beginner's guide to analyzing your roll",
  },
];
for (const { file, row, label, subtitle } of guideCards) {
  card(file, row, label, subtitle);
}
for (const day of seo.dailyDates) {
  const daily = JSON.parse(
    readFileSync(`public/data/daily/${day}.json`, "utf8"),
  );
  card(
    "daily-" + day,
    daily.topNumber,
    "DAILY ANSWERS  /  " + day,
    "Highest score across the three seeded modes",
  );
}
console.log(
  `Generated ${seo.dailyDates.length + guideCards.length + 1} social cards at 1200 × 630.`,
);
