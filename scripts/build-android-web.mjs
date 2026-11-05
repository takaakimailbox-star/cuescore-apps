// Builds the shared native web bundle (unchanged iOS build script) and applies Android-only post-processing.
// Never touches iOS output semantics: the iOS script is run as-is, then native-web/ is patched for Android.
import { execFileSync } from "node:child_process";
import { cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
console.log("CueScore Android web bundle ready at native-web (android-native-v1.js injected)");
