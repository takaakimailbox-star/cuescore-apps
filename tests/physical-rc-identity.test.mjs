import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const read = (relative) => fs.readFileSync(new URL(`../${relative}`, import.meta.url));
const text = (relative) => read(relative).toString("utf8");
const sha256 = (relative) => crypto.createHash("sha256").update(read(relative)).digest("hex");

const productionInfo = text("ios/App/App/Info.plist");
const productionProject = text("ios/App/App.xcodeproj/project.pbxproj");
const rcInfo = text("ios/App/App/Info-ScoreRC.plist");
const rcConfig = text("ios/App/ScoreRC.xcconfig");
const rcIconContents = JSON.parse(text("ios/App/App/Assets.xcassets/AppIconRC.appiconset/Contents.json"));

test("production iOS identity and icon remain unchanged", () => {
  assert.match(productionInfo, /<string>CueScore Apps<\/string>/);
  assert.match(productionProject, /PRODUCT_BUNDLE_IDENTIFIER = com\.takaakimailboxstar\.cuescoreapps;/);
  assert.match(productionProject, /ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;/);
  assert.equal(
    sha256("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"),
    "49b2aa25427930af44eb9f4d90fe00265c0396fe3af6f81e8d05ef7571b072d3"
  );
});

test("physical RC uses an isolated display name, bundle ID, plist, and icon set", () => {
  assert.match(rcInfo, /<string>Score RC<\/string>/);
  assert.match(rcConfig, /PRODUCT_BUNDLE_IDENTIFIER = com\.takaakimailboxstar\.cuescoreapps\.rc12/);
  assert.match(rcConfig, /INFOPLIST_FILE = App\/Info-ScoreRC\.plist/);
  assert.match(rcConfig, /ASSETCATALOG_COMPILER_APPICON_NAME = AppIconRC/);
  assert.doesNotMatch(rcConfig, /CURRENT_PROJECT_VERSION|MARKETING_VERSION/);
  assert.equal(rcIconContents.images[0].filename, "AppIconRC-512@2x.png");
  assert.notEqual(
    sha256("ios/App/App/Assets.xcassets/AppIconRC.appiconset/AppIconRC-512@2x.png"),
    sha256("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")
  );
});

test("physical RC icon is a valid 1024 by 1024 PNG", () => {
  const png = read("ios/App/App/Assets.xcassets/AppIconRC.appiconset/AppIconRC-512@2x.png");
  assert.equal(png.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(png.readUInt32BE(16), 1024);
  assert.equal(png.readUInt32BE(20), 1024);
});

test("physical RC plist retains the production runtime capability contract", () => {
  for (const key of [
    "CAPACITOR_DEBUG",
    "UIApplicationSceneManifest",
    "NSCameraUsageDescription",
    "UIInterfaceOrientationPortrait",
    "UIViewControllerBasedStatusBarAppearance"
  ]) {
    assert.equal(rcInfo.includes(key), true, `missing RC plist key: ${key}`);
  }
});
