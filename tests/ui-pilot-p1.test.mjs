import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

// UI Pilot P1 comparison build (Build 90, internal TestFlight): default OFF, 9-Ball / 10-Ball only, own removable unit, no effect on match data / shot clock.
const require = createRequire(import.meta.url);
const P = require("../ui-pilot-v1.js");
const root = new URL("../", import.meta.url);
const raw = name => globalThis.__p3RawReadFileSync.call(fs, new URL(name, root), "utf8");
const js = raw("ui-pilot-v1.js"), css = raw("ui-pilot-v1.css");

test("UP-1: default OFF; stored values are validated; the Pilot applies only to an enabled comparison, choice 'new', and 9-Ball / 10-Ball", () => {
  const mem = v => ({ getItem: () => v });
  assert.deepEqual(P.readStore(mem(null)), { enabled: false, on: true });
  assert.deepEqual(P.readStore(mem("{bad")), { enabled: false, on: true });
  assert.deepEqual(P.readStore(mem(JSON.stringify({ v: 2, enabled: true }))), { enabled: false, on: true });
  assert.equal(P.readStore(mem(JSON.stringify({ v: 1, enabled: "yes" }))).enabled, false);
  assert.deepEqual(P.readStore(mem(JSON.stringify({ v: 1, enabled: true, on: false }))), { enabled: true, on: false });
  assert.equal(P.KEY, "cueScore.uiPilot.v1");
  const icon = n => `assets/icons/games/${n}.svg`;
  for (const n of ["game-9ball", "game-10ball"]) assert.equal(P.applied({ enabled: true, on: true }, icon(n)), true, n);
  for (const n of ["game-jpa-9ball", "game-rotation", "game-14-1", "game-3cushion"]) assert.equal(P.applied({ enabled: true, on: true }, icon(n)), false, n);
  assert.equal(P.applied({ enabled: false, on: true }, icon("game-9ball")), false); assert.equal(P.applied({ enabled: true, on: false }, icon("game-9ball")), false);
});

test("UP-2: one removable unit — no other product file references the Pilot, only its own storage key, no watcher on the DOM, no writes to match elements", () => {
  const unit = /^(ui-pilot-v1\.(js|css)|i18n-catalog-uipilot-v1\.js|sw\.js)$/;
  for (const f of fs.readdirSync(root).filter(f => /\.(js|html|css)$/.test(f) && !unit.test(f))) {
    const t = raw(f);
    if (f === "index.html") { assert.equal((t.match(/ui-pilot-v1|i18n-catalog-uipilot-v1/g) || []).length, 3, "index.html loads exactly the three files"); assert.ok(!/CueScoreUiPilotV1|uiPilot/.test(t)); continue; }
    if (f === "tests") continue;
    assert.ok(!/CueScoreUiPilotV1|uiPilot|ui-pilot-p1/.test(t), `${f} must not reference the Pilot`);
  }
  assert.deepEqual([...new Set([...js.matchAll(/["'`](cueScore\.[A-Za-z0-9_.]+)["'`]/g)].map(m => m[1]))], ["cueScore.uiPilot.v1"]);
  assert.ok(!/MutationObserver/.test(js), "no DOM mutation watcher");
  for (const banned of ["localStorage.setItem(\"cueScore.shotClock", "CueScoreShotClockV1", "CueScoreEntitlement", "CueScoreDomain", "DATA_RECORD_KEY", "inProgressMatch"]) assert.ok(!js.includes(banned), banned);
  assert.ok(!/(proP[12]Score|proTurnLog|proP[12]Foul|proBalls)[^;\n]*\.(textContent|innerHTML|innerText)\s*=/.test(js), "never writes to score / log / foul elements");
  assert.match(js, /\.cue-new-match-v1/); assert.match(js, /isRackIconSrc/);
});

test("UP-3: every style rule is scoped to the Pilot, text >= 12px, motion 150-180 ms with a Reduce Motion block, no blinking", () => {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of body.matchAll(/(^|\})\s*([^{}@]+)\{/g)) {
    const sel = m[2].trim(); if (!sel || /^(from|to|\d+%)/.test(sel)) continue;
    for (const part of sel.split(",").map(x => x.trim())) assert.ok(/^(:root|\.ui-pilot-p1\b|#proStartTime\[data-uip\]|\.uip-)/.test(part), `unscoped selector: ${part}`);
  }
  for (const m of css.matchAll(/font-size:\s*(?:calc\()?(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1]) >= 12, `font-size ${m[1]}px`);
  for (const m of css.matchAll(/(?:animation|transition)[^;{}]*?\.(\d+)s/g)) { const ms = Number("0." + m[1]) * 1000; assert.ok(ms <= 180, `duration ${ms}ms`); }
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.ui-pilot-p1 \.uip-tick/);
  assert.ok(!/infinite|steps\(/.test(css), "no blinking / looping animation");
  assert.match(css, /\.ui-pilot-p1 \.pro-ball\{width:52px/); assert.match(css, /max-width:340px\)\{\.ui-pilot-p1 \.pro-balls\{row-gap:8px[^}]*\}\.ui-pilot-p1 \.pro-ball\{width:48px/);
});

test("UP-4: 3-language provisional catalog is complete and CANDIDATE; main catalogs untouched; removal procedure is documented", () => {
  const cat = require("../i18n-catalog-uipilot-v1.js");
  assert.deepEqual(Object.keys(cat).sort(), ["en", "ja", "zh-Hans"]);
  const keys = Object.keys(cat.ja); assert.equal(keys.length, 5);
  for (const l of ["en", "zh-Hans"]) assert.deepEqual(Object.keys(cat[l]), keys);
  assert.match(raw("i18n-catalog-uipilot-v1.js"), /CANDIDATE/);
  for (const main of ["i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"]) assert.ok(!raw(main).includes("uipilot"), main);
  const doc = raw("docs/implementation/CueScore_UIPilot_P1_Removal_Procedure_2026-10-28.md");
  assert.match(doc, /App Store 提出用の Build には試験UIを含めない/); assert.match(doc, /ui-pilot-v1\.js/);
});
