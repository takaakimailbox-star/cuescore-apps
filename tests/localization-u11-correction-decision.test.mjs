import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";
import crypto from "node:crypto";

// Documentation consistency test for Decision 039 / Official 123 / Official 124 / Decision Log v2.15 (Localization U11 correction).
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const sha16 = p => crypto.createHash("sha256").update(fs.readFileSync(new URL(p, root))).digest("hex").slice(0, 16);
const D = "docs/official/123_CueScore_Localization_U11_Correction_Decision.md", S = "docs/official/124_CueScore_Localization_U11_Correction_Spec.md";
const LOG = v => `docs/official/07_CueScore_Official_Design_Decision_Log_v${v}_Official_Release.docx`;
function zipEntry(p, name) {
  const b = fs.readFileSync(new URL(p, root)); let e = -1;
  for (let i = b.length - 22; i >= 0; i--) if (b.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  const n = b.readUInt16LE(e + 10); let o = b.readUInt32LE(e + 16);
  for (let k = 0; k < n; k++) {
    const m = b.readUInt16LE(o + 10), c = b.readUInt32LE(o + 20), nl = b.readUInt16LE(o + 28), xl = b.readUInt16LE(o + 30), cl = b.readUInt16LE(o + 32), l = b.readUInt32LE(o + 42);
    if (b.toString("utf8", o + 46, o + 46 + nl) === name) { const s = l + 30 + b.readUInt16LE(l + 26) + b.readUInt16LE(l + 28); const d = b.subarray(s, s + c); return (m === 0 ? d : zlib.inflateRawSync(d)).toString("utf8"); }
    o += 46 + nl + xl + cl;
  }
  throw new Error(name);
}
const block = x => { const s = x.indexOf("Decision 001｜"), e = x.indexOf("時系列変更記録"); return x.slice(x.lastIndexOf("<w:p>", s), x.lastIndexOf("<w:p>", e)); };

test("numbering: Decision 039 / Official 123 / 124 remain published once, 109 reserved, later Official 125 / 126 are present", () => {
  const nums = fs.readdirSync(new URL("docs/official/", root)).filter(n => /^\d+_.*\.md$/.test(n)).map(n => Number(n.split("_")[0]));
  for (const n of [121, 122, 123, 124]) assert.equal(nums.filter(v => v === n).length, 1, String(n));
  assert.equal(nums.filter(value => value === 109).length, 1);
  assert.equal(Math.max(...nums), 139);
  const t = zipEntry(LOG("2.15"), "word/document.xml").replace(/<[^>]+>/g, "");
  assert.deepEqual([...t.matchAll(/Decision (\d{3})｜/g)].map(m => Number(m[1])), Array.from({ length: 39 }, (_, i) => i + 1));
  assert.match(t, /Decision 039｜多言語化 U11 の訂正/);
  assert.doesNotMatch(zipEntry(LOG("2.14"), "word/document.xml"), /Decision 039/);
});
test("v2.15 keeps Decision 001-037 byte-identical to v2.14", () => {
  assert.ok(zipEntry(LOG("2.15"), "word/document.xml").includes(block(zipEntry(LOG("2.14"), "word/document.xml"))));
});
test("AC-U11C-4: Official 121 / 122 are kept as history (content hash unchanged)", () => {
  assert.equal(sha16("docs/official/121_CueScore_Localization_U4_U11_Approval_Decision.md"), "e536db9481d9493b");
  assert.equal(sha16("docs/official/122_CueScore_Localization_U4_U11_Approval_Spec.md"), "06ef7b0d94fe7254");
});
test("AC-U11C-1: the implemented U11 native settings remain equal to Decision 039; later camera resources are governed by Decision 040", () => {
  for (const p of ["ios/App/App/Info.plist", "ios/App/App/Info-ScoreRC.plist"]) {
    const s = read(p);
    assert.match(s, /<key>CFBundleDevelopmentRegion<\/key>\s*<string>ja<\/string>/);
    assert.match(s, /<key>CFBundleLocalizations<\/key>\s*<array>\s*<string>ja<\/string>\s*<string>en<\/string>\s*<string>zh-Hans<\/string>\s*<\/array>/);
  }
  const pb = read("ios/App/App.xcodeproj/project.pbxproj");
  assert.match(pb, /developmentRegion = ja;/);
  assert.match(pb, /knownRegions = \(\s*ja,\s*en,\s*"zh-Hans",\s*Base,\s*\);/);
  const d = read(D), sp = read(S);
  for (const re of [/CFBundleLocalizations/, /訂正の経緯/, /FAIL/, /案 P/, /暗号化フルバックアップ/, /上書き許可ではない/]) assert.match(d, re);
  for (const re of [/U11-R1′/, /AC-U11C-1/, /knownRegions/, /lproj/]) assert.match(sp, re);
  assert.match(read("docs/official/125_CueScore_Localization_Native_Camera_Decision.md"), /U11-R4.*限定例外/s);
});
test("AC-U11C-5: the earlier Official-consistency FAIL record is kept in the Decision and the SSOT", () => {
  assert.match(read(D), /この FAIL 記録は削除せず/);
  assert.match(read("docs/CURRENT_STATE.md"), /Official 整合性 FAIL（逸脱）/);
});
test("SSOT and README record Decision 039; documentation-only (no product source mentions it)", () => {
  assert.match(read("docs/README.md"), /official\/123_CueScore_Localization_U11_Correction_Decision\.md/);
  assert.match(read("docs/README.md"), /v2\.15 adds Decision 039/);
  assert.match(read("docs/README.md"), /Decision_Log_v2\.24_Official_Release/);
  assert.match(read("docs/README.md"), /official\/109_/);
  assert.match(read("docs/CURRENT_STATE.md"), /U11 Correction Decision Published（2026年10月17日）/);
  assert.match(read("docs/CURRENT_STATUS.md"), /U11 CORRECTION FORMALIZED/);
  for (const n of ["index.html", "sw.js", "i18n-v1.js", "monetization-v1.js"]) assert.doesNotMatch(read(n), /Decision 03[6789]/);
  assert.doesNotMatch([D, S].map(read).join("\n"), /ghp_[A-Za-z0-9]{20}|PRIVATE KEY|takaaki\.mailbox/i);
});
