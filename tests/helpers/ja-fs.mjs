/* P3: importing this module makes fs.readFileSync(<utf8 text>) return the ja-resolved view of production sources (window.cueT("p3.…") calls and static
 * data-i18n keys are rewritten back to the Japanese catalog text). Tests written before P3 therefore keep asserting the same Japanese output.
 * Use rawRead(path) when a test needs the real (unresolved) source. */
import fs from "node:fs";
import fsp from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { jaSource } from "./ja-source.mjs";

const original = globalThis.__p3RawReadFileSync || fs.readFileSync;
globalThis.__p3RawReadFileSync = original;
const originalAsync = globalThis.__p3RawReadFile || fsp.readFile;
globalThis.__p3RawReadFile = originalAsync;
const cache = new Map();
function patched(path, options) {
  const result = original.call(fs, path, options);
  const encoding = typeof options === "string" ? options : options && options.encoding;
  if (typeof result !== "string" || !encoding) return result;
  if (!result.includes("p3.")) return result;
  let hit = cache.get(result);
  if (hit === undefined) { hit = jaSource(result); cache.set(result, hit); }
  return hit;
}
async function patchedAsync(path, options) {
  const result = await originalAsync.call(fsp, path, options);
  const encoding = typeof options === "string" ? options : options && options.encoding;
  if (typeof result !== "string" || !encoding || !result.includes("p3.")) return result;
  let hit = cache.get(result);
  if (hit === undefined) { hit = jaSource(result); cache.set(result, hit); }
  return hit;
}
if (!fs.readFileSync.__p3) {
  patched.__p3 = true; patchedAsync.__p3 = true;
  fs.readFileSync = patched;
  fsp.readFile = patchedAsync;
  syncBuiltinESMExports();
}
export const rawRead = (path, options = "utf8") => original.call(fs, path, options);
