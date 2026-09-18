import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

await import("../monetization-v1.js");

const diagnostic = globalThis.CueScoreIapDiagnostic;
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const web = fs.readFileSync(new URL("../monetization-v1.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../monetization-v1.css", import.meta.url), "utf8");

test("all fire-and-forget entitlement refresh entry points use the safe boundary", () => {
  assert.match(web, /const refreshSafely=phase=>diagnostic\.settleSafely/);
  for (const phase of ["INITIAL_NATIVE", "PRO_OPEN", "FOREGROUND", "FALLBACK"]) {
    assert.ok(web.includes(`refreshSafely("${phase}")`), phase);
  }
  assert.doesNotMatch(web, /void entitlement\.refresh\(\)/);
});

test("safe boundary consumes a rejected Promise with only classified error data", async () => {
  const seen = [];
  let unhandled = 0;
  const listener = () => { unhandled += 1; };
  process.on("unhandledRejection", listener);
  const fallback = {status: "ready", isPro: true};
  const result = await diagnostic.settleSafely(
    () => Promise.reject(Object.assign(new Error("private detail"), {code: "TEMPORARY"})),
    error => seen.push(diagnostic.safeError(error)),
    fallback
  );
  await new Promise(resolve => setImmediate(resolve));
  process.off("unhandledRejection", listener);
  assert.equal(result, fallback);
  assert.equal(unhandled, 0);
  assert.deepEqual(seen, [{domain: "Error", code: "TEMPORARY", classification: "CODED_ERROR"}]);
});

test("temporary entitlement and product failures do not demote a verified Pro state", () => {
  assert.match(web, /previouslyVerified=state\.isPro===true/);
  assert.match(web, /status:previouslyVerified\?"ready":"error",isPro:previouslyVerified/);
  assert.match(web, /product:product\|\|previousProduct\|\|null/);
  assert.match(web, /PRODUCT_REFRESH_REJECTED/);
});

test("purchase UX blocks duplicate actions and acknowledges verified success", () => {
  assert.match(web, /if\(operationInFlight\)return/);
  assert.match(web, /buyButton\.disabled=operationInFlight/);
  assert.match(web, /restoreButton\.disabled=operationInFlight/);
  assert.match(web, /購入処理中です…/);
  assert.match(web, /✓ CueScore Proが有効になりました/);
  assert.match(web, /await new Promise\(resolve=>setTimeout\(resolve,900\)\)/);
  assert.match(web, /return close\(true\)/);
  assert.match(css, /data-busy="true"/);
  assert.match(web, /result\.status==="cancelled"/);
  assert.match(web, /result\.status==="pending"/);
  assert.match(web, /購入を完了できませんでした/);
});

test("verified Pro removes lock badges and prevents MutationObserver re-decoration", () => {
  assert.match(web, /if\(entitlement\.isPro\(\)\)\{[\s\S]*?\.cue-pro-badge-v1[\s\S]*?node=>node\.remove\(\)/);
  assert.match(web, /\.cue-pro-entry-v1[\s\S]*?classList\.remove\("cue-pro-entry-v1"\)/);
  assert.match(web, /\.cue-history-limit-v1[\s\S]*?node=>node\.remove\(\)/);
  assert.match(web, /MutationObserver\(\(\)=>requestAnimationFrame\(decorate\)\)/);
  assert.match(web, /entitlement\.subscribe\(snapshot=>\{syncPaywall\(\);syncSettingsPlan\(snapshot\);decorate\(\)/);
});

test("existing Pro sees active state and never a repurchase button", () => {
  assert.match(web, /data-pro-active hidden>✓ CueScore Pro 有効/);
  assert.match(web, /buyButton\.hidden=s\.isPro/);
  assert.match(web, /if\(entitlement\.isPro\(\)\|\|bypass\)return false/);
});

test("Build 69 debug UI is absent from the normal Pro surface", () => {
  for (const text of ["data-pro-diagnostic", "data-pro-storefront", "Purchase Diagnostic", "data-purchase-diagnostic"]) {
    assert.equal(web.includes(text), false, text);
  }
  assert.doesNotMatch(css, /cue-pro-(diagnostic|storefront|purchase-diagnostic)-v1/);
});

test("global unhandled rejection logs internally without a misleading user toast", () => {
  const block = html.match(/window\.addEventListener\("unhandledrejection", event => \{[\s\S]*?\n    \}\);/)?.[0] || "";
  assert.match(block, /console\.error/);
  assert.doesNotMatch(block, /showToast/);
  assert.doesNotMatch(block, /通信または保存を完了できませんでした/);
  assert.doesNotMatch(block, /接続状態を確認して/);
});

test("protected StoreKit and pricing contracts remain unchanged", () => {
  assert.match(web, /com\.takaakimailboxstar\.cuescoreapps\.pro/);
  assert.match(web, /localizedPrice/);
  assert.doesNotMatch(web, /¥980|\$5\.99/);
});
