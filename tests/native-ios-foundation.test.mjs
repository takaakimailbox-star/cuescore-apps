import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const config = JSON.parse(fs.readFileSync(new URL("../capacitor.config.json", import.meta.url), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const project = fs.readFileSync(new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url), "utf8");
const infoPlist = fs.readFileSync(new URL("../ios/App/App/Info.plist", import.meta.url), "utf8");

test("native runtime skips Service Worker while the PWA registration remains intact", () => {
  assert.match(html, /window\.Capacitor\?\.isNativePlatform\?\.\(\)/);
  assert.match(html, /location\.protocol === "capacitor:"/);
  assert.match(html, /const canUseServiceWorker =\s*!isNativeRuntimeV170/);
  assert.match(html, /navigator\.serviceWorker\.register\("\.\/sw\.js"/);
});

test("iOS target is iPhone-only, portrait-only, version 1.0 build 62", () => {
  assert.doesNotMatch(project, /TARGETED_DEVICE_FAMILY = "1,2"/);
  assert.match(project, /TARGETED_DEVICE_FAMILY = 1;/);
  assert.match(project, /MARKETING_VERSION = 1\.0;/);
  assert.match(project, /CURRENT_PROJECT_VERSION = 62;/);
  assert.match(infoPlist, /UIInterfaceOrientationPortrait/);
  assert.doesNotMatch(infoPlist, /UIInterfaceOrientationLandscape/);
  assert.doesNotMatch(infoPlist, /UISupportedInterfaceOrientations~ipad/);
});

test("Capacitor foundation uses bundled assets without a remote server URL", () => {
  assert.equal(config.appName, "CueScore Apps");
  assert.equal(config.webDir, "native-web");
  assert.equal(config.server, undefined);
  assert.equal(config.ios.contentInset, "never");
  assert.equal(packageJson.dependencies["@capacitor/core"], "8.0.2");
  assert.equal(packageJson.dependencies["@capacitor/ios"], "8.0.2");
  assert.equal(packageJson.devDependencies["@capacitor/cli"], "8.0.2");
});

test("native v1 remains local-first and bundles every offline legal page", () => {
  assert.match(html, /csvExport:false,\s*cloudSync:false/);
  assert.match(html, /const canUseServiceWorker =\s*!isNativeRuntimeV170/);
  for (const relative of ["privacy.html", "terms.html", "support.html"]) {
    assert.equal(fs.existsSync(new URL(`../native-web/${relative}`, import.meta.url)), true);
    assert.equal(fs.existsSync(new URL(`../ios/App/App/public/${relative}`, import.meta.url)), true);
  }
});

test("generated and copied native index use the current source implementation", () => {
  const nativeHtml = fs.readFileSync(new URL("../native-web/index.html", import.meta.url), "utf8");
  const copiedHtml = fs.readFileSync(new URL("../ios/App/App/public/index.html", import.meta.url), "utf8");
  assert.equal(nativeHtml, html);
  assert.equal(copiedHtml, html);
  assert.match(copiedHtml, /function persistCompletedMatchRecordsV162\(records\)/);
  assert.match(copiedHtml, /adding another Player must not unset the existing primary Player/);
});

test("native backup writes the unchanged JSON payload to a file and opens the iOS share sheet", () => {
  assert.match(html, /const isNativeCapacitorRuntime =\s*location\.protocol === "capacitor:"/);
  assert.match(html, /capacitor\?\.Plugins\?\.Filesystem/);
  assert.match(html, /capacitor\?\.Plugins\?\.Share/);
  assert.match(html, /capacitor\?\.registerPlugin\?\.\("Filesystem"\)/);
  assert.match(html, /capacitor\?\.registerPlugin\?\.\("Share"\)/);
  assert.match(html, /Filesystem\.writeFile\(\{/);
  assert.match(html, /directory: "CACHE"/);
  assert.match(html, /encoding: "utf8"/);
  assert.match(html, /Share\.share\(\{/);
  assert.match(html, /url: file\.uri/);
  assert.match(html, /const blob = new Blob\(\[json\]/);
});
