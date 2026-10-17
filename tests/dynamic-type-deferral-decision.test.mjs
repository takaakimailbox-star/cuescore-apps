import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

// Documentation consistency test for Decision 033 / Official 112 / Decision Log v2.9 (Dynamic Type automatic linking: Deferred).
const root = new URL("../", import.meta.url);
const exists = path => fs.existsSync(new URL(path, root));
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const sha256 = path => crypto.createHash("sha256").update(fs.readFileSync(new URL(path, root))).digest("hex");
const DECISION = "docs/official/112_CueScore_Dynamic_Type_Deferral_Decision.md";
const O110 = "docs/official/110_CueScore_Settings_Unified_Design_Decision.md";
const O111 = "docs/official/111_CueScore_Settings_Unified_Design_Spec.md";
const LOG = v => `docs/official/07_CueScore_Official_Design_Decision_Log_v${v}_Official_Release.docx`;
const DS = "docs/official/02_CueScore_Design_System_v2.1_Official_Release.docx";

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

test("numbering: Decision 033 and Official 112 are published once; Official 109 stays reserved; highest Official number is 120 (119 / 120 = Decision 037; 117 / 118 = Decision 036; 115 / 116 = Decision 035; 113 / 114 = Decision 034)", () => {
  const numbers = fs.readdirSync(new URL("docs/official/", root)).filter(name => /^\d+_.*\.md$/.test(name)).map(name => Number(name.split("_")[0]));
  for (const number of [110, 111, 112]) assert.equal(numbers.filter(value => value === number).length, 1, `Official ${number}`);
  assert.ok(!numbers.includes(109), "Official 109 (Glossary) must not exist");
  assert.equal(Math.max(...numbers), 120);
  assert.equal((docxText(LOG("2.9")).match(/Decision 033｜/g) || []).length, 1);
  assert.ok(!docxText(LOG("2.8")).includes("Decision 033"), "the preserved v2.8 must not contain Decision 033");
  assert.match(read(DECISION), /\*\*Decision number:\*\* \*\*Decision 033\*\*/);
  assert.match(read(DECISION), /Official 109 は Localization Glossary 用に予約済み/);
});

test("existing Decisions are preserved: v2.8 untouched, v2.9 keeps Decision 001-032 byte-identical and ids run 001..033", () => {
  assert.ok(exists(LOG("2.7")) && exists(LOG("2.8")) && exists(LOG("2.9")));
  const x28 = readZipEntry(LOG("2.8"), "word/document.xml"), x29 = readZipEntry(LOG("2.9"), "word/document.xml");
  assert.ok(x29.includes(decisionBlock(x28)), "Decision 001-032 of v2.8 must be contained unchanged in v2.9");
  const ids = [...docxText(LOG("2.9")).matchAll(/Decision (\d{3})｜/g)].map(match => Number(match[1]));
  assert.deepEqual(ids, Array.from({ length: 33 }, (_, index) => index + 1));
  const text = docxText(LOG("2.9"));
  assert.match(text, /Decision 014｜Settingsから低頻度・低重要度要素を削減/);
  assert.match(text, /Decision 032｜Settings Unified Design/);
  assert.doesNotMatch(text, /Release Candidate/);
  assert.match(readZipEntry(LOG("2.9"), "word/footer1.xml"), /Official Release \| 2026-10-12/);
  assert.match(text, /CueScore Official Design Decision Log v2\.9/);
});

test("Official 110 / 111 are preserved unchanged (content hash) and AC-SU-10 keeps its original wording", () => {
  assert.equal(sha256(O110).slice(0, 16), "5c1b4f0d92d923e7", "Official 110 must be unchanged");
  assert.equal(sha256(O111).slice(0, 16), "6425859f862091ec", "Official 111 must be unchanged");
  assert.match(read(O111), /\| AC-SU-10 \| 文字サイズ拡大（Dynamic Type 相当）時の安全なスクロール（\*\*NOT VERIFIED。実装 Gate で必須\*\*） \|/);
  const decision = read(DECISION);
  assert.match(decision, /\*\*Official 111 は改変せず保全する。\*\* 本 Decision は、Official 111 に対する\*\*後続 Decision\*\*/);
  assert.match(decision, /AC-SU-10 の行を削除・skip・弱体化しない/);
});

test("DT-1: automatic linking is Deferred for v1.2 line and P1; future work needs a separate Decision; accessibility is not declared unnecessary", () => {
  const decision = read(DECISION);
  assert.match(decision, /現行の v1\.2 系および多言語化 P1 では実装しない。Later \/ Deferred とする/);
  assert.match(decision, /将来の対応は、\*\*別の Decision で判断する\*\*/);
  assert.match(decision, /アクセシビリティ対応を不要と判断したのではない/);
  for (const reason of ["レイアウト安定性", "3 言語対応を優先", "不要な UI 変更を増やさない"]) assert.ok(decision.includes(reason), reason);
});

