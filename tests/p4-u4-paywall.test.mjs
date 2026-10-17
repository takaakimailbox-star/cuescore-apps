import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { core, ja } from "./helpers/i18n-ja-catalog.mjs";
import { rawRead } from "./helpers/ja-fs.mjs";
import { jaLiteralsInJs } from "./helpers/js-ja-literals.mjs";
import { cueCalls } from "./helpers/ja-source.mjs";

// Decision 038 / Official 121-122 (U4): the Paywall and the Settings plan card are translated into ja / en / zh-Hans.
// ja is unchanged; the purchase / restore / entitlement / price (StoreKit displayPrice) behaviour is untouched.
const require = createRequire(import.meta.url);
const cats = { ja, en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js") };
const i18n = Object.fromEntries(["ja", "en", "zh-Hans"].map(l => [l, core.createI18n({ language: l, storage: null })]));
let lang = "ja";
globalThis.window = globalThis;
globalThis.cueT = (key, params) => i18n[lang].t(key, params);
await import("../monetization-v1.js");
const diagnostic = globalThis.CueScoreIapDiagnostic;
const mon = rawRead("monetization-v1.js"), html = rawRead("index.html");

const manifest = JSON.parse(rawRead("tests/fixtures/p3/translation-manifest.json"));
const u4Keys = Object.entries(manifest.keys).filter(([, v]) => v.addedBy === "Decision 038 (U4 Paywall)").map(([k]) => k);

test("28 U4 keys are in all three catalogs; en / zh are non-empty and never reuse the ja text", () => {
  assert.equal(u4Keys.length, 28);
  for (const k of u4Keys) {
    assert.ok(cats.ja[k] && cats.en[k] && cats.zh[k], k);
    if (/[぀-ヿ一-鿿]/.test(cats.ja[k])) { assert.notEqual(cats.en[k], cats.ja[k], k); assert.doesNotMatch(cats.en[k], /[぀-ヿ一-鿿]/, k); assert.doesNotMatch(cats.zh[k], /[぀-ヿ]/, k); }
  }
});
test("the purchase-terms note is the fact-based plan B (no exaggerated guarantee) and no price is hard-coded in the strings", () => {
  const k = u4Keys.find(x => cats.ja[x] === "一度の購入でずっと利用できます");
  assert.equal(cats.en[k], "A one-time purchase. No subscription.");
  assert.equal(cats.zh[k], "一次性购买，无需订阅。");
  for (const x of u4Keys) for (const l of ["en", "zh"]) {
    assert.doesNotMatch(cats[l][x], /forever|for good|lifetime|permanent|永久|终身|永远/i, x);
    assert.doesNotMatch(cats[l][x], /[¥$￥€]\s*\d|\d+\s*円/, `${x}: price must come from StoreKit displayPrice`);
  }
});
test("ja strings are exactly the former literals (ja UI unchanged)", () => {
  const ex = { "購入・復元について": 1, "Proを購入・購入を復元": 1, "購入情報を確認中": 1, "価格を取得できません": 1, "復元できる購入は見つかりませんでした。": 1, "{x}はProで利用できます。": 1 };
  const have = new Set(u4Keys.map(k => cats.ja[k]));
  for (const t of Object.keys(ex)) assert.ok(have.has(t), t);
  lang = "ja";
  assert.deepEqual(diagnostic.planViewState({ status: "ready", isPro: false }), { status: "free", label: "CueScore Free", action: "Proを購入・購入を復元" });
  assert.deepEqual(diagnostic.productViewState({ status: "loading" }), { text: "価格を確認中…", canPurchase: false });
});
test("view states resolve per language; the Pro label and the StoreKit price are language-independent", () => {
  const want = {
    en: { unknown: ["Checking…", "Checking purchase info…"], free: ["CueScore Free", "Buy Pro / Restore purchase"], pro: ["CueScore Pro ✓", "About purchase & restore"], load: "Checking price…", fail: "Price unavailable" },
    "zh-Hans": { unknown: ["确认中…", "正在确认购买信息…"], free: ["CueScore Free", "购买 Pro／恢复购买"], pro: ["CueScore Pro ✓", "关于购买与恢复"], load: "正在确认价格…", fail: "无法获取价格" },
  };
  for (const [l, w] of Object.entries(want)) {
    lang = l;
    const u = diagnostic.planViewState({ status: "loading", isPro: false }), f = diagnostic.planViewState({ status: "ready", isPro: false }), p = diagnostic.planViewState({ isPro: true });
    assert.deepEqual([u.label, u.action, u.status], [...w.unknown, "unknown"]);
    assert.deepEqual([f.label, f.action, f.status], [...w.free, "free"]);
    assert.deepEqual([p.label, p.action, p.status], [...w.pro, "pro"]);
    assert.equal(diagnostic.productViewState({ status: "loading" }).text, w.load);
    assert.equal(diagnostic.productViewState({ status: "ready" }).text, w.fail);
    assert.deepEqual(diagnostic.productViewState({ status: "ready", product: { localizedPrice: "¥980" } }), { text: "¥980", canPurchase: true });
  }
  lang = "ja";
});
test("monetization-v1.js has no Japanese literal left and every cueT key exists in all catalogs with matching parameters", () => {
  assert.deepEqual(jaLiteralsInJs(mon), []);
  const calls = cueCalls(mon);
  assert.equal(calls.length, 36);
  for (const { key, params } of calls) for (const c of Object.values(cats)) {
    assert.ok(c[key], key);
    const need = new Set([...c[key].matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]));
    assert.deepEqual([...params].sort(), [...need].sort(), key);
  }
  assert.match(html, /settings-formal-section-title-v1">\$\{window\.cueT\("p3\.8eec3c60"\)\}<\/h1>/);
});
test("purchase / restore / entitlement / product contract is unchanged", () => {
  assert.match(mon, /const PRO_PRODUCT_ID="com\.takaakimailboxstar\.cuescoreapps\.pro"/);
  assert.match(mon, /purchase:\(\)=>storeKit\.purchase\(\{productId:PRO_PRODUCT_ID\}\)/);
  assert.match(mon, /restore:\(\)=>storeKit\.restore\(\)/);
  assert.match(mon, /text:String\(snapshot\.product\.localizedPrice\)/);
  assert.match(mon, /result\.status==="notFound"/);
  assert.match(mon, /const verified=value=>Boolean\(value\?\.verified===true&&value\?\.isPro===true\)/);
  assert.match(mon, /result\.status==="pending"/);
});
