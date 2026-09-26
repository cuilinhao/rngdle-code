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
