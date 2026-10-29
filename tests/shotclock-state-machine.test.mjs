import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

// Decision 046 / Official 134-135: Shot Clock B4 state machine (deadline based), storage and zero-linkage static checks.
const require = createRequire(import.meta.url);
const SC = require("../shotclock-v1.js");
const root = new URL("../", import.meta.url);
const raw = name => globalThis.__p3RawReadFileSync.call(fs, new URL(name, root), "utf8");
const S = 1000;

test("AC-SC3: idle -> start -> pause -> resume uses a deadline, paused time does not run", () => {
  const c = SC.createClock(45); let t = 10_000;
  assert.equal(c.state, "idle"); assert.equal(c.seconds(t), 45);
  c.toggle(t); assert.equal(c.state, "running"); assert.equal(c.seconds(t), 45);
  t += 10 * S; assert.equal(c.seconds(t), 35);
  c.toggle(t); assert.equal(c.state, "paused"); assert.equal(c.seconds(t), 35);
  t += 600 * S; assert.equal(c.seconds(t), 35, "a long pause does not consume time");
  c.toggle(t); assert.equal(c.state, "running"); t += 5 * S; assert.equal(c.seconds(t), 30);
});

test("AC-SC4: the remaining time is recomputed from the real clock after background / lock (no accumulation)", () => {
  const c = SC.createClock(45); let t = 0; c.toggle(t);
  t += 19 * S; assert.equal(c.seconds(t), 26, "same value no matter how many ticks were missed");
  t += 100 * S; assert.equal(c.sync(t), true); assert.equal(c.state, "expired"); assert.equal(c.seconds(t), 0);
});

test("AC-SC3: reset restores the base time, clears the count and keeps the run / pause state; expired goes back to idle; no undo", () => {
  const c = SC.createClock(45); let t = 0; c.toggle(t); t += 10 * S; c.extend(t);
  c.reset(t); assert.equal(c.state, "running"); assert.equal(c.seconds(t), 45); assert.equal(c.extCount, 0); assert.equal(c.undo, null);
  c.toggle(t); t += 5 * S; c.reset(t); assert.equal(c.state, "paused"); assert.equal(c.seconds(t), 45);
  c.toggle(t); t += 100 * S; c.sync(t); assert.equal(c.state, "expired"); c.reset(t); assert.equal(c.state, "idle"); assert.equal(c.seconds(t), 45);
  assert.equal(c.undoExtend(t), false);
});

test("AC-SC3: extend +60 has no count limit, is disabled while idle, restarts at 60 from expiry", () => {
  const c = SC.createClock(30); let t = 0;
  assert.equal(c.extend(t), false, "idle: extend is disabled"); assert.equal(c.extCount, 0);
  c.toggle(t);
  for (let i = 1; i <= 25; i++) { assert.equal(c.extend(t), true); assert.equal(c.extCount, i); t += 4 * S; }
  assert.equal(c.seconds(t), 30 + 25 * 60 - 25 * 4);
  const d = SC.createClock(30); t = 0; d.toggle(t); t += 31 * S; d.sync(t); assert.equal(d.state, "expired");
  assert.equal(d.extend(t), true); assert.equal(d.state, "running"); assert.equal(d.seconds(t), 60);
  t += 61 * S; d.sync(t); assert.equal(d.state, "expired", "expires again at 0 (display only)");
});

test("AC-SC3: extension undo works only within 3 s, removes exactly 60 s and gives no elapsed time back", () => {
  const c = SC.createClock(45); let t = 0; c.toggle(t); t += 10 * S;
  c.extend(t); assert.equal(c.seconds(t), 95);
  t += 2 * S; assert.equal(c.undoExtend(t), true); assert.equal(c.seconds(t), 33); assert.equal(c.extCount, 0);
  c.extend(t); t += 3500; assert.equal(c.undoExtend(t), false, "after 3 s the undo is gone"); assert.equal(c.extCount, 1);
  const p = SC.createClock(45); t = 0; p.toggle(t); p.toggle(t); p.extend(t); assert.equal(p.seconds(t), 105); p.undoExtend(t + S); assert.equal(p.seconds(t), 45); assert.equal(p.state, "paused");
  const e = SC.createClock(30); t = 0; e.toggle(t); t += 31 * S; e.sync(t); e.extend(t); assert.equal(e.undoExtend(t + S), true); assert.equal(e.state, "expired"); assert.equal(e.seconds(t + S), 0);
});

test("AC-SC5: a running clock is stored as paused with its remaining time; invalid or out-of-range data falls back safely", () => {
  const c = SC.createClock(45); let t = 0; c.toggle(t); t += 12 * S; c.extend(t);
  const snap = c.snapshot(t); assert.deepEqual(Object.keys(snap).sort(), ["extCount", "extSec", "refMs", "remainMs", "state"]);
  const d = SC.createClock(45); assert.equal(d.restore(snap, t + 9999 * S), true);
  assert.equal(d.state, "paused"); assert.equal(d.seconds(t + 9999 * S), 93); assert.equal(d.extCount, 1);
  for (const bad of [null, "x", { state: "bogus", remainMs: 1, extCount: 0 }, { state: "paused", remainMs: NaN, extCount: 0 }, { state: "paused", remainMs: 1, extCount: -1 }, { state: "paused", remainMs: 1, extCount: 1.5 }]) assert.equal(SC.createClock(45).restore(bad, 0), false);
  const huge = SC.createClock(45); huge.restore({ state: "paused", remainMs: 1e12, extCount: 0 }, 0); assert.equal(huge.seconds(0), 45, "clamped to base + 60 x count");
  const exp = SC.createClock(45); exp.restore({ state: "expired", remainMs: 0, extCount: 2 }, 0); assert.equal(exp.state, "expired");
});

