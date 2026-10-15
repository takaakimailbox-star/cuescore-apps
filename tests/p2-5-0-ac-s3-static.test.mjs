/* P2-5-0 / L0 AC-S3 static foundation (CueScore i18n P2). Pins the CURRENT observer picture; production source is not changed.
 * AC-S3 (Official 108): at P2 end, MutationObserver TEXT rewriting is 0; structure-only observers are listed on an allow-list.
 * This file is NOT a statement that AC-S3 is met - it is the ratchet that P2-5 gates lower. Numbers may only go DOWN. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { read, count } from "./helpers/p2-source.mjs";
import { observerInventory, OBSERVER_FILES } from "./helpers/p2-observers.mjs";
import { observerScan, TEXT_WRITE_EXT } from "./helpers/p2-ac-s3.mjs";

const known = JSON.parse(read("tests/fixtures/p2/observer-ac-s3-known.json"));
const scan = observerScan();
const byKey = new Map(scan.map(o => [o.key, o]));
const ALLOWED_CLASSES = ["STRUCTURE", "STATE", "DIAGNOSTIC"];

/* ---------- ratchet constants (a P2-5 gate lowers exactly its own and records it in Evidence) ---------- */
const RATCHET = Object.freeze({
  registrations: 23,
  textRewrite: 11,        // KNOWN rewriters: OBS-01,02,03,10,14,15,16,17,19,22,23
  textMirrorPending: 1,   // OBS-09 (D-R2): NOT allow-listed until reachability + rewrite behaviour are decided by the Commander
  allowListed: 11         // structure/state/diagnostic observers with NO text-writing callee
});

test("[AC-S3 L0] fixture covers exactly the 23 live registrations, one row each, unique ids", () => {
  assert.equal(scan.length, RATCHET.registrations);
  assert.equal(known.length, RATCHET.registrations);
  assert.deepEqual(known.map(k => k.key).sort(), scan.map(s => s.key).sort());
  assert.equal(new Set(known.map(k => k.obs_id)).size, known.length);
  assert.equal(new Set(known.map(k => k.p2_ledger)).size, known.length);
  assert.equal(observerInventory().length, RATCHET.registrations);
});

test("[AC-S3 L0] class counts are pinned: 11 text-rewrite + 1 mirror-pending (unresolved 12) + 11 allow-list candidates", () => {
  const c = {}; for (const k of known) c[k.class] = (c[k.class] || 0) + 1;
  assert.equal(c.TEXT_REWRITE, RATCHET.textRewrite);
  assert.equal(c.TEXT_MIRROR_PENDING, RATCHET.textMirrorPending);
  assert.equal(ALLOWED_CLASSES.reduce((a, k) => a + (c[k] || 0), 0), RATCHET.allowListed);
  assert.equal(known.filter(k => k.class === "TEXT_REWRITE" || k.class === "TEXT_MIRROR_PENDING").length, 12, "unresolved AC-S3 observers (must reach 0, or be allow-listed with Commander approval, before AC-S3 PASS)");
});

test("[AC-S3 L0] the known TEXT-REWRITE list is exactly OBS-01,02,03,10,14,15,16,17,19,22,23", () => {
  assert.deepEqual(known.filter(k => k.class === "TEXT_REWRITE").map(k => k.obs_id), ["OBS-01", "OBS-02", "OBS-03", "OBS-10", "OBS-14", "OBS-15", "OBS-16", "OBS-17", "OBS-19", "OBS-22", "OBS-23"]);
  assert.deepEqual(known.filter(k => k.class === "TEXT_MIRROR_PENDING").map(k => k.obs_id), ["OBS-09"]);
});

for (const k of known) {
  test(`[${k.obs_id}] AC-S3 L0 ${k.key}: text-writing callees match the pinned class (${k.class})`, () => {
    const s = byKey.get(k.key);
    assert.ok(s, "registration disappeared or moved to another file");
    // Pinned: the set of text-writing functions reachable from the callback (depth 3, same scope). A change in either direction needs a gate.
    assert.deepEqual(s.textWriters, k.text_writers, `${k.obs_id}: reachable text writers changed`);
    assert.equal(s.usesCueT, k.uses_cueT, `${k.obs_id}: cueT reachability changed`);
    if (ALLOWED_CLASSES.includes(k.class)) assert.deepEqual(s.textWriters, [], `${k.obs_id} is allow-list class ${k.class} but reaches a text writer`);
    if (k.class === "TEXT_REWRITE" || k.class === "TEXT_MIRROR_PENDING") assert.ok(s.textWriters.length > 0, `${k.obs_id} is classified as text-writing but no writer is reachable: reclassification needs Evidence`);
  });
}

