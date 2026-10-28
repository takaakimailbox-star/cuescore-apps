import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

// Build 91: Plan A presentation of the shot-clock dock (internal evaluation candidate). Presentation only: the clock contract and the JS are untouched.
const require = createRequire(import.meta.url);
const SC = require("../shotclock-v1.js");
const raw = name => globalThis.__p3RawReadFileSync.call(fs, new URL("../" + name, import.meta.url), "utf8");
const css = raw("shotclock-v1.css"), js = raw("shotclock-v1.js");
const planA = css.slice(css.indexOf("Plan A (Build 91"));

test("PA-1: visual order is time > Reset > Extend > Start/Pause: Reset left with a strong outline, Extend tinted, Start/Pause white with a hairline (no black block)", () => {
  assert.match(planA, /\.cue-sc-dock:not\(\.cue-sc-lg\) \.cue-sc-resetb\{grid-column:2;/);
  assert.match(planA, /\.cue-sc-dock:not\(\.cue-sc-lg\) \.cue-sc-extb\{grid-column:3;/);
  assert.match(planA, /\.cue-sc-dock:not\(\.cue-sc-lg\) \.cue-sc-main\{grid-column:4;/);
  assert.match(planA, /\.cue-sc-resetb\{background:#fff!important;border:2px solid #1C1C1E!important/);
  assert.match(planA, /\.cue-sc-extb\{background:#F2F2F7!important;border:1px solid #D1D1D6!important/);
  assert.match(planA, /\.cue-sc-main\{background:#fff!important;border:1px solid #D1D1D6!important/);
  assert.ok(!/\.cue-sc-main\{[^}]*background:(var\(--cue-scd-text\)|#1C1C1E|#000)/.test(planA), "the Start/Pause button is no longer a black block");
});

test("PA-2: the time is the largest object (48 / 44 / 38 px by width) and turns red at time up; colour change only, 160 ms, off under Reduce Motion", () => {
  assert.match(planA, /\.cue-sc-dock\{--cue-scv-num:48px\}/); assert.match(planA, /max-width:380px\)\{\.cue-sc-dock\{--cue-scv-num:44px\}/); assert.match(planA, /max-width:340px\)\{\.cue-sc-dock\{--cue-scv-num:38px\}/);
  assert.match(planA, /\[data-st="expired"\] \.cue-sc-num\{color:var\(--cue-scd-err\)!important\}/);
  assert.match(planA, /\.cue-sc-num\{transition:color \.16s ease-out\}/); assert.match(planA, /prefers-reduced-motion:reduce\)\{\.cue-sc-dock \.cue-sc-num\{transition:none\}/);
  assert.ok(!/@keyframes|animation\s*:|infinite/.test(css), "no blinking / looping animation");
});

test("PA-3: control height stays 48 pt, no text below 12 px, hit widths keep Reset >= 54, Extend >= 46, Start/Pause >= 56 pt", () => {
  assert.match(css, /\.cue-sc-btn\{[^}]*height:48px!important/);
  for (const m of css.matchAll(/font-size:\s*(?:calc\()?(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1]) >= 12, `font-size ${m[1]}px`);
  assert.match(planA, /cue-sc-main\{flex-direction:column!important;gap:1px!important;min-width:68px/);
  assert.match(planA, /\.cue-sc-lb\{font-size:calc\(14px \* var\(--cue-scv-ts,1\)\)!important\}/, "labels follow the text scale");
  assert.match(planA, /\.cue-sc-dock\.cue-sc-lg\{--cue-scv-num:32px\}/, "large text keeps the pre-Plan-A time size so the two-row dock fits small log cards");
  assert.match(planA, /max-width:340px\)\{[^@]*cue-sc-main\{min-width:60px[^@]*cue-sc-resetb\{min-width:56px[^@]*cue-sc-extb\{min-width:46px/);
});

test("PA-4: the clock contract and the JS are unchanged (state machine API, 45 s default, 60 s extension, 3 s undo, no linkage)", () => {
  assert.equal(SC.DEFAULT_BASE, 45); assert.deepEqual([...SC.BASES], [30, 35, 40, 45, 60]); assert.equal(SC.EXT_MS, 60000); assert.equal(SC.UNDO_MS, 3000);
  assert.match(js, /els\.ext\.addEventListener|els\.ext = |ext: \$\("\.cue-sc-extb"/);
  assert.ok(!/proFoulBtn|proSafetyBtn|proSwitchBtn|proUndoBtn|proBalls|proP1Score/.test(js), "no linkage to match controls");
  const markup = js.slice(js.indexOf('dock = mk(\'<section class="cue-sc-dock"'), js.indexOf("wrap.appendChild(dock)"));
  assert.ok(markup.indexOf("cue-sc-extb") < markup.indexOf("cue-sc-resetb") && markup.indexOf("cue-sc-resetb") < markup.indexOf("cue-sc-main"), "DOM order unchanged (Plan A reorders with CSS only)");
});
