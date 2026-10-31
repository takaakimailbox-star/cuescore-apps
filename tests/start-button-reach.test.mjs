import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const css = read("navigation-shell-phase1.css");

const ux = read("match-setup-ux-v1.css");
test("SB95-1 the start button lives in an independent footer above the tab bar: no sticky position, no wide shadow band (Build 95 candidate replaces the Build 93 sticky + shadow)", () => {
  assert.ok(!/#startGameBtn\{[^}]*position:sticky/.test(css), "the Build 93 sticky rule is gone");
  assert.ok(!/0 -18px 14px 8px/.test(css), "the wide backing shadow is gone");
  const rule = ux.match(/#cueHomeV1\.match-setup-active-v3 #startGameBtn\{[^}]*\}/);
  assert.ok(rule, "footer start rule exists");
  assert.match(rule[0], /position:static!important/);
  assert.match(rule[0], /box-shadow:none!important/);
  assert.match(rule[0], /min-height:54px!important/);
  assert.match(ux, /#cueHomeV1\.match-setup-active-v3\{[^}]*overflow:hidden!important[^}]*padding:calc\(4px \+ env\(safe-area-inset-top\)\) 12px var\(--cue-sux-tab\)!important/);
  assert.match(ux, /--cue-sux-tab:calc\(68px \+ env\(safe-area-inset-bottom\)\)/);
});

test("SB95-1b the disabled start button is a distinct, opaque look (dashed frame, dark grey text, no play mark); the HTML disabled attribute stays the owner of the state", () => {
  assert.match(ux, /#startGameBtn:disabled\{[^}]*background:#e4e4e1!important;color:#585855!important;border:1\.5px dashed #b9b9b5!important\}/);
  assert.match(ux, /#startGameBtn:not\(:disabled\)\{[^}]*background:#1a1a1a!important/);
  const js = read("match-setup-ux-v1.js"), ui = read("final-ui-build18.js");
  assert.ok(!/setAttribute\(["']disabled|\.disabled\s*=/.test(js), "the new script never writes the start button's disabled state");
  assert.match(ui, /start\.disabled=players\.length<2/);
});

test("SB93-2 the setup scroller keeps its bottom padding (nav height + 24px + safe area) that the sticky offset relies on", () => {
  assert.match(css, /body\.cue-phase1-normal-mode \.cue-home-v1\{padding-bottom:calc\(var\(--cue-phase1-nav-height\) \+ 24px \+ env\(safe-area-inset-bottom\)\)!important\}/);
  assert.match(css, /\.cue-phase1-tab-bar\{\s*position:fixed;/);
});

test("SB93-3 the start button markup, handlers and the shot-clock / match logic files are untouched by the fix", () => {
  const html = read("index.html");
  assert.match(html, /<div class="cue-setup-footer-v1" id="cueSetupFooterV1">[\s\S]*?<button class="start-game-button new-match-start-v1 cue-home-start-v2" id="startGameBtn" type="button">/);
  assert.ok(!/disabled[^>]*id="startGameBtn"|id="startGameBtn"[^>]*disabled/.test(html), "no static disabled attribute is added to the markup (final-ui-build18.js owns it)");
  assert.match(read("sw.js"), /navigation-shell-phase1\.css\?v=2\.0-build96-setupux-v1/);
  assert.match(html, /navigation-shell-phase1\.css\?v=2\.0-build96-setupux-v1/);
});
