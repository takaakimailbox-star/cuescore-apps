import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const core = require("../i18n-v1.js");
const ja = require("../i18n-catalog-ja-v1.js");
const en = require("../i18n-catalog-en-v1.js");
const zh = require("../i18n-catalog-zh-hans-v1.js");
const html = read("index.html");
const catalogs = { ja, en, "zh-Hans": zh };

const placeholders = text => [...String(text).matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(match => match[1]).sort().join(",");
const make = (language, extra = {}) => core.createI18n({ language, storage: null, ...extra });

/* ---------- catalogs ---------- */
test("ja / en / zh-Hans catalogs define exactly the same keys with the same placeholders", () => {
  const keys = Object.keys(ja).sort();
  assert.ok(keys.length > 60);
  assert.deepEqual(Object.keys(en).sort(), keys);
  assert.deepEqual(Object.keys(zh).sort(), keys);
  for (const key of keys) {
    for (const [name, catalog] of Object.entries(catalogs)) {
      assert.equal(typeof catalog[key], "string", `${name}:${key} must be a string`);
      assert.ok(catalog[key].length > 0, `${name}:${key} must not be empty`);
      assert.equal(placeholders(catalog[key]), placeholders(ja[key]), `${name}:${key} placeholders differ from ja`);
    }
  }
});

test("every key used by the application exists in all catalogs", () => {
  const sources = ["index.html", "navigation-shell-phase1.js", "navigation-phase2-6.js"].map(read).join("\n");
  const used = new Set([
    ...[...sources.matchAll(/cueT\("([A-Za-z0-9_.]+)"/g)].map(match => match[1]),
    ...[...sources.matchAll(/data-i18n(?:-[a-z-]+)?="([A-Za-z0-9_.]+)"/g)].map(match => match[1])
  ]);
  assert.ok(used.size > 40, "expected the representative screens to use many keys");
  for (const key of used) for (const [name, catalog] of Object.entries(catalogs)) assert.ok(key in catalog, `${name} is missing ${key}`);
});

test("Japanese invariance: the static markup text equals the ja catalog (no Japanese rewrite is needed)", () => {
  const decode = text => text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
  let checked = 0;
  for (const match of html.matchAll(/<(\w+)[^>]*\sdata-i18n="([^"]+)"[^>]*>([^<]*)</g)) {
    assert.equal(decode(match[3]), ja[match[2]], `static text of ${match[2]} must equal the ja catalog`);
    checked += 1;
  }
  for (const [attribute, target] of [["aria-label", "data-i18n-aria-label"], ["placeholder", "data-i18n-placeholder"]]) {
    for (const match of html.matchAll(new RegExp(`<[^>]*\\s${attribute}="([^"]*)"[^>]*\\s${target}="([^"]+)"[^>]*>`, "g"))) {
      assert.equal(decode(match[1]), ja[match[2]], `static ${attribute} of ${match[2]} must equal the ja catalog`);
      checked += 1;
    }
  }
  assert.ok(checked >= 25, `expected at least 25 static keys, found ${checked}`);
});

/* ---------- language resolution (Official 108 Part I §3) ---------- */
const resolveCases = [
  [[], "ja"], [["ja-JP"], "ja"], [["en-US"], "en"], [["zh-Hans-CN"], "zh-Hans"], [["zh-CN"], "zh-Hans"], [["zh-SG"], "zh-Hans"], [["zh"], "zh-Hans"],
  [["zh-Hant-TW"], "ja"], [["zh-TW"], "ja"], [["zh-HK"], "ja"], [["zh-MO"], "ja"], [["zh-Hant"], "ja"],
  [["ko-KR"], "ja"], [["fr-FR"], "ja"], [["ko-KR", "en-US"], "en"], [["zh-Hans-CN", "en-US"], "zh-Hans"], [["en-US", "zh-Hans-CN"], "en"], [["ja-JP", "zh-Hans-CN"], "ja"],
  // U10: a Traditional Chinese first preference resolves to ja whatever follows.
  [["zh-Hant-TW", "en-US"], "ja"], [["zh-TW", "en-US"], "ja"], [["zh-HK", "en-US"], "ja"], [["zh-MO", "en-US"], "ja"],
  [["zh-Hant-TW", "ja-JP"], "ja"], [["zh-Hant-TW", "zh-Hans-CN"], "ja"],
  [["en-US", "zh-Hant-TW"], "en"], [["zh-Hans-CN", "zh-Hant-TW"], "zh-Hans"], [["ja-JP", "zh-Hant-TW"], "ja"],
  [["fr-FR", "zh-TW", "en-GB"], "en"], [["ko-KR", "zh-Hant-TW", "en-US"], "en"], [["ko-KR", "zh-Hant-TW", "zh-Hans-CN"], "ja"],
  // script subtags win over region subtags; tags are case and separator insensitive
  [["zh-Hans-TW"], "zh-Hans"], [["zh-Hant-CN"], "ja"], [["ZH_hans_cn"], "zh-Hans"], [["EN_us"], "en"], [["yue-Hant-HK"], "ja"], [["cmn-Hans-CN"], "ja"]
];
test("device language resolution follows the Official 108 table including U10", () => {
  for (const [languages, expected] of resolveCases) {
    assert.equal(core.resolveDeviceLanguage(languages).language, expected, JSON.stringify(languages));
  }
});

test("a stored manual preference always wins and invalid stored values fall back to auto", () => {
  const storage = value => ({ getItem: key => (key === core.STORAGE_KEY ? value : null) });
  assert.equal(core.resolve({ storage: storage("en"), languages: ["zh-Hant-TW"] }).language, "en");
  assert.equal(core.resolve({ storage: storage("zh-Hans"), languages: ["ja-JP"] }).language, "zh-Hans");
  assert.equal(core.resolve({ storage: storage("ja"), languages: ["en-US"] }).language, "ja");
  assert.equal(core.resolve({ storage: storage("auto"), languages: ["en-US"] }).source, "device");
  for (const bad of ["zh-Hant", "fr", "", "EN", "{}", null]) assert.equal(core.readPreference(storage(bad)), "auto", String(bad));
  assert.equal(core.readPreference({ getItem() { throw new Error("denied"); } }), "auto");
  assert.equal(core.readPreference(null), "auto");
  assert.equal(core.resolve({ storage: storage(null), languages: ["xx"] }).language, "ja");
});

test("the language preference key is independent from every data namespace", () => {
  assert.equal(core.STORAGE_KEY, "cueScore.language.v1");
  assert.ok(!core.STORAGE_KEY.startsWith("rotationScoreboard."));
  assert.deepEqual([...core.SUPPORTED_LANGUAGES], ["ja", "en", "zh-Hans"]);
  assert.deepEqual([...core.PREFERENCES], ["auto", "ja", "en", "zh-Hans"]);
  for (const file of ["match-sharing-format-v1.js", "match-sharing-adapters-v1.js", "match-sharing-sender-v1.js", "match-sharing-receiver-v1.js", "match-sharing-persistence-v1.js", "match-sharing-transaction-v1.js", "match-sharing-validation-v1.js", "match-sharing-player-drafts-v1.js", "match-sharing-ui-v1.js", "demo-data.js", "record-access-v1.js"]) {
    assert.doesNotMatch(read(file), /cueScore\.language|CueScoreI18n|cueT\(/, `${file} must not know about the language preference`);
  }
  const backup = html.slice(html.indexOf("function makeBackupPayload"), html.indexOf("function dateStamp"));
  assert.ok(backup.length > 200);
  assert.doesNotMatch(backup, /language|cueT|I18n/i);
});

/* ---------- translation ---------- */
test("t() resolves selected language, then ja, then the key; interpolates and supports plurals", () => {
  const missing = [];
  const english = make("en", { onMissing: key => missing.push(key) });
  assert.equal(english.t("nav.home"), "Home");
  assert.equal(english.t("player.count", { count: 3 }), "Registered players: 3");
  assert.equal(english.t("player.row.editAria", { name: "A&B" }), "Edit A&B");
  assert.equal(english.t("not.a.key"), "not.a.key");
  assert.equal(english.t("player.count"), "Registered players: {count}");
  core.registerCatalog("ja", { ...ja, "test.only.ja": "日本語のみ" });
  assert.equal(make("en").t("test.only.ja"), "日本語のみ");
  assert.equal(make("zh-Hans").t("test.only.ja"), "日本語のみ");
  core.registerCatalog("ja", ja); // restore
  assert.deepEqual(missing, ["not.a.key"]);
  core.registerCatalog("test-plural", { "x": { one: "{count} ball", other: "{count} balls" } });
  core.registerCatalog("en", { ...en, "x.plural": { one: "{count} ball", other: "{count} balls" } });
  assert.equal(make("en").t("x.plural", { count: 1 }), "1 ball");
  assert.equal(make("en").t("x.plural", { count: 2 }), "2 balls");
  core.registerCatalog("en", en); // restore
});

test("Japanese resolves every key to the exact existing Japanese text", () => {
  const japanese = make("ja");
  for (const [key, value] of Object.entries(ja)) assert.equal(japanese.t(key, { game: "{game}", player1: "{player1}", player2: "{player2}", condition: "{condition}", name: "{name}", count: "{count}" }), value);
  assert.equal(japanese.t("home.resume.action"), "再開 ›");
  assert.equal(japanese.t("home.resume.cardAria", { game: "Rotation", player1: "A", player2: "B", condition: "目標点 120-120" }), "中断中のRotation、A対B、目標点 120-120、試合を再開");
});

/* ---------- DOM application ---------- */
function fakeNode(attributes = {}, text = "") {
  const node = { attributes: { ...attributes }, textContent: text, matches: () => false,
    getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null; },
    setAttribute(name, value) { this.attributes[name] = value; } };
  return node;
}
function fakeRoot(nodes) {
  return { querySelectorAll: () => nodes, matches: () => false, documentElement: { attrs: {}, setAttribute(name, value) { this.attrs[name] = value; } } };
}
test("applyStatic never touches the DOM for Japanese and only rewrites explicit data-i18n keys otherwise", () => {
  const make2 = () => [fakeNode({ "data-i18n": "nav.home" }, "ホーム"), fakeNode({ "data-i18n-aria-label": "nav.main.aria", "aria-label": "メインナビゲーション" }), fakeNode({ "aria-label": "no key", title: "keep" }, "keep")];
  const japaneseNodes = make2();
  const japaneseResult = make("ja").applyStatic(fakeRoot(japaneseNodes));
  assert.equal(japaneseResult.changed, 0);
  assert.equal(japaneseNodes[0].textContent, "ホーム");
  assert.equal(japaneseNodes[1].attributes["aria-label"], "メインナビゲーション");
  const englishNodes = make2();
  assert.equal(make("en").applyStatic(fakeRoot(englishNodes)).changed, 2);
  assert.equal(englishNodes[0].textContent, "Home");
  assert.equal(englishNodes[1].attributes["aria-label"], "Main navigation");
  assert.equal(englishNodes[2].textContent, "keep");
  const chineseNodes = make2();
  make("zh-Hans").applyStatic(fakeRoot(chineseNodes));
  assert.equal(chineseNodes[0].textContent, "首页");
});

test("html lang follows the resolved language and Japanese is left untouched", () => {
  for (const [language, expected] of [["en", "en"], ["zh-Hans", "zh-Hans"]]) {
    const doc = fakeRoot([]); doc.documentElement.attrs = {};
    assert.equal(make(language).applyHtmlLang(doc), true);
    assert.equal(doc.documentElement.attrs.lang, expected);
  }
  const doc = fakeRoot([]);
  assert.equal(make("ja").applyHtmlLang(doc), false);
  assert.deepEqual(doc.documentElement.attrs, {});
  assert.match(html, /<html lang="ja"/);
});

test("formatters use Intl with the language locale and never change stored ISO dates", () => {
  const date = "2026-10-08T12:34:00.000Z";
  assert.match(make("ja").formatDate(date, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }), /2026年10月8日/);
  assert.match(make("en").formatDate(date, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }), /October 8, 2026/);
  assert.match(make("zh-Hans").formatDate(date, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }), /2026年10月8日/);
  assert.equal(make("en").formatDate("not a date"), "");
  assert.equal(make("en").formatNumber(1234.5), "1,234.5");
});

