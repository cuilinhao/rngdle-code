import test from "node:test";
import assert from "node:assert/strict";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import jsQR from "jsqr";

// A missing QR or a tree painted over its modules must break real decoding.
test("tree share PNG exports 1200 by 630 and preserves its exact scan URL with or without tree imagery", async () => {
  const { drawTreeShareCard } = await import("../src/share-card.mjs");
  assert.equal(typeof drawTreeShareCard, "function");
  const tree = createCanvas(530, 530);
  const tx = tree.getContext("2d");
  tx.fillStyle = "#143322";
  tx.fillRect(0, 0, 530, 530);
  for (const url of ["https://rngdle.art/zh?n=0", "http://127.0.0.1:5173/fr?n=1000000"]) {
    for (const treeImage of [undefined, tree]) {
      const canvas = createCanvas(1200, 630);
      drawTreeShareCard(canvas.getContext("2d"), {
        number: "1,000,000", score: "123,456", percent: "Top 0.0001%",
        label: "Number rarity lab", subtitle: "Legendary", scoreLabel: "Rarity score",
        percentLabel: "Global upper-tail share (ties included)", url, qrLabel: "Scan to explore", treeImage,
      });
      const png = await loadImage(canvas.toBuffer("image/png"));
      assert.equal(png.width, 1200);
      assert.equal(png.height, 630);
      const restored = createCanvas(png.width, png.height);
      const ctx = restored.getContext("2d");
      ctx.drawImage(png, 0, 0);
      assert.equal(jsQR(ctx.getImageData(0, 0, 1200, 630).data, 1200, 630)?.data, url);
    }
  }
});
