import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const exists = path => fs.existsSync(new URL(path, root));

const DECISION = "docs/official/107_CueScore_Localization_Decision.md";
const SPEC = "docs/official/108_CueScore_Localization_Spec.md";
const LOG26 = "docs/official/07_CueScore_Official_Design_Decision_Log_v2.6_Official_Release.docx";
const LOG27 = "docs/official/07_CueScore_Official_Design_Decision_Log_v2.7_Official_Release.docx";
const GLOSSARY = "docs/proposals/CueScore_Localization_Glossary_DRAFT_2026-10-08.md";

// Minimal ZIP reader (central directory + raw deflate) so the test has no external dependency.
function readZipEntry(path, name) {
  const buffer = fs.readFileSync(new URL(path, root));
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  assert.ok(eocd >= 0, `${path}: end of central directory not found`);
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  for (let index = 0; index < count; index += 1) {
    assert.equal(buffer.readUInt32LE(offset), 0x02014b50, `${path}: bad central directory entry`);
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

test("Official document numbers 107 and 108 are published, unique and 109 is not created", () => {
  assert.ok(exists(DECISION));
  assert.ok(exists(SPEC));
  const names = fs.readdirSync(new URL("docs/official/", root)).filter(name => /^\d+_.*\.md$/.test(name));
  const numbers = names.map(name => Number(name.split("_")[0]));
  for (const number of [107, 108]) {
    assert.equal(numbers.filter(value => value === number).length, 1, `Official ${number} must be unique`);
  }
  assert.ok(!numbers.includes(109), "Official 109 (Glossary) must not exist until the P4 review");
  assert.ok(Math.max(...numbers) === 108, "highest Official md number must be 108");
});

test("Decision Log v2.6 is preserved and v2.7 keeps Decision 001-030 byte-identical", () => {
  assert.ok(exists(LOG26));
  assert.ok(exists(LOG27));
  const xml26 = readZipEntry(LOG26, "word/document.xml");
  const xml27 = readZipEntry(LOG27, "word/document.xml");
  const start = xml26.indexOf("Decision 001｜");
  const end = xml26.indexOf("時系列変更記録");
  assert.ok(start > 0 && end > start);
  const block = xml26.slice(xml26.lastIndexOf("<w:p>", start), xml26.lastIndexOf("<w:p>", end));
  assert.ok(xml27.includes(block), "Decision 001-030 section of v2.6 must be contained unchanged in v2.7");
  const ids = [...docxText(LOG27).matchAll(/Decision (\d{3})｜/g)].map(match => Number(match[1]));
  assert.deepEqual(ids, Array.from({ length: 31 }, (_, index) => index + 1), "Decision numbers must be 001..031 once each, in order");
});

test("Decision Log v2.7 is published as Official Release with Decision 031 and no Release Candidate marker", () => {
  const text = docxText(LOG27);
  assert.match(text, /CueScore Official Design Decision Log v2\.7/);
  assert.match(text, /Decision 031｜CueScore Localization/);
  assert.match(text, /D1：対応言語が端末設定に存在しない場合は日本語へ fallback/);
  assert.match(text, /U10：繁体字中国語/);
  assert.match(text, /Official 107/);
  assert.match(text, /Official 108/);
  assert.doesNotMatch(text, /Release Candidate/);
  assert.match(readZipEntry(LOG27, "word/footer1.xml"), /Official Release \| 2026-10-09/);
});

test("Official 107 and 108 are adopted, not Release Candidates, and keep the conditional and pending items", () => {
  const decision = read(DECISION);
  const spec = read(SPEC);
  for (const text of [decision, spec]) {
    assert.match(text, /^\*\*Status:\*\* Adopted/m);
    assert.doesNotMatch(text, /RELEASE CANDIDATE|NOT OFFICIAL/);
    assert.match(text, /Implementation NOT STARTED/);
  }
  for (let index = 1; index <= 10; index += 1) {
    assert.match(decision, new RegExp(`\\*\\*D${index}\\*\\*`), `D${index} must be listed in Official 107`);
  }
  assert.match(decision, /`\[zh-Hant-TW, en-US\]`/);
  assert.match(spec, /^## Part I — Specification/m);
  assert.match(spec, /^## Part II — Data \/ QR Compatibility Contract/m);
  assert.match(spec, /^## Part III — Test Acceptance Criteria/m);
  assert.match(spec, /^## Part IV — Implementation Phase Plan/m);
  for (const id of ["U3", "U4", "U6", "U8", "U9", "U11"]) {
    assert.match(spec, new RegExp(`\\|\\s*${id}\\s*\\|[^\\n]*DECISION PENDING`), `${id} must remain a Decision Pending item`);
  }
  assert.match(decision, /NOT VERIFIED/);
  assert.match(spec, /S-B/);
});

test("Official 108 requirement identifiers resolve", () => {
  const spec = read(SPEC);
  const defined = (pattern) => new Set([...spec.matchAll(pattern)].map(match => match[1]));
  const referenced = (pattern) => new Set(spec.match(pattern) || []);
  const rows = defined(/\|\s*(U\d{1,2})\s*\|/g);
  for (const id of referenced(/\bU\d{1,2}\b/g)) assert.ok(rows.has(id), `${id} is referenced but not defined`);
  const acceptance = defined(/\|\s*(AC-S?\d+)\s*\|/g);
  for (const id of referenced(/\bAC-S?\d+\b/g)) {
    if (id === "AC-0") continue; // section heading prefix (AC-0.1 .. AC-0.4)
    assert.ok(acceptance.has(id), `${id} is referenced but not defined`);
  }
  const switching = defined(/\|\s*(T-SW-\d+)\s*\|/g);
  for (let index = 1; index <= 10; index += 1) assert.ok(switching.has(`T-SW-${index}`), `T-SW-${index} must be defined`);
  const compatibility = defined(/\|\s*\*\*(V\d)\*\*/g);
  for (let index = 1; index <= 7; index += 1) assert.ok(compatibility.has(`V${index}`), `V${index} must be defined`);
  for (const id of referenced(/\bL-[A-Z0-9]+-\d+\b/g)) {
    assert.match(spec, new RegExp(`(^|\\n)(- |\\| )?\\*{0,2}${id}[^\\n]*`), `${id} must be defined`);
  }
  assert.doesNotMatch(spec, /Spec A|Contract E/);
});

test("README index lists Official 107 / 108 and Decision Log v2.7 and keeps the Glossary a Draft", () => {
  const readme = read("docs/README.md");
  assert.match(readme, /7\. `official\/07_CueScore_Official_Design_Decision_Log_v2\.7_Official_Release\.docx`/);
  assert.match(readme, /Official Design Decision Log v2\.7 is the current official release and successor\s+to v2\.6/);
  assert.match(readme, /- `official\/107_CueScore_Localization_Decision\.md`/);
  assert.match(readme, /- `official\/108_CueScore_Localization_Spec\.md`/);
  assert.doesNotMatch(readme, /official\/109_/);
  assert.match(readme, /proposals\/CueScore_Localization_Glossary_DRAFT_2026-10-08\.md/);
  for (const match of readme.matchAll(/`official\/(10[78]_[^`]+\.md)`/g)) {
    assert.ok(exists(`docs/official/${match[1]}`), `README references a missing file: ${match[1]}`);
  }
});

test("Glossary stays a Draft outside docs/official", () => {
  assert.ok(exists(GLOSSARY));
  assert.ok(!fs.readdirSync(new URL("docs/official/", root)).some(name => /Glossary/i.test(name)));
  const glossary = read(GLOSSARY);
  assert.match(glossary, /\*\*Status:\*\* DRAFT/);
  assert.match(glossary, /Glossary Review Pending/);
  assert.match(glossary, /PENDING/);
});

test("SSOT records the Localization Phase 0 state without removing the Build 84 release record", () => {
  const state = read("docs/CURRENT_STATE.md");
  assert.match(state, /^## CueScore 3言語対応 Phase 0 Official Specification Published（2026年10月9日）/m);
  assert.match(state, /Localization Implementation \*\*NOT STARTED\*\*/);
  assert.match(state, /## Version 1\.2 Build 84 Manual Release（2026年10月4日）/);
  assert.match(state, /Decision 12はLater登録の履歴として維持する/);
  const status = read("docs/CURRENT_STATUS.md");
  assert.match(status, /Localization Gate: `CUESCORE I18N PHASE 0 — OFFICIAL RELEASE PUBLISHED`/);
  assert.match(status, /Current project Version \/ Build: `1\.2 \(84\)`/);
  assert.match(status, /Gate: `RELEASE EXECUTED \/ ASC READY_FOR_SALE \/ PUBLIC PROPAGATION PENDING`/);
  assert.match(read("docs/handoff/CURRENT_DECISION.md"), /CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009/);
  assert.match(read("docs/handoff/CURRENT_REPORT.md"), /CUESCORE-I18N-PHASE0-OFFICIAL-RELEASE-20261009/);
});
