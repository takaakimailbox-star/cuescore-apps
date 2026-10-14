/* P2-2 Display Mapper: stored Japanese canonical resultLabel values are mapped for DISPLAY only. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { read, indexHtml, extractFunction, count } from "./helpers/p2-source.mjs";

const require = createRequire(import.meta.url);
const core = require("../i18n-v1.js");
const ja = require("../i18n-catalog-ja-v1.js"), en = require("../i18n-catalog-en-v1.js"), zh = require("../i18n-catalog-zh-hans-v1.js");
const domain = require("../domain-constants-v1.js");
const html = indexHtml();

test("[P2L-002] new catalog keys exist in all three catalogs; ja equals the stored canonical value; en / zh-Hans differ", () => {
  const cases = { "mapper.resultLabel.two": "2個", "mapper.resultLabel.skipped": "記録なし" };
  for (const [key, canonical] of Object.entries(cases)) {
    assert.equal(ja[key], canonical); assert.ok(en[key] && en[key] !== canonical); assert.ok(zh[key] && zh[key] !== canonical);
  }
  assert.equal(core.RESULT_LABEL_KEYS["2個"], "mapper.resultLabel.two"); assert.equal(core.RESULT_LABEL_KEYS["記録なし"], "mapper.resultLabel.skipped");
});
test("[P2L-002] wording for the two legacy values is marked provisional (pending P3 terminology approval) in every catalog", () => {
  for (const f of ["i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"]) assert.equal(count(read(f), "P2-2 provisional"), 2, f);
});
test("[P2L-002] every Domain canonical resultLabel value has a Mapper entry in every language (no gap left)", () => {
  for (const value of Object.values(domain.RESULT_LABELS)) {
    const key = core.RESULT_LABEL_KEYS[value]; assert.ok(key, value);
    for (const c of [ja, en, zh]) assert.ok(c[key], key);
  }
});
test("[P2L-008] the Mapper is bound once as window.cueResultLabel and called only at the display row", () => {
  assert.equal(count(html, /cueResultLabel/g), 3, "2 definitions (mapper / no-i18n fallback) + 1 call, none elsewhere");
  const body = extractFunction(html, "buildAnalysisLogV65");
  assert.equal(count(body, "window.cueResultLabel("), 1);
  for (const f of fsList()) assert.ok(!read(f).includes("cueResultLabel"), f + " must not use the display mapper");
});
function fsList() { return ["match-sharing-adapters-v1.js", "match-sharing-format-v1.js", "match-sharing-persistence-v1.js", "match-sharing-validation-v1.js", "match-sharing-receiver-v1.js", "match-sharing-sender-v1.js", "match-sharing-transaction-v1.js", "record-access-v1.js", "domain-constants-v1.js", "analytics-build4-metrics.js"]; }
test("[P2L-012,102,103] stored / exported / shared paths never call the Display Mapper (Backup, CSV, producer, consumers)", () => {
  for (const name of ["makeBackupPayload", "exportBackup", "exportCsv", "buildPlayerMatchAnalysisV64", "recordAnalysisEventV60"]) {
    let body; try { body = extractFunction(html, name); } catch (_) { continue; }
    assert.ok(!/cueResultLabel|mapResultLabel|cueT\(/.test(body), name);
  }
  const producerAt = html.indexOf('recordAnalysisEventV60("break_result"');
  assert.ok(!/cueResultLabel|mapResultLabel/.test(html.slice(producerAt, producerAt + 1500)));
});
test("[P2L-008] the only display site is in the legacy detail renderer, which the formal match detail replaces at load (dormant in the current UI)", () => {
  assert.ok(html.includes("openHistoricalRecord=openMatchDetailV1;"));
  assert.ok(html.includes("window.openHistoricalRecordV2=openMatchDetailV1;"));
  assert.equal(count(html, "renderAnalysisLogPageV65("), 2, "definition + the single legacy call");
});
