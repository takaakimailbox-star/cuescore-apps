import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";
import crypto from "node:crypto";

// Documentation consistency test for Decision 036 / Official 117 / Official 118 / Decision Log v2.12 (Localization P4 review policy).
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const sha16 = p => crypto.createHash("sha256").update(fs.readFileSync(new URL(p, root))).digest("hex").slice(0, 16);
const D = "docs/official/117_CueScore_Localization_P4_Review_Policy_Decision.md", S = "docs/official/118_CueScore_Localization_P4_Review_Policy_Spec.md";
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

test("numbering: Decision 036 / Official 117 / 118 published once, 109 reserved, highest Official number 118", () => {
  const nums = fs.readdirSync(new URL("docs/official/", root)).filter(n => /^\d+_.*\.md$/.test(n)).map(n => Number(n.split("_")[0]));
  for (const n of [107, 108, 110, 111, 112, 113, 114, 115, 116, 117, 118]) assert.equal(nums.filter(v => v === n).length, 1, String(n));
  assert.ok(!nums.includes(109));
  assert.equal(Math.max(...nums), 118);
  const t = zipEntry(LOG("2.12"), "word/document.xml").replace(/<[^>]+>/g, "");
  assert.deepEqual([...t.matchAll(/Decision (\d{3})｜/g)].map(m => Number(m[1])), Array.from({ length: 36 }, (_, i) => i + 1));
  assert.match(t, /Decision 036｜多言語化 P4 レビュー方式の改定/);
  assert.doesNotMatch(zipEntry(LOG("2.11"), "word/document.xml"), /Decision 036/);
});
test("v2.12 keeps Decision 001-035 byte-identical to v2.11", () => {
  assert.ok(zipEntry(LOG("2.12"), "word/document.xml").includes(block(zipEntry(LOG("2.11"), "word/document.xml"))));
});
test("Official 107/108/110-116 are unchanged (content hash)", () => {
  assert.equal(sha16("docs/official/107_CueScore_Localization_Decision.md"), "e274cec70e3f9789");
  assert.equal(sha16("docs/official/108_CueScore_Localization_Spec.md"), "c86a48331d4780e0");
  assert.equal(sha16("docs/official/112_CueScore_Dynamic_Type_Deferral_Decision.md"), "79bfe235c71a95ff");
  assert.equal(sha16("docs/official/115_CueScore_Localization_U6_Dialog_Decision.md"), "3fab4d760dd0b9ff");
  assert.equal(sha16("docs/official/116_CueScore_Localization_U6_Dialog_Spec.md"), "dde6d65ed2b54a78");
});
test("Decision 036 records the approved policy, keeps P4-REVIEWED human-only and U3/U4/U8 pending", () => {
  const d = read(D), s = read(S);
  for (const re of [/外部の人間レビュアーを\*\*必須としない\*\*/, /AI の結果を `P4-REVIEWED` と読み替えない/, /`P4-AI-VERIFIED`（新設）/, /PO の承認記録がない限り `P4-APPROVED` を付与しない/, /AI の調査は\*\*根拠の収集と照合\*\*/, /食い違う場合は統合せず/, /人間の独立レビューは実施されていない/, /公開後の修正手順/, /U3（法務ページ注記）、U4（Paywall の法的／Apple 要件）、U8（Backup Share Sheet）、U11 は \*\*DECISION PENDING のまま\*\*/, /最終承認は Product Owner/]) assert.match(d, re);
  for (const re of [/AI の検証を `P4-REVIEWED` と記録しない/, /`P4-APPROVED` は Product Owner の承認記録/, /人間の独立レビュー未実施/, /ja catalog と ja 表示は変更しない/, /AC-P4R-6/]) assert.match(s, re);
});
test("SSOT and README record Decision 036; documentation-only (no product source mentions it)", () => {
  assert.match(read("docs/README.md"), /official\/117_CueScore_Localization_P4_Review_Policy_Decision\.md/);
  assert.match(read("docs/README.md"), /v2\.12 adds Decision 036/);
  assert.doesNotMatch(read("docs/README.md"), /official\/109_/);
  assert.match(read("docs/CURRENT_STATE.md"), /Localization P4 Review Policy Decision Published（2026年10月17日）/);
  assert.match(read("docs/CURRENT_STATUS.md"), /REVIEW POLICY OFFICIAL DECISION PUBLISHED/);
  for (const n of ["index.html", "sw.js", "i18n-v1.js"]) assert.doesNotMatch(read(n), /Decision 036/);
  assert.doesNotMatch([D, S].map(read).join("\n"), /ghp_[A-Za-z0-9]{20}|PRIVATE KEY|takaaki\.mailbox/i);
});
