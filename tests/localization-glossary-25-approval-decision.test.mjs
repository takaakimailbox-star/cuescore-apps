import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const sha256 = path => crypto.createHash("sha256").update(fs.readFileSync(new URL(path, root))).digest("hex");
const D = "docs/official/127_CueScore_Localization_Glossary_25_Terms_Approval_Decision.md";
const S = "docs/official/128_CueScore_Localization_Glossary_25_Terms_Approval_Spec.md";
const LOG = version => `docs/official/07_CueScore_Official_Design_Decision_Log_v${version}_Official_Release.docx`;

function zipEntry(path, name) {
  const buffer = fs.readFileSync(new URL(path, root));
  let end = -1;
  for (let i = buffer.length - 22; i >= 0; i -= 1) if (buffer.readUInt32LE(i) === 0x06054b50) { end = i; break; }
  const count = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  for (let index = 0; index < count; index += 1) {
    const method = buffer.readUInt16LE(offset + 10);
    const compressed = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const local = buffer.readUInt32LE(offset + 42);
    if (buffer.toString("utf8", offset + 46, offset + 46 + nameLength) === name) {
      const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      const data = buffer.subarray(start, start + compressed);
      return (method === 0 ? data : zlib.inflateRawSync(data)).toString("utf8");
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error(name);
}

const docxText = path => zipEntry(path, "word/document.xml").replace(/<[^>]+>/g, "");

test("Decision 041 / Official 127-128 are uniquely published while Official 109 stays reserved", () => {
  const numbers = fs.readdirSync(new URL("docs/official/", root))
    .filter(name => /^\d+_.*\.md$/.test(name))
    .map(name => Number(name.split("_")[0]));
  for (const number of [127, 128]) assert.equal(numbers.filter(value => value === number).length, 1, String(number));
  assert.equal(numbers.filter(value => value === 109).length, 1);
  assert.equal(Math.max(...numbers), 135);
  const latest = docxText(LOG("2.17"));
  assert.deepEqual([...latest.matchAll(/Decision (\d{3})｜/g)].map(match => Number(match[1])), Array.from({ length: 41 }, (_, index) => index + 1));
  assert.match(latest, /Decision 041｜多言語化 Glossary 25語のPO承認記録/);
  assert.doesNotMatch(docxText(LOG("2.16")), /Decision 041/);
});

test("the approved ledger has exactly 25 IDs and cannot include G14 or G25", () => {
  const spec = read(S);
  const ids = [...spec.matchAll(/^\| (G\d{2}) \|/gm)].map(match => match[1]);
  const approved = ids.slice(0, 25);
  assert.deepEqual(approved, [
    "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12", "G13",
    "G15", "G16", "G17", "G18", "G19", "G20", "G21", "G22", "G23", "G24", "G26", "G27",
  ]);
  assert.equal(new Set(approved).size, 25);
  assert.ok(!approved.includes("G14"));
  assert.ok(!approved.includes("G25"));
});

test("G14 and G25 remain PENDING and Official 109 remains unpublished", () => {
  const all = `${read(D)}\n${read(S)}`;
  assert.match(all, /G14.*G25.*PENDING/s);
  assert.match(all, /Official 109.*未発行/s);
  assert.match(all, /人間の独立レビュー.*未実施/s);
  assert.match(all, /NOT VERIFIED/);
  assert.match(read(S), /^\| G14 \|[^\n]+\| PENDING \|/m);
  assert.match(read(S), /^\| G25 \|[^\n]+\| PENDING \|/m);
});

test("catalog, product source, P4 approval record and Data/QR source are byte-preserved", () => {
  const expected = {
    "index.html": "27ed1c4fd0a074b2a5b0c35f09e61ab92add52f87f1f05827722c6f11fbf2f76",
    "i18n-catalog-ja-v1.js": "bfe2b3b0cd0a1734ebc259128dc5dade248d95f26f89a80a5465cd106e143a39",
    "i18n-catalog-en-v1.js": "27f3bed6c3e6988482e6c91367e782eb83d5caa73076e90ecdc99f36da992e2c",
    "i18n-catalog-zh-hans-v1.js": "224c1f96c57d22c77fb164558ffd1eecfb570f8c6c27d5cd372c3f03c5c381e6",
    "match-sharing-adapters-v1.js": "f10ac88ee5ba7317b75b4ba5f11d654bb2547503c6b15df783e7be0cb8170ea5",
    "match-sharing-validation-v1.js": "4399a8a63818ce2a687a78dc5fb2c157e2f239f71f2f44f36463cc75cace1aee",
    "tests/fixtures/p4/po-approval.json": "a06df95336c6961647504755600ccfeb60efd2b53e5e71696cace6fe468f599b",
  };
  for (const [path, digest] of Object.entries(expected)) assert.equal(sha256(path), digest, path);
});

test("SSOT preserves the Decision 041 record after v2.18 publication and contains no credential material", () => {
  const readme = read("docs/README.md");
  assert.match(readme, /Decision_Log_v2\.22_Official_Release/);
  assert.match(readme, /Decision 041/);
  assert.match(read("docs/CURRENT_STATE.md"), /Glossary 25 Terms PO Approval Published/);
  assert.match(read("docs/CURRENT_STATUS.md"), /GLOSSARY 25 TERMS FORMALIZED/);
  assert.doesNotMatch(`${read(D)}\n${read(S)}`, /ghp_[A-Za-z0-9]{20}|PRIVATE KEY|takaaki\.mailbox/i);
});
