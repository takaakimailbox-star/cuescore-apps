import "./helpers/ja-fs.mjs";
/* P2 Phase B / OBS-03: refresh() of the match-setup player selection is triggered explicitly (no MutationObserver).
 * refresh() reads exactly two inputs: the player library and selectedRegisteredPlayer. This file (a) pins the complete set of production places that
 * can change those inputs or rewrite the library overlay, so a new one cannot appear without review, and (b) checks the trigger wiring over fakes.
 * The behavioural equivalence with the former observer is proven separately by the differential random walks (tests/browser/p2-obs03-walk.mjs). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { read, count } from "./helpers/p2-source.mjs";

const html = read("index.html"), b18 = read("final-ui-build18.js");
const WRAPPED = ["openPlayerLibrary", "closePlayerLibrary", "showPlayerLibraryMain", "openPlayerEditor", "renderPlayerLibrary", "savePlayerEditor", "deletePlayerByIdV1"];

test("[OBS-03] no MutationObserver in final-ui-build18.js; triggers are the overlay events, the 7 wrapped overlay functions and the 3 navigation hooks", () => {
  assert.ok(!b18.includes("MutationObserver"));
  assert.ok(b18.includes('["click","input","change"].forEach(type=>libraryOverlay.addEventListener(type,refreshSoon))'));
  assert.ok(b18.includes(JSON.stringify(WRAPPED).replace(/,/g, ",")));
  assert.equal(count(read("navigation-shell-phase1.js"), "CueScoreBuild18PlayerSelection?.refreshSoon?.()"), 2);
  assert.equal(count(read("navigation-phase2-6.js"), "CueScoreBuild18PlayerSelection?.refreshSoon?.()"), 1);
  assert.ok(b18.includes("window.CueScoreBuild18PlayerSelection={refresh,refreshSoon,validPlayers,selected};"));
});
test("[OBS-03] every wrapped function exists in production and keeps its global binding style (function declaration or global reassignment)", () => {
  for (const n of WRAPPED) assert.ok(new RegExp(`function ${n}\\(`).test(html), n);
  assert.equal(count(html, /\bopenPlayerLibrary = function\(/), 1); assert.equal(count(html, /\bshowPlayerLibraryMain = function\(/), 1); assert.equal(count(html, /\brenderPlayerLibrary = function\(/), 1);
  for (const f of fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && f !== "sw.js")) if (f !== "index.html") for (const n of WRAPPED) assert.ok(!new RegExp(`\\b${n}\\s*=[^=]`).test(read(f)), `${f} re-assigns ${n} after the wrappers are installed`);
});
test("[OBS-03] inventory of the inputs of refresh(): selection writers and library writers are pinned (a new writer needs a trigger review)", () => {
  assert.equal(count(html, /selectedRegisteredPlayer\[[^\]]*\]\s*=[^=]/g), 4);  // clear on delete, select, clear on edit, primary init
  assert.equal(count(html, /selectedRegisteredPlayer\s*=[^=]/g), 3);            // declaration, state restore, clearSelectedPlayersV1
  assert.equal(count(html, /\[selectedRegisteredPlayer\[1\], selectedRegisteredPlayer\[2\]\] =/g), 1); // swap (inside the setup screen: setup click listener)
  assert.equal(count(html, /(?<!function )writePlayerLibrary\(/g), 5);          // save, delete, set-primary, delete-all x2
});
test("[OBS-03] inventory of code that touches the player-library overlay element (a new reference needs a trigger review)", () => {
  const per = {}; for (const f of fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && f !== "sw.js")) { const n = count(read(f), "playerLibraryOverlay"); if (n) per[f] = n; }
  assert.deepEqual(per, { "final-ui-build18.js": 1, "index.html": 20, "navigation-phase2-6.js": 2, "navigation-shell-phase1.js": 4, "player-detail-build6.js": 3, "ui-revision-v12.js": 1 });
});
test("[OBS-03] wiring over fakes: wrappers call the original, return its value, and ask for exactly one deferred refresh; overlay events register; refresh() itself is unchanged in behaviour", () => {
  const raf = []; const listeners = {}; const mk = () => ({ textContent: "", value: "", hidden: false, disabled: false, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener() {}, querySelector: () => null, after() {}, closest: () => null, set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h || ""; } });
  const setup = mk(), start = mk(), overlay = { addEventListener: (t, f) => (listeners[t] = f) };
  const nodes = {}; const calls = [];
  const ctx = vm.createContext({
    document: { querySelector: s => (s === ".cue-new-match-integrated-v2" ? setup : null), getElementById: id => (id === "startGameBtn" ? start : id === "playerLibraryOverlay" ? overlay : (nodes[id] ||= mk())), createElement: () => mk() },
    requestAnimationFrame: f => raf.push(f), setTimeout: f => f(), readPlayerLibrary: () => [], selectedRegisteredPlayer: { 1: null, 2: null }, initializePrimaryMatchSetupV1() {}, openPlayerLibrary() {},
    window: {}
  });
  ctx.window.openPlayerLibrary = function (...a) { calls.push(["open", this === ctx.window, a]); return 42; };
  ctx.window.closePlayerLibrary = () => { calls.push(["close"]); };
  vm.runInContext(b18, ctx);
  assert.deepEqual(Object.keys(listeners).sort(), ["change", "click", "input"]);
  const before = raf.length;
  assert.equal(ctx.window.openPlayerLibrary(2), 42); assert.deepEqual(calls[0].slice(0, 1), ["open"]); assert.deepEqual(calls[0][2], [2]);
  assert.equal(raf.length, before + 1);
  ctx.window.closePlayerLibrary(); assert.equal(raf.length, before + 2);
  listeners.click(); assert.equal(raf.length, before + 3);
  raf.forEach(f => f()); // deferred refresh runs refresh(): empty library -> "add player" placeholders
  assert.equal(nodes.p1NameDisplayV1.textContent, "プレーヤーを追加"); assert.equal(nodes.p2NameDisplayV1.textContent, "対戦相手を追加");
  assert.equal(start.disabled, true); assert.equal(start.attrs["aria-disabled"], "true");
});
