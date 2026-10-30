import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const sha = p => crypto.createHash("sha256").update(fs.readFileSync(new URL(p, root))).digest("hex");
const plists = ["ios/App/App/Info.plist", "ios/App/App/Info-ScoreRC.plist"];
const strings = {
  "ios/App/App/ja.lproj/InfoPlist.strings": "プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。",
  "ios/App/App/en.lproj/InfoPlist.strings": "The camera is used to take player profile photos and scan match-sharing QR codes.",
  "ios/App/App/zh-Hans.lproj/InfoPlist.strings": "相机用于拍摄球员个人资料照片和扫描比赛分享二维码。",
};

test("Decision 040 camera purpose strings are exact and each file contains only NSCameraUsageDescription", () => {
  for (const [path, value] of Object.entries(strings)) {
    assert.equal(read(path), `"NSCameraUsageDescription" = "${value}";\n`, path);
  }
  for (const path of plists) {
    assert.match(read(path), new RegExp(`<key>NSCameraUsageDescription</key>\\s*<string>${strings["ios/App/App/ja.lproj/InfoPlist.strings"]}</string>`));
  }
});

test("the localized variant group is registered once in App target resources with ja / en / zh-Hans children", () => {
  const pb = read("ios/App/App.xcodeproj/project.pbxproj");
  assert.equal((pb.match(/\/\* InfoPlist\.strings in Resources \*\//g) || []).length, 2);
  assert.equal((pb.match(/\/\* InfoPlist\.strings \*\//g) || []).length, 3);
  for (const pair of [
    ["ja", "ja.lproj/InfoPlist.strings"],
    ["en", "en.lproj/InfoPlist.strings"],
    ["zh-Hans", "zh-Hans.lproj/InfoPlist.strings"],
  ]) assert.ok(pb.includes(`name = ${pair[0] === "zh-Hans" ? '"zh-Hans"' : pair[0]}; path = ${pair[0] === "zh-Hans" ? `"${pair[1]}"` : pair[1]};`));
  assert.match(pb, /isa = PBXVariantGroup;[\s\S]*name = InfoPlist\.strings;/);
});

test("U11 language values, production and RC identities, signing team, version and build remain unchanged", () => {
  for (const p of plists) {
    const s = read(p);
    assert.match(s, /<key>CFBundleDevelopmentRegion<\/key>\s*<string>ja<\/string>/);
    assert.match(s, /<key>CFBundleLocalizations<\/key>\s*<array>\s*<string>ja<\/string>\s*<string>en<\/string>\s*<string>zh-Hans<\/string>\s*<\/array>/);
  }
  const pb = read("ios/App/App.xcodeproj/project.pbxproj");
  assert.match(pb, /developmentRegion = ja;/);
  assert.match(pb, /knownRegions = \(\s*ja,\s*en,\s*"zh-Hans",\s*Base,\s*\);/);
  assert.equal((pb.match(/PRODUCT_BUNDLE_IDENTIFIER = com\.takaakimailboxstar\.cuescoreapps;/g) || []).length, 2);
  assert.equal((pb.match(/DEVELOPMENT_TEAM = U26DF88PRW;/g) || []).length, 6);
  assert.equal((pb.match(/CURRENT_PROJECT_VERSION = 95;/g) || []).length, 2);
  assert.equal((pb.match(/MARKETING_VERSION = 1\.4;/g) || []).length, 2);
  assert.match(read("ios/App/ScoreRC.xcconfig"), /PRODUCT_BUNDLE_IDENTIFIER = com\.takaakimailboxstar\.cuescoreapps\.rc12/);
  assert.match(read("ios/App/ScoreRC.xcconfig"), /INFOPLIST_FILE = App\/Info-ScoreRC\.plist/);
});

test("camera / QR implementation, plist bases, RC configuration and data-contract sources are byte-preserved", () => {
  assert.equal(sha("ios/App/App/CueScoreQRScannerPlugin.swift"), "9fd23624230f0365e6b073e3c576fd69b7eb9a6a73edee9d8f5557f0966d4534");
  assert.equal(sha("ios/App/App/Info.plist"), "12f1121ef0443d75062ca544af1b0ed5c5cbecc96b3b557bb4edf3b9057220c1");
  assert.equal(sha("ios/App/App/Info-ScoreRC.plist"), "3d210557612b031f713c0a6cb10b7a3f79118677da9c545093cb6990a7b8c56a");
  assert.equal(sha("ios/App/ScoreRC.xcconfig"), "f60ea263b19f84cd3c8bc13f1a18a56b53b5728e363adc5c1a022e09704aa2c2");
  assert.equal(sha("monetization-v1.js"), "9da40f6be8c3dd5c2bb2535325a6bc83a890ad16e38d649e44315222115f6c60");
  assert.equal(sha("domain-constants-v1.js"), "234d235b30c3aa144e4af9e6a647f746d94a0c9f9c0e3761356d1da9235f9c76");
});

test("Info.plist and Info-ScoreRC.plist still differ only in display name and whitespace", () => {
  const norm = s => s.replace(/\s+/g, " ").replace(/<key>CFBundleDisplayName<\/key> <string>[^<]*<\/string>/, "");
  assert.equal(norm(read(plists[0])), norm(read(plists[1])));
});
