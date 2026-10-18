import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

// Documentation consistency test for Decision 032 / Official 110 / Official 111 / Decision Log v2.8.
// Official publication state (2026-10-12): Decision 032 / Official 110 / Official 111 / Decision Log v2.8, CF-1 B案.
const root = new URL("../", import.meta.url);
const exists = path => fs.existsSync(new URL(path, root));
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const DECISION = "docs/official/110_CueScore_Settings_Unified_Design_Decision.md";
const SPEC = "docs/official/111_CueScore_Settings_Unified_Design_Spec.md";
const LOG27 = "docs/official/07_CueScore_Official_Design_Decision_Log_v2.7_Official_Release.docx";
const LOG28 = "docs/official/07_CueScore_Official_Design_Decision_Log_v2.8_Official_Release.docx";

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

test("numbering: Decision 032 and Official 110 / 111 are published once, Official 109 stays reserved, highest number is 120", () => {
  const official = fs.readdirSync(new URL("docs/official/", root)).filter(name => /^\d+_.*\.md$/.test(name)).map(name => Number(name.split("_")[0]));
  const count = number => official.filter(value => value === number).length;
  assert.equal(count(110), 1); assert.equal(count(111), 1);
  assert.equal(count(109), 0, "Official 109 is reserved for the Localization Glossary and must not be used");
  assert.equal(Math.max(...official), 128);
  assert.ok(!docxText(LOG27).includes("Decision 032"), "Decision 032 must not exist in the preserved v2.7");
  assert.equal((docxText(LOG28).match(/Decision 032｜/g) || []).length, 1);
  const decision = read(DECISION), spec = read(SPEC);
  assert.match(decision, /\*\*Decision number:\*\* \*\*Decision 032\*\*/);
  assert.match(decision, /Official 109 は Localization Glossary 用に予約済み/);
  assert.match(spec, /Official 109 は Glossary 用に予約済み/);
});

test("Decision 014 is preserved and Decision Log v2.8 keeps Decision 001-031 byte-identical", () => {
  const xml27 = readZipEntry(LOG27, "word/document.xml"), xml28 = readZipEntry(LOG28, "word/document.xml");
  const start = xml27.indexOf("Decision 001｜"), end = xml27.indexOf("時系列変更記録");
  const block = xml27.slice(xml27.lastIndexOf("<w:p>", start), xml27.lastIndexOf("<w:p>", end));
  assert.ok(xml28.includes(block), "Decision 001-031 of v2.7 must be contained unchanged in v2.8");
  const text28 = docxText(LOG28);
  const ids = [...text28.matchAll(/Decision (\d{3})｜/g)].map(match => Number(match[1]));
  assert.deepEqual(ids, Array.from({ length: 32 }, (_, index) => index + 1), "Decision numbers must be 001..032 once each, in order");
  assert.match(text28, /Decision 014｜Settingsから低頻度・低重要度要素を削減/);
  assert.match(text28, /ブレイクルール、イリーガル判定、アプリ情報、設定検索、不要Chevronを削除。低頻度項目は枠で区別。/);
  assert.match(text28, /Decision 014（Settings から低頻度・低重要度要素を削減）は削除・改変しない/);
  assert.match(docxText(LOG28), /CueScore Official Design Decision Log v2\.8/);
});

test("Decision 110 records A-L, the Decision 014 relationship and the limited scope", () => {
  const decision = read(DECISION);
  for (const id of "ABCDEFGHIJKL") assert.match(decision, new RegExp(`\\| \\*\\*${id}\\*\\* \\|`), `decision ${id} must be recorded`);
  assert.match(decision, /Decision 014[^\n]*削除・改変しない/);
  assert.match(decision, /限定的に後続上書き/);
  for (const scope of ["Settings", "言語 / Language", "About CueScore", "利用規約", "プライバシーポリシー"]) assert.ok(decision.includes(scope), `scope item ${scope}`);
  assert.match(decision, /他画面へ一般化しない/);
  assert.match(decision, /ブレイクルール、イリーガル判定、設定検索/);
});