test("[AC-S3 L0] MutationObserver is referenced only by the 23 audited `new MutationObserver(` registrations (no alias, no second style)", () => {
  const files = fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && f !== "sw.js");
  let regs = 0;
  for (const f of files) {
    const text = read(f), mentions = count(text, /\bMutationObserver\b/), registrations = count(text, /new MutationObserver\(/);
    if (!OBSERVER_FILES.includes(f)) assert.equal(mentions, 0, `${f} references MutationObserver outside the audited set`);
    assert.equal(mentions, registrations, `${f}: a MutationObserver mention that is not a registration (alias such as \`const MO = MutationObserver\`, or a guard)`);
    regs += registrations;
  }
  assert.equal(regs, RATCHET.registrations);
});

test("[AC-S3 L0] no new post-hoc translation observer: only OBS-17 reaches cueT from an observer callback", () => {
  assert.deepEqual(scan.filter(s => s.usesCueT).map(s => s.key), ["navigation-phase2-6.js#0"]);
});

test("[AC-S3 L0] the text-write detector itself recognises every write style it must (guards against weakening the scanner)", () => {
  for (const s of ["a.textContent=x", "a.innerHTML = `x`", "a.innerText='x'", "a.outerHTML=x", "a.insertAdjacentHTML('beforeend',h)", "a.insertAdjacentText('beforeend',t)", "document.createTextNode(t)", "a.setAttribute('aria-label',v)", "a.setAttribute(\"title\", v)", "a.placeholder=x", "a.title = x", "a.append('x')", "a.nodeValue=x", "a.data=x", "Object.assign(a,{textContent:x})", "a.replaceChildren('x')", "document.body.innerHTML += ''", "a.textContent+=x", "a.title+=x"]) assert.ok(TEXT_WRITE_EXT.test(s), s);
  for (const s of ["a.className=x", "a.classList.add('x')", "a.setAttribute('data-x','1')", "a.hidden=true", "a.textContent==='x'", "a.dataset.k=v", "a.setAttribute('role','dialog')", "a.innerHTML==='x'", "if(a.textContent!==b)c()"]) assert.ok(!TEXT_WRITE_EXT.test(s), s);
});

test("[AC-S3 L0 / P2L-119 AC-S2 residual] exactly 2 display-text comparisons remain in the wording guard (OBS-15) and nowhere else in the index.html guard family", () => {
  const html = read("index.html");
  assert.equal(count(html, 'node.textContent.includes("0回少なく抑えた")'), 1);
  assert.equal(count(html, 'node.textContent.includes("0上回った")'), 1);
  assert.equal(count(html, /textContent\.includes\(\s*["'`]/), 2, "no further display-text includes() comparisons may appear (AC-S2 ratchet)");
});

test("[AC-S3 L0] allow-list integrity: allow-listed observers are exactly the structure/state/diagnostic set and contain no Japanese literal in the callback itself", () => {
  const allowed = known.filter(k => ALLOWED_CLASSES.includes(k.class)).map(k => k.obs_id);
  assert.deepEqual(allowed, ["OBS-04", "OBS-05", "OBS-06", "OBS-07", "OBS-08", "OBS-11", "OBS-12", "OBS-13", "OBS-18", "OBS-20", "OBS-21"]);
  for (const k of known.filter(k => ALLOWED_CLASSES.includes(k.class))) assert.deepEqual(byKey.get(k.key).jpFunctions, [], `${k.obs_id} reaches a function with a Japanese literal`);
});

test("[AC-S3 L0] reconciliation with the P2-0 classification fixture (observer-classification.json, left untouched): exactly two reclassifications, both evidenced", () => {
  const old = JSON.parse(read("tests/fixtures/p2/observer-classification.json"));
  const oldRole = Object.fromEntries(old.map(o => [o.id, o.role]));
  const diffs = known.filter(k => {
    const was = oldRole[k.p2_ledger];
    const now = ALLOWED_CLASSES.includes(k.class) ? "allowed" : "rewrite";
    return was !== now;
  }).map(k => `${k.p2_ledger}:${oldRole[k.p2_ledger]}->${k.class}`);
  assert.deepEqual(diffs, [
    "P2L-113:allowed->TEXT_MIRROR_PENDING", // OBS-09: the P2-0 fixture allowed it; R-P2-1 / P2-5-0 found it copies status text (reachability: none in this release) -> NOT allow-listed until D-R2
    "P2L-122:rewrite->STATE"                // OBS-18: P2-4 removed the title text comparison/write from navigation-shell-phase1.js; no text writer is reachable now
  ]);
});
