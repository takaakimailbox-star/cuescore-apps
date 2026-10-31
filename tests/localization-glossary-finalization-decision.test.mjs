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
  assert.equal(Math.max(...numbers), 139);
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
    "index.html": "a933a668c6612b9972cc05b617b98a38fb9dbdf512012e8b9b58a832e1e07a8d",
    "i18n-catalog-ja-v1.js": "8e143e25570f13da4f0cae16f9812cc0b87eae00f2e4ff1f01f9a4e41c2bb1c4",
    "i18n-catalog-en-v1.js": "cb6e0d797835e13e7978ec9d5944bd9554a63c19cc13ca780a0ac190979a28ce",
    "i18n-catalog-zh-hans-v1.js": "1322bf99ba7288352e7db1dfaacc515dfd7028af92fd8adef92f4387b4c4f456",
    "match-sharing-adapters-v1.js": "f10ac88ee5ba7317b75b4ba5f11d654bb2547503c6b15df783e7be0cb8170ea5",
    "match-sharing-validation-v1.js": "4399a8a63818ce2a687a78dc5fb2c157e2f239f71f2f44f36463cc75cace1aee",
    "tests/fixtures/p4/po-approval.json": "a06df95336c6961647504755600ccfeb60efd2b53e5e71696cace6fe468f599b",
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
