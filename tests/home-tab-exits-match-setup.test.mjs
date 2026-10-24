import "./helpers/ja-fs.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// v1.3 polish: the bottom Home tab must return from the (unstarted) match setup screen to the first Home screen.
// The measured browser proof is tests/browser/home-tab-exits-match-setup.mjs (headless Chrome, not part of `node --test`).
const nav = readFileSync(new URL("../navigation-shell-phase1.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("openRoot('home') leaves an open match setup through the existing setup-close path", () => {
  const m = nav.match(/if\(key==="home"\)\{([\s\S]*?)\n    \}\n/);
  assert.ok(m, "home branch exists");
  const branch = m[1].replace(/\/\/.*$/gm, "");
  assert.match(branch, /getElementById\("cueHomeV1"\)\?\.classList\.contains\("match-setup-active-v3"\)/);
  assert.match(branch, /history\.state\?\.cueMatchSetupV3\)history\.back\(\);else window\.closeCueMatchSetupV3\?\.\(\)/);
  assert.match(branch, /window\.scrollTo\(0,0\)/);
  // no data-destroying call from the Home tab: nothing that resets/discards a match or setup values
  assert.doesNotMatch(branch, /reset|discard|clear|remove|localStorage|snapshot|startGame|saveMatch/i);
});

test("a running match is not touched: go() still ignores every tab request in match mode", () => {
  assert.match(nav, /const go=key=>\{\s*if\(!roots\.includes\(key\)\|\|isMatchMode\(\)\)return;/);
});

test("closeCueMatchSetupV3 only toggles the setup presentation (no match or setup data is written or discarded)", () => {
  const m = html.match(/const closeSetup=\(\)=>\{([\s\S]*?)\n  \};/);
  assert.ok(m, "closeSetup exists");
  assert.match(m[1], /classList\.remove\("match-setup-active-v3"\)/);
  assert.doesNotMatch(m[1], /localStorage|reset|discard|startGame|saveMatch|snapshot/i);
  assert.match(html, /window\.closeCueMatchSetupV3=closeSetup;/);
  assert.match(html, /window\.addEventListener\("popstate",\(\)=>\{if\(home\.classList\.contains\("match-setup-active-v3"\)\)closeSetup\(\)\}\);/);
});
