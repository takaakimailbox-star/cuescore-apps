import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const navigation = fs.readFileSync(new URL("../navigation-phase2-6.css", import.meta.url), "utf8");

test("Build 75 uses bounded section spacing instead of a flexible footer spacer", () => {
  assert.match(navigation, /Build 75: distribute bounded breathing room without restoring the flex spacer/);
  assert.match(navigation, /settings-formal-spacer-v1\{display:block!important;flex:0 0 40px!important;min-height:40px!important\}/);
  assert.doesNotMatch(navigation, /Build 75[\s\S]*?settings-formal-spacer-v1\{[^}]*flex-grow\s*:\s*1/);
});

test("Build 75 distributes breathing room across the four Settings blocks", () => {
  assert.match(navigation, /settings-formal-main-v1>\.settings-formal-section-title-v1:first-child\{margin-top:22px\}/);
  assert.match(navigation, /settings-plan-card-v72\+\.settings-formal-section-title-v1\{margin-top:26px\}/);
  assert.match(navigation, /settings-app-footer-v1\{padding-top:14px!important\}/);
  assert.match(navigation, /settings-app-brand-v1\{padding:12px 0 10px\}/);
  assert.match(navigation, /settings-copyright-v1\{padding-top:10px\}/);
});

test("Build 75 preserves row sizes, copyright, legal navigation, and fixed navigation", () => {
  assert.match(html, /\.settings-data-row-v1 \{[\s\S]*?min-height: 63px !important/);
  assert.match(html, /\.settings-plan-action-v72 \{[\s\S]*?min-height: 44px/);
  assert.match(html, /\.settings-info-link-v1 \{ min-height: 42px; \}/);
  assert.match(html, /© \$\{new Date\(\)\.getFullYear\(\)\} CueScore Apps/);
  assert.match(html, /data-cuescore-about/);
  assert.match(html, /data-settings-legal="terms\.html"/);
  assert.match(html, /data-settings-legal="privacy\.html"/);
  assert.match(html, /navigation-shell-phase1\.css/);
  assert.match(html, /navigation-phase2-6\.css\?v=2\.0-build76-settings-scroll-lock-v1/);
});