test("DT-2: automatic linking, display safety on enlargement, and Design System requirements are distinguished; Deferred is never recorded as PASS", () => {
  const decision = read(DECISION);
  assert.match(decision, /\| ① 自動連動機能の実装[^\n]*\*\*Deferred（Later）\*\*[^\n]*PASS とは記録しない/);
  assert.match(decision, /\| \*\*AC-SU-10a\*\* \| Dynamic Type 自動連動[^\n]*\*\*DEFERRED（Later）\*\*[^\n]*\*\*PASS ではない\*\*/);
  assert.match(decision, /\| \*\*AC-SU-10b\*\* \|[^\n]*CSS 疑似拡大 36 条件 PASS[^\n]*NOT VERIFIED/);
  assert.match(decision, /実際の iOS Dynamic Type 対応を PASS と記録しない/);
  assert.match(decision, /3 言語 × 3 viewport（390×844、375×812、320×568）= \*\*36 条件\*\*/);
  // any line mentioning AC-SU-10 together with PASS must carry a qualifier
  for (const line of decision.split("\n")) {
    if (/AC-SU-10/.test(line) && /PASS/.test(line)) assert.match(line, /ではない|NOT VERIFIED|疑似拡大|PASS にする|PASS に変更|PASS としない|意味しない/, line);
  }
  assert.doesNotMatch(decision, /Dynamic Type 対応は PASS である|対応済み機能である/);
});

test("Design System v2.1 accessibility requirements are preserved in the Official file and named as preserved in Decision 033", () => {
  const ds = docxText(DS);
  assert.match(ds, /200%相当まで主要内容を欠落させない/);
  assert.match(ds, /DS-REQ-034/);
  assert.match(ds, /Dynamic Type拡大時に主要操作または主要値を切り捨ててはならない/);
  assert.match(ds, /Dynamic Type拡大時は固定高を解除し、折返しと縦方向拡張を許可する/);
  const decision = read(DECISION);
  assert.match(decision, /削除・弱体化・改変しない/);
  for (const text of ["DS-REQ-034", "DS-REQ-033", "§14", "200% 相当まで主要内容を欠落させない"]) assert.ok(decision.includes(text), text);
});

test("DT-3: Larger Text is not declared as supported in the App Store until implemented and verified", () => {
  const decision = read(DECISION);
  assert.match(decision, /Larger Text（文字サイズ拡大）対応を未実装の状態で、App Store の対応済み機能として申告しない/);
  assert.match(docxText(LOG("2.9")), /Larger Text 対応を未実装の状態で、App Store の対応済み機能として申告しない/);
  assert.match(read("docs/README.md"), /Larger Text support must not be declared as supported in the App Store/);
});

test("SSOT, README and handoff record the publication without claiming Dynamic Type support", () => {
  const readme = read("docs/README.md");
  assert.match(readme, /7\. `official\/07_CueScore_Official_Design_Decision_Log_v2\.13_Official_Release\.docx`/);
  assert.match(readme, /- `official\/112_CueScore_Dynamic_Type_Deferral_Decision\.md`/);
  assert.match(readme, /v2\.9 adds Decision 033/);
  assert.doesNotMatch(readme, /official\/109_/);
  const state = read("docs/CURRENT_STATE.md");
  assert.match(state, /^## CueScore Dynamic Type Deferral Official Decision Published（2026年10月12日）/m);
  assert.match(state, /実際の iOS Dynamic Type 対応は PASS と記録しない/);
  assert.match(state, /^## CueScore Settings Unified Design Official Decision Published（2026年10月12日）/m);
  assert.match(read("docs/CURRENT_STATUS.md"), /Dynamic Type Gate: `CUESCORE DYNAMIC TYPE — DEFERRED DECISION FORMALIZED`/);
  assert.match(read("docs/CURRENT_STATUS.md"), /実際の iOS Dynamic Type 対応: PASS ではない/);
  for (const file of ["docs/handoff/CURRENT_DECISION.md", "docs/handoff/CURRENT_REPORT.md"]) {
    assert.match(read(file), /CUESCORE-DYNAMIC-TYPE-DEFERRED-DECISION-20261012/);
    assert.match(read(file), /CUESCORE-SETTINGS-UNIFIED-DESIGN-OFFICIAL-DECISION-20261012/);
    assert.match(read(file), /CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009/);
  }
  assert.ok(exists("docs/implementation/CueScore_Dynamic_Type_Deferral_Official_Release_2026-10-12.md"));
});

test("no existing or new test is skipped, todo'd or only-focused (no weakening)", () => {
  const offenders = [];
  for (const name of fs.readdirSync(new URL("tests/", root)).filter(file => file.endsWith(".test.mjs"))) {
    const source = read(`tests/${name}`);
    if (/\b(?:test|it|describe)\.(?:skip|todo|only)\(|\{\s*(?:skip|todo|only)\s*:\s*(?:true|["'`])/.test(source)) offenders.push(name);
  }
  assert.deepEqual(offenders, []);
  // the Localization documentation test keeps all of its original assertions' titles
  const titles = [...read("tests/localization-official-docs.test.mjs").matchAll(/^test\("([^"]+)"/gm)].map(match => match[1]);
  assert.ok(titles.length >= 7, "all original Localization documentation tests remain");
});

test("protected scope: S-B is never true, Settings R implementation markers and P1 boundary are not touched by this decision", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1\s*=\s*true/);
  const decision = read(DECISION);
  for (const text of ["Settings R の実装", "S-B は条件付きのまま", "P1 は未完成・未 commit", "Official 110 / 111", "Decision 014・032"]) assert.ok(decision.includes(text), text);
});