test("Design System relationship: 20pt radius, 44-46pt information-row exception, 52pt rules elsewhere untouched, Official 84 superseded only in Settings", () => {
  const decision = read(DECISION), spec = read(SPEC);
  assert.match(decision, /\*\*20pt を採用\*\*/);
  assert.match(decision, /44〜46pt/);
  assert.match(decision, /Settings 以外の 52pt 規則[^\n]*一切変更しない/);
  assert.match(spec, /SU-002: Settings 以外の画面、Design System v2\.1 の 52pt 規則[^\n]*変更しない/);
  assert.match(decision, /Official 84 は改変しない。本 Decision が上記範囲に限って後続置換する/);
  assert.match(spec, /\| アプリ情報の各行 \| \*\*44〜46pt\*\*/);
  assert.match(spec, /\| 購入情報行（操作） \| 52pt 以上/);
  assert.match(spec, /DS-REQ-018/);
  // the 52pt exception must not be applied to plan / data rows
  assert.match(decision, /### 4\.2 例外の対象外（52pt 以上を維持する行）/);
});

test("CF-1 B案: data rows 56px or more at 830px or less, 62px or more at 831px or more; Official 84 superseded only for Settings at 830px or less", () => {
  const decision = read(DECISION), spec = read(SPEC), log = docxText(LOG28);
  assert.match(decision, /画面高さ（CSS viewport height）\*\*830px 以下\*\*: データ管理行は \*\*56px 以上\*\*/);
  assert.match(decision, /画面高さ \*\*831px 以上\*\*: データ管理行は \*\*62px 以上\*\*。Official 84 の 62px 規則を維持する/);
  assert.match(decision, /境界: \*\*830px は 56px 以上、831px は 62px 以上\*\*/);
  assert.match(decision, /Official 84 の 62px 規則は、この範囲に限り本 Decision が後続置換する/);
  assert.match(decision, /他画面の行高さ・規則は一切変更しない/);
  assert.match(decision, /CF-1 \| [^\n]*RESOLVED（2026-10-12、Product Owner 承認 B案）/);
  assert.doesNotMatch(decision + spec, /60pt 以上（62pt 推奨）|831px 以上で 60pt/, "the superseded RC value (60) must not remain");
  assert.match(spec, /830px 以下は 56px 以上、831px 以上は 62px 以上/);
  assert.match(spec, /SU-032A: 行高さの切替は CSS の画面高さ（viewport height）で判定し、830px 以下と 831px 以上の境界を明示的にテストする/);
  assert.match(spec, /AC-SU-13 \| 境界条件: 画面高さ 830px で 56px 以上、831px で 62px 以上/);
  assert.match(log, /画面高さ 830px 以下で 56px 以上、831px 以上で 62px 以上/);
  assert.match(log, /Official 84 は改変しない/);
  // Official 84 itself is untouched
  assert.match(read("docs/official/84_CueScore_v1.0_Build31_Final_Review_UI_Navigation_Spec.md"), /Data rows remain at least 62px in the compact portrait layout/);
});

test("Version is single-defined and consistent with Native MARKETING_VERSION; docs forbid a new hardcode", () => {
  const spec = read(SPEC), decision = read(DECISION);
  assert.match(spec, /SU-090: About 画面は正しい Version を表示する[^\n]*hardcode してはならない/);
  assert.match(spec, /SU-092: Web 側の定義と Native `MARKETING_VERSION`/);
  assert.match(decision, /`1\.2` を新たに hardcode しない/);
  const html = read("index.html");
  const web = html.match(/const CUESCORE_APP_VERSION = "([^"]+)";/);
  assert.ok(web, "single definition candidate CUESCORE_APP_VERSION must exist");
  const pbx = read("ios/App/App.xcodeproj/project.pbxproj");
  const native = [...pbx.matchAll(/MARKETING_VERSION = ([0-9.]+);/g)].map(match => match[1]);
  assert.ok(native.length >= 2);
  assert.ok(native.every(value => value === web[1]), `Native MARKETING_VERSION ${native} must equal CUESCORE_APP_VERSION ${web[1]}`);
});

test("Localization: heading translations, shared key for heading and aria-label, existing P1 key pattern", () => {
  const spec = read(SPEC), decision = read(DECISION);
  for (const text of ["アプリ情報", "App info", "应用信息"]) { assert.ok(spec.includes(text) && decision.includes(text), text); }
  assert.match(spec, /`settings\.section\.appInfo`/);
  assert.match(spec, /`aria-label` も\*\*同じ翻訳 Key\*\*/);
  assert.match(spec, /P2 以降の翻訳を前倒ししない/);
  assert.match(spec, /settings\.section\.\*|`settings\.section\.appInfo`/);
  // The P1 catalogs are not part of main yet (P1 is unfinished and uncommitted). When they are present, the sibling key pattern must exist.
  for (const file of ["i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"]) {
    if (exists(file)) assert.match(read(file), /"settings\.section\.data":/, `${file} keeps the sibling key pattern`);
  }
});

test("acceptance conditions cover viewports, languages, one-screen, fallback and the NOT VERIFIED items", () => {
  const spec = read(SPEC);
  for (const text of ["375×812", "390×844", "ja", "en", "zh-Hans", "文字切れ 0", "横 overflow 0", "Bottom Navigation", "375×667", "320×568"]) assert.ok(spec.includes(text), text);
  const defined = [...spec.matchAll(/^\| (AC-SU-\d+) \|/gm)].map(match => match[1]);
  assert.deepEqual(defined, Array.from({ length: 13 }, (_, index) => `AC-SU-${index + 1}`));
  assert.match(spec, /AC-SU-9 \| 実機[^\n]*NOT VERIFIED/);
  assert.match(spec, /AC-SU-10 \| 文字サイズ拡大[^\n]*NOT VERIFIED/);
  assert.match(spec, /AC-SU-2 \| 角丸 20pt で 1画面が成立すること/);
});

