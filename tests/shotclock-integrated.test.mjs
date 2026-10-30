import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";
import zlib from "node:zlib";

// Decision 047 / Official 136-137: selectable extension seconds, re-based progress bar, four soft bar colours, time-up presentation, digits + unit side by side.
const require = createRequire(import.meta.url);
const SC = require("../shotclock-v1.js");
const main = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), "zh-Hans": require("../i18n-catalog-zh-hans-v1.js") };   // Decision 048: the 21 shot-clock keys are P4-approved and live in the main catalogs
const cat = Object.fromEntries(Object.entries(main).map(([l, c]) => [l, Object.fromEntries(Object.entries(c).filter(([k]) => k.startsWith("shotclock.")))]));
const raw = name => globalThis.__p3RawReadFileSync.call(fs, new URL("../" + name, import.meta.url), "utf8");
const css = raw("shotclock-v1.css"), js = raw("shotclock-v1.js"), idx = raw("index.html");
const S = 1000;
const at8 = (base, ext) => { const c = SC.createClock(base, ext); c.toggle(0); const t = (base - 8) * S; return [c, t]; };

test("SC47-1: extension choices are 25/30/45/60 (default 60); base times stay 30/35/40/45/60; invalid values fall back to 60", () => {
  assert.deepEqual([...SC.EXTS], [25, 30, 45, 60]); assert.equal(SC.DEFAULT_EXT, 60); assert.deepEqual([...SC.BASES], [30, 35, 40, 45, 60]);
  assert.equal(SC.createClock(45).ext, 60); assert.equal(SC.createClock(45, 99).ext, 60); assert.equal(SC.createClock(45, 30).ext, 30);
});

test("SC47-2: remaining + chosen seconds (8 s left: 33 / 38 / 53 / 68), for every base time, running and paused", () => {
  for (const base of SC.BASES) for (const [ext, want] of [[25, 33], [30, 38], [45, 53], [60, 68]]) {
    const [c, t] = at8(base, ext); assert.equal(c.seconds(t), 8); c.extend(t); assert.equal(c.seconds(t), want, `base ${base} +${ext}`);
    const [p, tp] = at8(base, ext); p.toggle(tp); p.extend(tp); assert.equal(p.seconds(tp), want, `paused base ${base} +${ext}`);
  }
});

test("SC47-3: undo within 3 s takes back exactly the seconds added; elapsed real time is not given back; after 3 s no undo; from expired it returns to expired", () => {
  for (const ext of SC.EXTS) {
    const [c, t] = at8(45, ext); c.extend(t); assert.equal(c.undo.added, ext * S);
    c.undoExtend(t + 2 * S); assert.equal(c.seconds(t + 2 * S), 6, `+${ext}: 8 s left, 2 s elapsed -> 6`); assert.equal(c.extCount, 0);
    const [d, td] = at8(45, ext); d.extend(td); assert.equal(d.undoExtend(td + 3001), false); assert.equal(d.seconds(td + 3001), 8 + ext - 3);
  }
  const c = SC.createClock(45, 30); c.toggle(0); c.sync(50 * S); assert.equal(c.state, "expired");
  c.extend(50 * S); assert.equal(c.seconds(50 * S), 30); c.undoExtend(51 * S); assert.equal(c.state, "expired"); assert.equal(c.seconds(51 * S), 0);
});

test("SC47-4: the bar is re-based at an extension (full right after, counts down to 0), undo restores the previous reference; time up = empty bar", () => {
  const [c, t] = at8(45, 25);
  assert.ok(Math.abs(c.fraction(t) - 8 / 45) < 1e-9);
  c.extend(t); assert.equal(c.fraction(t), 1); assert.ok(Math.abs(c.fraction(t + 11 * S) - 22 / 33) < 1e-9);
  c.undoExtend(t + S); assert.ok(Math.abs(c.fraction(t + S) - 7 / 45) < 1e-9, "undo restores the pre-extension reference");
  const e = SC.createClock(45); e.toggle(0); e.sync(46 * S); assert.equal(e.fraction(46 * S), 0); assert.equal(SC.createClock(45).fraction(0), 1);
  const r = SC.createClock(45); r.toggle(0); r.extend(S); r.reset(2 * S); assert.equal(r.fraction(2 * S), 1);
});

