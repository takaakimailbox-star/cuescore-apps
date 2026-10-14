/* P2-1 Domain constants / fixed locales. The constants hold the EXISTING canonical values; these tests freeze the values
 * (code points), the placement (script order, Service Worker, native bundle) and the AC-S4 / AC-S6 ratchets after the move. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { read, indexHtml, codePoints, count, matchClose } from "./helpers/p2-source.mjs";

const require = createRequire(import.meta.url);
const domain = require("../domain-constants-v1.js");
const html = indexHtml();

const isDeepFrozen = value => Object.isFrozen(value) && Object.values(value).every(v => typeof v !== "object" || v === null || isDeepFrozen(v));

test("[P2L-004,005,006,007] resultLabel canonical values keep their exact code points", () => {
  const expected = {
    NO_SCORE: "U+7121 U+5F97 U+70B9", ONE: "U+0031 U+500B", TWO: "U+0032 U+500B", TWO_OR_MORE: "U+0032 U+500B U+4EE5 U+4E0A",
    THREE_OR_MORE: "U+0033 U+500B U+4EE5 U+4E0A", SCRATCH: "U+30B9 U+30AF U+30E9 U+30C3 U+30C1", ILLEGAL: "U+30A4 U+30EA U+30FC U+30AC U+30EB",
    BREAK_FAILED: "U+30D6 U+30EC U+30A4 U+30AF U+5931 U+6557", BREAK_FOUL: "U+30D6 U+30EC U+30A4 U+30AF U+30D5 U+30A1 U+30FC U+30EB",
    PRE_BREAK_FOUL: "U+30D5 U+30A1 U+30FC U+30EB U+FF08 U+30D6 U+30EC U+30A4 U+30AF U+4EA4 U+4EE3 U+FF09",
    SKIPPED: "U+8A18 U+9332 U+306A U+3057"
  };
  assert.deepEqual(Object.keys(domain.RESULT_LABELS), Object.keys(expected));
  for (const [key, cps] of Object.entries(expected)) assert.equal(codePoints(domain.RESULT_LABELS[key]), cps, key);
  assert.equal(codePoints(domain.pocketedLabel(3)), "U+0033 U+7403 U+30A4 U+30F3");
  for (let n = 1; n <= 9; n++) assert.equal(domain.pocketedLabel(n), `${n}球イン`);
});

test("[P2L-023,024,025,026] category defaults and reserved names keep their stored values", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(domain.FREE_CATEGORY)), { id: "category_free", name: "Free" });
  assert.deepEqual(JSON.parse(JSON.stringify(domain.DEFAULT_CATEGORIES)), { TOURNAMENT: { id: "category_tournament", name: "大会" }, OTHER: { id: "category_other", name: "その他" } });
  assert.equal(codePoints(domain.DEFAULT_CATEGORIES.TOURNAMENT.name), "U+5927 U+4F1A");
  assert.equal(codePoints(domain.DEFAULT_CATEGORIES.OTHER.name), "U+305D U+306E U+4ED6");
  assert.deepEqual([...domain.LEGACY_REMOVED_CATEGORY_NAMES], ["JPA", "KTCリーグ", "練習試合"]);
  assert.deepEqual([...domain.RESERVED_CATEGORY_NAMES], ["Free", "JPA", "KTCリーグ", "練習試合"]);
});

test("[P2L-035..077] fixed locales keep their values and are language independent", () => {
  assert.equal(domain.IDENTITY_LOCALE, "ja"); assert.equal(domain.SORT_LOCALE, "ja"); assert.equal(domain.IDENTITY_NORMALIZATION_FORM, "NFKC");
});

test("the Domain asset is frozen, dependency-free and exposes exactly the P2-1 API (no UI language, DOM or storage)", () => {
  assert.ok(isDeepFrozen(domain));
  assert.deepEqual(Object.keys(domain).sort(), ["DEFAULT_CATEGORIES", "FREE_CATEGORY", "IDENTITY_LOCALE", "IDENTITY_NORMALIZATION_FORM", "LEGACY_REMOVED_CATEGORY_NAMES", "RESERVED_CATEGORY_NAMES", "RESULT_LABELS", "SORT_LOCALE", "pocketedLabel"]);
  const src = read("domain-constants-v1.js");
  assert.ok(!/require\(|document\.|localStorage|sessionStorage|cueT\(|CueScoreI18n|navigator\./.test(src), "no dependency, DOM, storage or language lookup");
});

test("placement: loaded before every consumer, precached by the Service Worker and bundled for native", () => {
  const order = [...html.matchAll(/<script src="\.\/([^"?]+)/g)].map(m => m[1]);
  const at = order.indexOf("domain-constants-v1.js");
  assert.ok(at > 0, "script tag present");
  for (const consumer of ["match-sharing-validation-v1.js", "match-sharing-persistence-v1.js", "match-sharing-player-drafts-v1.js", "record-access-v1.js", "ui-revision-v12.js"]) assert.ok(order.indexOf(consumer) > at, consumer + " loads after the Domain asset");
  const firstInline = html.indexOf("<script>");
  assert.ok(html.indexOf('src="./domain-constants-v1.js"') < firstInline, "before the first inline script");
  assert.ok(read("sw.js").includes('"./domain-constants-v1.js"'));
  assert.ok(read("scripts/build-native-web.mjs").includes('"domain-constants-v1.js"'));
  // dependency order inside i18n: the domain asset does not depend on i18n and i18n does not depend on it
  assert.ok(!read("i18n-v1.js").includes("CueScoreDomainV1"));
});

test("every UMD consumer resolves the Domain asset itself (Node require / browser global) and fails loudly without it", () => {
  for (const f of ["match-sharing-persistence-v1.js", "match-sharing-player-drafts-v1.js", "record-access-v1.js"]) {
    const src = read(f);
    assert.ok(src.includes('require("./domain-constants-v1.js")') && src.includes("root.CueScoreDomainV1") && src.includes("Domain constants are required"), f);
  }
  for (const f of ["match-sharing-persistence-v1.js", "match-sharing-player-drafts-v1.js", "record-access-v1.js"]) assert.ok(require("../" + f));
});

/* ---------- AC-S4 / AC-S6 ratchets after P2-1 ---------- */
const CANON = ["無得点", "1個", "2個", "2個以上", "3個以上", "スクラッチ", "イリーガル", "ブレイク失敗", "ブレイクファール", "ファール（ブレイク交代）"];
test("[P2L-004..011] AC-S4: no resultLabel canonical literal remains in production logic outside the Domain asset (dead V61 table, i18n Mapper table and demo fixtures excepted)", () => {
  const dead = html.indexOf("const BREAK_RESULT_LABELS_V61 = {");
  const stripped = html.slice(0, dead) + html.slice(matchClose(html, html.indexOf("{", dead)) + 1);
  const re = new RegExp("[\"'`](" + CANON.join("|") + ")[\"'`]", "g");
  assert.deepEqual([...stripped.matchAll(re)].map(m => m[0]), []);
  for (const f of fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f))) {
    if (["domain-constants-v1.js", "i18n-v1.js", "demo-data.js", "sw.js"].includes(f) || f === "index.html" || /^i18n-catalog/.test(f)) continue;
    assert.deepEqual([...read(f).matchAll(re)].map(m => m[0]), [], f);
  }
});
test("[P2L-023..026] AC-S4: category default / reserved literals are gone from index.html", () => {
  for (const literal of ['"JPA"', '"KTCリーグ"', '"練習試合"', '"category_tournament"', '"category_other"', '"category_free"', '"Free"']) assert.equal(count(html, literal), 0, literal);
});
test("[P2L-035..077] AC-S6: every case-folding / collation / NFKC identity call reads the Domain constant", () => {
  const files = fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && !/^(sw\.js|support\.html|privacy\.html|terms\.html|official-document\.js)$/.test(f));
  for (const f of files) {
    const src = read(f);
    assert.equal(count(src, /toLocaleLowerCase\(\s*["']ja["']\s*\)/), 0, f + " toLocaleLowerCase('ja')");
    assert.equal(count(src, /localeCompare\([^\n]*?,\s*["']ja["']/), 0, f + " localeCompare(..,'ja')");
  }
  assert.equal(count(html, "toLocaleLowerCase(CueScoreDomainV1.IDENTITY_LOCALE)"), 16);
});

/* ---------- behavior: the consumers really read the constants (sentinel Domain + spies) ---------- */
import vm from "node:vm";
function loadWithSentinel(file, constants) {
  const captured = { lower: [], compare: [], normalize: [] };
  const ctx = vm.createContext({ module: { exports: {} }, require: () => constants, globalThis: undefined });
  ctx.globalThis = ctx;
  vm.runInContext(`
    String.prototype.toLocaleLowerCase = function (loc) { __cap.lower.push(loc); return String(this); };
    String.prototype.localeCompare = function (other, loc) { __cap.compare.push(loc); return 0; };
    String.prototype.normalize = function (form) { __cap.normalize.push(form); return String(this); };
  `.replace(/__cap/g, "__cap"), Object.assign(ctx, { __cap: captured }));
  vm.runInContext(read(file), ctx, { filename: file });
  return { api: ctx.module.exports, captured };
}
test("[P2L-050] persistence normalizeText passes the Domain identity locale and normalization form", () => {
  const { api, captured } = loadWithSentinel("match-sharing-persistence-v1.js", { IDENTITY_LOCALE: "sentinel-locale", IDENTITY_NORMALIZATION_FORM: "sentinel-form", SORT_LOCALE: "x" });
  const fn = api.normalizeText || api.__test?.normalizeText;
  if (typeof fn === "function") { fn("A b"); assert.ok(captured.lower.includes("sentinel-locale")); assert.ok(captured.normalize.includes("sentinel-form")); }
  else assert.ok(read("match-sharing-persistence-v1.js").includes("normalize(domain.IDENTITY_NORMALIZATION_FORM)") && read("match-sharing-persistence-v1.js").includes("toLocaleLowerCase(domain.IDENTITY_LOCALE)"));
});
test("[P2L-076] record-access stableNewest compares ids with the Domain sort locale (numeric)", () => {
  const { api, captured } = loadWithSentinel("record-access-v1.js", { SORT_LOCALE: "sentinel-sort" });
  api.stableNewest({ id: "a" }, { id: "b" });
  assert.deepEqual(captured.compare, ["sentinel-sort"]);
});
test("[P2L-077] ui-revision stable sort and [P2L-051] player-draft nameKey source tokens read the Domain constants", () => {
  assert.ok(read("ui-revision-v12.js").includes("CueScoreDomainV1.SORT_LOCALE,{numeric:true}"));
  const { api, captured } = loadWithSentinel("match-sharing-player-drafts-v1.js", { IDENTITY_LOCALE: "sentinel-locale", IDENTITY_NORMALIZATION_FORM: "x", SORT_LOCALE: "x" });
  assert.ok(api);
  assert.ok(read("match-sharing-player-drafts-v1.js").includes("toLocaleLowerCase(domain.IDENTITY_LOCALE)"));
});
