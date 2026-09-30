// Rasterizes public/favicon.svg into the PNG and ICO favicons. Run: node scripts/build-favicons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const svg = readFileSync("public/favicon.svg", "utf8");

async function png(size, { opaque = false } = {}) {
  // iOS fills transparent pixels with black, so the touch icon is a full-bleed square.
  const source = opaque ? svg.replace('rx="14"', 'rx="0"') : svg;
  const image = await loadImage(Buffer.from(source.replace("<svg ", `<svg width="${size}" height="${size}" `)));
  const canvas = createCanvas(size, size);
  canvas.getContext("2d").drawImage(image, 0, 0, size, size);
  return canvas.toBuffer("image/png");
}

// ICO container holding PNG-compressed entries (supported by every current browser).
function ico(entries) {
  const header = Buffer.alloc(6 + 16 * entries.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = header.length;
  entries.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(size % 256, at);
    header.writeUInt8(size % 256, at + 1);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...entries.map((entry) => entry.data)]);
}

const outputs = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "android-chrome-192x192.png": 192,
  "android-chrome-512x512.png": 512,
};
for (const [name, size] of Object.entries(outputs)) writeFileSync("public/" + name, await png(size));
writeFileSync("public/apple-touch-icon.png", await png(180, { opaque: true }));
writeFileSync(
  "public/favicon.ico",
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })))),
);
console.log("Favicons written from public/favicon.svg");