test("SC47-5: a stored (resumed) clock keeps its extension seconds and bar reference; the extension setting is stored in the clock key only", () => {
  const [c, t] = at8(45, 30); c.extend(t); const snap = c.snapshot(t); assert.equal(snap.extSec, 30);
  const d = SC.createClock(45, 60); assert.equal(d.restore(snap, t), true); assert.equal(d.ext, 30); assert.equal(d.state, "paused"); assert.equal(d.seconds(t), 38); assert.equal(d.fraction(t), 1);
  const mem = v => ({ getItem: () => v });
  assert.equal(SC.readStore(mem(JSON.stringify({ v: 1, enabled: true, base: 45, ext: 25 }))).ext, 25);
  assert.equal(SC.readStore(mem(JSON.stringify({ v: 1, enabled: true, base: 45, ext: 7 }))).ext, 60);
  assert.equal(SC.readStore(mem(JSON.stringify({ v: 1, enabled: true, base: 45 }))).ext, 60, "stores written by Build 91 (no ext) read as 60");
  let saved = ""; SC.writeStore({ setItem: (k, v) => { assert.equal(k, SC.KEY); saved = v; } }, { enabled: true, base: 40, ext: 45, clock: null }); assert.equal(JSON.parse(saved).ext, 45);
});

test("SC47-6: colour level by real remaining seconds: warn (10-6) and danger (5-1) beat extension green; extension green at 11+ s only while an extension is in use; reset returns to normal", () => {
  const m = js.match(/const level = \(c, n\) => \(([^;]+)\);/); assert.ok(m, "level()");
  const level = new Function("c", "n", "return (" + m[1] + ");");
  const c = SC.createClock(45); const L = (n, now = 0) => level(c, n);
  assert.equal(L(45), "ok"); c.toggle(0); assert.equal(L(30), "ok"); assert.equal(L(11), "ok"); assert.equal(L(10), "warn"); assert.equal(L(6), "warn"); assert.equal(L(5), "danger"); assert.equal(L(1), "danger");
  c.extend(S); assert.equal(L(60), "ext"); assert.equal(L(11), "ext"); assert.equal(L(10), "warn"); assert.equal(L(5), "danger");
  c.reset(2 * S); assert.equal(L(45), "ok");
  c.extend(3 * S); c.undoExtend(4 * S); assert.equal(L(40), "ok", "undo of the only extension goes back to normal");
  c.sync(1e6); assert.equal(c.state, "expired"); assert.equal(L(0), "over");
});

