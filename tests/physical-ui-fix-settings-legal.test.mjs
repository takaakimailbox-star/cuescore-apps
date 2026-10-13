import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const nav = fs.readFileSync(new URL("../navigation-phase2-6.css", import.meta.url), "utf8");

test("Settings scroll owner is never overflow-locked at any viewport", () => {
  assert.doesNotMatch(nav, /\.settings-formal-scroll-v1\{[^}]*overflow-y:hidden/);
  assert.doesNotMatch(html, /\.settings-formal-scroll-v1\s*\{[^}]*overflow-y:\s*hidden/);
});

test("Legal overlay hides the Bottom Navigation while open and restores it on close", () => {
  assert.match(html, /body\.cue-legal-open-v1 \.cue-phase1-tab-bar\{display:none!important\}/);
  assert.match(html, /legalOverlayV165\.hidden = false;\s*document\.body\.classList\.add\("cue-legal-open-v1"\)/);
  assert.match(html, /legalFrameV165\?\.removeAttribute\("src"\);\s*document\.body\.classList\.remove\("cue-legal-open-v1"\)/);
});
