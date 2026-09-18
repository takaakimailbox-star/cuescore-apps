import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const navigation = fs.readFileSync(new URL("../navigation-phase2-6.css", import.meta.url), "utf8");

test("compact native Settings removes only the late spacer override", () => {
  assert.match(navigation, /Build 74: keep the legal footer above the fixed tab bar/);
  assert.match(navigation, /@media \(max-width:430px\) and \(min-height:780px\) and \(max-height:900px\)\{\s*\.settings-formal-spacer-v1\{display:none!important;flex:0 0 0!important;min-height:0!important\}/);
  assert.match(html, /<div class="settings-formal-spacer-v1" aria-hidden="true"><\/div>/);
});

test("Build 73 row sizes remain unchanged", () => {
  assert.match(html, /\.settings-data-row-v1 \{[\s\S]*?min-height: 63px !important/);
  assert.match(html, /\.settings-plan-action-v72 \{[\s\S]*?min-height: 44px/);
  assert.match(html, /\.settings-info-link-v1 \{ min-height: 42px; \}/);
});

test("privacy and the fixed bottom navigation remain present", () => {
  assert.match(html, /data-settings-legal="privacy\.html"><span>プライバシーポリシー<\/span>/);
  assert.match(html, /navigation-shell-phase1\.css/);
  assert.match(html, /navigation-phase2-6\.css/);
  assert.match(navigation, /settings-formal-spacer-v1/);
});
