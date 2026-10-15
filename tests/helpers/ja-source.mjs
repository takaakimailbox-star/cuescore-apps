/* P3 test helper. Production source now routes display text through window.cueT("p3.<hash>", {params}); the source-pinning tests written before P3
 * assert the Japanese text. jaSource() rewrites every such call back to the ja catalog text (params become ${expr}/ + expr +), so those assertions keep
 * verifying the same Japanese output without being weakened. Pure text transformation; production code is untouched. */
import fs from "node:fs";
import vm from "node:vm";
let JA = null;
// Evaluate the ja catalog file in an isolated context so the result does not depend on module-cache state of other tests.
const ja = () => {
  if (JA) return JA;
  const read = globalThis.__p3RawReadFileSync || fs.readFileSync;
  const text = read.call(fs, new URL("../../i18n-catalog-ja-v1.js", import.meta.url), "utf8");
  let captured = null;
  const sandbox = { CueScoreI18nV1: { registerCatalog: (language, dictionary) => (captured = dictionary) } };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(text, sandbox);
  if (!captured) throw new Error("jaSource: ja catalog did not register");
  return (JA = captured);
};

function matchClose(src, open) {
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
function splitTop(text, keep) {
  const out = []; let depth = 0, start = 0, i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "'" || c === '"') { i++; while (i < text.length && text[i] !== c) { if (text[i] === "\\") i++; i++; } i++; continue; }
    if (c === "`") { const close = matchClose("`" + text.slice(i + 1) + "`", -1); void close; i++; while (i < text.length && text[i] !== "`") { if (text[i] === "\\") { i += 2; continue; } if (text[i] === "$" && text[i + 1] === "{") { i = i + 1 + matchClose(text.slice(i + 1), 0) + 1; continue; } i++; } i++; continue; }
    if (c === "(" || c === "[" || c === "{") { const e = matchClose(text, i); i = e + 1; continue; }
    if (c === "," ) { out.push(text.slice(start, i)); start = i + 1; }
    i++;
  }
  out.push(text.slice(start));
  return keep ? out.filter(s => s.trim()) : out.map(s => s.trim()).filter(Boolean);
}
const escTpl = t => t.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${").replace(/\n/g, "\\n");
const SIMPLE = /^[\w$.?[\]]+(\([^()]*\))?$/;

const STATIC_KEY = / data-i18n(?:-[a-z-]+)?="p3\.[0-9a-f]{8}"/g;
export function jaSource(src, catalogOverride) {
  src = src.replace(STATIC_KEY, "");
  const catalog = catalogOverride || ja();
  const MARK = /window\.cueT\((["'`])p3\./g;
  let out = src;
  const found = []; let mm;
  while ((mm = MARK.exec(src))) found.push({ index: mm.index, q: mm[1] });
  for (let fi = found.length - 1; fi >= 0; fi--) {
    const idx = found[fi].index, kquote = found[fi].q;
    const open = idx + "window.cueT".length;
    const close = matchClose(out, open);
    if (close < 0) continue;
    const inside = out.slice(open + 1, close);
    const parts = splitTop(inside);
    const key = parts[0].slice(1, -1);
    const params = {}; let countExpr = null;
    if (parts[1]) {
      const body = parts[1].trim().replace(/^\{/, "").replace(/\}$/, "");
      for (const entry of splitTop(body, true)) { const c = entry.indexOf(":"); const name = entry.slice(0, c).trim(), expr = entry.slice(c + 1); if (name === "count" && !/\{count\}/.test(catalog[key] || "")) { countExpr = expr; continue; } params[name] = expr; }
    }
    const message = catalog[key];
    if (message === undefined) throw new Error("jaSource: key not in ja catalog " + key);
    const before = out.slice(0, idx), after = out.slice(close + 1);
    const inTemplate = before.endsWith("${") && after.startsWith("}");
    let text;
    if (inTemplate) {
      text = message.split(/(\{[A-Za-z0-9_]+\})/).map(p => { const m = /^\{([A-Za-z0-9_]+)\}$/.exec(p); return m ? "${" + (params[m[1]] ?? p) + "}" : escTpl(p); }).join("");
      out = before.slice(0, -2) + text + after.slice(1);
    } else {
      const pieces = message.split(/(\{[A-Za-z0-9_]+\})/).filter(p => p !== "").map(p => { const m = /^\{([A-Za-z0-9_]+)\}$/.exec(p); return m ? { expr: params[m[1]] ?? p } : { lit: p }; });
      const quote = (t, q) => q === "'" ? "'" + t.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'" : JSON.stringify(t);
      let b = before, a = after, lq = null, rq = false;
      const lm = /(["'])\s*\+\s*$/.exec(b); if (lm) { lq = lm[1]; }
      const rm = /^\s*\+\s*(["'])/.exec(a);
      if (!pieces.some(p => p.expr)) {
        if (lm) b = b.slice(0, lm.index);
        if (rm) { a = a.slice(rm[0].length); rq = true; }
        const q = lq || (rm ? rm[1] : (kquote === "`" ? "`" : kquote));
        const lit = q === "`" ? "`" + escTpl(message) + "`" : quote(message, q);
        out = b + (lq ? lit.slice(1) : lit).slice(0, rq ? -1 : undefined) + a;
      } else if (!lm && !rm && kquote !== "'" && kquote !== '"') {
        out = before + "`" + pieces.map(p => p.lit !== undefined ? escTpl(p.lit) : "${" + p.expr + "}").join("") + "`" + after;
      } else {
        const qq = lq || (rm ? rm[1] : (kquote === "`" ? '"' : kquote));
        text = pieces.map(p => p.lit !== undefined ? quote(p.lit, qq) : (SIMPLE.test(p.expr) ? p.expr : "(" + p.expr + ")")).join(" + ");
        out = before + text + after;
      }
    }
  }
  return out;
}
