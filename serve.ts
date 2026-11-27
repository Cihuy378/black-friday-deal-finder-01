// Tiny static server for previewing Doorbreaker locally.
// Usage: node serve.ts  then open http://localhost:8080
// Serves app/ at the server root, matching how the entry is graded.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(fileURLToPath(new URL(".", import.meta.url)), "app");
const port = Number(process.env.PORT ?? 8080);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    let path = decodeURIComponent(url.pathname);
    if (path === "/") path = "/index.html";
    const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
    const file = join(appDir, safe);
    if (!file.startsWith(appDir)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
  }
});

server.listen(port, () => {
  console.log("Doorbreaker preview at http://localhost:" + port);
});
