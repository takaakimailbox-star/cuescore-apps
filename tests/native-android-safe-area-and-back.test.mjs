import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { bridgeSafeArea } from "../scripts/android-safe-area-bridge.mjs";

const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("safe-area bridge rewrites every env(safe-area-inset-*) once and keeps fallbacks", () => {
  const r = bridgeSafeArea("a{top:calc(18px + env(safe-area-inset-top));padding:max(20px,env(safe-area-inset-bottom)) env(safe-area-inset-left, 12px)}b{x:env(safe-area-inset-top,0px)}");
  assert.equal(r.count, 4);
  assert.ok(r.text.includes("calc(18px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)))"));
  assert.ok(r.text.includes("var(--safe-area-inset-left, env(safe-area-inset-left, 12px))"));
  assert.ok(r.text.includes("var(--safe-area-inset-top, env(safe-area-inset-top,0px))"));
  assert.equal(bridgeSafeArea(r.text).count, 4, "idempotence is not required, but a second pass must not break the syntax");
  assert.ok(!bridgeSafeArea("margin:0").count);
});

test("bridge is Android-only: shared sources keep the plain env(); the Android build script applies it", () => {
  assert.ok(read("index.html").includes("env(safe-area-inset-top)"));
  assert.ok(!read("index.html").includes("--safe-area-inset-"));
  assert.ok(!read("scripts/build-native-web.mjs").includes("safe-area-bridge"));
  const android = read("scripts/build-android-web.mjs");
  assert.match(android, /android-safe-area-bridge\.mjs/);
  assert.match(android, /CUESCORE_ANDROID_SAFE_AREA_BRIDGE/);
});

function backHarness({ visibleIds = [], tab = "home", tilesVisible = true, homeVisible = true, policy }) {
  const clicked = [];
  const mk = id => ({ id, hidden: false, disabled: false, parentElement: null, classList: { contains: () => false }, getClientRects: () => [1], click: () => clicked.push(id) });
  const nodes = {};
  for (const id of visibleIds) nodes["#" + id] = mk(id);
  nodes['[data-phase1-tab="home"]'] = mk("homeTab");
  if (homeVisible) nodes["#cueHomeV1"] = mk("cueHomeV1");
  nodes["#cueDisciplineSwitcherV1"] = mk("tiles");
  if (!tilesVisible) nodes["#cueDisciplineSwitcherV1"].getClientRects = () => [];
  const window = {};
  const ctx = { window, document: { querySelector: s => nodes[s] || null, body: { dataset: { cuePhase1Tab: tab } } }, getComputedStyle: () => ({ display: "block", visibility: "visible" }) };
  vm.runInNewContext(read("android-native-v1.js"), ctx);
  if (policy) assert.equal(window.CueScoreAndroidBackV1.setPolicy(policy), true);
  return { result: window.CueScoreAndroidBackV1.handle(), clicked, api: window.CueScoreAndroidBackV1 };
}

test("Back policy defaults to the current behaviour (no change until Product Owner approval)", () => {
  assert.equal(backHarness({}).api.getPolicy(), "current");
  const cur = backHarness({ tab: "settings" });
  assert.equal(cur.result, false); assert.deepEqual(cur.clicked, []);
  assert.deepEqual(backHarness({ tilesVisible: false }).clicked, []);
  assert.equal(backHarness({}).api.setPolicy("bogus"), false);
});

test("proposal policy: modal -> close; tab screens -> Home tab; selected discipline -> list; list -> minimize", () => {
  assert.deepEqual(backHarness({ policy: "proposal", visibleIds: ["newMatchRacePickerV1", "newMatchRacePickerCloseV1"] }).clicked, ["newMatchRacePickerCloseV1"]);
  assert.deepEqual(backHarness({ policy: "proposal", visibleIds: ["cueInProgressChoiceV1", "cueInProgressCancelV1"] }).clicked, ["cueInProgressCancelV1"]);
  for (const tab of ["player", "history", "settings"]) { const r = backHarness({ policy: "proposal", tab }); assert.equal(r.result, true); assert.deepEqual(r.clicked, ["homeTab"]); }
  assert.deepEqual(backHarness({ policy: "proposal", tilesVisible: false }).clicked, ["homeTab"]);
  const root = backHarness({ policy: "proposal" });
  assert.equal(root.result, false); assert.deepEqual(root.clicked, []);
  // an existing in-app Back control always wins over the proposal rules
  assert.deepEqual(backHarness({ policy: "proposal", tab: "settings", visibleIds: ["settingsBackBtn"] }).clicked, ["settingsBackBtn"]);
});
