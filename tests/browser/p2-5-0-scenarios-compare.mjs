/* P2-5-0 scenario comparison + dynamic AC-S3 check (NOT part of `node --test`).
 * Usage:
 *   node tests/browser/p2-5-0-scenarios-compare.mjs <actual.json> <golden.json>   compare behaviour (DOM facts, changed-writer set, observer targets)
 *   node tests/browser/p2-5-0-scenarios-compare.mjs <actual.json> --ac-s3 [--expect-zero]
 *        dynamic AC-S3: observers that CHANGED text during any scenario must be inside the known list (observer-ac-s3-known.json);
 *        allow-list classes (STRUCTURE/STATE/DIAGNOSTIC) must never change text; --expect-zero (P2-5 end) requires NO observer text change at all.
 * `--write-golden <actual.json> <golden.json>` derives a golden from a reviewed run (deliberate action only).
 * Exit 0 = PASS, 1 = FAIL. Fire counts are NOT compared (timing dependent); changed-write membership and returned DOM facts are. */
import fs from "node:fs";
const args = process.argv.slice(2);
const load = f => JSON.parse(fs.readFileSync(f, "utf8"));
const known = load(new URL("../fixtures/p2/observer-ac-s3-known.json", import.meta.url).pathname);

function reduce(run) {
  const scenarios = {};
  for (const [name, s] of Object.entries(run.scenarios)) {
    scenarios[name] = { reach: s.reach, error: s.error, result: s.result, changedObservers: Object.entries(s.observers).filter(([k, v]) => v.changed > 0 && !k.startsWith("?")).map(([k]) => k).sort() };
  }
  return { lang: run.lang, mode: run.mode, tz: run.tz, viewport: run.viewport, dom: Object.fromEntries(Object.entries(run.dom).map(([k, v]) => [k, v.sha256])), observerTargets: (run.observerTargets || []).filter(o => !o.key.startsWith("?")).map(o => ({ key: o.key, targets: o.targets.map(t => ({ desc: String(t.desc).replace(/\..*$/, ""), live: t.live, opts: t.opts })) })), scenarios };
}
const VOLATILE = [/^A2-idle-mutation-source$/]; // idle attribute churn: pinned separately by shape in the report, not by exact counts
function deepDiff(a, b, p = "", out = []) {
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) === !Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) deepDiff(a[k], b[k], p + "/" + k, out);
  } else out.push({ path: p, golden: JSON.stringify(a)?.slice(0, 160), actual: JSON.stringify(b)?.slice(0, 160) });
  return out;
}
if (args[0] === "--write-golden") { fs.writeFileSync(args[2], JSON.stringify(reduce(load(args[1])), null, 1) + "\n"); console.log("golden written: " + args[2]); process.exit(0); }

const actual = load(args[0]);
const failures = [];
if (args[1] === "--ac-s3") {
  const textKeys = new Set(known.filter(k => k.class === "TEXT_REWRITE" || k.class === "TEXT_MIRROR_PENDING").map(k => k.key));
  const allowedKeys = new Set(known.filter(k => ["STRUCTURE", "STATE", "DIAGNOSTIC"].includes(k.class)).map(k => k.key));
  const changed = {};
  for (const [name, s] of Object.entries(actual.scenarios)) for (const [k, v] of Object.entries(s.observers)) if (v.changed > 0) (changed[k] ||= []).push(name);
  for (const [k, scs] of Object.entries(changed)) {
    if (k.startsWith("?")) failures.push(`unknown observer site changed text: ${k} in ${scs.join(",")}`);
    else if (allowedKeys.has(k)) failures.push(`ALLOW-LIST VIOLATION: ${k} changed text in ${scs.join(",")}`);
    else if (!textKeys.has(k)) failures.push(`unclassified observer changed text: ${k}`);
  }
  if (args.includes("--expect-zero")) for (const k of Object.keys(changed)) failures.push(`AC-S3 expect-zero: ${k} still rewrote text in ${changed[k].join(",")}`);
  const summary = { mode: "ac-s3" + (args.includes("--expect-zero") ? "+expect-zero" : ""), observersThatChangedText: Object.keys(changed).sort(), knownTextObservers: [...textKeys].length, run: actual.lang + "/" + actual.mode, failures };
  console.log(JSON.stringify(summary, null, 1)); process.exit(failures.length ? 1 : 0);
}
const golden = load(args[1]); const got = reduce(actual);
for (const name of Object.keys(golden.scenarios)) { if (!got.scenarios[name]) failures.push({ path: "/scenarios/" + name, golden: "present", actual: "missing" }); }
const g = JSON.parse(JSON.stringify(golden)), a = JSON.parse(JSON.stringify(got));
for (const re of VOLATILE) for (const n of Object.keys(g.scenarios)) if (re.test(n)) { delete g.scenarios[n].result; delete a.scenarios[n].result; }
failures.push(...deepDiff(g, a));
console.log(JSON.stringify({ mode: "compare", run: actual.lang + "/" + actual.mode, scenarios: Object.keys(golden.scenarios).length, differences: failures.length, first: failures.slice(0, 12) }, null, 1));
process.exit(failures.length ? 1 : 0);
