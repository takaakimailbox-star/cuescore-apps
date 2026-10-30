import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const css = read("navigation-shell-phase1.css");

test("SB93-1 the start-match button is sticky above the tab bar on the match setup screen (Build 93)", () => {
  const rule = css.match(/body\.cue-phase1-normal-mode #cueHomeV1\.match-setup-active-v3 #startGameBtn\{[^}]*\}/);
  assert.ok(rule, "sticky start rule exists");
  assert.match(rule[0], /position:sticky!important/);
  assert.match(rule[0], /bottom:0!important/);
  assert.match(rule[0], /z-index:6!important/);
  assert.ok(!/display:|height:|margin|padding|transform|pointer-events/.test(rule[0]), "no size / layout / hit-test change: only the position and a backing shadow");
});

test("SB93-1b the disabled start button stays opaque (same look as the former 40 % dark button) so the sticky button never shows the rows below through itself", () => {
  const rule = css.match(/#startGameBtn:disabled\{[^}]*\}/);
  assert.ok(rule);
  assert.match(rule[0], /opacity:1!important/);
  assert.match(rule[0], /background:#9e9e9d!important/);
});

test("SB93-2 the setup scroller keeps its bottom padding (nav height + 24px + safe area) that the sticky offset relies on", () => {
  assert.match(css, /body\.cue-phase1-normal-mode \.cue-home-v1\{padding-bottom:calc\(var\(--cue-phase1-nav-height\) \+ 24px \+ env\(safe-area-inset-bottom\)\)!important\}/);
  assert.match(css, /\.cue-phase1-tab-bar\{\s*position:fixed;/);
});

test("SB93-3 the start button markup, handlers and the shot-clock / match logic files are untouched by the fix", () => {
  const html = read("index.html");
  assert.match(html, /<button class="start-game-button new-match-start-v1 cue-home-start-v2" id="startGameBtn" type="button">/);
  assert.match(read("sw.js"), /navigation-shell-phase1\.css\?v=2\.0-build94-sc21-v1/);
  assert.match(html, /navigation-shell-phase1\.css\?v=2\.0-build94-sc21-v1/);
});
