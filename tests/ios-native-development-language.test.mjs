import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// Decision 038 / Official 121 (U11): the Native development-language fallback is ja. CFBundleLocalizations keeps a device in en / zh-Hans on its own
// language for OS-provided strings (verified in an isolated Simulator probe: Evidence 67); an unsupported language falls back to ja.
// Bundle IDs and product identifiers are untouched; no lproj / InfoPlist.strings is added.
const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const plists = ["ios/App/App/Info.plist", "ios/App/App/Info-ScoreRC.plist"];

test("both Info plists declare the ja development region and the three supported localizations", () => {
  for (const p of plists) {
    const s = read(p);
    assert.match(s, /<key>CFBundleDevelopmentRegion<\/key>\s*<string>ja<\/string>/, p);
    assert.match(s, /<key>CFBundleLocalizations<\/key>\s*<array>\s*<string>ja<\/string>\s*<string>en<\/string>\s*<string>zh-Hans<\/string>\s*<\/array>/, p);
    assert.doesNotMatch(s, /<key>CFBundleDevelopmentRegion<\/key>\s*<string>en<\/string>/, p);
  }
});
test("project.pbxproj development region is ja and the known regions cover ja / en / zh-Hans / Base", () => {
  const s = read("ios/App/App.xcodeproj/project.pbxproj");
  assert.match(s, /developmentRegion = ja;/);
  assert.match(s, /knownRegions = \(\s*ja,\s*en,\s*"zh-Hans",\s*Base,\s*\);/);
  assert.doesNotMatch(s, /developmentRegion = en;/);
});
test("Bundle IDs and the StoreKit product identifier are unchanged; no new lproj / strings", () => {
  const pb = read("ios/App/App.xcodeproj/project.pbxproj");
  const ids = [...pb.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)].map(m => m[1]).sort();
  assert.deepEqual(ids, ["com.takaakimailboxstar.cuescoreapps", "com.takaakimailboxstar.cuescoreapps", "com.takaakimailboxstar.cuescoreapps.storekittests", "com.takaakimailboxstar.cuescoreapps.storekittests", "com.takaakimailboxstar.cuescoreapps.storekituitests", "com.takaakimailboxstar.cuescoreapps.storekituitests"]);
  assert.match(read("ios/App/ScoreRC.xcconfig"), /PRODUCT_BUNDLE_IDENTIFIER = com\.takaakimailboxstar\.cuescoreapps\.rc12/);
  for (const p of plists) assert.match(read(p), /<key>CFBundleIdentifier<\/key>\s*<string>\$\(PRODUCT_BUNDLE_IDENTIFIER\)<\/string>/);
  assert.match(read("monetization-v1.js"), /com\.takaakimailboxstar\.cuescoreapps\.pro/);
  const found = []; (function walk(d) { for (const e of fs.readdirSync(new URL(d, root), { withFileTypes: true })) { if (e.name === "node_modules" || e.name === "public") continue; const p = d + e.name; if (e.isDirectory()) { if (/\.lproj$/.test(e.name)) found.push(p); walk(p + "/"); } else if (/\.strings$/.test(e.name)) found.push(p); } })("ios/App/");
  assert.deepEqual(found, ["ios/App/App/Base.lproj"]);
});
test("Info.plist and Info-ScoreRC.plist differ only in the display name (and whitespace)", () => {
  const norm = s => s.replace(/\s+/g, " ").replace(/<key>CFBundleDisplayName<\/key> <string>[^<]*<\/string>/, "");
  assert.equal(norm(read(plists[0])), norm(read(plists[1])));
});
test("the JS language resolution is untouched (ja fallback, manual priority stays in the web layer)", () => {
  const core = read("i18n-v1.js");
  assert.match(core, /navigator/);
});
