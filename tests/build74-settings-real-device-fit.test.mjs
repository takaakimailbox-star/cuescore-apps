import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { jaText } from "./helpers/i18n-ja-catalog.mjs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const navigation = fs.readFileSync(new URL("../navigation-phase2-6.css", import.meta.url), "utf8");

test("compact native Settings: the Build 74 spacer rule stays in the stylesheet but the spacer element is gone (Decision 032 / Official 111 SU-012)", () => {
  assert.match(navigation, /Build 74: keep the legal footer above the fixed tab bar/);
  assert.match(navigation, /@media \(max-width:430px\) and \(min-height:780px\) and \(max-height:900px\)\{\s*\.settings-formal-spacer-v1\{display:none!important;flex:0 0 0!important;min-height:0!important\}/);
  assert.doesNotMatch(html, /<div class="settings-formal-spacer-v1"/, "the middle spacer element must not be rendered any more");
});

test("Build 73 row sizes are superseded by the Settings Unified Design tokens (Decision 032 / Official 111)", () => {
  // The legacy base rules stay in the stylesheet, but the effective sizes are the Official 111 tokens.
  assert.match(html, /--sud-plan-row: 52px; --sud-data-row: 62px; --sud-info-row: 46px;/);
  assert.match(html, /@media \(max-height: 830px\) \{\s*\.settings-formal-shell-v1 \{ --sud-title-top: 12px; --sud-title-gap: 6px; --sud-data-row: 56px; --sud-info-row: 44px; \}/);
  assert.match(html, /\.settings-data-row-v1 \{[\s\S]*?min-height: 63px !important/);
});

test("privacy and the fixed bottom navigation remain present", () => {
  assert.match(html, /data-settings-legal="privacy\.html"><span>\$\{window\.cueT\("settings\.legal\.privacy"\)\}<\/span>/);
  assert.equal(jaText("settings.legal.privacy"), "プライバシーポリシー");
  assert.match(html, /navigation-shell-phase1\.css/);
  assert.match(html, /navigation-phase2-6\.css/);
  assert.match(navigation, /settings-formal-spacer-v1/);
});