test("SC47-7: four soft bar colours are tints of the ball-icon colours in index.html (not invented); digits stay neutral, red only at time up, bar never red/filled at 0", () => {
  const ball = n => (idx.match(new RegExp("\\.ball-" + n + " \\{ background: #([0-9a-fA-F]{6});"))[1]);
  const rgb = h => [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  const tint = (c, t) => c.map(v => Math.round(v * t + 255 * (1 - t)));
  const mid = (a, b) => a.map((v, i) => Math.round((v + b[i]) / 2));
  const hex = c => c.map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
  const y = rgb(ball(1)), o = rgb(ball(5)), g = rgb(ball(6));
  const tok = n => css.match(new RegExp("--cue-scg-" + n + ":#([0-9A-F]{6})"))[1];
  assert.equal(tok("normal"), hex(tint(y, .6))); assert.equal(tok("ext"), hex(tint(g, .6))); assert.equal(tok("danger"), hex(tint(o, .6))); assert.equal(tok("warn"), hex(tint(mid(y, o), .6)));
  const blk = css.slice(css.indexOf("Decision 047 / Official 136-137"));
  assert.match(blk, /\[data-st="expired"\] \.cue-sc-bar i\{width:0!important\}/);
  assert.match(blk, /\[data-st="expired"\] \.cue-sc-num,[^{]*\.cue-sc-sec[^{]*\{color:var\(--cue-scd-err\)!important\}/);
  assert.match(blk, /\.cue-sc-dock \.cue-sc-num\{color:var\(--cue-scd-text\)!important\}/);
  assert.ok(!/cue-sc-bar i\{[^}]*(err|#D70015|red)/.test(blk), "no red bar fill");
  assert.ok(!/@keyframes|animation\s*:|infinite/.test(css)); assert.match(blk, /prefers-reduced-motion:reduce\)\{\.cue-sc-dock \.cue-sc-bar i\{transition:none\}/);
});

test("SC47-8: digits and unit are side by side (one baseline row); the unit is in every state; extension button follows the chosen value", () => {
  assert.match(js, /<span class="cue-sc-row"><b class="cue-sc-num"><\/b><span class="cue-sc-sec"><\/span><\/span>/);
  assert.match(js, /els\.sec\.textContent = T\("shotclock\.sec"\)/);
  assert.match(css, /\.cue-sc-row\{display:flex;align-items:baseline/);
  assert.match(js, /textContent = \(un \? "−" : "\+"\) \+ clock\.ext/);
  assert.match(js, /menu\(extBtn, EXTS,/, "setup row offers the extension choices through the tap menu");
});

test("SC47-9: catalog: extension time term + parameterised aria in 3 languages, P4-APPROVED main-catalog keys (Decision 048)", () => {
  for (const l of ["ja", "en", "zh-Hans"]) { assert.ok(cat[l]["shotclock.extTime"]); assert.match(cat[l]["shotclock.aria.extend"], /\{sec\}/); }
  assert.equal(cat.ja["shotclock.extTime"], "延長時間"); assert.equal(cat.en["shotclock.extTime"], "Extension"); assert.equal(cat["zh-Hans"]["shotclock.extTime"], "延时时间");
  for (const f of ["i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"]) assert.ok(raw(f).includes("shotclock.extTime"), f);
  assert.equal(cat["zh-Hans"]["shotclock.extend"], "延时"); assert.equal(cat["zh-Hans"]["shotclock.aria.undo"], "撤销延时"); assert.equal(cat.en["shotclock.supplement"], "Time each shot manually");
});

test("SC47-10: still zero linkage (no match data, score, log, Backup/QR keys, audio/vibration) and the timing source is Date.now deadlines", () => {
  for (const banned of ["proP1Score", "proP2Score", "proTurnLog", "proFoulBtn", "proSafetyBtn", "proSwitchBtn", "proUndoBtn", "proBalls", "CueScoreDomain", "DATA_RECORD_KEY", "inProgressMatch", "navigator.vibrate", "AudioContext", "new Audio"]) assert.ok(!js.includes(banned), banned);
  assert.ok(/deadline/.test(js) && /Date\.now/.test(js));
});

function zipText(path) {
  const buffer = fs.readFileSync(new URL("../" + path, import.meta.url)); let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i--) if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  const count = buffer.readUInt16LE(eocd + 10); let off = buffer.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i++) {
    const method = buffer.readUInt16LE(off + 10), cs = buffer.readUInt32LE(off + 20), nl = buffer.readUInt16LE(off + 28), el = buffer.readUInt16LE(off + 30), cl = buffer.readUInt16LE(off + 32), lo = buffer.readUInt32LE(off + 42);
    if (buffer.toString("utf8", off + 46, off + 46 + nl) === "word/document.xml") {
      const start = lo + 30 + buffer.readUInt16LE(lo + 26) + buffer.readUInt16LE(lo + 28), d = buffer.subarray(start, start + cs);
      return (method === 0 ? d : zlib.inflateRawSync(d)).toString("utf8").replace(/<[^>]+>/g, "");
    }
    off += 46 + nl + el + cl;
  }
  assert.fail("document.xml not found");
}
test("SC47-11: Decision Log v2.23 records Decision 047 once, Decisions 001-047 contiguous, v2.22 is preserved without 047, README keeps v2.23 as the preceding release (v2.24 is current since Decision 048), Official 136 / 137 exist", () => {
  const t = zipText("docs/official/07_CueScore_Official_Design_Decision_Log_v2.23_Official_Release.docx");
  assert.equal((t.match(/Decision 047｜/g) || []).length, 1);
  assert.deepEqual([...t.matchAll(/Decision (\d{3})｜/g)].map(m => Number(m[1])), Array.from({ length: 47 }, (_, i) => i + 1));
  assert.match(t, /Version 2\.23/); assert.match(t, /D047-3：延長秒を＋25／＋30／＋45／＋60から選択/);
  assert.ok(!zipText("docs/official/07_CueScore_Official_Design_Decision_Log_v2.22_Official_Release.docx").includes("Decision 047"));
  const readme = raw("docs/README.md");
  assert.match(readme, /v2\.23 adds Decision 047/); assert.match(readme, /Official Design Decision Log v2\.24 is the current official release and successor\s+to v2\.23/);   // Decision 048 later publishes v2.24; v2.23 is preserved
  assert.ok(fs.existsSync(new URL("../docs/official/136_CueScore_Shot_Clock_Integrated_Improvement_Decision.md", import.meta.url)) && fs.existsSync(new URL("../docs/official/137_CueScore_Shot_Clock_Integrated_Improvement_Spec.md", import.meta.url)));
});
