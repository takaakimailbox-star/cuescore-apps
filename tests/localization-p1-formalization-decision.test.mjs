import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

// Documentation consistency test for Decision 034 / Official 113 / Official 114 / Decision Log v2.10 (Localization P1 formalization).
const root = new URL("../", import.meta.url);
const exists = path => fs.existsSync(new URL(path, root));
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const sha16 = path => crypto.createHash("sha256").update(fs.readFileSync(new URL(path, root))).digest("hex").slice(0, 16);
const DECISION = "docs/official/113_CueScore_Localization_P1_Formalization_Decision.md";
const SPEC = "docs/official/114_CueScore_Localization_P1_Acceptance_Spec.md";
const LOG = v => `docs/official/07_CueScore_Official_Design_Decision_Log_v${v}_Official_Release.docx`;
const IMPL = "docs/implementation/CueScore_Localization_Decision_034_Official_Release_2026-10-13.md";

function readZipEntry(path, name) {
  const buffer = fs.readFileSync(new URL(path, root));
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i -= 1) if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  assert.ok(eocd >= 0, `${path}: end of central directory not found`);
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n += 1) {
    const method = buffer.readUInt16LE(offset + 10), compressed = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28), extraLength = buffer.readUInt16LE(offset + 30), commentLength = buffer.readUInt16LE(offset + 32);
    const local = buffer.readUInt32LE(offset + 42);
    const entryName = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);
    if (entryName === name) {
      const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      const data = buffer.subarray(start, start + compressed);
      return (method === 0 ? data : zlib.inflateRawSync(data)).toString("utf8");
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error(`${path}: ${name} not found`);
}
const docxText = path => readZipEntry(path, "word/document.xml").replace(/<[^>]+>/g, "");
const decisionBlock = xml => { const s = xml.indexOf("Decision 001｜"), e = xml.indexOf("時系列変更記録"); return xml.slice(xml.lastIndexOf("<w:p>", s), xml.lastIndexOf("<w:p>", e)); };

test("numbering: Decision 034 and Official 113 / 114 are published once; Official 109 stays reserved; highest Official number is 120", () => {
  const numbers = fs.readdirSync(new URL("docs/official/", root)).filter(name => /^\d+_.*\.md$/.test(name)).map(name => Number(name.split("_")[0]));
  for (const number of [107, 108, 110, 111, 112, 113, 114]) assert.equal(numbers.filter(value => value === number).length, 1, `Official ${number}`);
  assert.ok(!numbers.includes(109), "Official 109 (Glossary) must not exist");
  assert.equal(Math.max(...numbers), 122);
  assert.equal((docxText(LOG("2.10")).match(/Decision 034｜/g) || []).length, 1);
  assert.ok(!docxText(LOG("2.9")).includes("Decision 034"), "the preserved v2.9 must not contain Decision 034");
  assert.match(read(DECISION), /本書 = \*\*Decision 034\*\*/);
  assert.match(read(DECISION), /109 は Glossary 用に予約済み/);
});

test("existing Decisions are preserved: v2.9 untouched, v2.10 keeps Decision 001-033 byte-identical and ids run 001..034", () => {
  for (const v of ["2.7", "2.8", "2.9", "2.10"]) assert.ok(exists(LOG(v)), `v${v} must exist`);
  const x29 = readZipEntry(LOG("2.9"), "word/document.xml"), x210 = readZipEntry(LOG("2.10"), "word/document.xml");
  assert.ok(x210.includes(decisionBlock(x29)), "Decision 001-033 of v2.9 must be contained unchanged in v2.10");
  const ids = [...docxText(LOG("2.10")).matchAll(/Decision (\d{3})｜/g)].map(match => Number(match[1]));
  assert.deepEqual(ids, Array.from({ length: 34 }, (_, index) => index + 1));
  const text = docxText(LOG("2.10"));
  assert.match(text, /Decision 033｜Dynamic Type 自動連動の Deferred（Later）/);
  assert.match(text, /Decision 034｜多言語化 P1 の正式固定/);
  assert.match(text, /CueScore Official Design Decision Log v2\.10/);
  assert.doesNotMatch(text, /Release Candidate/);
  assert.match(readZipEntry(LOG("2.10"), "word/footer1.xml"), /Official Release \| 2026-10-12|Official Release \| 2026-10-13/);
});

