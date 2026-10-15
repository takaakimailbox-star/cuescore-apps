/* P2-0 characterization helpers. Read-only access to production sources; nothing here changes them. */
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import { createRequire } from "node:module";

export const ROOT = new URL("../../", import.meta.url);
export const read = rel => fs.readFileSync(new URL(rel, ROOT), "utf8");
export const sha256 = text => crypto.createHash("sha256").update(text, "utf8").digest("hex");
export const codePoints = text => [...String(text)].map(ch => "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join(" ");

/* Index of the matching closer for the opener at `open`, skipping strings, template literals, comments and simple regex literals. */
export function matchClose(src, open) {
  const pairs = { "{": "}", "(": ")", "[": "]" };
  const stack = [pairs[src[open]]];
  let i = open + 1;
  while (i < src.length && stack.length) {
    const c = src[i], n = src[i + 1];
    if (c === "/" && n === "/") { i = src.indexOf("\n", i); if (i < 0) break; continue; }
    if (c === "/" && n === "*") { i = src.indexOf("*/", i + 2) + 2; continue; }
    if (c === "'" || c === '"') { i++; while (i < src.length && src[i] !== c) { if (src[i] === "\\") i++; i++; } i++; continue; }
    if (c === "`") {
      i++;
      while (i < src.length && src[i] !== "`") {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === "$" && src[i + 1] === "{") { i = matchClose(src, i + 1) + 1; continue; }
        i++;
      }
      i++; continue;
    }
    if (c === "/") {
      let j = i - 1; while (j >= 0 && /\s/.test(src[j])) j--;
      if (j < 0 || /[(,=:;!&|?{}[+\-*%<>~^]/.test(src[j]) || /\b(return|typeof|case)$/.test(src.slice(Math.max(0, j - 6), j + 1))) {
        i++; let inClass = false;
        while (i < src.length) { const d = src[i]; if (d === "\\") { i += 2; continue; } if (d === "[") inClass = true; else if (d === "]") inClass = false; else if (d === "/" && !inClass) break; else if (d === "\n") break; i++; }
        i++; continue;
      }
    }
    if (c === "{" || c === "(" || c === "[") stack.push(pairs[c]);
    else if (c === stack[stack.length - 1]) stack.pop();
    i++;
  }
  return stack.length ? -1 : i - 1;
}

/* Source text of `function name(...) {...}` (optionally `async`). Throws if absent or ambiguous when `nth` is not given. */
export function extractFunction(src, name, nth) {
  const re = new RegExp("(?:async\\s+)?function\\s+" + name.replace(/\$/g, "\\$") + "\\s*\\(", "g");
  const starts = []; let m;
  while ((m = re.exec(src))) starts.push(m.index);
  if (!starts.length) throw new Error("function not found: " + name);
  if (starts.length > 1 && nth === undefined) throw new Error("ambiguous function: " + name + " x" + starts.length);
  const start = starts[nth || 0];
  const paren = src.indexOf("(", start);
  const bodyOpen = src.indexOf("{", matchClose(src, paren));
  const end = matchClose(src, bodyOpen);
  if (end < 0) throw new Error("unbalanced function: " + name);
  return src.slice(start, end + 1);
}

/* Evaluate source snippets in a fresh vm context and return the context. */
const domainConstants = createRequire(import.meta.url)("../../domain-constants-v1.js");
export const domain = domainConstants;
/* P2-6: production date display goes through window.cueDate (i18n-v1 core, ja table). Tests that evaluate production snippets get it by default. */
const i18nCore = createRequire(import.meta.url)("../../i18n-v1.js");
export const cueDate = (value, id) => i18nCore.formatDatePattern("ja", value, id);
export function run(code, globals = {}) {
  const win = { cueDate, ...(globals.window || {}) };
  const context = vm.createContext({ console, CueScoreDomainV1: domainConstants, ...globals, window: win });
  vm.runInContext(code, context);
  return context;
}

export const indexHtml = () => read("index.html");

/* Count of non-overlapping occurrences. */
export const count = (text, needle) => needle instanceof RegExp ? (text.match(new RegExp(needle.source, needle.flags.includes("g") ? needle.flags : needle.flags + "g")) || []).length : text.split(needle).length - 1;

/* Golden snapshots: tests/fixtures/p2/golden/<name>.json. Regenerate only deliberately with P2_WRITE_GOLDEN=1 (then review the diff). */
export function golden(name, value) {
  const path = new URL(`tests/fixtures/p2/golden/${name}.json`, ROOT);
  const text = JSON.stringify(value, null, 1) + "\n";
  if (process.env.P2_WRITE_GOLDEN === "1") { fs.writeFileSync(path, text); return { written: true, text }; }
  if (!fs.existsSync(path)) throw new Error(`golden missing: ${name} (generate once with P2_WRITE_GOLDEN=1 and review)`);
  return { written: false, expected: fs.readFileSync(path, "utf8"), text };
}
