import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "native-web");

const files = [
  "index.html",
  "analysis-final-rc.css",
  "analysis-final-rc.js",
  "analysis-build4.css",
  "analysis-build4.js",
  "player-detail-build6.css",
  "ui-revision-v12.css",
  "player-detail-build8.css",
  "player-detail-build6.js",
  "ui-revision-v12.js",
  "analytics-build4-metrics.js",
  "demo-data.js",
  "manifest.webmanifest",
  "official-document.js",
  "official-pages.css",
  "privacy.html",
  "support.html",
  "terms.html"
];

const directories = [
  "assets",
  "icons",
  "src",
  "docs/official/app-store-v1.0/public"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const relative of files) {
  const source = path.join(root, relative);
  await stat(source);
  const destination = path.join(output, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination);
}

for (const relative of directories) {
  const source = path.join(root, relative);
  await stat(source);
  const destination = path.join(output, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

console.log(`CueScore native web bundle created at ${path.relative(root, output)}`);
