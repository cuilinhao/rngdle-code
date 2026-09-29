import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, join } from "node:path";
const root = resolve("dist"),
  port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".bin": "application/octet-stream",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
createServer((req, res) => {
  try {
    const url = new URL(req.url, "http://localhost"),
      pathname = decodeURIComponent(url.pathname),
      base = resolve(root, "." + pathname);
    if (!base.startsWith(root + "/") && base !== root) {
      res.writeHead(403);
      res.end();
      return;
    }
    const candidates =
      pathname === "/"
        ? [join(root, "index.html")]
        : [base, base + ".html", join(base, "index.html")];
    let file = candidates.find((p) => existsSync(p) && statSync(p).isFile()),
      status = 200;
    if (!file) {
      file = join(root, "404.html");
      status = 404;
    }
    res.writeHead(status, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(400);
    res.end();
  }
}).listen(port, "127.0.0.1", () =>
  console.log("Production preview: http://127.0.0.1:" + port),
);
