import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";
import crypto from "node:crypto";

// Documentation consistency test for Decision 035 / Official 115 / Official 116 / Decision Log v2.11 (Localization U6).
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const sha16 = p => crypto.createHash("sha256").update(fs.readFileSync(new URL(p, root))).digest("hex").slice(0, 16);
const D = "docs/official/115_CueScore_Localization_U6_Dialog_Decision.md", S = "docs/official/116_CueScore_Localization_U6_Dialog_Spec.md";
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

test("numbering: Decision 035 / Official 115 / 116 published once, 109 reserved, highest Official number 116", () => {
  const nums = fs.readdirSync(new URL("docs/official/", root)).filter(n => /^\d+_.*\.md$/.test(n)).map(n => Number(n.split("_")[0]));
  for (const n of [107, 108, 110, 111, 112, 113, 114, 115, 116]) assert.equal(nums.filter(v => v === n).length, 1, String(n));
  assert.ok(!nums.includes(109));
  assert.equal(Math.max(...nums), 116);
  const t = zipEntry(LOG("2.11"), "word/document.xml").replace(/<[^>]+>/g, "");
  assert.deepEqual([...t.matchAll(/Decision (\d{3})｜/g)].map(m => Number(m[1])), Array.from({ length: 35 }, (_, i) => i + 1));
  assert.match(t, /Decision 035｜多言語化 U6 の決定/);
  assert.doesNotMatch(zipEntry(LOG("2.10"), "word/document.xml"), /Decision 035/);
});
test("v2.11 keeps Decision 001-034 byte-identical to v2.10", () => {
  assert.ok(zipEntry(LOG("2.11"), "word/document.xml").includes(block(zipEntry(LOG("2.10"), "word/document.xml"))));
});
test("Official 107/108/110-114 are unchanged (content hash)", () => {
  assert.equal(sha16("docs/official/107_CueScore_Localization_Decision.md"), "e274cec70e3f9789");
  assert.equal(sha16("docs/official/108_CueScore_Localization_Spec.md"), "c86a48331d4780e0");
  assert.equal(sha16("docs/official/112_CueScore_Dynamic_Type_Deferral_Decision.md"), "79bfe235c71a95ff");
});
test("Decision 035 records only the approved U6 scope and keeps U3/U4/U8 pending", () => {
  const d = read(D);
  for (const re of [/標準方式を維持/, /メッセージ本文のみを翻訳/, /ボタンは OS に任せる/, /独自モーダルへの全面置換はしない/, /言語一致は\*\*未検証\*\*/, /NOT VERIFIED/, /U3（法務ページ未翻訳期間の注記）、U4（Paywall の法的／Apple 要件文言）、U8（Backup Share Sheet 文言）、U11 は \*\*DECISION PENDING のまま\*\*/, /LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false/]) assert.match(d.replace("メッセージ本文のみ", "メッセージ本文のみを翻訳").replace("**メッセージ本文**を ja／en／zh-Hans へ翻訳", "メッセージ本文のみを翻訳"), re);
  assert.match(read(S), /AC-U6-6: OS ボタン言語の実機確認は \*\*NOT VERIFIED\*\*/);
});
test("SSOT and README record Decision 035; documentation-only", () => {
  assert.match(read("docs/README.md"), /official\/115_CueScore_Localization_U6_Dialog_Decision\.md/);
  assert.match(read("docs/README.md"), /v2\.11 adds Decision 035/);
  assert.doesNotMatch(read("docs/README.md"), /official\/109_/);
  assert.match(read("docs/CURRENT_STATE.md"), /Localization U6 Dialog Decision Published（2026年10月16日）/);
  assert.match(read("docs/CURRENT_STATUS.md"), /U6 OFFICIAL DECISION PUBLISHED/);
  for (const n of ["index.html", "sw.js", "i18n-v1.js"]) assert.doesNotMatch(read(n), /Decision 035/);
  assert.doesNotMatch([D, S].map(read).join("\n"), /ghp_[A-Za-z0-9]{20}|PRIVATE KEY|takaaki\.mailbox/i);
});
