import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const css=readFileSync(new URL("../navigation-phase2-6.css",import.meta.url),"utf8");
const shell=readFileSync(new URL("../navigation-shell-phase1.css",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");

test("Home follows the supplied tall iPhone composition",()=>{
  assert.match(css,/padding:clamp\(210px,28svh,242px\) 0 0/);
  assert.match(css,/height:64px!important/);
  assert.match(css,/margin:clamp\(190px,26\.5svh,232px\) auto 0/);
  assert.match(css,/min-height:66px/);
  assert.match(css,/border-bottom:0!important/);
});

test("Home tab uses the transparent reference-derived cue-ball PNG",()=>{
  assert.match(shell,/nav-home-reference-build33\.png/);
  assert.match(shell,/mask-image:none/);
  assert.match(sw,/nav-home-reference-build33\.png/);
});

test("Build 33 has a fresh app-shell version",()=>{
  assert.match(sw,/APP_VERSION = "2\.0-build36-match-card-c-fidelity-v1"/);
});

test("Settings keeps the supplied data-card and lower app-information composition",()=>{
  assert.match(css,/settings-formal-spacer-v1\{display:block!important;flex:0 0 clamp\(132px,18svh,160px\)!important/);
  assert.match(css,/settings-screen\.settings-formal-v1,.settings-formal-shell-v1,.settings-page-header-v2\{background:#fff!important\}/);
  assert.match(css,/settings-app-footer-v1\{padding:8px 6px 0!important\}/);
});
