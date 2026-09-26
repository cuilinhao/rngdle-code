import test from "node:test";
import assert from "node:assert/strict";
import { createCanvas } from "@napi-rs/canvas";
import jsQR from "jsqr";

// A missing/wrong URL payload, quiet zone, or module placement must break decoding.
test("share QR decodes exact locale and boundary-number URLs at 200 pixels on a card", async () => {
  const { createShareQr, drawShareQr } = await import("../src/share-qr.mjs");
  for (const origin of ["https://rngdle.art", "http://127.0.0.1:5173"]) {
    for (const locale of ["en", "zh", "ja", "ko", "de", "fr"]) {
      for (const number of [0, 1000000]) {
        const url = `${origin}/${locale}?n=${number}`;
        const matrix = createShareQr(url);
        assert.ok(matrix.data instanceof Uint8Array);
        assert.equal(matrix.data.length, matrix.size ** 2);
        for (const [x, y] of [[48, 48], [952, 382], [499.4, 213.7]]) {
          const canvas = createCanvas(1200, 630);
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#eaefd1";
          ctx.fillRect(0, 0, 1200, 630);
          drawShareQr(ctx, matrix, x, y, 200);
          const pixels = ctx.getImageData(0, 0, 1200, 630);
          assert.equal(jsQR(pixels.data, 1200, 630)?.data, url, `${url} at ${x},${y}`);
        }
      }
    }
  }
});

test("share QR supports custom colors and quiet-zone padding without painting outside its square", async () => {
  const { createShareQr, drawShareQr } = await import("../src/share-qr.mjs");
  const url = "https://rngdle.art/zh?n=12321";
  const canvas = createCanvas(300, 300);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#cc3344";
  ctx.fillRect(0, 0, 300, 300);
  drawShareQr(ctx, createShareQr(url), 40, 40, 220, { dark: "#000000", light: "#ffffff", quietZone: 6 });
  const image = ctx.getImageData(0, 0, 300, 300);
  assert.equal(jsQR(image.data, 300, 300)?.data, url);
  assert.deepEqual(Array.from(ctx.getImageData(39, 40, 1, 1).data), [204, 51, 68, 255]);
  assert.deepEqual(Array.from(ctx.getImageData(40, 40, 1, 1).data), [255, 255, 255, 255]);
  assert.deepEqual(Array.from(ctx.getImageData(260, 259, 1, 1).data), [204, 51, 68, 255]);
});
