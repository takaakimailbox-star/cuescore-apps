import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

// Decision 036 / Official 117-118: the AI-verification overlay covers every catalog key exactly once, never claims human review or approval,
// keeps the manifest history untouched, and the P4 QA catalog corrections are in place.
const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const manifest = JSON.parse(read("tests/fixtures/p3/translation-manifest.json"));
const ai = JSON.parse(read("tests/fixtures/p4/ai-verification.json"));
const cat = { en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js"), ja: require("../i18n-catalog-ja-v1.js") };
// the AI-verification overlay covers the 1,331 keys that existed at the P4 QA; keys added later by PO-approved decisions (manifest addedBy) are covered by the PO approval record
const all = [...Object.keys(manifest.keys).filter(k => !manifest.keys[k].addedBy), ...Object.keys(manifest.earlierKeys)].sort();

test("overlay: every manifest key is either AI-verified or awaiting a PO decision, exactly once", () => {
  const verified = Object.keys(ai.keys), po = Object.keys(ai.poDecision);
  assert.equal(new Set([...verified, ...po]).size, verified.length + po.length, "no key twice");
  assert.deepEqual([...verified, ...po].sort(), all);
  assert.equal(verified.length + po.length, 1331 - 2); // 2 ball-in-hand keys retired 2026-10-28
  for (const [key, e] of Object.entries(ai.keys)) { assert.ok(["V", "VR"].includes(e.v), key); assert.ok(["R0", "R1", "R2"].includes(e.r), `${key}: R3 can never be AI-verified`); }
  for (const [key, e] of Object.entries(ai.poDecision)) assert.equal(e.r, "R3", key);
});
test("overlay never claims human review or approval; the manifest history is untouched", () => {
  assert.equal(ai.humanIndependentReview, "NOT PERFORMED");
  assert.match(ai.verifier, /^AI \(/);
  assert.doesNotMatch(JSON.stringify(ai), /P4-REVIEWED"|P4-APPROVED"/);
  assert.match(ai.meaning, /NOT a human independent review/);
  for (const e of [...Object.values(manifest.keys), ...Object.values(manifest.earlierKeys)]) assert.equal(e.status, "P3-PROVISIONAL");
});
test("P4 QA catalog corrections are applied and ja is untouched by them", () => {
  assert.equal(cat.en["p3.1632c17c"], "Opponent switched without scoring");
  assert.equal(cat.zh["p3.c3551739"], "换人");
  for (const key of ["p3.467ddd36", "p3.4f633597", "p3.62505545", "p3.ad2e1dd6"]) assert.ok(!cat.zh[key].includes("・") && cat.zh[key].includes("·"), key);
  for (const v of Object.values(cat.zh)) assert.ok(!String(typeof v === "object" ? JSON.stringify(v) : v).includes("・"), "no Japanese middle dot in zh-Hans");
  for (const [key, v] of Object.entries(cat.en)) assert.ok(!/\S {3}\S/.test(typeof v === "object" ? Object.values(v).join("|") : v), `${key}: no three-space separators in en`);
  assert.equal(cat.ja["p3.c3551739"], "プレーヤー交代");
});
