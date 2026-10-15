/* P2-5-0 AC-S3 static scanner. Read-only. For every `new MutationObserver(cb)` registration it resolves the callback and the
 * same-scope functions it (transitively, depth 3) calls or passes by name, and reports which of them can write display text.
 * Inline <script> observers are resolved inside their own <script> block only (the 30k-line index.html reuses names across IIFEs). */
import { read, extractFunction, matchClose } from "./p2-source.mjs";
import { observerInventory, resolveCallback, JP } from "./p2-observers.mjs";

/* Text-bearing writes. Superset of p2-observers TEXT_WRITE: also text nodes, append("literal"), nodeValue/data, label/text props. */
export const TEXT_WRITE_EXT = /\.(textContent|innerHTML|innerText|outerHTML|nodeValue|data|label|text)\s*\+?=(?!=)|insertAdjacentHTML\(|insertAdjacentText\(|createTextNode\(|\.(append|prepend|before|after)\(\s*["'`]|setAttribute\(\s*["'](aria-label|aria-description|title|placeholder|alt|label)["']|\.(title|placeholder|ariaLabel)\s*\+?=(?!=)|\{\s*(textContent|innerHTML)\s*:|\.replaceChildren\(\s*["'`]|\.replaceWith\(\s*["'`]/;

function declared(src) {
  const names = new Map();
  for (const m of src.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)) names.set(m[1], { kind: "fn", idx: m.index });
  for (const m of src.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g)) if (!names.has(m[1])) names.set(m[1], { kind: "arrow", idx: m.index, end: m.index + m[0].length });
  return names;
}
function refs(code) {
  const out = new Set();
  for (const m of code.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) out.add(m[1]);
  for (const m of code.matchAll(/[(,]\s*([A-Za-z_$][\w$]*)\s*(?=[,)])/g)) out.add(m[1]);
  return out;
}
function bodyOf(src, info, name) {
  if (info.kind === "fn") return extractFunction(src, name, 0);
  let j = info.end; while (/\s/.test(src[j])) j++;
  if (src[j] === "{") return src.slice(info.idx, matchClose(src, j) + 1);
  const e = src.indexOf("\n", j); return src.slice(info.idx, e < 0 ? src.length : e);
}
function scopeOf(file, cb) {
  const full = read(file);
  if (!file.endsWith(".html")) return full;
  const at = full.indexOf(cb.slice(0, 80)); if (at < 0) return full;
  return full.slice(full.lastIndexOf("<script", at), full.indexOf("</script>", at));
}
function closure(file, cb, depth = 3) {
  const src = scopeOf(file, cb), decl = declared(src), seen = new Map();
  const walk = (code, d, name) => {
    if (seen.has(name)) return; seen.set(name, code); if (d === 0) return;
    for (const t of refs(code)) if (decl.has(t) && t !== name) { try { walk(bodyOf(src, decl.get(t), t), d - 1, t); } catch (_) { /* unresolved name */ } }
  };
  walk(cb, depth, "<cb>"); return seen;
}
export function observerScan() {
  return observerInventory().map(o => {
    const src = read(o.file); const re = /new MutationObserver\(/g; let m, k = 0, arg;
    while ((m = re.exec(src))) { if (k++ === o.k) { const open = m.index + m[0].length - 1; arg = src.slice(open + 1, matchClose(src, open)); break; } }
    const cb = resolveCallback(src, arg);
    const cl = closure(o.file, cb);
    const entries = [...cl];
    return {
      key: o.file + "#" + o.k, file: o.file, k: o.k, line: o.line,
      closureSize: cl.size,
      textWriters: entries.filter(([, c]) => TEXT_WRITE_EXT.test(c)).map(([n]) => n).sort(),
      jpFunctions: entries.filter(([, c]) => JP.test(c)).map(([n]) => n).sort(),
      usesCueT: entries.some(([, c]) => /cueT\(/.test(c))
    };
  });
}
