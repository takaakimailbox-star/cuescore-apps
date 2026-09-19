import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

await import("../monetization-v1.js");
const diagnostic = globalThis.CueScoreIapDiagnostic;
const web = fs.readFileSync(new URL("../monetization-v1.js", import.meta.url), "utf8");
const native = fs.readFileSync(new URL("../ios/App/App/CueScoreStoreKitPlugin.swift", import.meta.url), "utf8");

test("Build 77 hides a previous storefront price while a fresh product loads", () => {
  const stale = {status:"ready", isPro:false, product:{localizedPrice:"$5.99"}};
  const loading = diagnostic.freshProductStart(stale);
  assert.equal(loading.product, null);
  assert.equal(loading.isPro, false);
  assert.deepEqual(diagnostic.productViewState(loading), {text:"価格を確認中…", canPurchase:false});
  assert.equal(diagnostic.productViewState(loading).text.includes("$5.99"), false);
});

test("Build 77 enables purchase only after the fresh displayPrice succeeds", () => {
  const fresh = {status:"ready", isPro:false, product:{localizedPrice:"¥980"}};
  assert.deepEqual(diagnostic.productViewState(fresh), {text:"¥980", canPurchase:true});
  assert.deepEqual(diagnostic.productViewState(fresh, true), {text:"¥980", canPurchase:false});
  assert.match(native, /"localizedPrice": product\.displayPrice/);
});

test("Build 77 fresh failure never renders stale price or demotes verified Pro", () => {
  const loadingPro = diagnostic.freshProductStart({status:"ready", isPro:true, product:{localizedPrice:"$5.99"}});
  const failure = {...loadingPro, status:"ready", product:null, error:"CODED_ERROR"};
  assert.equal(failure.isPro, true);
  assert.deepEqual(diagnostic.productViewState(failure), {text:"価格を取得できません", canPurchase:false});
  assert.equal(diagnostic.productViewState(failure).text.includes("$5.99"), false);
  assert.match(web, /product:product\|\|\(freshProduct\?null:previousProduct\)\|\|null/);
});

test("Build 77 opens with a synchronous fresh state and keeps purchase semantics", () => {
  assert.match(web, /entitlement\.beginFreshProductLoad\(\);overlay\.hidden=false/);
  assert.match(web, /refreshSafely\("PRO_OPEN",\{freshProduct:true\}\)/);
  assert.match(web, /requestId!==refreshSerial/);
  assert.match(web, /purchase:\(\)=>storeKit\.purchase\(\{productId:PRO_PRODUCT_ID\}\)/);
  assert.match(web, /if\(verified\(result\)\)[\s\S]*?status:"success"/);
  assert.match(web, /result\.status==="cancelled"/);
  assert.match(web, /result\.status==="pending"/);
});
