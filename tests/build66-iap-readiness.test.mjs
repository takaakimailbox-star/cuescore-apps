import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const web=fs.readFileSync(new URL("../monetization-v1.js",import.meta.url),"utf8");
const native=fs.readFileSync(new URL("../ios/App/App/CueScoreStoreKitPlugin.swift",import.meta.url),"utf8");
const config=fs.readFileSync(new URL("../ios/App/CueScore.storekit",import.meta.url),"utf8");
const recordPolicy=fs.readFileSync(new URL("../record-access-v1.js",import.meta.url),"utf8");

test("Build 67 keeps the immutable Product ID identical in web, native and StoreKit configuration",()=>{
  const id="com.takaakimailboxstar.cuescoreapps.pro";
  for(const source of [web,native,config])assert.ok(source.includes(id));
});

test("StoreKit product success returns localized displayPrice and zero products stays unavailable",()=>{
  assert.match(native,/let products = try await Product\.products\(for: \[Self\.proProductID\]\)/);
  assert.match(native,/guard let product = products\.first[\s\S]*?"PRODUCTS_EMPTY"/);
  assert.match(native,/"localizedPrice": product\.displayPrice/);
  assert.match(web,/snapshot\?\.status==="loading"[\s\S]*?"価格を確認中…"/);
  assert.match(web,/snapshot\?\.product\?\.localizedPrice[\s\S]*?String\(snapshot\.product\.localizedPrice\)/);
  assert.match(web,/buyButton\.disabled=!productView\.canPurchase/);
});

test("verified, cancelled, pending and failure purchase outcomes remain distinct",()=>{
  assert.match(native,/case \.success\(let result\):[\s\S]*?case \.verified/);
  assert.match(native,/case \.userCancelled:[\s\S]*?"status": "cancelled"/);
  assert.match(native,/case \.pending:[\s\S]*?"status": "pending"/);
  assert.match(web,/if\(verified\(result\)\)[\s\S]*?status:"success"/);
  assert.match(web,/return\{status:"failure",error\}/);
});

test("entitlement refresh preserves verified Pro when only product lookup fails",()=>{
  assert.match(web,/current=await adapter\.currentEntitlement\(\)/);
  assert.match(web,/product=await adapter\.product\?\.\(\)/);
  assert.match(web,/const isPro=verified\(current\);emit\(\{status:product\|\|isPro\?"ready":"error",isPro,product:product\|\|\(freshProduct\?null:previousProduct\)\|\|null/);
});

test("product and entitlement retry on Pro open and foreground lifecycle",()=>{
  assert.match(web,/entitlement\.beginFreshProductLoad\(\);[\s\S]*?syncPaywall\(\);void refreshSafely\("PRO_OPEN",\{freshProduct:true\}\)/);
  assert.match(web,/visibilitychange[\s\S]*?visibilityState==="visible"[\s\S]*?refreshSafely\("FOREGROUND"\)/);
});

test("restore syncs App Store and unlocks only a verified current entitlement",()=>{
  assert.match(native,/try await AppStore\.sync\(\)/);
  assert.match(native,/Transaction\.currentEntitlements/);
  assert.match(web,/async restore\(\)[\s\S]*?if\(verified\(result\)\)[\s\S]*?isPro:true[\s\S]*?status:"notFound"/);
});

test("Pro still unlocks every approved scope without changing the shared gate",()=>{
  for(const scope of ["personalBest","analysis","opponents","historyLimit","backup","restore"])assert.match(web,new RegExp(`${scope}:`));
});

test("Free newest-20 policy remains unchanged and does not delete stored records",()=>{
  assert.match(recordPolicy,/FREE_LIMIT=20/);
  assert.match(recordPolicy,/\.slice\(0,FREE_LIMIT\)/);
  assert.doesNotMatch(recordPolicy,/localStorage\.(removeItem|clear)/);
});