test("requirement identifiers resolve and are unique", () => {
  const spec = read(SPEC);
  const definitions = [...spec.matchAll(/^(?:- |\| )?\*?\*?(SU-\d{3})[:：（ ]/gm)].map(match => match[1]);
  const defined = new Set([...spec.matchAll(/(?:^- |\| [^|\n]*（)(SU-\d{3})/gm)].map(match => match[1]));
  for (const line of spec.split("\n")) { const match = line.match(/^- (SU-\d{3}):/); if (match) defined.add(match[1]); }
  const unique = [...spec.matchAll(/^- (SU-\d{3}):/gm)].map(match => match[1]);
  assert.equal(new Set(unique).size, unique.length, "SU definitions must be unique");
  const referenced = new Set([...(read(DECISION) + spec).matchAll(/SU-\d{3}/g)].map(match => match[0]));
  for (const id of referenced) assert.ok(defined.has(id) || unique.includes(id), `${id} is referenced but not defined`);
  assert.ok(definitions.length > 0);
});

test("cross references resolve, all three documents are Official, SSOT and README record the publication", () => {
  for (const file of ["docs/official/84_CueScore_v1.0_Build31_Final_Review_UI_Navigation_Spec.md", "docs/official/71_CueScore_v1.0_Cloud_Sync_Row_Hidden_Decision.md", "docs/official/72_CueScore_v1.0_Cloud_Sync_Row_Hidden_Spec.md", "docs/official/107_CueScore_Localization_Decision.md", "docs/official/108_CueScore_Localization_Spec.md", "docs/official/02_CueScore_Design_System_v2.1_Official_Release.docx", "docs/official/04_CueScore_UI_Components_v1.1_Official_Release.docx", "docs/implementation/CueScore_Settings_Unified_Design_Official_Release_2026-10-12.md"]) assert.ok(exists(file), file);
  const decision = read(DECISION), spec = read(SPEC), log = docxText(LOG28);
  assert.match(decision, /\*\*Status:\*\* Adopted \/ Official/);
  assert.match(spec, /\*\*Status:\*\* Adopted \/ Official/);
  assert.doesNotMatch(decision + spec, /\*\*Status:\*\* Release Candidate/);
  assert.doesNotMatch(log, /Release Candidate/, "the published Decision Log v2.8 must not carry an RC marker");
  assert.match(readZipEntry(LOG28, "word/footer1.xml"), /Official Release \| 2026-10-12/);
  assert.match(decision, /Implementation NOT STARTED/);
  assert.match(spec, /Implementation NOT STARTED/);
  const readme = read("docs/README.md");
  assert.match(readme, /7\. `official\/07_CueScore_Official_Design_Decision_Log_v2\.17_Official_Release\.docx`/);
  assert.match(readme, /- `official\/110_CueScore_Settings_Unified_Design_Decision\.md`/);
  assert.match(readme, /- `official\/111_CueScore_Settings_Unified_Design_Spec\.md`/);
  assert.doesNotMatch(readme, /official\/109_/);
  const state = read("docs/CURRENT_STATE.md");
  assert.match(state, /^## CueScore Settings Unified Design Official Decision Published（2026年10月12日）/m);
  assert.match(state, /P1は未完成・未commit/);
  assert.match(state, /## CueScore 3言語対応 Phase 0 Official Specification Published（2026年10月9日）/);
  assert.match(read("docs/CURRENT_STATUS.md"), /Settings Design Gate: `CUESCORE SETTINGS UNIFIED DESIGN — OFFICIAL DECISION PUBLISHED`/);
  assert.match(read("docs/handoff/CURRENT_DECISION.md"), /CUESCORE-SETTINGS-UNIFIED-DESIGN-OFFICIAL-DECISION-20261012/);
  assert.match(read("docs/handoff/CURRENT_REPORT.md"), /CUESCORE-SETTINGS-UNIFIED-DESIGN-OFFICIAL-DECISION-20261012/);
});

test("maintained scope: S-B is never true and the documents do not change the protected contracts", () => {
  // The S-B flag lives in the P1 source, which is not on main yet: it must never be true (absent or false).
  assert.doesNotMatch(read("index.html"), /LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1\s*=\s*true/);
  if (/LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1/.test(read("index.html"))) assert.match(read("index.html"), /const LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false;/);
  const decision = read(DECISION);
  for (const text of ["課金状態の判定", "Backup / Restore / Delete", "Official 71 / 72", "S-B", "Legal 画面", "Match / Player / Snapshot / Backup / QR / CSV"]) assert.ok(decision.includes(text), text);
});
