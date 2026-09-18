import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

await import("../monetization-v1.js");

const diagnostic = globalThis.CueScoreIapDiagnostic;
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const web = fs.readFileSync(new URL("../monetization-v1.js", import.meta.url), "utf8");

test("unknown entitlement renders checking state without assuming Free", () => {
  assert.deepEqual(diagnostic.planViewState({status: "unavailable", isPro: false}), {
    status: "unknown", label: "確認中", action: "購入情報を確認中"
  });
  assert.deepEqual(diagnostic.planViewState({status: "loading", isPro: false}), {
    status: "unknown", label: "確認中", action: "購入情報を確認中"
  });
});

test("confirmed Free renders CueScore Free and the purchase and restore entry", () => {
  assert.deepEqual(diagnostic.planViewState({status: "ready", isPro: false}), {
    status: "free", label: "CueScore Free", action: "Proを購入・購入を復元"
  });
});

test("verified Pro remains visible during a foreground refresh", () => {
  assert.deepEqual(diagnostic.planViewState({status: "loading", isPro: true}), {
    status: "pro", label: "CueScore Pro ✓", action: "購入・復元について"
  });
});

test("Settings contains the current-plan card and reuses the existing Pro surface", () => {
  assert.match(html, /class="settings-plan-card-v72" aria-label="現在のプラン"/);
  assert.match(html, /data-settings-plan-state[^>]*>確認中/);
  assert.match(html, /data-settings-plan-action-label>購入情報を確認中/);
  assert.match(web, /open\("currentPlan",\{trigger\}\)/);
  assert.equal((web.match(/cue-pro-overlay-v1/g) || []).length >= 1, true);
});

test("plan UI subscribes to the existing CueScoreEntitlement SSOT", () => {
  assert.match(web, /window\.CueScoreEntitlement=entitlement/);
  assert.match(web, /entitlement\.subscribe\(snapshot=>\{syncPaywall\(\);syncSettingsPlan\(snapshot\);decorate\(\)/);
  assert.match(web, /syncSettingsPlan\(\)/);
  assert.doesNotMatch(web, /localStorage[\s\S]{0,80}(?:isPro|proPlan|purchased)/i);
});

test("plan card uses overflow-safe portrait layout", () => {
  assert.match(html, /\.settings-plan-status-v72,[\s\S]*?grid-template-columns: minmax\(0,1fr\) auto/);
  assert.match(html, /\.settings-plan-action-v72[\s\S]*?grid-template-columns: minmax\(0,1fr\) 18px/);
  assert.match(html, /\.settings-plan-value-v72[\s\S]*?overflow-wrap: anywhere/);
  assert.match(html, /\.settings-plan-card-v72[\s\S]*?border-radius: 18px/);
});

test("compact iPhone portrait layout keeps every Settings item on one page", () => {
  assert.match(html, /@media \(max-width: 430px\) and \(max-height: 900px\)/);
  assert.match(html, /@media \(max-width: 430px\) and \(max-height: 900px\)[\s\S]*?\.settings-data-row-v1 \{[\s\S]*?min-height: 63px !important/);
  assert.match(html, /@media \(max-width: 430px\) and \(max-height: 900px\)[\s\S]*?\.settings-plan-action-v72 \{[\s\S]*?min-height: 44px/);
  assert.match(html, /@media \(max-width: 430px\) and \(max-height: 900px\)[\s\S]*?\.settings-formal-spacer-v1 \{[\s\S]*?min-height: 0 !important/);
  assert.match(html, /@media \(max-width: 430px\) and \(max-height: 900px\)[\s\S]*?\.settings-info-link-v1 \{ min-height: 42px; \}/);
  assert.match(html, /\.settings-plan-value-v72[\s\S]*?overflow-wrap: anywhere/);
});

test("Build 71 Pro and startup safety contracts remain present", () => {
  assert.match(web, /refreshSafely\("FOREGROUND"\)/);
  assert.match(web, /if\(entitlement\.isPro\(\)\)\{[\s\S]*?\.cue-pro-badge-v1/);
  assert.match(html, /window\.addEventListener\("unhandledrejection"[\s\S]*?console\.error/);
  assert.doesNotMatch(web, /¥980|\$5\.99/);
});
