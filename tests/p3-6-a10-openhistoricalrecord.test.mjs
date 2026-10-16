import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// P3-6 candidate A10 (Official 108 P3-6; P4 review policy gate): the first `window.openHistoricalRecordV2 = openHistoricalRecord` assignment was dead
// (overwritten at load before any read) and was removed. This pins the live wiring so the History detail path cannot silently lose its opener.
const read = f => globalThis.__p3RawReadFileSync.call(fs, new URL("../" + f, import.meta.url), "utf8");
const PRODUCT = fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && !/^(sw\.js|i18n-catalog-)/.test(f));

test("openHistoricalRecordV2 is assigned exactly once, to the Match Detail opener", () => {
  const index = read("index.html");
  const assigns = index.match(/window\.openHistoricalRecordV2\s*=[^=]/g) || [];
  assert.equal(assigns.length, 1);
  assert.match(index, /window\.openHistoricalRecordV2=openMatchDetailV1;/);
  assert.doesNotMatch(index, /window\.openHistoricalRecordV2\s*=\s*openHistoricalRecord\b/);
});
test("the only reader is the guarded fallback behind openMatchDetailV1 (no captured references)", () => {
  const reads = [];
  for (const f of PRODUCT) for (const m of read(f).matchAll(/.{0,60}window\.openHistoricalRecordV2.{0,40}/g)) if (!/window\.openHistoricalRecordV2\s*=[^=]/.test(m[0])) reads.push(`${f}: ${m[0]}`);
  assert.equal(reads.length, 1, reads.join("\n"));
  assert.match(reads[0], /window\.openMatchDetailV1\|\|window\.openHistoricalRecordV2/);
});
test("the History detail path keeps its opener wiring (intent of the former history-card-readability assertion)", () => {
  const index = read("index.html");
  assert.match(index, /data-player-record-id/);
  assert.match(index, /openHistoricalRecord=openMatchDetailV1;/);
  assert.match(index, /window\.openMatchResultDetailV5=recordId=>openMatchDetailV1\(recordId,\{source:"result"\}\)/);
});
