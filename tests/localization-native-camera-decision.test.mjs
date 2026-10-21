import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import zlib from "node:zlib";

const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const sha16 = p => crypto.createHash("sha256").update(fs.readFileSync(new URL(p, root))).digest("hex").slice(0, 16);
const D = "docs/official/125_CueScore_Localization_Native_Camera_Decision.md";
const S = "docs/official/126_CueScore_Localization_Native_Camera_Spec.md";
const LOG = v => `docs/official/07_CueScore_Official_Design_Decision_Log_v${v}_Official_Release.docx`;

function zipEntry(p, name) {
  const b = fs.readFileSync(new URL(p, root)); let e = -1;
  for (let i = b.length - 22; i >= 0; i--) if (b.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  const n = b.readUInt16LE(e + 10); let o = b.readUInt32LE(e + 16);
  for (let k = 0; k < n; k++) {
    const m = b.readUInt16LE(o + 10), c = b.readUInt32LE(o + 20), nl = b.readUInt16LE(o + 28), xl = b.readUInt16LE(o + 30), cl = b.readUInt16LE(o + 32), l = b.readUInt32LE(o + 42);
    if (b.toString("utf8", o + 46, o + 46 + nl) === name) { const s = l + 30 + b.readUInt16LE(l + 26) + b.readUInt16LE(l + 28); const data = b.subarray(s, s + c); return (m === 0 ? data : zlib.inflateRawSync(data)).toString("utf8"); }
    o += 46 + nl + xl + cl;
  }
  throw new Error(name);
}

const docxText = p => zipEntry(p, "word/document.xml").replace(/<[^>]+>/g, "");

test("Decision 040 / Official 125 / 126 are uniquely published while Official 109 stays reserved", () => {
  const nums = fs.readdirSync(new URL("docs/official/", root)).filter(n => /^\d+_.*\.md$/.test(n)).map(n => Number(n.split("_")[0]));
  for (const n of [125, 126]) assert.equal(nums.filter(v => v === n).length, 1, String(n));
  assert.equal(nums.filter(value => value === 109).length, 1);
  assert.equal(Math.max(...nums), 130);
  const text = docxText(LOG("2.16"));
  assert.deepEqual([...text.matchAll(/Decision (\d{3})｜/g)].map(m => Number(m[1])), Array.from({ length: 40 }, (_, i) => i + 1));
  assert.match(text, /Decision 040｜多言語化 Native カメラ許可文言/);
  assert.doesNotMatch(docxText(LOG("2.15")), /Decision 040/);
});

test("localization Officials retain their expected hashes after the authorized Official 108 v1.1 revision", () => {
  assert.equal(sha16("docs/official/107_CueScore_Localization_Decision.md"), "e274cec70e3f9789");
  assert.equal(sha16("docs/official/108_CueScore_Localization_Spec.md"), "a53eebc7009c3dca");
  assert.equal(sha16("docs/official/121_CueScore_Localization_U4_U11_Approval_Decision.md"), "e536db9481d9493b");
  assert.equal(sha16("docs/official/122_CueScore_Localization_U4_U11_Approval_Spec.md"), "06ef7b0d94fe7254");
  assert.equal(sha16("docs/official/123_CueScore_Localization_U11_Correction_Decision.md"), "6de4a1b8e13e663a");
  assert.equal(sha16("docs/official/124_CueScore_Localization_U11_Correction_Spec.md"), "49eb340fa1b86078");
});

test("camera decision is narrow, keeps the U11 values and records the U11-R4 limited successor exception", () => {
  const all = `${read(D)}\n${read(S)}`;
  for (const re of [
    /`NSCameraUsageDescription` のみ/,
    /ja\.lproj\/InfoPlist\.strings/,
    /en\.lproj\/InfoPlist\.strings/,
    /zh-Hans\.lproj\/InfoPlist\.strings/,
    /未対応OS言語.*日本語/,
    /アプリ内の手動言語設定.*独立/,
    /U11-R4/,
    /限定例外/,
    /過去の Official 整合性 FAIL/,
    /実機.*NOT VERIFIED/,
  ]) assert.match(all, re);
  assert.match(all, /プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。/);
  assert.match(all, /The camera is used to take player profile photos and scan match-sharing QR codes\./);
  assert.match(all, /相机用于拍摄球员个人资料照片和扫描比赛分享二维码。/);
});

test("SSOT points to Decision Log v2.16 and the Decision publication remains product-source-free", () => {
  assert.match(read("docs/README.md"), /Decision_Log_v2\.19_Official_Release/);
  assert.match(read("docs/README.md"), /v2\.16 adds Decision 040/);
  assert.match(read("docs/CURRENT_STATE.md"), /Native Camera Localization Decision Published/);
  assert.match(read("docs/CURRENT_STATUS.md"), /NATIVE CAMERA LOCALIZATION FORMALIZED/);
  for (const p of ["index.html", "sw.js", "i18n-v1.js", "monetization-v1.js"]) assert.doesNotMatch(read(p), /Decision 040/);
  assert.doesNotMatch(`${read(D)}\n${read(S)}`, /ghp_[A-Za-z0-9]{20}|PRIVATE KEY|takaaki\.mailbox/i);
});
