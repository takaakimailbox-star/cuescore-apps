import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";
import { cueCalls } from "./helpers/ja-source.mjs";

// P3 translation catalog consistency (Official 108 AC-1 for the P3 keys): every key used by the product exists in ja / en / zh-Hans with the same
// placeholders, provisional translations are tracked as P3-PROVISIONAL, and no Japanese leaks into the en catalog.
const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
const raw = name => globalThis.__p3RawReadFileSync.call(fs, new URL(name, root), "utf8");
const catalogs = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js") };
const manifest = JSON.parse(raw("tests/fixtures/p3/translation-manifest.json"));
const PRODUCT = fs.readdirSync(root).filter(f => /\.(js|html)$/.test(f) && !/^(sw\.js|i18n-catalog-|support\.html|privacy\.html|terms\.html|official-document\.js)/.test(f));
const placeholders = text => [...String(text).matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]).sort().join(",");

const calls = []; const staticKeys = new Set();
for (const file of PRODUCT) {
  const text = raw(file);
  for (const call of cueCalls(text)) calls.push({ file, ...call });
  for (const m of text.matchAll(/data-i18n(?:-[a-z-]+)?="(p3\.[0-9a-f]{8})"/g)) staticKeys.add(m[1]);
}
const used = new Set([...calls.map(call => call.key), ...staticKeys]);

test("every P3 key used by the product exists in ja, en and zh-Hans, and no catalog carries an unused P3 key", () => {
  assert.ok(used.size > 0 || Object.keys(manifest.keys).length === 0);
  for (const key of used) for (const [name, catalog] of Object.entries(catalogs)) assert.ok(key in catalog, `${name} is missing ${key}`);
  for (const [name, catalog] of Object.entries(catalogs)) for (const key of Object.keys(catalog).filter(k => k.startsWith("p3."))) assert.ok(used.has(key), `${name}:${key} is not used by any product source`);
});

test("the review-state manifest lists exactly the P3 keys and keeps them P3-PROVISIONAL (never P4-APPROVED)", () => {
  assert.equal(manifest.status, "P3-PROVISIONAL");
  assert.deepEqual(Object.keys(manifest.keys).sort(), [...used].sort());
  for (const [key, entry] of Object.entries(manifest.keys)) { assert.equal(entry.status, "P3-PROVISIONAL", key); assert.ok(Number.isInteger(entry.area) && entry.area >= 1 && entry.area <= 6, key); }
});

test("placeholders match across ja / en / zh-Hans (plural forms included) and call sites supply every placeholder", () => {
  for (const key of used) {
    const base = placeholders(catalogs.ja[key]);
    for (const name of ["en", "zh"]) {
      const value = catalogs[name][key];
      const forms = typeof value === "object" ? Object.values(value) : [value];
      for (const form of forms) { assert.equal(typeof form, "string"); assert.ok(form.length > 0, `${name}:${key} empty`); assert.equal(placeholders(form), base, `${name}:${key} placeholders`); }
    }
  }
  for (const call of calls) for (const name of placeholders(catalogs.ja[call.key]).split(",").filter(Boolean)) assert.ok(call.params.has(name), `${call.file}: ${call.key} call is missing {${name}}`);
});

test("plural en entries receive a count parameter at every call site; zh and ja stay plain strings", () => {
  for (const key of used) {
    assert.equal(typeof catalogs.ja[key], "string", `ja:${key}`);
    assert.equal(typeof catalogs.zh[key], "string", `zh:${key}`);
    const en = catalogs.en[key];
    if (typeof en === "object") {
      assert.ok(typeof en.one === "string" && typeof en.other === "string", `en:${key} needs one and other`);
      for (const call of calls.filter(c => c.key === key)) assert.ok(call.params.has("count"), `${call.file}: plural ${key} needs count`);
    }
  }
});

test("en text contains no Japanese and neither translation contains HTML-significant characters", () => {
  for (const key of used) {
    for (const [name, value] of [["en", catalogs.en[key]], ["zh", catalogs.zh[key]]]) {
      const forms = typeof value === "object" ? Object.values(value) : [value];
      for (const form of forms) {
        assert.doesNotMatch(form, /[<>"]/, `${name}:${key} has an HTML-significant character`);
        if (name === "en") assert.doesNotMatch(form, /[぀-ヿ一-鿿]/, `en:${key} contains Japanese`);
      }
    }
  }
});

test("Japanese catalog text of every P3 key is the original display text (non-empty, no placeholder-only message)", () => {
  for (const key of used) { const ja = catalogs.ja[key]; assert.ok(ja.replace(/\{[A-Za-z0-9_]+\}/g, "").trim().length > 0, key); }
});

test("applyStatic rewrites only the first / last text node of mixed-content elements and leaves ja untouched", async () => {
  const core = require("../i18n-v1.js");
  const make = language => {
    const node = {
      attrs: { "data-i18n-text-first": "k.first", "data-i18n-text-last": "k.last" },
      childNodes: [{ nodeType: 3, nodeValue: "\n  A text" }, { nodeType: 1 }, { nodeType: 3, nodeValue: "B text  " }],
      getAttribute(name) { return this.attrs[name] ?? null; }, setAttribute() {}, matches() { return false; }, querySelectorAll() { return []; }
    };
    const root = { ...node, matches(sel) { return /data-i18n-text-first/.test(sel); }, querySelectorAll() { return []; } };
    core.registerCatalog("test-ja", { "k.first": "A", "k.last": "B" });
    core.registerCatalog("en", { "k.first": "First", "k.last": "Last" });
    core.registerCatalog("ja", { "k.first": "A", "k.last": "B" });
    const i18n = core.createI18n({ language, storage: null, languages: [language] });
    return { node: root, run: () => i18n.applyStatic(root) };
  };
  const en = make("en"); en.run();
  assert.equal(en.node.childNodes[0].nodeValue, "\n  First");
  assert.equal(en.node.childNodes[2].nodeValue, "Last  ");
  assert.equal(en.node.childNodes[1].nodeType, 1);
  const ja = make("ja"); assert.deepEqual(ja.run(), { changed: 0 });
  assert.equal(ja.node.childNodes[0].nodeValue, "\n  A text");
});
