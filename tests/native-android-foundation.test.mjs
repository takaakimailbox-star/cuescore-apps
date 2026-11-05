import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const A = "android/app/src/main/java/com/takaakimailboxstar/cuescoreapps";

test("android project keeps the existing application id and Build 99 identity", () => {
  const gradle = read("android/app/build.gradle");
  assert.match(gradle, /applicationId "com\.takaakimailboxstar\.cuescoreapps"/);
  assert.match(gradle, /versionName "1\.4"/);
  assert.match(gradle, /versionCode 99/);
  const vars = read("android/variables.gradle");
  assert.match(vars, /minSdkVersion = 26/);
  assert.match(vars, /targetSdkVersion = 36/);
  assert.match(vars, /compileSdkVersion = 36/);
  assert.match(gradle, /useLegacyPackaging = false/, "16 KB page-size: native libs must not be legacy-compressed");
});

test("android QR scanner exposes the same JS contract as the iOS plugin", () => {
  const ios = read("ios/App/App/CueScoreQRScannerPlugin.swift");
  const android = read(`${A}/scanner/CueScoreQRScannerPlugin.java`);
  assert.match(android, /name = "CueScoreQRScanner"/);
  for (const method of ["authorizationStatus", "requestPermission", "startScan", "stopScan", "openSettings"]) {
    assert.ok(ios.includes(`name: "${method}"`), `iOS has ${method}`);
    assert.match(android, new RegExp(`public void ${method}\\(PluginCall call\\)`), `android has ${method}`);
  }
  for (const event of ["scanResult", "scannerError", "scannerLifecycle"]) {
    assert.ok(ios.includes(`"${event}"`) && android.includes(`"${event}"`), `event ${event}`);
  }
  for (const code of ["CAMERA_NOT_AUTHORIZED", "INVALID_PREVIEW_RECT", "SESSION_NOT_RUNNING", "SETTINGS_UNAVAILABLE"]) {
    assert.ok(ios.includes(code) && android.includes(code), `error code ${code}`);
  }
  assert.match(android, /handleOnPause/);
  assert.match(android, /handleOnResume/);
  assert.match(android, /handleOnDestroy/);
});

test("android billing exposes the CueScoreStoreKit contract consumed by monetization-v1.js unchanged", () => {
  const js = read("monetization-v1.js");
  const android = read(`${A}/billing/CueScoreStoreKitPlugin.java`);
  assert.match(js, /"CueScoreStoreKit"/);
  assert.match(android, /name = "CueScoreStoreKit"/);
  for (const call of ["getProduct", "currentEntitlement", "purchase", "restore"]) {
    assert.ok(js.includes(`storeKit.${call}(`), `JS calls ${call}`);
    assert.match(android, new RegExp(`public void ${call}\\(PluginCall call\\)`));
  }
  assert.ok(android.includes('"entitlementChanged"'));
  for (const status of ["success", "pending", "cancelled"]) assert.ok(android.includes(`"${status}"`));
  assert.ok(js.includes('"com.takaakimailboxstar.cuescoreapps.pro"'));
  assert.ok(android.includes('"com.takaakimailboxstar.cuescoreapps.pro"'));
  // Entitlement is never persisted client-side: always re-queried from Play (fail closed).
  assert.doesNotMatch(android, /SharedPreferences|localStorage/);
});

test("manifest: camera optional, predictive back, resizable, locales, no auto-backup", () => {
  const m = read("android/app/src/main/AndroidManifest.xml");
  assert.match(m, /android\.permission\.CAMERA/);
  assert.match(m, /android\.hardware\.camera"\s+android:required="false"/);
  assert.match(m, /enableOnBackInvokedCallback="true"/);
  assert.match(m, /resizeableActivity="true"/);
  assert.match(m, /localeConfig="@xml\/locales_config"/);
  assert.match(m, /allowBackup="false"/);
  const locales = read("android/app/src/main/res/xml/locales_config.xml");
  for (const l of ["ja", "en", "zh-Hans"]) assert.ok(locales.includes(`"${l}"`));
});

test("android bundle injection is additive and leaves the iOS build script untouched", () => {
  const ios = read("scripts/build-native-web.mjs");
  assert.ok(!ios.includes("android"));
  const android = read("scripts/build-android-web.mjs");
  assert.match(android, /build-native-web\.mjs/);
  assert.match(android, /android-native-v1\.js/);
  assert.ok(!read("index.html").includes("android-native-v1.js"), "shared index.html must not load the Android adapter");
  assert.ok(existsSync(new URL("../android-native-v1.js", import.meta.url)));
});

function runBack(visibleIds) {
  const clicked = [];
  const nodes = Object.fromEntries(visibleIds.map(id => [id, { hidden: false, disabled: false, parentElement: null, classList: { contains: () => false }, getClientRects: () => [1], click: () => clicked.push(id) }]));
  const window = {};
  const ctx = {
    window,
    document: { querySelector: s => nodes[s.startsWith("#") ? s.slice(1) : s] || null },
    getComputedStyle: () => ({ display: "block", visibility: "visible" })
  };
  vm.runInNewContext(read("android-native-v1.js"), ctx);
  return { result: window.CueScoreAndroidBackV1.handle(), clicked };
}

test("Android Back clicks the top-most visible in-app Back control, else reports unhandled", () => {
  assert.deepEqual(runBack(["settingsBackBtn", "matchSharingFlowBackV1"]), { result: true, clicked: ["matchSharingFlowBackV1"] });
  assert.deepEqual(runBack(["recordsBackV2"]), { result: true, clicked: ["recordsBackV2"] });
  assert.deepEqual(runBack([]), { result: false, clicked: [] });
});

test("backup/restore JSON contract used on Android stays the shared one", () => {
  const html = read("index.html");
  assert.ok(html.includes("cuescore-apps-backup"));
  assert.match(html, /schemaVersion:\s*2/);
});
