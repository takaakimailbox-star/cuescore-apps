/* Match-setup UX trial (Build 95 candidate; design basis: the isolated Prototype of 2026-10-30).
 * Static contract tests. Presentation only: no start condition, no stored data, no score / clock calculation is touched. The new wording is P3-PROVISIONAL (not in the main catalogs). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const read = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const html = read("index.html"), js = read("match-setup-ux-v1.js"), css = read("match-setup-ux-v1.css"), sc = read("shotclock-v1.js"), scCss = read("shotclock-v1.css");
const cat = require("../i18n-catalog-setupux-v1.js");

test("SU-1 wiring: catalog, script and stylesheet are loaded (page, service worker, native build list) and the start button sits in the independent footer", () => {
  for (const f of ["i18n-catalog-setupux-v1.js", "match-setup-ux-v1.js", "match-setup-ux-v1.css"]) {
    assert.ok(html.includes("./" + f + "?v="), "index.html loads " + f);
    assert.ok(read("sw.js").includes("./" + f + "?v="), "sw.js precaches " + f);
    assert.ok(read("scripts/build-native-web.mjs").includes('"' + f + '"'), "native build copies " + f);
  }
  assert.ok(html.indexOf("i18n-catalog-setupux-v1.js") < html.indexOf("match-setup-ux-v1.js") && html.indexOf("match-setup-ux-v1.js") < html.indexOf("./shotclock-v1.js?v="));
  assert.ok(html.indexOf("match-setup-ux-v1.css") > html.indexOf("shotclock-v1.css"), "the layout sheet loads last so it wins the cascade");
  const footer = html.match(/<div class="cue-setup-footer-v1" id="cueSetupFooterV1">[\s\S]*?<\/div>\s*\n\s*\n/);
  assert.ok(footer && /id="cueSetupReasonV1"/.test(footer[0]) && /id="startGameBtn"/.test(footer[0]));
  const section = html.match(/<section class="cue-home-card-v1 cue-new-match-v1 cue-new-match-integrated-v2"[\s\S]*?<\/section>\s*\n\s*\n\s*<div class="cue-setup-footer-v1"/);
  assert.ok(section && !/id="startGameBtn"/.test(section[0]), "the start button is no longer inside the scrolling setup card");
  assert.ok(/<div class="cue-setup-reason-wrap-v1" role="status">/.test(html));
});

test("SU-2 wording: provisional catalog has identical key sets in ja / en / zh-Hans, is NOT in the main catalogs and carries the P3-PROVISIONAL / not-reviewed notice", () => {
  const keys = l => Object.keys(cat[l]).sort();
  assert.deepEqual(keys("en"), keys("ja")); assert.deepEqual(keys("zh-Hans"), keys("ja"));
  assert.equal(keys("ja").length, 7);
  for (const l of ["ja", "en", "zh-Hans"]) for (const k of keys(l)) assert.ok(String(cat[l][k]).trim().length > 0, l + " " + k);
  for (const f of ["i18n-catalog-ja-v1.js", "i18n-catalog-en-v1.js", "i18n-catalog-zh-hans-v1.js"]) assert.ok(!read(f).includes("setupux."), f + " must not hold the provisional keys");
  const head = read("i18n-catalog-setupux-v1.js").slice(0, 900);
  assert.match(head, /P3-PROVISIONAL/); assert.match(head, /Human independent review: NOT PERFORMED/);
  assert.ok(!/p4-po-approval|setupux/.test(read("tests/p4-po-approval.test.mjs")), "no P4 approval record exists for these terms");
  assert.equal(cat.ja["setupux.reason.p2"], "対戦相手を選ぶと試合を開始できます");
});

test("SU-3 policy: no DOM-watching observer (AC-S3 ratchet), no write to the start button's disabled state, explicit triggers only", () => {
  assert.ok(!/MutationObserver/.test(js));
  assert.ok(!/setAttribute\(["']disabled|\.disabled\s*=/.test(js));
  assert.match(js, /\["click", "input", "change"\]\.forEach\(t => doc\.addEventListener\(t, later, true\)\)/);
  assert.match(read("final-ui-build18.js"), /start\.disabled=players\.length<2\|\|!selected\(1\)\|\|!selected\(2\)/, "the start condition is still owned (unchanged) by final-ui-build18.js");
});

test("SU-4 menu contract: short lists only (<= 9 rows), choices come from the existing sheet / the unchanged clock constants, the existing sheet code applies and validates", () => {
  assert.match(js, /const MENU_MAX_ROWS = 9;/);
  assert.match(js, /querySelectorAll\("\.new-match-race-options-v1 \[data-race-value\]"\)/);
  assert.match(js, /onPick: \(v, o\) => o\.real\.click\(\)/);
  assert.match(js, /if \(!real\.length \|\| real\.length > MENU_MAX_ROWS\) return;/);
  assert.ok(!/61\s*,\s*90|25\s*,\s*50|15\s*,\s*20/.test(js), "no race value lists are hard-coded in the script");
  assert.match(js, /role", "listbox"/); assert.match(js, /role", "option"/); assert.match(js, /aria-selected/); assert.match(js, /key === "Escape"/); assert.match(js, /ArrowDown/);
});

test("SU-5 the existing Race to / Skill Level choice sources are unchanged (values, order, custom limits)", () => {
  assert.match(html, /Array\.from\(\{length:15\},\(_,index\)=>index\+1\)/);
  assert.match(html, /\[25,50,75,100,125,150\]/); assert.match(html, /\[15,20,25,30,35,40,50\]/); assert.match(html, /\[61,90,120,150,180,240,300\]/);
  assert.match(html, /const jpaTargets = \{1:14,2:19,3:25,4:31,5:38,6:46,7:55,8:65,9:75\}/);
  assert.match(html, /"9ball": Object\.freeze\(\{min:1,max:100/); assert.match(html, /rotation: Object\.freeze\(\{min:1,max:1000/); assert.match(html, /straightPool: Object\.freeze\(\{min:1,max:1000/); assert.match(html, /threeCushion: Object\.freeze\(\{min:1,max:100/);
});

test("SU-6 shot clock: setup UI only; constants, store key and calculation are unchanged (Decision 046 / 047 / 048)", () => {
  assert.match(sc, /const BASES = Object\.freeze\(\[30, 35, 40, 45, 60\]\);/); assert.match(sc, /const EXTS = Object\.freeze\(\[25, 30, 45, 60\]\);/);
  assert.match(sc, /DEFAULT_BASE = 45/); assert.match(sc, /DEFAULT_EXT = 60/);
  assert.match(sc, /baseBtn\.addEventListener\("click", \(\) => menu\(baseBtn, BASES,/); assert.match(sc, /extBtn\.addEventListener\("click", \(\) => menu\(extBtn, EXTS,/);
  assert.match(sc, /sw\.addEventListener\("click", \(\) => \{ store\.enabled = !store\.enabled; save\(\); paint\(\); \}\);/);
  assert.match(sc, /vals\.hidden = !store\.enabled;/);
  assert.ok(!/cue-sc-base-btn|role", "radio"/.test(sc), "the always-visible chips are replaced by the value buttons");
  assert.match(sc, /card\.appendChild\(sec\)/);
  assert.match(scCss, /\.cue-sc-val\{[^}]*min-height:52px/);
});

test("SU-7 layout contract: header in one row, compact cards, independent footer, 44pt+ targets, empty-player state is not colour-only, no animation", () => {
  assert.match(css, /\.cue-selected-game-v1\{display:flex!important;flex-direction:row!important/);
  assert.match(css, /\.cue-new-match-integrated-v2\{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important/);
  assert.match(css, /#cueSetupFooterV1\{display:block;flex:0 0 auto/);
  assert.match(css, /\.cue-menu-row-v1\{[^}]*min-height:46px/);
  assert.match(css, /\.new-match-race-row-v2\{[^}]*min-height:52px!important/);
  assert.match(css, /\.cue-setup-reason-v1::after\{content:"";position:absolute;inset:-12px -8px\}/, "the reason line has a 44pt tap area");
  assert.match(css, /is-empty-v1\{border:2px dashed/); assert.match(css, /::before\{content:"\+"/); assert.match(css, /text-decoration:underline/);
  assert.ok(!/@keyframes|animation\s*:|transition\s*:/.test(css), "no animation / transition (Reduce Motion safe)");
  assert.ok(!/position:sticky!important;bottom/.test(css) && !/#startGameBtn\{[^}]*box-shadow:(?!none)/.test(css));
});
