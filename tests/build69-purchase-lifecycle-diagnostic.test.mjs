import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

await import("../monetization-v1.js");

const diagnostic = globalThis.CueScoreIapDiagnostic;
const native = fs.readFileSync(new URL("../ios/App/App/CueScoreStoreKitPlugin.swift", import.meta.url), "utf8");
const web = fs.readFileSync(new URL("../monetization-v1.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../monetization-v1.css", import.meta.url), "utf8");

test("Build 69 contains every approved native purchase lifecycle phase", () => {
  for (const phase of [
    "P01 PURCHASE_NATIVE_ENTERED",
    "P02 PRODUCT_FETCH_STARTED",
    "P03 PRODUCT_READY",
    "P04 PURCHASE_AWAIT_STARTED",
    "P05 PURCHASE_RESULT_RETURNED",
    "P06 VERIFICATION_STARTED",
    "P07 VERIFIED",
    "P08 UNVERIFIED",
    "P09 FINISH_STARTED",
    "P10 FINISH_COMPLETED",
    "P11 BRIDGE_RESOLVE_STARTED",
    "P12 NATIVE_SUCCESS_READY"
  ]) assert.ok(native.includes(phase), phase);
});

test("native diagnostics distinguish success, pending, cancellation, unknown, throw, resolve and reject", () => {
  for (const status of ["SUCCESS", "PENDING", "USER_CANCELLED", "UNKNOWN"]) {
    assert.ok(native.includes(`\"resultStatus\": \"${status}\"`), status);
  }
  assert.match(native, /errorDomain[\s\S]*?errorCode[\s\S]*?PURCHASE_THROW/);
  assert.match(native, /case \.unverified[\s\S]*?P08 UNVERIFIED/);
  assert.match(native, /P11 BRIDGE_RESOLVE_STARTED[\s\S]*?call\.resolve/);
  assert.match(native, /call\.reject/);
});

test("JavaScript diagnostics distinguish click, await, resolve, reject and Pro application", () => {
  for (const phase of [
    "J01 JS_PURCHASE_CLICK",
    "J02 JS_ENTITLEMENT_PURCHASE_ENTERED",
    "J03 JS_NATIVE_PROMISE_WAIT",
    "J04 JS_NATIVE_PROMISE_RESOLVED",
    "J05 JS_NATIVE_PROMISE_REJECTED",
    "J06 JS_PRO_APPLIED"
  ]) assert.ok(web.includes(phase), phase);
  assert.equal(diagnostic.purchaseStatus({status: "success"}), "success");
  assert.equal(diagnostic.purchaseStatus({status: "pending"}), "pending");
  assert.equal(diagnostic.purchaseStatus({status: "cancelled"}), "cancelled");
  assert.equal(diagnostic.purchaseStatus({status: "unexpected"}), "failure");
});

test("listener rejection is consumed and classified without an unhandled rejected Promise", async () => {
  const events = [];
  const cleanup = diagnostic.registerListener(
    {addListener: () => Promise.reject(Object.assign(new Error("not available"), {code: "PLUGIN_ERROR"}))},
    "entitlementChanged",
    () => {},
    {start: () => events.push("start"), success: () => events.push("success"), reject: error => events.push(diagnostic.safeError(error).classification)}
  );
  assert.equal(await cleanup.ready, false);
  assert.deepEqual(events, ["start", "CODED_ERROR"]);
  cleanup();
});

test("diagnostic history is bounded to the latest 20 entries", () => {
  const history = diagnostic.createHistory(20);
  for (let index = 1; index <= 25; index += 1) history.push(`phase-${index}`);
  assert.equal(history.snapshot().length, 20);
  assert.equal(history.snapshot()[0], "phase-6");
  assert.equal(history.snapshot().at(-1), "phase-25");
});

test("foreground, transaction update and current entitlement reads are diagnostic-only", () => {
  assert.match(web, /VISIBILITY_/);
  assert.match(web, /ENTITLEMENT_REFRESH_STARTED/);
  assert.match(web, /ENTITLEMENT_REFRESH_RESULT/);
  assert.match(native, /TRANSACTION_UPDATE_RECEIVED/);
  assert.match(native, /TRANSACTION_UPDATE_VERIFIED/);
  assert.match(native, /TRANSACTION_UPDATE_UNVERIFIED/);
  assert.match(native, /TRANSACTION_UPDATE_ENTITLEMENT/);
  assert.match(native, /CURRENT_ENTITLEMENTS_RESULT/);
  assert.match(native, /matchingVerifiedEntitlement/);
  assert.match(native, /"revoked"/);
});

test("temporary Pro diagnostics show storefront and a bounded phase history", () => {
  assert.match(web, /data-pro-storefront/);
  assert.match(web, /Purchase Diagnostic/);
  assert.match(web, /data-purchase-diagnostic/);
  assert.match(css, /\.cue-pro-purchase-diagnostic-v1 pre\{[^}]*height:78px[^}]*overflow:auto/);
  assert.equal(diagnostic.formatStorefront({storefrontCountryCode: "us", storefrontId: "143441"}), "Storefront: US / 143441");
  assert.equal(diagnostic.formatStorefront({}), "Storefront: unavailable");
});

test("diagnostics preserve StoreKit authority and avoid sensitive transaction payloads", () => {
  const productId = "com.takaakimailboxstar.cuescoreapps.pro";
  assert.ok(native.includes(productId));
  assert.ok(web.includes(productId));
  assert.match(native, /switch try await product\.purchase\(\)/);
  assert.match(native, /await transaction\.finish\(\)/);
  assert.match(native, /Transaction\.currentEntitlements/);
  assert.match(native, /try await AppStore\.sync\(\)/);
  assert.doesNotMatch(native, /transactionId|transactionID|signedTransaction|\bJWS\b/);
  assert.doesNotMatch(web, /receipt|payment credentials/i);
});
