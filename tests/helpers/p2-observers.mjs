import { read, matchClose, extractFunction } from "./p2-source.mjs";
export const OBSERVER_FILES = ["analysis-build4.js", "analysis-final-rc.js", "final-ui-build18.js", "index.html", "monetization-v1.js", "navigation-phase2-6.js", "navigation-shell-phase1.js", "player-detail-build6.js", "ui-revision-v12.js"];
export const TEXT_WRITE = /\.(textContent|innerHTML|innerText|outerHTML)\s*=[^=]|insertAdjacentHTML\(|setAttribute\(\s*["'](aria-label|title|placeholder)["']|\.(title|placeholder)\s*=[^=]/;
export const JP = /[぀-ヿ一-鿿（）]/;
export function resolveCallback(src, arg) {
  const id = arg.trim();
  if (!/^[A-Za-z_$][\w$]*$/.test(id)) return arg;
  try { return extractFunction(src, id, 0); } catch (_) { /* not a function declaration */ }
  const decl = new RegExp("(?:const|let|var)\\s+" + id.replace(/\$/g, "\\$") + "\\s*=").exec(src);
  if (!decl) return arg;
  const arrow = src.indexOf("=>", decl.index);
  const brace = src.indexOf("{", arrow);
  return src.slice(decl.index, matchClose(src, brace) + 1);
}
/* Every `new MutationObserver(cb)` in production sources: file, 1-based line, callback source, direct text write, Japanese literal in callback. */
export function observerInventory() {
  const out = [];
  for (const file of OBSERVER_FILES) {
    const src = read(file); const re = /new MutationObserver\(/g; let m, k = 0;
    while ((m = re.exec(src))) {
      const open = m.index + m[0].length - 1;
      const arg = src.slice(open + 1, matchClose(src, open));
      const cb = resolveCallback(src, arg);
      out.push({ file, k: k++, line: src.slice(0, m.index).split("\n").length, callback: /^[A-Za-z_$][\w$]*$/.test(arg.trim()) ? arg.trim() : "(inline)", directTextWrite: TEXT_WRITE.test(cb), jpLiteral: JP.test(cb), cueT: /cueT\(/.test(cb) });
    }
  }
  return out;
}