test("AC-SC10: base times 30/35/40/45/60 only, default 45; storage defaults to OFF and ignores bad values", () => {
  assert.deepEqual([...SC.BASES], [30, 35, 40, 45, 60]); assert.equal(SC.DEFAULT_BASE, 45);
  const c = SC.createClock(33); assert.equal(c.base, 45); assert.equal(c.setBase(50), false); assert.equal(c.setBase(60), true); assert.equal(c.seconds(0), 60);
  const mem = v => ({ getItem: () => v, setItem(k, x) { this.last = [k, x]; } });
  assert.deepEqual(SC.readStore(mem(null)), { enabled: false, base: 45, ext: 60, clock: null });
  assert.deepEqual(SC.readStore(mem("{bad")), { enabled: false, base: 45, ext: 60, clock: null });
  assert.deepEqual(SC.readStore(mem(JSON.stringify({ v: 2, enabled: true }))), { enabled: false, base: 45, ext: 60, clock: null });
  assert.equal(SC.readStore(mem(JSON.stringify({ v: 1, enabled: "yes", base: 33 }))).enabled, false);
  const ok = SC.readStore(mem(JSON.stringify({ v: 1, enabled: true, base: 35 }))); assert.equal(ok.enabled, true); assert.equal(ok.base, 35);
  const w = mem(null); SC.writeStore(w, { enabled: true, base: 40, clock: null }); assert.equal(w.last[0], "cueScore.shotClock.v1");
  assert.equal(SC.KEY, "cueScore.shotClock.v1");
});

test("AC-SC2 / AC-SC6: zero linkage and data protection (static): no other product file references the clock, the clock touches only its own key and no match data", () => {
  const src = raw("shotclock-v1.js");
  const others = fs.readdirSync(root).filter(f => /\.(js|html|css)$/.test(f) && !/^(shotclock-v1\.(js|css)|i18n-catalog-shotclock-v1\.js|sw\.js)$/.test(f));
  for (const f of others) {
    const text = raw(f);
    if (f === "index.html") { assert.equal((text.match(/shotclock-v1|i18n-catalog-shotclock-v1/g) || []).length, 3, "index.html only loads the three files"); assert.ok(!/CueScoreShotClockV1|cueScore\.shotClock/.test(text)); continue; }
    assert.ok(!/CueScoreShotClockV1|shotClock|cueScore\.shotClock/.test(text), `${f} must not reference the shot clock`);
  }
  const keys = [...src.matchAll(/["'`](cueScore\.[A-Za-z0-9_.]+|rotationScoreboard\.[A-Za-z0-9_.]+)["'`]/g)].map(m => m[1]);
  assert.deepEqual([...new Set(keys)], ["cueScore.shotClock.v1"], "the only storage key");
  for (const banned of ["proP1Score", "proP2Score", "proTurnLog", "proFoulBtn", "proSafetyBtn", "proSwitchBtn", "proUndoBtn", "proBalls", "CueScoreDomain", "DATA_RECORD_KEY", "inProgressMatch", "navigator.vibrate", "AudioContext", "new Audio"]) assert.ok(!src.includes(banned), `shotclock-v1.js must not reference ${banned}`);
  assert.ok(!/addEventListener\(\s*["'](input|change)["']/.test(src), "no listener on match input controls");
  assert.ok(!/sound|haptic/i.test(src.replace(/\/\*[\s\S]*?\*\//g, "")), "no sound / haptics are implemented (default OFF, not offered)");
});

test("AC-SC1 / AC-SC11: OFF mounts nothing (static), the dock is created only when enabled, 3-language provisional catalog is complete and CANDIDATE", () => {
  const src = raw("shotclock-v1.js");
  assert.match(src, /if \(!store\.enabled\) return;\s*\/\/ OFF: nothing is created/);
  const cat = require("../i18n-catalog-shotclock-v1.js");
  assert.deepEqual(Object.keys(cat).sort(), ["en", "ja", "zh-Hans"]);
  const keys = Object.keys(cat.ja); assert.equal(keys.length, 21);   // 20 (Decision 046) + shotclock.extTime (Decision 047)
  for (const lang of ["en", "zh-Hans"]) assert.deepEqual(Object.keys(cat[lang]), keys);
  assert.equal(cat["zh-Hans"]["shotclock.title"], "出杆计时器");
  assert.equal(cat["zh-Hans"]["shotclock.paused"], "已暂停");
  assert.equal(cat.en["shotclock.undo"], "Undo"); assert.match(cat.en["shotclock.aria.undo"], /extension/i);
  assert.match(raw("i18n-catalog-shotclock-v1.js"), /CANDIDATE/);
  for (const main of ["i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"]) assert.ok(!raw(main).includes("shotclock"), `${main} stays unchanged (P4-approved keys only)`);
});

test("AC-SC7: the dock has no text below 12px, 48pt controls and no blinking animation", () => {
  const css = raw("shotclock-v1.css");
  assert.ok(!/@keyframes|animation\s*:/.test(css), "no blinking / pulsing (DS-REQ-035)");
  assert.match(css, /\.cue-sc-btn\{[^}]*height:48px!important/);
  for (const m of css.matchAll(/font-size:\s*(?:calc\()?(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1]) >= 12, `font-size ${m[1]}px`);
});
