import "./helpers/ja-fs.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Gate 025 (Build 87 real-device report): the six Home tile names were missing on the first launch and cut off after a redisplay.
// The names must never sit in a clipping box and are re-painted once the first frames / fonts / foreground returns are settled.
// The measured proof (ja/en/zh-Hans x 320/390/430) is tests/browser/new-home-grid.mjs.
const css = readFileSync(new URL("../navigation-phase2-6.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../navigation-phase2-6.js", import.meta.url), "utf8");
const rule = sel => { const a = css.indexOf(sel + "{"); assert.ok(a >= 0, "rule exists: " + sel); return css.slice(a + sel.length + 1, css.indexOf("}", a)); };
const SW = "#cueHomeV1:not(.match-setup-active-v3) #cueDisciplineSwitcherV1";

test("the tile name has no clipping box and no ellipsis; a long name wraps instead of being cut (Gate 025)", () => {
  const strong = rule(SW + " .cue-discipline-label-v1 strong");
  assert.match(strong, /overflow:visible!important/);
  assert.match(strong, /text-overflow:clip!important/);
  assert.match(strong, /white-space:normal!important/);
  assert.doesNotMatch(strong, /overflow:hidden|ellipsis|nowrap/);
  const label = rule(SW + " .cue-discipline-label-v1");
  assert.match(label, /overflow:visible!important/);
  assert.match(label, /min-width:0!important/);
  assert.match(label, /max-width:none!important/);
});

test("the formal six names stay unchanged and the repaint hook covers first frame, load, pageshow, resize, foreground and fonts (Gate 025)", () => {
  for (const hook of ['requestAnimationFrame(repaintLabels)', 'addEventListener("load",repaintLabels)', 'addEventListener("pageshow",repaintLabels)', 'addEventListener("resize",repaintLabels)', 'addEventListener("orientationchange",repaintLabels)', 'visibilityState==="visible"', 'addEventListener("resume",repaintLabels)', "document.fonts?.ready?.then(repaintLabels)"]) assert.ok(js.includes(hook), hook);
  assert.match(css, /#cueDisciplineSwitcherV1\.home-label-repaint-v3 \.cue-discipline-label-v1 strong\{color:#171718!important\}/);
  // the hook changes no data and no handler
  const body = js.slice(js.indexOf("const repaintLabels="), js.indexOf("document.fonts?.ready?.then(repaintLabels)"));
  assert.doesNotMatch(body, /localStorage|sessionStorage|\.click\(|dispatchEvent|textContent|innerHTML/);
});
