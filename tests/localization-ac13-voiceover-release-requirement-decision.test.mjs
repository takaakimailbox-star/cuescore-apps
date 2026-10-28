import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const sha256 = path => crypto.createHash("sha256").update(fs.readFileSync(new URL(path, root))).digest("hex");
const spec = read("docs/official/108_CueScore_Localization_Spec.md");
const decision = read("docs/official/130_CueScore_Localization_AC13_VoiceOver_Release_Requirement_Decision.md");

function readZipEntry(path, name) {
  const buffer = fs.readFileSync(new URL(path, root));
  let eocd = -1;
  for (let index = buffer.length - 22; index >= 0; index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) { eocd = index; break; }
  }
  assert.ok(eocd >= 0, `${path}: end of central directory not found`);
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  for (let index = 0; index < count; index += 1) {
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const entryName = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);
    if (entryName === name) {
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const data = buffer.subarray(start, start + compressedSize);
      return (method === 0 ? data : zlib.inflateRawSync(data)).toString("utf8");
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  assert.fail(`${path}: ${name} not found`);
}

const docxText = path => readZipEntry(path, "word/document.xml").replace(/<[^>]+>/g, "");

test("Decision 043 and Official 130 are unique and Decision Log v2.19 is current", () => {
  const names = fs.readdirSync(new URL("docs/official/", root)).filter(name => /^\d+_.*\.md$/.test(name));
  const numbers = names.map(name => Number(name.split("_")[0]));
  assert.equal(numbers.filter(value => value === 130).length, 1);
  assert.equal(Math.max(...numbers), 135);
  assert.match(decision, /Decision 043/);
  assert.match(decision, /Official 130/);
  assert.match(decision, /Decision Log.*v2\.19/);
  const log = "docs/official/07_CueScore_Official_Design_Decision_Log_v2.19_Official_Release.docx";
  const text = docxText(log);
  assert.equal((text.match(/Decision 043｜/g) || []).length, 1);
  assert.deepEqual([...text.matchAll(/Decision (\d{3})｜/g)].map(match => Number(match[1])), Array.from({length: 43}, (_, index) => index + 1));
  assert.match(readZipEntry(log, "word/footer1.xml"), /Official Release \| 2026-10-21/);
});

test("Official 108 keeps all 31 acceptance identifiers and revises only VoiceOver audio blocking", () => {
  const acceptance = [...spec.matchAll(/^\| (AC-(?:S)?\d+) \|/gm)].map(match => match[1]);
  assert.deepEqual(acceptance, [
    ...Array.from({length: 21}, (_, index) => `AC-${index + 1}`),
    ...Array.from({length: 10}, (_, index) => `AC-S${index + 1}`),
  ]);
  const ac13 = spec.match(/^\| AC-13 \|.*$/m)?.[0] || "";
  for (const required of ["aria-label/alt/title/placeholder", "`lang`", "`aria-live`", "フォーカス順", "Modal", "静的検査＋DOM検査"]) {
    assert.ok(ac13.includes(required), required);
  }
  assert.match(ac13, /VoiceOver.*非ブロッキング/);
  assert.match(ac13, /未実施でも本項目をFAIL／NOT VERIFIEDにしない/);
  assert.match(decision, /既存のVoiceOver対応.*削除・弱体化・変更しない/s);
});

test("product, catalog, Native and StoreKit files are byte-preserved", () => {
  const expected = {
    "index.html": "05a05b92997942204e97e9999ad6abd56f84aa407b06dd450d69e5e90cd6a456",
    "i18n-catalog-ja-v1.js": "47ea5f63a6f35eb3c06b4cd7641d48690248f0d8921507dd05882336b99844c9",
    "i18n-catalog-en-v1.js": "ebf832444b67365ff4a5d246f6a89befa47341b767da024720fd96bad5bb8282",
    "i18n-catalog-zh-hans-v1.js": "7027ee64557b064a31a7cba88a3ab3bce641607c543f5f4ab8c8bc42970737a1",
    "monetization-v1.js": "9da40f6be8c3dd5c2bb2535325a6bc83a890ad16e38d649e44315222115f6c60",
    "ios/App/App.xcodeproj/project.pbxproj": "cc2385141b89401e2bc6f149b7bfa75e1a6902886d0f18dcba0586a1258c51f3",
  };
  for (const [path, digest] of Object.entries(expected)) assert.equal(sha256(path), digest, path);
});

test("SSOT applies Decision 043 without declaring P6 complete", () => {
  const state = `${read("docs/CURRENT_STATE.md")}\n${read("docs/CURRENT_STATUS.md")}\n${read("docs/handoff/CURRENT_REPORT.md")}`;
  assert.match(state, /PASS 28／BLOCKED 1／NOT VERIFIED 2／FAIL 0／DEFERRED 0/);
  assert.match(state, /P6全体PASS.*宣言しない/s);
  assert.match(state, /production source.*変更なし/s);
});
