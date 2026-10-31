import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../match-setup-ux-v1.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../match-setup-ux-v1.css", import.meta.url), "utf8");

test("9-Ball / 10-Ball presets are 1-10 + Other; 3 Cushion presets are the contiguous 7-40 + Other; limits unchanged", () => {
  assert.match(html, /\(nineBall \|\| tenBall\) && options\) \{\s*options\.innerHTML = Array\.from\(\{length:10\},\(_,index\)=>index\+1\)/);
  assert.match(html, /threeCushion && options\) \{\s*options\.innerHTML = Array\.from\(\{length:34\},\(_,index\)=>index\+7\)/);
  assert.match(html, /"9ball": Object\.freeze\(\{min:1,max:100/);
  assert.match(html, /threeCushion: Object\.freeze\(\{min:1,max:100/);
});

test("a current value outside the presets is injected as its own selectable row (never for the JPA9 Skill Level list)", () => {
  assert.match(html, /data-race-injected/);
  assert.match(html, /if \(!jpa && options\) \{\s*const current = Number\(input\.value\)/);
});

test("the menu scrim is not aria-hidden (outside tap) and the global pointer-events rule is untouched", () => {
  assert.ok(!/scrim\.setAttribute\("aria-hidden"/.test(js));
  assert.match(js, /scrim\.addEventListener\("click", cancel\)/);
  assert.match(html, /\.hidden,\s*\[aria-hidden="true"\]\s*\{\s*pointer-events:\s*none\s*!important/);
});

test("cancel (outside tap, Escape) never applies a value and restores focus; Other stays pinned in a bounded list", () => {
  assert.match(js, /const cancel = \(\) => \{ const cb = opts\.onCancel; closeMenu\(true\)/);
  assert.match(js, /onCancel: \(\) => \{ const c = \$\("#newMatchRacePickerCloseV1"\); if \(c\) c\.click\(\); \}/);
  assert.match(js, /pinned: other/);
  assert.match(css, /\.cue-menu-row-v1\.is-pinned-v1\{position:sticky;bottom:-6px/);
});

test("vertical balance: spacers share the spare height above and below the setup content; the footer stays independent", () => {
  assert.match(css, /\.cue-new-match-integrated-v2::before\{content:"";order:-1;flex:1 1 0;min-height:0;max-height:clamp\(0px,9vh,84px\)\}/);
  assert.match(css, /\.cue-new-match-integrated-v2::after\{content:"";order:99;flex:1\.25 1 0;min-height:0\}/);
  assert.match(css, /#cueSetupFooterV1\{display:block;flex:0 0 auto/);
});

test("yellow state colours stay as they were (only the Other numeric input was neutralised earlier)", () => {
  assert.match(html, /:where\(button, a, input, select, textarea, \[tabindex\]\):focus-visible\s*\{\s*outline: 3px solid #ffd54a !important;/);
  assert.match(css, /\.new-match-player-card-v1\.is-empty-v1\{border:2px dashed #c9a227!important/);
  assert.match(html, /\.pro-player-panel\.active\s*\{\s*border-color: #ffd54a;/);
});