/* ---------- language change request: class C only (Write-trap) ---------- */
function trapStorage(initial = {}, { failSet = false, failGet = false } = {}) {
  const data = new Map(Object.entries(initial));
  const log = [];
  return { log, data,
    getItem(key) { if (failGet) throw new Error("denied"); return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { log.push(["set", key, value]); if (failSet) throw new Error("quota"); data.set(key, String(value)); },
    removeItem(key) { log.push(["remove", key]); data.delete(key); } };
}
const guardOf = (state, allowSavedInterrupted = false) => ({ state: () => ({ state, allowSavedInterrupted }) });

test("changing the language writes only cueScore.language.v1 and reloads once", () => {
  const storage = trapStorage({ "rotationScoreboard.matchRecords.v1": "[]", "cueScore.inProgressMatch.v1": "{}" });
  let reloads = 0;
  const result = core.requestLanguageChange("en", { guard: guardOf("S-C"), storage, reload: () => { reloads += 1; } });
  assert.deepEqual(result, { ok: true, changed: true, preference: "en" });
  assert.deepEqual(storage.log, [["set", "cueScore.language.v1", "en"]]);
  assert.equal(reloads, 1);
  assert.equal(storage.data.get("rotationScoreboard.matchRecords.v1"), "[]");
  assert.equal(storage.data.get("cueScore.inProgressMatch.v1"), "{}");
  const unchanged = core.requestLanguageChange("en", { guard: guardOf("S-C"), storage, reload: () => { reloads += 1; } });
  assert.deepEqual(unchanged, { ok: true, changed: false, preference: "en" });
  assert.equal(storage.log.length, 1);
  assert.equal(reloads, 1);
});

test("S-A (recording) always blocks; S-B is blocked until the proof flag allows it; no write happens when blocked", () => {
  for (const [state, allow, code] of [["S-A", true, "BLOCKED_ACTIVE_MATCH"], ["S-B", false, "BLOCKED_SAVED_INTERRUPTED_MATCH"]]) {
    const storage = trapStorage();
    let reloads = 0;
    const result = core.requestLanguageChange("en", { guard: guardOf(state, allow), storage, reload: () => { reloads += 1; } });
    assert.equal(result.ok, false);
    assert.equal(result.code, code);
    assert.deepEqual(storage.log, []);
    assert.equal(reloads, 0);
  }
  const allowed = trapStorage();
  assert.equal(core.requestLanguageChange("ja", { guard: guardOf("S-B", true), storage: allowed, reload() {} }).ok, true);
  for (const guard of [undefined, {}, { state: () => null }, { state: () => ({ state: "S-Z" }) }, { state() { throw new Error("x"); } }]) {
    const storage = trapStorage();
    assert.equal(core.requestLanguageChange("en", { guard, storage, reload() {} }).code, "GUARD_UNAVAILABLE");
    assert.deepEqual(storage.log, []);
  }
  assert.equal(core.requestLanguageChange("fr", { guard: guardOf("S-C"), storage: trapStorage(), reload() {} }).code, "INVALID_PREFERENCE");
});

test("a failed write keeps the previous language setting and never reloads", () => {
  const storage = trapStorage({ [core.STORAGE_KEY]: "zh-Hans" }, { failSet: true });
  let reloads = 0;
  const result = core.requestLanguageChange("en", { guard: guardOf("S-C"), storage, reload: () => { reloads += 1; } });
  assert.deepEqual(result, { ok: false, code: "WRITE_FAILED" });
  assert.equal(storage.data.get(core.STORAGE_KEY), "zh-Hans");
  assert.equal(reloads, 0);
  assert.equal(core.requestLanguageChange("en", { guard: guardOf("S-C"), storage: null, reload() {} }).code, "STORAGE_UNAVAILABLE");
  assert.equal(core.requestLanguageChange("en", { guard: guardOf("S-C"), storage: trapStorage({}, { failGet: true }), reload() {} }).code, "STORAGE_UNAVAILABLE");
});

test("TOCTOU: if recording starts between the check and the reload the key is rolled back", () => {
  const storage = trapStorage({ [core.STORAGE_KEY]: "ja" });
  let calls = 0;
  const guard = { state: () => ({ state: ++calls >= 2 ? "S-A" : "S-C" }) };
  let reloads = 0;
  const result = core.requestLanguageChange("en", { guard, storage, reload: () => { reloads += 1; } });
  assert.equal(result.ok, false);
  assert.equal(result.code, "BLOCKED_ACTIVE_MATCH");
  assert.equal(result.rolledBack, true);
  assert.equal(storage.data.get(core.STORAGE_KEY), "ja");
  assert.equal(reloads, 0);
  assert.deepEqual(storage.log.map(entry => entry[1]), [core.STORAGE_KEY, core.STORAGE_KEY]);
  const fresh = trapStorage();
  let n = 0;
  core.requestLanguageChange("en", { guard: { state: () => ({ state: ++n >= 2 ? "S-A" : "S-C" }) }, storage: fresh, reload() {} });
  assert.equal(fresh.data.has(core.STORAGE_KEY), false, "a previously absent key is removed again");
  const failing = trapStorage();
  const reloadFailure = core.requestLanguageChange("en", { guard: guardOf("S-C"), storage: failing, reload() { throw new Error("no reload"); } });
  assert.equal(reloadFailure.code, "RELOAD_FAILED");
  assert.equal(failing.data.has(core.STORAGE_KEY), false);
});

/* ---------- Display Mapper (read only, canonical values untouched) ---------- */
test("Display Mapper translates canonical resultLabel values for display only and leaves unknown values alone", () => {
  const labels = Object.keys(core.RESULT_LABEL_KEYS);
  assert.equal(labels.length, 9);
  for (const label of labels) {
    assert.equal(core.mapResultLabel(make("ja"), label), label, `ja must show ${label} unchanged`);
    assert.notEqual(core.mapResultLabel(make("en"), label), label);
    assert.notEqual(core.mapResultLabel(make("zh-Hans"), label), label);
  }
  assert.equal(core.mapResultLabel(make("ja"), "7球イン"), "7球イン");
  assert.equal(core.mapResultLabel(make("en"), "7球イン"), "7 pocketed");
  assert.equal(core.mapResultLabel(make("zh-Hans"), "12球イン"), "进12球");
  for (const unknown of ["", "未知のラベル", "球イン", "1球インX", "Break", null, undefined, 3]) assert.equal(core.mapResultLabel(make("en"), unknown), unknown);
  const frozen = Object.freeze({ id: "x", resultLabel: "無得点" });
  core.mapResultLabel(make("en"), frozen.resultLabel);
  assert.equal(frozen.resultLabel, "無得点");
});

test("D4: only an untouched default category name with its default id is translated", () => {
  const english = make("en");
  assert.equal(core.mapCategoryName(english, { id: "category_tournament", name: "大会" }), "Tournament");
  assert.equal(core.mapCategoryName(english, { id: "category_other", name: "その他" }), "Other");
  assert.equal(core.mapCategoryName(english, { id: "category_tournament", name: "地区大会" }), "地区大会");
  assert.equal(core.mapCategoryName(english, { id: "category_custom_1", name: "大会" }), "大会");
  assert.equal(core.mapCategoryName(english, { id: "category_free", name: "Free" }), "Free");
  assert.equal(core.mapCategoryName(english, null), "");
  assert.equal(core.mapCategoryName(make("ja"), { id: "category_tournament", name: "大会" }), "大会");
});

/* ---------- architecture guards ---------- */
test("the i18n files use no MutationObserver or innerHTML replacement and the guard is read only", () => {
  for (const file of ["i18n-v1.js", "i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"]) {
    assert.doesNotMatch(read(file), /MutationObserver|innerHTML|insertAdjacentHTML|document\.write/, file);
  }
  const start = html.indexOf("function peekInProgressMatchV1");
  const end = html.indexOf("window.CueScoreLanguageGuardV1");
  assert.ok(start > 0 && end > start);
  const guard = html.slice(start, end);
  assert.doesNotMatch(guard, /setItem|removeItem|clear\(|clearInProgressMatchV1|readInProgressMatchV1|persistInProgressMatchV1/);
  assert.match(guard, /const LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1|LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 === true/);
  assert.match(html, /window\.CueScoreLanguageGuardV1 = Object\.freeze\(\{ state: languageSwitchStateV1 \}\);/);
});

test("domain code (snapshot, restore, backup, CSV, sharing) never calls the translation layer", () => {
  const body = (name) => {
    const start = html.indexOf(`function ${name}(`);
    assert.ok(start > 0, `${name} must exist`);
    let depth = 0, index = html.indexOf("{", start);
    const open = index;
    for (; index < html.length; index += 1) {
      if (html[index] === "{") depth += 1;
      else if (html[index] === "}") { depth -= 1; if (depth === 0) break; }
    }
    return html.slice(open, index + 1);
  };
  for (const name of ["snapshot", "restore", "persistInProgressMatchV1", "readInProgressMatchV1", "restoreInProgressMatchV1", "makeBackupPayload", "persistCompletedMatchRecordsV162", "writeMatchRecords", "readMatchRecords", "writePlayerLibrary", "readPlayerLibrary"]) {
    assert.doesNotMatch(body(name), /cueT\(|CueScoreI18n|cueScore\.language/, `${name} must stay language independent`);
  }
  const snapshot = body("snapshot");
  assert.equal(/[぀-ヿ㐀-䶿一-鿿]/.test(snapshot), false, "snapshot() must not embed Japanese display strings");
});

test("i18n assets are registered for offline use and load before the application scripts", () => {
  const files = ["i18n-v1.js", "i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"];
  const sw = read("sw.js");
  const build = read("scripts/build-native-web.mjs");
  for (const file of files) {
    assert.ok(sw.includes(`"./${file}"`), `${file} must be pre-cached`);
    assert.ok(build.includes(`"${file}"`), `${file} must be bundled for native-web`);
    assert.ok(fs.existsSync(new URL(`../${file}`, import.meta.url)));
  }
  const positions = files.map(file => html.indexOf(`<script src="./${file}"></script>`));
  assert.ok(positions.every(position => position > 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, "core first, then ja, en, zh-Hans");
  assert.ok(positions[3] < html.indexOf('<script src="./demo-data.js'));
  assert.ok(positions[3] < html.indexOf("CueScore App Store v1.0 RC: Later features remain implemented"));
  assert.match(read("sw.js"), /const APP_VERSION = "2\.0-build84-match-sharing-fix-v1";/);
});

test("the Settings language row and view reuse the existing Settings suite components and bypass the demo/cloud action handlers", () => {
  assert.match(html, /data-settings-open-language/);
  assert.match(html, /data-suite-view="language"/);
  assert.match(html, /class="settings-suite-radio-v2"/);
  assert.doesNotMatch(html, /data-settings-action="language"/);
  assert.match(html, /core\.requestLanguageChange\(selected, \{ guard: window\.CueScoreLanguageGuardV1, storage, reload: \(\) => location\.reload\(\) \}\)/);
  assert.match(html, /languageMessageKey/);
});

test("R-FIT (Decision 032): the language row is the first row of the app info card; the footer composition is gone; the Settings scroll owner stays scrollable", () => {
  assert.doesNotMatch(html, /settings-info-link-v1\[data-settings-open-language\]/);          // no row-specific height override
  assert.doesNotMatch(html, /P1 R-FIT/);                                                       // the footer-gap rule belonged to the removed footer
  assert.doesNotMatch(html, /<footer class="settings-app-footer-v1">|settings-app-brand-v1"><span data-cuescore-logo/);
  assert.match(read("navigation-phase2-6.css"), /\.settings-formal-scroll-v1\{overflow-y:auto!important/); // Physical UI Fix: the Build 76 overflow lock is replaced by overflow:auto
  const card = html.match(/<section class="settings-data-card-v1 settings-app-info-card-v1"[\s\S]*?<\/section>/)[0];
  const order = [...card.matchAll(/data-settings-open-language|data-cuescore-about|data-settings-legal="(terms|privacy)\.html"/g)].map(match => match[0]);
  assert.deepEqual(order, ['data-settings-open-language', 'data-cuescore-about', 'data-settings-legal="terms.html"', 'data-settings-legal="privacy.html"']);
});
