import QRCode from "qrcode";

/** QR modules in row-major order; dark modules have value 1. */
export function createShareQr(url) {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });
  return { size: modules.size, data: new Uint8Array(modules.data) };
}

/** Paint crisp modules and their quiet zone inside the requested square. */
export function drawShareQr(
  ctx,
  matrix,
  x,
  y,
  size,
  { dark = "#264632", light = "#f6f1e7", quietZone = 4 } = {},
) {
  const left = Math.round(x);
  const top = Math.round(y);
  const pixels = Math.round(size);
  const modules = matrix.size + quietZone * 2;
  ctx.save();
  ctx.fillStyle = light;
  ctx.fillRect(left, top, pixels, pixels);
  ctx.fillStyle = dark;
  for (let row = 0; row < matrix.size; row++) {
    const y0 = top + Math.round(((row + quietZone) * pixels) / modules);
    const y1 = top + Math.round(((row + quietZone + 1) * pixels) / modules);
    for (let col = 0; col < matrix.size; col++) {
      if (!matrix.data[row * matrix.size + col]) continue;
      const x0 = left + Math.round(((col + quietZone) * pixels) / modules);
      const x1 = left + Math.round(((col + quietZone + 1) * pixels) / modules);
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
  }
  ctx.restore();
}
