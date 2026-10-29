import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

// Decision 046 / Official 134 / 135 / Decision Log v2.22 / Design System v2.2 / UI Components v1.2 (documentation publication of the PO-approved Shot Clock B4).
const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
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

const LOG = "docs/official/07_CueScore_Official_Design_Decision_Log_v2.22_Official_Release.docx";
const text = path => readZipEntry(path, "word/document.xml").replace(/<[^>]+>/g, "");
const decision = read("docs/official/134_CueScore_Shot_Clock_B4_Manual_Dock_Decision.md");
const spec = read("docs/official/135_CueScore_Shot_Clock_B4_Manual_Dock_Spec.md");

test("Official 134 and 135 are published exactly once (Decision 047 later adds 136 / 137 as the highest)", () => {
  const nums = fs.readdirSync(new URL("docs/official/", root)).filter(n => /^\d+_.*\.md$/.test(n)).map(n => Number(n.split("_")[0]));
  for (const n of [134, 135]) assert.equal(nums.filter(v => v === n).length, 1, String(n));
  assert.equal(Math.max(...nums), 137);
  for (const n of [136, 137]) assert.equal(nums.filter(v => v === n).length, 1, String(n));
  assert.equal(nums.filter(v => v === 109).length, 1);
  assert.match(decision, /Decision 046/);
  assert.match(spec, /Official 134（Decision 046）/);
});

test("Decision Log v2.22 records Decision 046 once, keeps v2.21 as the preceding release and Decisions 001-045 contiguous", () => {
  const t = text(LOG);
  assert.equal((t.match(/Decision 046｜/g) || []).length, 1);
  assert.deepEqual([...t.matchAll(/Decision (\d{3})｜/g)].map(m => Number(m[1])), Array.from({ length: 46 }, (_, i) => i + 1));
  assert.match(t, /Version 2\.22/);
  assert.match(t, /D046-2：ボール入力、ファール、セーフティ、プレーヤー交代、Undo、ラック終了、試合終了と連動しない/);
  const prev = text("docs/official/07_CueScore_Official_Design_Decision_Log_v2.21_Official_Release.docx");
  assert.ok(!prev.includes("Decision 046"), "the preserved v2.21 must not contain Decision 046");
  const readme = read("docs/README.md");
  assert.match(readme, /7\. `official\/07_CueScore_Official_Design_Decision_Log_v2\.22_Official_Release\.docx`/);
  assert.match(readme, /2\. `official\/02_CueScore_Design_System_v2\.2_Official_Release\.docx`/);
  assert.match(readme, /4\. `official\/04_CueScore_UI_Components_v1\.2_Official_Release\.docx`/);
  assert.match(readme, /official\/134_CueScore_Shot_Clock_B4_Manual_Dock_Decision\.md/);
  assert.match(readme, /official\/135_CueScore_Shot_Clock_B4_Manual_Dock_Spec\.md/);
});

test("Design System v2.2 and UI Components v1.2 add the shot-clock-only addendum and preserve v2.1 / v1.1", () => {
  const ds = text("docs/official/02_CueScore_Design_System_v2.2_Official_Release.docx");
  for (const id of ["T1", "T2", "T3", "T4", "DS-REQ-053", "DS-REQ-054"]) assert.ok(ds.includes(id), id);
  assert.match(ds, /ログ表示は0行になる/);
  assert.match(ds, /実機200% PASS/);
  assert.ok(!text("docs/official/02_CueScore_Design_System_v2.1_Official_Release.docx").includes("DS-REQ-053"));
  const ui = text("docs/official/04_CueScore_UI_Components_v1.2_Official_Release.docx");
  for (const id of ["UIC-REQ-050", "UIC-REQ-051", "UIC-REQ-052"]) assert.ok(ui.includes(id), id);
  assert.ok(!text("docs/official/04_CueScore_UI_Components_v1.1_Official_Release.docx").includes("UIC-REQ-050"));
});

test("Official 134 / 135 fix the approved B4 behaviour and keep the 20 terms CANDIDATE with Official 109 unchanged", () => {
  for (const phrase of ["連動しない", "45秒", "30／35／40／45／60", "回数制限なし", "3秒", "既定OFF", "Free／Pro共通", "セット方式", "Deferred"]) assert.ok((decision + spec).includes(phrase), phrase);
  for (const id of Array.from({ length: 12 }, (_, i) => `AC-SC${i + 1}`)) assert.match(spec, new RegExp(`\\| ${id} \\|`));
  const terms = [...spec.matchAll(/^\| SC(\d{2}) \|/gm)].map(m => m[1]);
  assert.deepEqual(terms, Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0")));
  assert.match(spec, /全語 `CANDIDATE`/);
  assert.ok(!/\bAPPROVED\b[^\n]*SC\d\d/.test(spec));
  assert.match(spec, /出杆计时器/); assert.match(spec, /已暂停/); assert.match(spec, /Undo −60/);
  const glossary = read("docs/official/109_CueScore_Localization_Glossary.md");
  assert.match(glossary, /`CANDIDATE`: 0/);
  assert.ok(!glossary.includes("出杆计时器"), "Official 109 must stay unchanged");
});
