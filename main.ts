// Doorbreaker entrypoint (Node 22, standard library only).
// The site lives in app/ as plain static files. This program hands the
// entry in: it copies app/ and screenshots/ next to this file into the
// output folder and writes dossier.json there with the vendored
// make.fun library, which the scorer rebuilds and compares byte for byte.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(rootDir, "app"), join(outputDir, "app"), { recursive: true });

const shotsDir = join(rootDir, "screenshots");
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, "screenshots"), { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log("Doorbreaker dossier written to " + join(outputDir, "dossier.json"));
