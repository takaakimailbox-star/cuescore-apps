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
const decision = read("docs/official/131_CueScore_Localization_iOS_First_Entry_Language_List_Decision.md");

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

const official130 = "docs/official/130_CueScore_Localization_AC13_VoiceOver_Release_Requirement_Decision.md";

test("Decision 044 and Official 131 are unique; Decision 043 / Official 130 are not reused; Decision Log v2.20 is current", () => {
  const names = fs.readdirSync(new URL("docs/official/", root)).filter(name => /^\d+_.*\.md$/.test(name));
  const numbers = names.map(name => Number(name.split("_")[0]));
  assert.equal(numbers.filter(value => value === 131).length, 1);
  assert.equal(numbers.filter(value => value === 130).length, 1);
  assert.equal(Math.max(...numbers), 139);
  assert.match(decision, /Decision 044/);
  assert.match(decision, /Official 131/);
  assert.match(decision, /Decision 043／Official 130は再利用しない/);
  const log = "docs/official/07_CueScore_Official_Design_Decision_Log_v2.20_Official_Release.docx";
  const text = docxText(log);
  assert.equal((text.match(/Decision 044｜/g) || []).length, 1);
  assert.equal((text.match(/Decision 043｜/g) || []).length, 1);
  assert.deepEqual([...text.matchAll(/Decision (\d{3})｜/g)].map(match => Number(match[1])), Array.from({length: 44}, (_, index) => index + 1));
  assert.ok(docxText("docs/official/07_CueScore_Official_Design_Decision_Log_v2.19_Official_Release.docx").includes("Decision 043｜") && !docxText("docs/official/07_CueScore_Official_Design_Decision_Log_v2.19_Official_Release.docx").includes("Decision 044｜"));
});

test("the note is limited to the observed environments and keeps expectations, resolver, Native and catalogs unchanged", () => {
  for (const required of ["先頭1要素のみ", "iPhone 16e", "iOS 26.6.2", "iOS 26.5", "全iOSバージョンでの保証ではない", "変更しない", "Nativeブリッジ", "追加しない", "手動選択", "AC-U10-1", "AC-U10-5"]) assert.ok(decision.includes(required), required);
  assert.match(decision, /resolverの複数言語入力に対する期待値.*変更しない/s);
  assert.match(decision, /以前のProduct Ownerの承認は方針検討の承認/);
  assert.doesNotMatch(decision, /全てのiOS(?:バージョン)?で(?:先頭|保証)/);
});

test("Official 108 v1.1, Official 130, Official 109, the resolver, catalogs, product and Native files are byte-preserved", () => {
  const expected = {
    "docs/official/108_CueScore_Localization_Spec.md": "a53eebc7009c3dca124636a6575f919b1490e47be2d0b191370bcec252c0e968",
    "docs/official/130_CueScore_Localization_AC13_VoiceOver_Release_Requirement_Decision.md": "d9850a3a54603bf848c2e7149ae716ec4c6ab3f8d04777b8dc7fead114ab6328",
    "docs/official/109_CueScore_Localization_Glossary.md": "5f1eb130eb07025c5b587558093117f17ac382de137932a58e0e64e1a6540a9e",
    "i18n-v1.js": "e3a5909a0007c7d28c13ae1b96e0cb9671065302a459ebf1ec343ac77ceb10c7",
    "index.html": "68fddc85f59f5fb1a62f3bbf0bb99330631c1cdfec3a4ff39dc8f7a5abcea020",
    "monetization-v1.js": "9da40f6be8c3dd5c2bb2535325a6bc83a890ad16e38d649e44315222115f6c60",
    "i18n-catalog-ja-v1.js": "351ad0530e4ff8a1c66ce81b37938c10a60d7684ffae2dc3ceeb36fc48ea66ad",
    "i18n-catalog-en-v1.js": "011a957ed527adf6298f78e6a288a8718506c766db3356364b2fc3aab436a00f",
    "i18n-catalog-zh-hans-v1.js": "0be5d83df480714bcf2d4522810a76e4d655675d9fe15c1600249c3bb14362d6",
    "sw.js": "6cf62d7ef2d7e3c12eda100ff5beb9817993f10af4ede9dccca6cda3f0fb719e",
    "ios/App/App.xcodeproj/project.pbxproj": "17121c255c2646d766cb8b190287f079b8fe82f93b7550529763ad1a65e78dd3",
    "ios/App/App/Info.plist": "12f1121ef0443d75062ca544af1b0ed5c5cbecc96b3b557bb4edf3b9057220c1",
    "ios/App/App/Info-ScoreRC.plist": "3d210557612b031f713c0a6cb10b7a3f79118677da9c545093cb6990a7b8c56a"
};
  for (const [path, digest] of Object.entries(expected)) assert.equal(sha256(path), digest, path);
});

test("the acceptance identifiers are intact and SSOT does not declare P6 complete", () => {
  const acceptance = [...spec.matchAll(/^\| (AC-(?:S)?\d+) \|/gm)].map(match => match[1]);
  assert.equal(acceptance.length, 31);
  const state = `${read("docs/CURRENT_STATE.md")}\n${read("docs/CURRENT_STATUS.md")}`;
  assert.match(state, /iOS First-Entry Language List/);
  assert.match(state, /P6全体PASS・P7は宣言しない/);
  assert.match(read("docs/README.md"), /official\/131_CueScore_Localization_iOS_First_Entry_Language_List_Decision\.md/);
  assert.match(read("docs/README.md"), /v2\.20 adds Decision 044/);
  for (const name of ["index.html", "sw.js", "i18n-v1.js", "monetization-v1.js"]) assert.doesNotMatch(read(name), /Decision 044/);
  void official130;
});
