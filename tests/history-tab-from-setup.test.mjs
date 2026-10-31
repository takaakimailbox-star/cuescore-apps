import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../match-setup-ux-v1.css", import.meta.url), "utf8");
const nav = readFileSync(new URL("../navigation-shell-phase1.js", import.meta.url), "utf8");

test("root cause is pinned: the setup rule is #id-qualified display:flex!important, so records mode needs an equally specific hide", () => {
  assert.match(css, /body\.cue-phase1-normal-mode #cueHomeV1\.match-setup-active-v3\{--cue-sux-tab[^}]*display:flex!important/);
  assert.match(html, /\.app\.records-mode>\.cue-home-v1\{display:none!important\}/, "the shared hide rule is unchanged");
  assert.match(css, /body\.cue-phase1-normal-mode \.app\.records-mode>#cueHomeV1\.match-setup-active-v3\{display:none!important\}/);
});

test("the fix is scoped to records mode only and the navigation contract is untouched", () => {
  const rule = css.match(/\.app\.records-mode>#cueHomeV1\.match-setup-active-v3\{[^}]*\}/g) || [];
  assert.equal(rule.length, 1);
  assert.ok(!/settings-mode|player/.test(rule[0]));
  assert.match(nav, /if\(key==="history"\)\{document\.getElementById\("recordsBtn"\)\?\.click\(\);document\.querySelector\("#recordsList"\)\?\.scrollTo\?\.\(0,0\)\}/);
  assert.match(nav, /if\(!roots\.includes\(key\)\|\|isMatchMode\(\)\)return;/, "tabs stay disabled during a match");
});
