import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

await import("../monetization-v1.js");

const diagnostic = globalThis.CueScoreIapDiagnostic;
const native = fs.readFileSync(new URL("../ios/App/App/CueScoreStoreKitPlugin.swift", import.meta.url), "utf8");
const web = fs.readFileSync(new URL("../monetization-v1.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../monetization-v1.css", import.meta.url), "utf8");

test("Build 68 uses the injected Capacitor plugin registry first", () => {
  const registered = {getProduct() {}};
  let fallbackCalls = 0;
  const value = diagnostic.storeKitPlugin({
    Plugins: {CueScoreStoreKit: registered},
    registerPlugin() { fallbackCalls += 1; return {fallback: true}; }
  }, true);
  assert.equal(value, registered);
  assert.equal(fallbackCalls, 0);
});

test("Build 68 falls back to registerPlugin when the registry entry is absent", () => {
  const fallback = {getProduct() {}};
  const value = diagnostic.storeKitPlugin({registerPlugin(name) {
    assert.equal(name, "CueScoreStoreKit");
    return fallback;
  }}, true);
  assert.equal(value, fallback);
});

test("Build 68 reports no bridge adapter when neither native path exists", () => {
  assert.equal(diagnostic.storeKitPlugin({}, true), null);
  assert.equal(diagnostic.storeKitPlugin({Plugins: {}}, true), null);
  assert.equal(diagnostic.storeKitPlugin({Plugins: {CueScoreStoreKit: {}}}, false), null);
});

test("Build 67 distinguishes bridge errors without exposing error details", () => {
  assert.deepEqual(diagnostic.fromError(new Error("bridge unavailable")), {state: "BRIDGE_ERROR"});
  assert.equal(diagnostic.format({state: "BRIDGE_ERROR"}), "Diagnostic: BRIDGE_ERROR");
});

test("Build 67 distinguishes StoreKit throws by non-sensitive domain and code", () => {
  const value = diagnostic.fromError({
    code: "STOREKIT_ERROR",
    data: {diagnosticState: "STOREKIT_ERROR", errorDomain: "StoreKit.StoreKitError", errorCode: 7}
  });
  assert.deepEqual(value, {state: "STOREKIT_ERROR", errorDomain: "StoreKit.StoreKitError", errorCode: 7});
  assert.equal(diagnostic.format(value), "Diagnostic: STOREKIT_ERROR / domain=StoreKit.StoreKitError / code=7");
  assert.match(native, /let nsError = error as NSError/);
  assert.match(native, /"errorDomain": nsError\.domain/);
  assert.match(native, /"errorCode": nsError\.code/);
});

test("Build 67 distinguishes an empty product response", () => {
  const value = diagnostic.fromError({code: "PRODUCTS_EMPTY", data: {productsCount: 0}});
  assert.deepEqual(value, {state: "PRODUCTS_EMPTY", productsCount: 0});
  assert.equal(diagnostic.format(value), "Diagnostic: PRODUCTS_EMPTY / count=0");
  assert.match(native, /"productsCount": products\.count/);
});

test("Build 67 records product success count and Product ID match", () => {
  const value = diagnostic.fromProduct({productsCount: 1, productIdMatched: true});
  assert.deepEqual(value, {state: "PRODUCTS_OK", productsCount: 1, productIdMatched: true});
  assert.equal(diagnostic.format(value), "Diagnostic: PRODUCTS_OK / count=1 / match=YES");
  assert.match(native, /"localizedPrice": product\.displayPrice/);
  assert.match(native, /"productIdMatched": product\.id == Self\.proProductID/);
});

test("Build 67 diagnostic helper remains supplemental after its temporary UI is removed", () => {
  assert.doesNotMatch(web, /data-pro-diagnostic/);
  assert.match(web, /buyButton\.disabled=!productView\.canPurchase/);
  assert.doesNotMatch(web, /verified\s*=\s*.*diagnostic|diagnostic.*isPro\s*=\s*true/);
  assert.doesNotMatch(css, /\.cue-pro-diagnostic-v1/);
});
