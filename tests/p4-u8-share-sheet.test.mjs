import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

// Decision 037 (U8) / Official 120 P4A-R6: the Backup Share Sheet title / text / dialogTitle are display strings resolved through the catalog.
// Backup schema, keys, JSON payload, file name, storage location and the restore path never see them.
const require = createRequire(import.meta.url);
const raw = name => globalThis.__p3RawReadFileSync.call(fs, new URL("../" + name, import.meta.url), "utf8");
const cat = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js") };
const index = raw("index.html");
const K = { title: "p3.be9b322f", text: "p3.699efd71", dialog: "p3.bce07140" };

test("the three strings are fixed by Official 120; ja is exactly the former literal", () => {
  assert.deepEqual([cat.ja[K.title], cat.ja[K.text], cat.ja[K.dialog]], ["CueScore Apps バックアップ", "CueScore Apps v1.0 バックアップ", "バックアップを保存"]);
  assert.deepEqual([cat.en[K.title], cat.en[K.text], cat.en[K.dialog]], ["CueScore Apps Backup", "CueScore Apps v1.0 Backup", "Save backup"]);
  assert.deepEqual([cat.zh[K.title], cat.zh[K.text], cat.zh[K.dialog]], ["CueScore Apps 备份", "CueScore Apps v1.0 备份", "保存备份"]);
});
test("Share.share receives the catalog strings and the share call keeps its other arguments", () => {
  const m = index.match(/await Share\.share\(\{([\s\S]*?)\}\);/);
  assert.ok(m, "Share.share call");
  assert.match(m[1], new RegExp(`title: window\\.cueT\\("${K.title}"\\)`));
  assert.match(m[1], new RegExp(`text: window\\.cueT\\("${K.text}"\\)`));
  assert.match(m[1], /url: file\.uri/);
  assert.match(m[1], new RegExp(`dialogTitle: window\\.cueT\\("${K.dialog}"\\)`));
});
test("the strings do not reach the backup file name, the payload, storage or the restore path", () => {
  for (const key of Object.values(K)) {
    const uses = [...index.matchAll(new RegExp(key.replace(".", "\\."), "g"))];
    assert.equal(uses.length, 1, `${key} is used exactly once (the Share.share call)`);
  }
  assert.match(index, /const filename = /);
  const around = index.slice(index.indexOf("await Share.share({") - 1400, index.indexOf("await Share.share({"));
  assert.doesNotMatch(around, /p3\.(be9b322f|699efd71|bce07140)/);
  assert.match(around, /Filesystem\.writeFile/);
  for (const f of fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && !/^i18n-catalog-/.test(f))) if (f !== "index.html") assert.doesNotMatch(raw(f), /p3\.(be9b322f|699efd71|bce07140)/, f);
});
