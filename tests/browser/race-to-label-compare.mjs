/* Compares two race-to-label.mjs outputs (pristine vs changed). Usage: node tests/browser/race-to-label-compare.mjs <pristine.json> <changed.json>   (exit 1 on failure) */
import fs from "node:fs";
const [a, b] = process.argv.slice(2).map(f => JSON.parse(fs.readFileSync(f, "utf8")));
let fail = 0; const bad = m => { fail++; console.log("FAIL", m); }; let n = 0;
const RACK = d => /\/(9ball|10ball)$/.test(d);
for (const k of Object.keys(a)) {
  const A = a[k], B = b[k]; if (!B) { bad(k + " missing"); continue; }
  A.trace.forEach(([step, sa], i) => {
    const sb = B.trace[i][1]; n++;
    for (const f of ["score", "log", "fouls", "goal"]) if (JSON.stringify(sa[f]) !== JSON.stringify(sb[f])) bad(`${k} ${step}: ${f} differs (${JSON.stringify(sa[f])} vs ${JSON.stringify(sb[f])})`);
    if (RACK(k)) {
      sb.goalLabel.forEach((t, p) => { if (t !== "Race to") bad(`${k} ${step}: Race to line has extra text "${t}"`); });
      sb.stats.forEach((t, p) => { if (!new RegExp(`^Race to ${sb.goal[p]}$`).test(t.replace(/\s+/g, " ").trim())) bad(`${k} ${step}: stat line "${t}" is not "Race to ${sb.goal[p]}"`); });
    } else if (JSON.stringify(sa.stats) !== JSON.stringify(sb.stats) || JSON.stringify(sa.goalLabel) !== JSON.stringify(sb.goalLabel)) bad(`${k} ${step}: non rack-game label changed (${JSON.stringify(sa.stats)} vs ${JSON.stringify(sb.stats)})`);
    if (!RACK(k) && sb.badge.some(x => x && x.shown)) bad(`${k} ${step}: badge shown outside 9/10-Ball`);
  });
  if (A.store !== B.store) bad(`${k}: stored data differs`);
}
for (const k of Object.keys(b)) for (const [step, s] of b[k].trace) if (s.text) bad(`${k} ${step}: ball-in-hand wording is visible on the match screen`);
// the "Ball in hand" badge is gone (PO 2026-10-28): nothing is shown on the cards after a foul in any discipline
for (const k of Object.keys(b)) for (const [step, s] of b[k].trace) if ((s.badge || []).some(x => x && x.shown && x.text)) bad(`${k} ${step}: a ball-in-hand badge is still shown`);
console.log(fail ? "FAIL " + fail : `PASS (${n} steps compared)`);
process.exit(fail ? 1 : 0);