test("Official 107 / 108 / 110 / 111 / 112 are preserved unchanged (content hash)", () => {
  assert.equal(sha16("docs/official/107_CueScore_Localization_Decision.md"), "e274cec70e3f9789");
  assert.equal(sha16("docs/official/108_CueScore_Localization_Spec.md"), "c86a48331d4780e0");
  assert.equal(sha16("docs/official/110_CueScore_Settings_Unified_Design_Decision.md"), "5c1b4f0d92d923e7");
  assert.equal(sha16("docs/official/111_CueScore_Settings_Unified_Design_Spec.md"), "6425859f862091ec");
  assert.equal(sha16("docs/official/112_CueScore_Dynamic_Type_Deferral_Decision.md"), "79bfe235c71a95ff");
});

test("Decision 034 records the three Product Owner decisions without converting NOT VERIFIED items", () => {
  const d = read(DECISION);
  assert.match(d, /D034-1 U9/); assert.match(d, /D034-2 S-B/); assert.match(d, /D034-3 L-RES-10/); assert.match(d, /D034-4 P1 から P2/);
  assert.match(d, /LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false/);
  assert.match(d, /S-B の許可・有効化（flag=true）は \*\*Later／別 Gate\*\*/);
  assert.match(d, /FAIL にも PASS にも変更しない/);
  assert.match(d, /Official 108 L-SW-8／L-SW-9 は\*\*変更しない\*\*/);
  assert.match(d, /\*\*A\. Product Owner が明示確認した項目\*\*/);
  assert.match(d, /\*\*B\. 画像・ログ・自動検証で独立に確認した項目\*\*/);
  assert.match(d, /\*\*C\. 未確認として残す項目\*\*/);
  assert.match(d, /証拠のない確認を追加記録しない/);
  assert.match(d, /緩和・改変しない/);
  assert.match(d, /NOT VERIFIED として後工程へ引き継ぐ/);
  assert.match(d, /実機 standalone PWA/);
  assert.match(d, /Score P1 本体の WKWebView での直接測定/);
});

test("Official 114 keeps the classification vocabulary and does not turn C items into PASS", () => {
  const s = read(SPEC);
  assert.match(s, /\*\*C を PASS に、B を A に読み替えない。\*\*/);
  assert.match(s, /\| P1F-12 \| T-SW-1〜10 \| B \|/);
  assert.match(s, /\| P1F-11 \| C5 \| B \|/);
  assert.match(s, /\| P1F-4 \| L-RES-10 \| B \|/);
  assert.match(s, /D（FAIL／BLOCKED）: 0 件/);
  assert.match(s, /P1F-S1: `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`/);
  assert.match(s, /AC-P1F-3: 受入マトリクスの C 項目が PASS として SSOT に記録されていない/);
  assert.doesNotMatch(s, /RELEASE CANDIDATE/);
});

test("SSOT and README record Decision 034 consistently", () => {
  const readme = read("docs/README.md"), state = read("docs/CURRENT_STATE.md"), status = read("docs/CURRENT_STATUS.md");
  assert.match(readme, /official\/113_CueScore_Localization_P1_Formalization_Decision\.md/);
  assert.match(readme, /official\/114_CueScore_Localization_P1_Acceptance_Spec\.md/);
  assert.match(readme, /v2\.10 adds Decision 034/);
  assert.match(readme, /v2\.9 adds Decision 033/);
  assert.doesNotMatch(readme, /official\/109_/);
  assert.match(state, /CueScore Localization P1 Formalization Decision Published（2026年10月13日）/);
  assert.match(status, /DECISION 034 OFFICIAL PUBLISHED \/ SOURCE FORMALIZATION PENDING/);
  assert.match(read("docs/handoff/CURRENT_DECISION.md"), /CUESCORE-I18N-P1-FORMALIZATION-DECISION-034-20261013/);
  assert.match(read("docs/handoff/CURRENT_REPORT.md"), /CUESCORE-I18N-P1-FORMALIZATION-DECISION-034-20261013/);
  assert.ok(exists(IMPL));
  for (const text of [state, read(IMPL)]) assert.match(text, /P1 の source は main に未反映|P1 の source は main に未反映/);
});

test("this publication is documentation-only: no product source file mentions Decision 034 and no personal data or credentials are in the new documents", () => {
  for (const name of ["index.html", "sw.js", "i18n-v1.js"]) if (exists(name)) assert.doesNotMatch(read(name), /Decision 034/);
  const docs = [DECISION, SPEC, IMPL].map(read).join("\n");
  assert.doesNotMatch(docs, /00008140-[0-9A-F]{16}/i, "no device UDID");
  assert.doesNotMatch(docs, /192\.168\.\d+\.\d+/, "no LAN address");
  assert.doesNotMatch(docs, /BEGIN (RSA |EC )?PRIVATE KEY|ghp_[A-Za-z0-9]{20}|AuthKey_/);
  assert.doesNotMatch(docs, /TAKAAAKI|ISHIZUKA|takaaki\.mailbox/i, "no personal name or email");
});
