import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import test from "node:test";
import { createRequire } from "node:module";

// Decision 048 / Official 138-139 (AC-ST1..7): the 21 shot-clock terms are P4-APPROVED main-catalog keys bound to the hash of [ja, en, zh-Hans]
const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const cat = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js") };
const rec = JSON.parse(read("tests/fixtures/p4/po-approval-shotclock.json"));
const hash = k => crypto.createHash("sha256").update(JSON.stringify([cat.ja[k], cat.en[k], cat.zh[k]])).digest("hex").slice(0, 16);
const ph = v => [...new Set((JSON.stringify(v).match(/\{[A-Za-z0-9_]+\}/g) || []))].sort().join();

test("ST-1 / ST-2: 21 keys in the three main catalogs with matching placeholders; approval hashes bind to the current text", () => {
  const keys = Object.keys(rec.keys);
  assert.equal(keys.length, 21);
  assert.deepEqual(keys.sort(), Object.keys(cat.ja).filter(k => k.startsWith("shotclock.")).sort());
  for (const k of keys) {
    assert.ok(cat.en[k] !== undefined && cat.zh[k] !== undefined, k);
    assert.equal(ph(cat.ja[k]), ph(cat.en[k]), k); assert.equal(ph(cat.ja[k]), ph(cat.zh[k]), k);
    assert.equal(rec.keys[k].h, hash(k), `${k}: text changed after approval (re-approval required)`);
    assert.match(rec.keys[k].r, /^R[012]$/);
  }
});

test("ST-3: the record states the approval honestly (conditional PO delegation, no human review, no P4-REVIEWED, R2 for zh competition terms)", () => {
  assert.equal(rec.status, "P4-APPROVED"); assert.equal(rec.date, "2026-10-29");
  assert.match(rec.poDelegation, /CONDITIONAL delegation/); assert.match(rec.poDelegation, /NOT as an unconditional approval/);
  assert.equal(rec.humanIndependentReview, "NOT PERFORMED"); assert.match(rec.reviewedState, /P4-REVIEWED is not used/);
  assert.doesNotMatch(JSON.stringify(rec.keys), /P4-REVIEWED/);
  assert.match(rec.residualRisk, /NOT VERIFIED/);
  for (const k of ["shotclock.title", "shotclock.extTime", "shotclock.extend", "shotclock.expired"]) assert.equal(rec.keys[k].r, "R2", k);
  assert.equal(Object.values(rec.keys).filter(v => v.qaChanged).length, 6);
});

test("ST-4: the provisional catalog is retired and the clock reads the main catalogs through cueT", () => {
  assert.ok(!fs.existsSync(new URL("i18n-catalog-shotclock-v1.js", root)));
  const js = read("shotclock-v1.js");
  assert.match(js, /root\.cueT\(key, params\)/); assert.ok(!/CueScoreShotClockCatalogV1/.test(js));
  for (const f of ["index.html", "sw.js", "scripts/build-native-web.mjs"]) assert.ok(!read(f).includes("i18n-catalog-shotclock"), f);
});

test("ST-5: the key terms are the approved wording", () => {
  assert.equal(cat.zh["shotclock.title"], "出杆计时器"); assert.equal(cat.zh["shotclock.paused"], "已暂停");
  assert.equal(cat.en["shotclock.undo"], "Undo"); assert.equal(cat.en["shotclock.expired"], "Time up");
  assert.equal(cat.en["shotclock.supplement"], "Time each shot manually");
  assert.deepEqual(["shotclock.extend", "shotclock.extTime", "shotclock.aria.undo"].map(k => cat.zh[k]), ["延时", "延时时间", "撤销延时"]);
  assert.match(cat.zh["shotclock.aria.extend"], /\{sec\}/); assert.match(cat.zh["shotclock.aria.extCount"], /\{count\}/);
});

test("ST-7: Official 109 is protected and the Glossary successor / decision documents exist", () => {
  assert.match(read("docs/official/109_CueScore_Localization_Glossary.md"), /CONFIRMED`: 38語/);
  for (const f of ["138_CueScore_Shot_Clock_21_Terms_P4_Approval_Decision.md", "139_CueScore_Shot_Clock_21_Terms_P4_Approval_Spec.md"]) assert.ok(fs.existsSync(new URL("docs/official/" + f, root)), f);
  assert.match(read("docs/official/139_CueScore_Shot_Clock_21_Terms_P4_Approval_Spec.md"), /S12/);
});
