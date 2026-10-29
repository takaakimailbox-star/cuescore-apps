import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import test from "node:test";
import { createRequire } from "node:module";

// Decision 037 / Official 119-120 (AC-P4A-1..3, 8): the PO approval record covers every catalog key, binds to the current [ja, en, zh-Hans] text,
// keeps the AI-verification residual risks, never claims a human review and leaves U4/U11 pending.
const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const cat = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js") };
const approval = JSON.parse(read("tests/fixtures/p4/po-approval.json"));
const approvalU4 = JSON.parse(read("tests/fixtures/p4/po-approval-u4.json")); // keys added by Decision 038 (U4)
const approvalSC = JSON.parse(read("tests/fixtures/p4/po-approval-shotclock.json")); // keys added by Decision 048 (shot clock, 21 keys)
const ai = JSON.parse(read("tests/fixtures/p4/ai-verification.json"));
const hash = k => crypto.createHash("sha256").update(JSON.stringify([cat.ja[k], cat.en[k], cat.zh[k]])).digest("hex").slice(0, 16);

test("every catalog key has an approval record bound to its current ja/en/zh-Hans text", () => {
  const all = { ...approval.keys, ...approvalU4.keys, ...approvalSC.keys };
  assert.equal(Object.keys(all).length, Object.keys(approval.keys).length + Object.keys(approvalU4.keys).length + Object.keys(approvalSC.keys).length, "the three records do not overlap");
  assert.deepEqual(Object.keys(all).sort(), Object.keys(cat.ja).sort());
  for (const [key, e] of Object.entries(all)) assert.equal(e.h, hash(key), `${key}: text changed after approval (re-approval required)`);
});
test("residual risks are kept and the 9 corrected R3 keys stay R3", () => {
  for (const [key, e] of Object.entries(approval.keys)) {
    if (ai.keys[key]) assert.equal(e.r, ai.keys[key].r, key);
    else if (ai.poDecision[key]) { assert.equal(e.r, "R3", key); assert.equal(e.correctedBy, "PD-P4A-B"); }
    else assert.equal(e.r, "R2", `${key}: new U3/U8 key`);
  }
  assert.equal(Object.values(approval.keys).filter(v => v.correctedBy).length, 9);
  assert.equal(Object.values(approval.keys).filter(v => v.origin).length, 4);
});
test("the record states the approval honestly: no human review, no P4-REVIEWED, Glossary 109 unpublished, U4/U11 pending", () => {
  assert.equal(approval.status, "P4-APPROVED");
  assert.equal(approval.date, "2026-10-17");
  assert.equal(approval.humanIndependentReview, "NOT PERFORMED");
  assert.match(approval.reviewedState, /P4-REVIEWED is not used/);
  assert.match(approval.terms.glossary109, /NOT published/);
  assert.match(approval.pending.U4, /DECISION PENDING/);
  assert.match(approval.pending.U11, /DECISION PENDING/);
  assert.doesNotMatch(JSON.stringify(approval.keys), /P4-REVIEWED/);
});
