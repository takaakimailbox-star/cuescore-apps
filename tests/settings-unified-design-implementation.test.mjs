import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";


// Implementation test for Decision 032 / Official 110 / Official 111 (Settings Unified Design R).
const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const html = read("index.html");
const settingsTemplate = html.slice(html.indexOf('root.innerHTML = `\n    <header class="settings-page-header-v2">'), html.indexOf("screen.appendChild(root);"));
const sudCss = html.slice(html.indexOf("/* Settings Unified Design (Decision 032"), html.indexOf("</style>\n<script>", html.indexOf("/* Settings Unified Design (Decision 032")));


test("SU-010/011: three cards in order plan, data management, app info, then the copyright line", () => {
  const order = [...settingsTemplate.matchAll(/class="settings-plan-card-v72"|class="settings-data-card-v1"|class="settings-data-card-v1 settings-app-info-card-v1"|class="settings-copyright-v1"/g)].map(match => match[0]);
  assert.deepEqual(order, ['class="settings-plan-card-v72"', 'class="settings-data-card-v1"', 'class="settings-data-card-v1 settings-app-info-card-v1"', 'class="settings-copyright-v1"']);
  // The sample-data section is feature-gated off (ENABLE_SAMPLE_DATA_UI = false) and is not one of the three cards.
  assert.match(settingsTemplate, /const ENABLE_SAMPLE_DATA_UI = false|ENABLE_SAMPLE_DATA_UI \? `/);
  const titles = [...settingsTemplate.matchAll(/<h1 class="settings-formal-section-title-v1">([^<]*)<\/h1>/g)].map(match => match[1]).filter(title => title !== "サンプルデータ");
  assert.equal(titles.length, 3);
  assert.equal(titles[0], "プラン");
  assert.equal(titles[1], '${window.cueT("settings.section.data")}');
  assert.equal(titles[2], '${window.cueT("settings.section.appInfo")}');
});

test("SU-012: no independent logo, no independent Version, no plan row label, no spacer in Settings", () => {
  assert.doesNotMatch(settingsTemplate, /data-cuescore-logo|settings-version|settings-app-brand-v1|settings-app-footer-v1|settings-formal-spacer-v1/);
  assert.doesNotMatch(settingsTemplate, /Version\s*1\.|Version\s*\$\{/);
  assert.doesNotMatch(settingsTemplate, /<strong>プラン<\/strong>/);
  assert.match(settingsTemplate, /<span class="settings-plan-value-v72 is-unknown" data-settings-plan-state aria-live="polite">確認中<\/span>/);
});

test("SU-011/060/040/050: existing hooks, plan-state contract, hidden cloud row and data actions are unchanged", () => {
  for (const hook of ['data-settings-plan-action', 'data-settings-action="export"', 'data-settings-action="restore"', 'data-settings-action="delete"', 'data-settings-open-language', 'data-cuescore-about', 'data-settings-legal="terms.html"', 'data-settings-legal="privacy.html"']) assert.ok(settingsTemplate.includes(hook), hook);
  assert.match(settingsTemplate, /data-settings-action="cloud" data-release-feature="cloud-sync" hidden/);
  const monetization = read("monetization-v1.js");
  assert.match(monetization, /planViewState\(snapshot\)\{if\(snapshot\?\.isPro===true\)return\{status:"pro",label:"CueScore Pro ✓"/);
  assert.match(monetization, /return\{status:"unknown",label:"確認中",action:"購入情報を確認中"\}/);
});

test("SU-020..027: card radius 20pt, border 1px, no doubled first-row line, shared inset, existing shadow kept", () => {
  assert.match(sudCss, /--sud-radius: 20px;/);
  assert.match(sudCss, /\.settings-plan-card-v72,\n\.settings-screen\.settings-formal-v1 \.settings-formal-main-v1 \.settings-data-card-v1 \{ border: 1px solid var\(--settings-line\) !important; border-radius: var\(--sud-radius\) !important; \}/);
  assert.match(sudCss, /\.settings-data-row-v1:not\(\[hidden\]\) ~ \.settings-data-row-v1:not\(\[hidden\]\) \{ border-top: 1px solid var\(--settings-line\) !important; \}/);
  assert.match(sudCss, /border-top: 0 !important; \}/); // the first visible row has no top line
  assert.match(sudCss, /\.settings-app-info-card-v1 \.settings-info-link-v1 ~ \.settings-info-link-v1 \{ border-top: 1px solid var\(--settings-line\) !important; \}/);
  assert.equal((sudCss.match(/padding: 0 16px !important/g) || []).length >= 3, true, "row inset is 16px for plan and info rows");
  assert.match(sudCss, /padding: 6px 16px !important; grid-template-columns: 40px minmax\(0,1fr\) auto 18px !important; gap: 10px !important/);
  assert.doesNotMatch(sudCss, /box-shadow/, "the existing card shadow is kept (not restated, not removed)");
  assert.match(html, /\.settings-data-card-v1 \{\n  overflow: hidden;\n  border: 1px solid var\(--settings-line\);\n  border-radius: 18px;\n  background: #fff;\n  box-shadow: 0 8px 24px rgba\(30,25,20,\.045\);/);
});

test("SU-030..033 / SU-032A / AC-SU-13: row heights and the 830 / 831px boundary", () => {
  assert.match(sudCss, /--sud-plan-row: 52px; --sud-data-row: 62px; --sud-info-row: 46px;/);
  assert.match(sudCss, /@media \(max-height: 830px\) \{\n  \.settings-formal-shell-v1 \{ --sud-title-top: 12px; --sud-title-gap: 6px; --sud-data-row: 56px; --sud-info-row: 44px; \}\n\}/);
  assert.equal((sudCss.match(/@media/g) || []).length, 1, "a single breakpoint at 830px");
  assert.match(sudCss, /\.settings-plan-status-v72 \{[^}]*min-height: var\(--sud-plan-row\) !important/);
  assert.match(sudCss, /\.settings-plan-action-v72 \{ min-height: var\(--sud-plan-row\) !important/);
  assert.match(sudCss, /\.settings-data-row-v1,\n\.settings-screen\.settings-formal-v1 \.settings-formal-main-v1 \.settings-data-row-v1\.cue-pro-entry-v1 \{ min-height: var\(--sud-data-row\) !important/);
  assert.match(sudCss, /\.settings-info-link-v1 \{[^}]*min-height: var\(--sud-info-row\) !important/);
});

test("SU-035/036: long titles and subtitles wrap instead of being clipped, fonts are not reduced further", () => {
  assert.match(sudCss, /\.settings-data-copy-v1 strong \{ font-size: 15px !important;[^}]*white-space: normal !important; overflow: visible !important; text-overflow: clip !important; \}/);
  assert.match(sudCss, /\.settings-data-copy-v1 span \{ font-size: 11px !important;[^}]*white-space: normal !important; overflow: visible !important; text-overflow: clip !important; \}/);
  assert.match(sudCss, /\.settings-formal-section-title-v1 \{ margin: var\(--sud-title-top\) 6px var\(--sud-title-gap\) !important; font-size: 16px !important/);
});

test("SU-082: the Settings scroll owner stays scrollable and the Bottom Navigation stays fixed", () => {
  assert.match(read("navigation-phase2-6.css"), /\.settings-formal-scroll-v1\{overflow-y:auto!important;overscroll-behavior:none!important/);
  assert.match(read("navigation-shell-phase1.css"), /\.cue-phase1-tab-bar\{\s*position:fixed;/);
  assert.match(html, /body\.cue-legal-open-v1 \.cue-phase1-tab-bar\{display:none!important\}/);
});

test("SU-090..094: Version has one definition, About reads it, Native MARKETING_VERSION and every legacy duplicate agree", () => {
  const definition = html.match(/const CUESCORE_APP_VERSION = "([^"]+)";\n  window\.CUESCORE_APP_VERSION_V1 = CUESCORE_APP_VERSION;/);
  assert.ok(definition, "CUESCORE_APP_VERSION is the single definition and is exposed once");
  assert.equal((html.match(/const CUESCORE_APP_VERSION = /g) || []).length, 1);
  assert.match(html, /<p>Version \$\{String\(window\.CUESCORE_APP_VERSION_V1 \|\| ""\)\}<\/p>/);
  assert.doesNotMatch(html, /<p>Version \d/, "About must not hardcode a Version");
  const native = [...read("ios/App/App.xcodeproj/project.pbxproj").matchAll(/MARKETING_VERSION = ([0-9.]+);/g)].map(match => match[1]);
  assert.ok(native.length >= 2 && native.every(value => value === definition[1]), `Native ${native} must equal ${definition[1]}`);
  // pre-existing duplicates (audited, other screens, unchanged) must not drift from the single definition
  assert.equal(html.match(/const RELEASE_LABEL = 'Version ([^']+)';/)[1], definition[1]);
  assert.equal(html.match(/const DISPLAY_VERSION = 'version ([^']+)';/)[1], definition[1]);
  assert.equal(html.match(/document\.documentElement\.dataset\.cuescoreVersion = "([^"]+)";/)[1], definition[1]);
  // the Settings footer / Settings template contain no Version literal
  assert.doesNotMatch(settingsTemplate, /1\.2/);
});

test("SU-100..103: heading key exists in ja / en / zh-Hans, heading and aria-label use the same key", () => {
  const expected = { "i18n-catalog-ja-v1.js": "アプリ情報", "i18n-catalog-en-v1.js": "App info", "i18n-catalog-zh-hans-v1.js": "应用信息" };
  for (const [file, value] of Object.entries(expected)) assert.match(read(file), new RegExp(`"settings\\.section\\.appInfo": "${value}",`), file);
  const section = settingsTemplate.match(/<h1 class="settings-formal-section-title-v1">\$\{window\.cueT\("([^"]+)"\)\}<\/h1>\n\s*<section class="settings-data-card-v1 settings-app-info-card-v1" aria-label="\$\{window\.cueT\("([^"]+)"\)\}">/);
  assert.ok(section);
  assert.equal(section[1], "settings.section.appInfo");
  assert.equal(section[2], section[1]);
  // P1 translation scope is kept: untranslated Plan strings are not translated here
  for (const file of Object.keys(expected)) assert.doesNotMatch(read(file), /"settings\.plan\./);
});

test("SU-012: the old footer CSS gap rule (P1 R-FIT) is removed; protected contracts stay: S-B false, no new storage keys", () => {
  assert.doesNotMatch(html, /P1 R-FIT/);
  assert.match(html, /const LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false;/);
  assert.doesNotMatch(sudCss, /localStorage|sessionStorage/);
});
