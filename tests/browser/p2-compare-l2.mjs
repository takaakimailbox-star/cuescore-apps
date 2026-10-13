/* P2 L2 comparison (NOT part of `node --test`). Usage: node tests/browser/p2-compare-l2.mjs <baselineDir> <candidateDir> <lang> <mode>
 * Compares two outputs of p2-observer-probe.mjs: normalized DOM text per screen (ja must be byte-identical across P2 gates),
 * stored-data hashes, and per-observer fire/write behavior. Wall-clock lines (match start time) are excluded. Exit 1 on any DOM/data difference. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const [base, cand, lang = "ja", mode = "pro"] = process.argv.slice(2);
const VOLATILE = [/^T 開始時刻 \d{1,2}:\d{2}$/, /^T Started \d{1,2}:\d{2}/];
const norm = file => fs.readFileSync(file, "utf8").split("\n").filter(l => l && !VOLATILE.some(r => r.test(l)));
const sha = lines => crypto.createHash("sha256").update(lines.join("\n")).digest("hex");
const j = d => JSON.parse(fs.readFileSync(path.join(d, `observer_runtime_${lang}_${mode}.json`), "utf8"));
const a = j(base), b = j(cand);
let bad = 0; const rows = [];
for (const screen of Object.keys(a.dom)) {
  const fa = path.join(base, `dom_${mode}_${screen}.txt`), fb = path.join(cand, `dom_${mode}_${screen}.txt`);
  const same = fs.existsSync(fb) && sha(norm(fa)) === sha(norm(fb));
  if (!same) bad++;
  rows.push(["DOM", screen, same ? "identical" : "DIFFERENT"]);
}
for (const k of Object.keys(a.storage)) {
  if (k === "rotationScoreboard.players.v1") continue; // lastUsed/updatedAt are wall-clock; playersNormalized (timestamps removed) is compared instead
  if (k === "allKeys") { const s = JSON.stringify(a.storage[k]) === JSON.stringify(b.storage[k]); if (!s) bad++; rows.push(["DATA", "localStorage key set", s ? "identical" : "DIFFERENT"]); continue; }
  const s = JSON.stringify(a.storage[k]) === JSON.stringify(b.storage[k]); if (!s) bad++; rows.push(["DATA", k, s ? "identical" : "DIFFERENT"]);
}
// Observers are matched by file + ordinal (sorted by registration line), so a gate that only shifts line numbers is not reported as a change.
const fileOf = o => o.site.replace(/\?[^:]*/, "").split(":")[0], lineOf = o => Number(o.site.split(":").pop());
const sum = o => ({ fired: Object.values(o.fires).reduce((x, y) => x + y, 0) > 0, wrote: Object.values(o.writes).reduce((x, y) => x + y, 0) > 0, changed: Object.values(o.changed).reduce((x, y) => x + y, 0) > 0 });
const map = r => {
  const lines = {}; for (const o of r.observers) (lines[fileOf(o)] ||= new Set()).add(lineOf(o));
  const rank = {}; for (const [f, set] of Object.entries(lines)) rank[f] = [...set].sort((x, y) => x - y);
  const m = new Map();
  for (const o of r.observers) { const k = fileOf(o) + "#" + rank[fileOf(o)].indexOf(lineOf(o)); const s = sum(o); const p = m.get(k) || { n: 0, fired: false, wrote: false, changed: false }; m.set(k, { n: p.n + 1, fired: p.fired || s.fired, wrote: p.wrote || s.wrote, changed: p.changed || s.changed }); }
  return m;
};
const ma = map(a), mb = map(b);
for (const k of new Set([...ma.keys(), ...mb.keys()])) {
  const x = JSON.stringify(ma.get(k) || null), y = JSON.stringify(mb.get(k) || null);
  rows.push(["OBSERVER", k, x === y ? "same (instances/fired/wrote/changed)" : `CHANGED ${x} -> ${y}`]);
}
for (const r of rows) console.log(r.join("\t"));
console.log(`SUMMARY\tDOM+DATA differences: ${bad}`);
process.exit(bad ? 1 : 0);
