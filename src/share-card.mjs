import { createShareQr, drawShareQr } from "./share-qr.mjs";

// Shared by the browser download dialog and build-time social card renderer.
export function drawShareCard(
  x,
  {
    number,
    score,
    percent,
    label,
    subtitle,
    scoreLabel,
    percentLabel,
    fontFamily = "sans-serif",
  },
) {
  x.fillStyle = "#eaefd1";
  x.fillRect(0, 0, 1200, 630);
  x.strokeStyle = "#6d910a";
  x.strokeRect(32, 32, 1136, 566);
  x.fillStyle = "#5a6a54";
  x.font = `24px ${fontFamily}`;
  x.fillText("RNGDLE.ART  /  " + label, 72, 98, 1056);
  x.fillStyle = "#223a28";
  x.font = `bold 128px ${fontFamily}`;
  x.fillText(number, 72, 280, 1056);
  x.font = `28px ${fontFamily}`;
  x.fillText(subtitle, 78, 342, 1044);
  x.font = `22px ${fontFamily}`;
  x.fillStyle = "#5a6a54";
  x.fillText(scoreLabel, 78, 442);
  x.fillText(percentLabel, 540, 442);
  x.fillStyle = "#223a28";
  x.font = `bold 48px ${fontFamily}`;
  x.fillText(score, 78, 506);
  x.fillText(percent, 540, 506, 570);
}

/** Download-only composition. Build-time OG cards retain drawShareCard above. */
export function drawTreeShareCard(
  ctx,
  {
    number, score, percent, label, subtitle, scoreLabel, percentLabel,
    fontFamily = "sans-serif", url, qrLabel, treeImage,
  },
) {
  ctx.save();
  ctx.fillStyle = "#f6f1e7";
  ctx.fillRect(0, 0, 1200, 630);
  if (treeImage) {
    ctx.drawImage(treeImage, 622, 0, 530, 530);
  } else {
    // A quiet specimen mark keeps the card composed while WebGL is unavailable.
    ctx.strokeStyle = "#d5dccb";
    ctx.lineWidth = 1;
    for (const radius of [90, 135, 180]) {
      ctx.beginPath();
      ctx.arc(885, 242, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#264632";
    ctx.font = `32px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.fillText("✦", 885, 253);
    ctx.textAlign = "left";
  }
  ctx.fillStyle = "#264632";
  ctx.font = `bold 26px ${fontFamily}`;
  ctx.fillText("RNGDLE.ART", 54, 70);
  ctx.fillStyle = "#5a6753";
  ctx.font = `18px ${fontFamily}`;
  ctx.fillText(label, 54, 104, 540);
  ctx.fillStyle = "#264632";
  let numberSize = 112;
  ctx.font = `bold ${numberSize}px ${fontFamily}`;
  while (ctx.measureText(number).width > 555 && numberSize > 60) {
    ctx.font = `bold ${--numberSize}px ${fontFamily}`;
  }
  ctx.fillText(number, 48, 265);
  ctx.font = `26px ${fontFamily}`;
  ctx.fillText(subtitle, 54, 314, 540);
  ctx.strokeStyle = "#d5dccb";
  ctx.beginPath();
  ctx.moveTo(54, 356);
  ctx.lineTo(592, 356);
  ctx.stroke();
  ctx.font = `18px ${fontFamily}`;
  ctx.fillStyle = "#5a6753";
  ctx.fillText(scoreLabel, 54, 399, 240);
  // Labels can be long in several locales; wrap instead of compressing the font.
  const words = percentLabel.split(/\s+/);
  let line = "", baseline = 399;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > 258) {
      ctx.fillText(line, 326, baseline, 258);
      baseline += 23;
      line = word;
    } else line = next;
  }
  ctx.fillText(line, 326, baseline, 258);
  ctx.fillStyle = "#264632";
  ctx.font = `bold 40px ${fontFamily}`;
  ctx.fillText(score, 54, 482, 240);
  ctx.fillText(percent, 326, 482, 268);
  ctx.fillStyle = "#5a6753";
  ctx.font = `18px ${fontFamily}`;
  let displayUrl = "rngdle.art";
  try { displayUrl = new URL(url).host + new URL(url).pathname; } catch {}
  ctx.fillText(displayUrl, 54, 572, 540);
  // Dedicated backing protects the scan area even with an opaque tree snapshot.
  ctx.fillStyle = "#f6f1e7";
  ctx.fillRect(954, 404, 222, 214);
  drawShareQr(ctx, createShareQr(url), 973, 414, 180);
  ctx.fillStyle = "#264632";
  ctx.font = `16px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.fillText(qrLabel, 1063, 609, 208);
  ctx.restore();
}
