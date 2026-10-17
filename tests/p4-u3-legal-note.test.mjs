import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

// Decision 037 (U3) / Official 120 P4A-R5: en / zh-Hans show a note that the legal pages are Japanese; ja renders nothing; the legal pages,
// links, back handling and consent behaviour are unchanged.
const require = createRequire(import.meta.url);
const raw = name => globalThis.__p3RawReadFileSync.call(fs, new URL("../" + name, import.meta.url), "utf8");
const cat = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js") };
const index = raw("index.html");
const KEY = "p3.61b05c7d";

test("the note text is fixed by Official 120 and exists in all three catalogs", () => {
  assert.equal(cat.en[KEY], "Legal pages are currently available in Japanese only.");
  assert.equal(cat.zh[KEY], "法律页面目前仅提供日语版本。");
  assert.equal(cat.ja[KEY], "法務ページは現在、日本語のみで提供されています。");
});
test("the note is rendered only when the language is not ja (Settings caption and legal overlay bar)", () => {
  const uses = [...index.matchAll(/.{0,120}p3\.61b05c7d.{0,40}/g)].map(m => m[0]);
  assert.equal(uses.length, 2, uses.join("\n"));
  for (const u of uses) assert.match(index.slice(index.indexOf(u) - 200, index.indexOf(u) + u.length), /CueScoreI18n\.language !== "ja"/);
});
test("legal links, targets, back handling and the legal pages themselves are unchanged", () => {
  assert.match(index, /data-settings-legal="terms\.html"/);
  assert.match(index, /data-settings-legal="privacy\.html"/);
  assert.match(index, /CUESCORE_CLOSE_LEGAL_VIEW/);
  assert.match(index, /legalFrameV165\.src = new URL\(legalPage, window\.location\.href\)\.href;/);
  for (const f of ["terms.html", "privacy.html"]) assert.match(raw(f), /<html lang="ja">/);
});
