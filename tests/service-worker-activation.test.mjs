import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const sw = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const manifest = fs.readFileSync(new URL("../manifest.webmanifest", import.meta.url), "utf8");
assert.match(sw, /const APP_VERSION = "2\.0-[^"]+"/);
const appVersion=sw.match(/const APP_VERSION = "([^"]+)"/)?.[1];
const pageVersion=html.match(/const PWA_VERSION = "([^"]+)"/)?.[1];
assert.equal(pageVersion,appVersion,"page and Service Worker versions must remain synchronized");
assert.match(html,new RegExp(`demo-data\\.js\\?v=${appVersion}`),"sample-data script must use the active PWA cache version");
assert.match(sw,new RegExp(`demo-data\\.js\\?v=${appVersion}`),"the versioned sample-data script must be available offline");
assert.match(html, /id:"app-store-v1"/);
assert.match(html, /csvExport:false/);
assert.match(html, /cloudSync:false/);
assert.match(html, /officialDemoData:true/);
assert.match(html, /data-settings-action="cloud" data-release-feature="cloud-sync" hidden/);
assert.match(html, /data-settings-action="export"/);
assert.match(html, /data-release-feature="csv-export" hidden/);
assert.doesNotMatch(manifest, /クラウド同期を利用できます/);
const lifecycleStart = html.indexOf("// CueScore RC59: PWA lifecycle");
const lifecycleEnd = html.indexOf("// CueScore Rotation Scoreboard", lifecycleStart);
assert.ok(lifecycleStart >= 0 && lifecycleEnd > lifecycleStart, "PWA lifecycle block must exist");

const lifecycle = html.slice(lifecycleStart, lifecycleEnd);
const controllerHandler = lifecycle.match(
  /navigator\.serviceWorker\.addEventListener\("controllerchange", \(\) => \{([\s\S]*?)\n    \}\);/
)?.[1] || "";

assert.match(controllerHandler, /if \(!updateReloadRequestedV150\) return;/);
assert.match(controllerHandler, /location\.reload\(\);/);
assert.ok(
  controllerHandler.indexOf("if (!updateReloadRequestedV150) return;") < controllerHandler.indexOf("location.reload();"),
  "Initial Service Worker control must be guarded before reload"
);
assert.match(lifecycle, /updateReloadRequestedV150 = true;\s+waiting\.postMessage\(\{ type: "SKIP_WAITING" \}\);/);

console.log("Service Worker activation reload guard test passed.");
