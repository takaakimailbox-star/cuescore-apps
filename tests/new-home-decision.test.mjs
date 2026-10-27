import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

// Decision 045 / Official 132 / 133 / Decision Log v2.21 (documentation publication of the PO-adopted New Home).
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

const LOG = "docs/official/07_CueScore_Official_Design_Decision_Log_v2.21_Official_Release.docx";
const decision = read("docs/official/132_CueScore_v1.3_New_Home_Six_Discipline_Grid_Decision.md");
const spec = read("docs/official/133_CueScore_v1.3_New_Home_Six_Discipline_Grid_Spec.md");

test("Official 132 and 133 are published exactly once and are the highest Official numbers", () => {
  const nums = fs.readdirSync(new URL("docs/official/", root)).filter(n => /^\d+_.*\.md$/.test(n)).map(n => Number(n.split("_")[0]));
  for (const n of [132, 133]) assert.equal(nums.filter(v => v === n).length, 1, String(n));
  assert.equal(Math.max(...nums), 135);
  assert.match(decision, /Decision 045/);
  assert.match(spec, /Official 132（Decision 045）/);
});

test("Decision Log v2.21 records Decision 045 once and keeps v2.20 as the preceding release", () => {
  const text = readZipEntry(LOG, "word/document.xml").replace(/<[^>]+>/g, "");
  assert.equal((text.match(/Decision 045｜/g) || []).length, 1);
  assert.match(text, /Version 2\.21/);
  assert.match(text, /D045-1：Homeは/);
  assert.ok(fs.existsSync(new URL("docs/official/07_CueScore_Official_Design_Decision_Log_v2.20_Official_Release.docx", root)), "v2.20 stays as the preceding release");
  const prev = readZipEntry("docs/official/07_CueScore_Official_Design_Decision_Log_v2.20_Official_Release.docx", "word/document.xml").replace(/<[^>]+>/g, "");
  assert.ok(!prev.includes("Decision 045"), "the preserved v2.20 must not contain Decision 045");
  const readme = read("docs/README.md");
  assert.match(readme, /7\. `official\/07_CueScore_Official_Design_Decision_Log_v2\.22_Official_Release\.docx`/);
  assert.match(readme, /official\/132_CueScore_v1\.3_New_Home_Six_Discipline_Grid_Decision\.md/);
  assert.match(readme, /official\/133_CueScore_v1\.3_New_Home_Six_Discipline_Grid_Spec\.md/);
});

test("Official 133 fixes the six-discipline order, the adopted icons and the acceptance conditions", () => {
  const rows = [...spec.matchAll(/^\| (\d) \| (上段・左|上段・右|中段・左|中段・右|下段・左|下段・右) \| `([A-Za-z0-9]+)` \| ([^|]+) \| `assets\/icons\/games\/([^`]+)` \|$/gm)].map(m => [m[1], m[2], m[3], m[4].trim(), m[5]]);
  assert.deepEqual(rows, [
    ["1", "上段・左", "9ball", "9-Ball", "game-9ball.svg"],
    ["2", "上段・右", "10ball", "10-Ball", "game-10ball.svg"],
    ["3", "中段・左", "jpa9", "JPA 9-Ball", "game-jpa-9ball.svg"],
    ["4", "中段・右", "rotation", "Rotation", "game-rotation.svg"],
    ["5", "下段・左", "straightPool", "14-1", "game-14-1.svg"],
    ["6", "下段・右", "threeCushion", "3 Cushion", "game-3cushion.svg"],
  ]);
  for (const id of Array.from({ length: 12 }, (_, i) => `AC-H${i + 1}`)) assert.match(spec, new RegExp(`\\| ${id} \\|`));
  assert.match(spec, /左上に別の戻るボタンは追加しない|追加しない: 左上の別の戻るボタン/);
});
