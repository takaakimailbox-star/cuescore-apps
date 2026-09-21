import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const navigation = fs.readFileSync(new URL("../navigation-phase2-6.css", import.meta.url), "utf8");

test("Build 76 locks only the compact Settings scroll owner", () => {
  assert.match(navigation, /Build 76: disable the Settings scroll owner when the compact layout already fits/);
  assert.match(navigation, /@media \(max-width:430px\) and \(min-height:780px\) and \(max-height:900px\)\{\s*\.settings-formal-scroll-v1\{overflow-y:hidden!important;overscroll-behavior:none!important;-webkit-overflow-scrolling:auto!important\}/);
});

test("Build 76 preserves overflow fallback outside the compact fit range", () => {
  assert.match(html, /\.settings-formal-scroll-v1 \{[\s\S]*?overflow-y: auto;[\s\S]*?overscroll-behavior: contain;[\s\S]*?-webkit-overflow-scrolling: touch;/);
  assert.doesNotMatch(navigation, /\.settings-screen\.settings-formal-v1\{[^}]*touch-action:none/);
});

test("Build 76 keeps the Build 75 geometry and refreshes native web caches", () => {
  assert.match(navigation, /settings-formal-spacer-v1\{display:block!important;flex:0 0 40px!important;min-height:40px!important\}/);
  assert.match(navigation, /settings-plan-card-v72\+\.settings-formal-section-title-v1\{margin-top:26px\}/);
  assert.match(html, /navigation-phase2-6\.css\?v=2\.0-build78-app-review-rc-v1/);
  assert.match(html, /const PWA_VERSION = "2\.0-build78-app-review-rc-v1"/);
});
