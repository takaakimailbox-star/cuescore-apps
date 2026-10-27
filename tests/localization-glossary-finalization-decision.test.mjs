import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const sha256 = path => crypto.createHash("sha256").update(fs.readFileSync(new URL(path, root))).digest("hex");
const glossary = read("docs/official/109_CueScore_Localization_Glossary.md");
const decision = read("docs/official/129_CueScore_Localization_Glossary_Finalization_Decision.md");

test("Decision 042 publishes Official 109 and 129 exactly once", () => {
  const numbers = fs.readdirSync(new URL("docs/official/", root)).filter(name => /^\d+_.*\.md$/.test(name)).map(name => Number(name.split("_")[0]));
  assert.equal(numbers.filter(value => value === 109).length, 1);
  assert.equal(numbers.filter(value => value === 129).length, 1);
  assert.equal(Math.max(...numbers), 135);
  assert.match(decision, /Decision 042/);
  assert.match(decision, /v2\.18/);
});

test("Glossary has 38 unique canonical IDs and no pending candidate", () => {
  const ids = [...glossary.matchAll(/^\| ([CG]\d{2}) \|/gm)].map(match => match[1]);
  assert.equal(ids.length, 38);
  assert.equal(new Set(ids).size, 38);
  assert.deepEqual(ids.filter(id => /^G/.test(id)), Array.from({length: 27}, (_, i) => `G${String(i + 1).padStart(2, "0")}`));
  assert.match(glossary, /`PENDING`: 0/);
  assert.match(glossary, /`CANDIDATE`: 0/);
});

test("G14 and G25 match the PO-approved wording and meaning", () => {
  assert.match(glossary, /^\| G14 \| アベレージ \| Average \| 平均得分 \| 得点÷完了イニング数。/m);
  assert.match(glossary, /^\| G25 \| スポット \| Spot \| 置球点 \| ボールを置く規定位置。球を戻す操作は既存のre-spot表現を使用。/m);
  assert.match(decision, /中国語の競技一次資料不足は`NOT VERIFIED`/);
  assert.match(glossary, /人間の独立レビューは未実施/);
});

test("catalog, Japanese UI and Data/QR implementation are byte-preserved", () => {
  const expected = {
    "index.html": "8a9ddca89818835eef67756278724bf4ec0151f5677cba74b4aaa7532b5387cf",
    "i18n-catalog-ja-v1.js": "47ea5f63a6f35eb3c06b4cd7641d48690248f0d8921507dd05882336b99844c9",
    "i18n-catalog-en-v1.js": "ebf832444b67365ff4a5d246f6a89befa47341b767da024720fd96bad5bb8282",
    "i18n-catalog-zh-hans-v1.js": "7027ee64557b064a31a7cba88a3ab3bce641607c543f5f4ab8c8bc42970737a1",
    "match-sharing-adapters-v1.js": "f10ac88ee5ba7317b75b4ba5f11d654bb2547503c6b15df783e7be0cb8170ea5",
    "match-sharing-validation-v1.js": "4399a8a63818ce2a687a78dc5fb2c157e2f239f71f2f44f36463cc75cace1aee",
    "tests/fixtures/p4/po-approval.json": "17576fcd7db0c9ed5433b151bf3314ed46b3dc0ea75b8911078015b341fa180d",
    "tests/fixtures/p4/po-approval-u4.json": "efc3bdfac4c2f1fc0629fb2738506131a4d6e03cd739419886765201f6df0b1d",
  };
  for (const [path, digest] of Object.entries(expected)) assert.equal(sha256(path), digest, path);
});

test("P6 remains a readiness audit rather than a final PASS after Decision 043", () => {
  const state = `${read("docs/CURRENT_STATE.md")}\n${read("docs/CURRENT_STATUS.md")}`;
  assert.match(state, /P6 Closeout Readiness/);
  assert.match(state, /VoiceOver実音声.*必須条件から外/s);
  assert.match(state, /Pro.*BLOCKED/s);
  assert.match(state, /P6全体.*PASS.*しない/s);
});
