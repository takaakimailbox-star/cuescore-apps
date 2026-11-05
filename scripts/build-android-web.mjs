// Builds the shared native web bundle (unchanged iOS build script) and applies Android-only post-processing.
// Never touches iOS output semantics: the iOS script is run as-is, then native-web/ is patched for Android.
import { execFileSync } from "node:child_process";
import { cp, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bridgeSafeArea } from "./android-safe-area-bridge.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
execFileSync(process.execPath, [path.join(root, "scripts/build-native-web.mjs")], { stdio: "inherit" });
const out = path.join(root, "native-web");
await cp(path.join(root, "android-native-v1.js"), path.join(out, "android-native-v1.js"));
const indexPath = path.join(out, "index.html");
const html = await readFile(indexPath, "utf8");
const tag = '<script src="./android-native-v1.js"></script>';
if (html.includes(tag)) throw new Error("android adapter already injected");
const at = html.lastIndexOf("</body>");
if (at < 0) throw new Error("index.html has no </body>");
await writeFile(indexPath, `${html.slice(0, at)}${tag}\n${html.slice(at)}`);
// Safe-area bridge (Android bundle only). CUESCORE_ANDROID_SAFE_AREA_BRIDGE=0 builds the pre-fix baseline for A/B checks.
let bridged = 0;
if (process.env.CUESCORE_ANDROID_SAFE_AREA_BRIDGE !== "0") {
  const walk = async dir => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== "vendor") await walk(f); continue; }
      if (!/\.(html|css|js)$/.test(e.name) || e.name === "android-native-v1.js") continue;
      const src = await readFile(f, "utf8");
      const r = bridgeSafeArea(src);
      if (r.count) { await writeFile(f, r.text); bridged += r.count; }
    }
  };
  await walk(out);
}
console.log(`CueScore Android safe-area bridge: ${bridged} env(safe-area-inset-*) occurrences rewritten`);
console.log("CueScore Android web bundle ready at native-web (android-native-v1.js injected)");
