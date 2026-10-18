import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";
import crypto from "node:crypto";

// Documentation consistency test for Decision 038 / Official 121 / Official 122 / Decision Log v2.14 (Localization U4/U11 approval).
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const sha16 = p => crypto.createHash("sha256").update(fs.readFileSync(new URL(p, root))).digest("hex").slice(0, 16);
const D = "docs/official/121_CueScore_Localization_U4_U11_Approval_Decision.md", S = "docs/official/122_CueScore_Localization_U4_U11_Approval_Spec.md";
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

test("numbering: Decision 038 / Official 121 / 122 published once, 109 reserved and unpublished, highest Official number 122", () => {
  const nums = fs.readdirSync(new URL("docs/official/", root)).filter(n => /^\d+_.*\.md$/.test(n)).map(n => Number(n.split("_")[0]));
  for (const n of [107, 108, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122]) assert.equal(nums.filter(v => v === n).length, 1, String(n));
  assert.equal(nums.filter(value => value === 109).length, 1);
  assert.equal(Math.max(...nums), 129);
  const t = zipEntry(LOG("2.14"), "word/document.xml").replace(/<[^>]+>/g, "");
  assert.deepEqual([...t.matchAll(/Decision (\d{3})｜/g)].map(m => Number(m[1])), Array.from({ length: 38 }, (_, i) => i + 1));
  assert.match(t, /Decision 038｜多言語化 U4／U11 の承認/);
  assert.doesNotMatch(zipEntry(LOG("2.13"), "word/document.xml"), /Decision 038/);
});
test("v2.14 keeps Decision 001-036 byte-identical to v2.13", () => {
  assert.ok(zipEntry(LOG("2.14"), "word/document.xml").includes(block(zipEntry(LOG("2.13"), "word/document.xml"))));
});
test("Official 119/120 are unchanged (content hash)", () => {
  assert.equal(sha16("docs/official/120_CueScore_Localization_P4_PO_Approval_Spec.md"), "abe9223a40a397c8");
});
test("Decision 038 records U4 plan B, the U11 policy and keeps the Glossary unpublished", () => {
  const d = read(D), sp = read(S);
  for (const re of [/案 B/, /A one-time purchase\. No subscription\./, /一次性购买，无需订阅。/, /CFBundleDevelopmentRegion/, /Official 109/]) assert.match(d, re);
  assert.match(sp, /StoreKit|displayPrice/);
});
test("SSOT and README record Decision 038; documentation-only (no product source mentions it)", () => {
  assert.match(read("docs/README.md"), /official\/121_CueScore_Localization_U4_U11_Approval_Decision\.md/);
  assert.match(read("docs/README.md"), /v2\.14 adds Decision 038/);
  assert.match(read("docs/README.md"), /Decision_Log_v2\.18_Official_Release/);
  assert.match(read("docs/README.md"), /official\/109_/);
  assert.match(read("docs/CURRENT_STATE.md"), /U4\/U11 Approval Decision Published（2026年10月17日）/);
  assert.match(read("docs/CURRENT_STATUS.md"), /U4\/U11 — OFFICIAL DECISION PUBLISHED/);
  for (const n of ["index.html", "sw.js", "i18n-v1.js", "monetization-v1.js"]) assert.doesNotMatch(read(n), /Decision 03[678]/);
  assert.doesNotMatch([D, S].map(read).join("\n"), /ghp_[A-Za-z0-9]{20}|PRIVATE KEY|takaaki\.mailbox/i);
});
