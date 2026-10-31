/* Match-setup UX trial (Build 95 candidate; design basis: the isolated Prototype of 2026-10-30).
 * Static contract tests. Presentation only: no start condition, no stored data, no score / clock calculation is touched. The new wording is P3-PROVISIONAL (not in the main catalogs). */
import test from "node:test";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const read = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const html = read("index.html"), js = read("match-setup-ux-v1.js"), css = read("match-setup-ux-v1.css"), sc = read("shotclock-v1.js"), scCss = read("shotclock-v1.css");
const cats = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), "zh-Hans": require("../i18n-catalog-zh-hans-v1.js") };
const rec = JSON.parse(read("tests/fixtures/p4/po-approval-setupux.json"));

test("SU-1 wiring: script and stylesheet are loaded (page, service worker, native build list) and the start button sits in the independent footer", () => {
  for (const f of ["match-setup-ux-v1.js", "match-setup-ux-v1.css"]) {
    assert.ok(html.includes("./" + f + "?v="), "index.html loads " + f);
    assert.ok(read("sw.js").includes("./" + f + "?v="), "sw.js precaches " + f);
    assert.ok(read("scripts/build-native-web.mjs").includes('"' + f + '"'), "native build copies " + f);
  }
  assert.ok(!html.includes("i18n-catalog-setupux-v1.js") && !read("sw.js").includes("i18n-catalog-setupux-v1.js") && !read("scripts/build-native-web.mjs").includes("i18n-catalog-setupux-v1.js"), "the provisional catalog is retired (plan A)");
  assert.ok(html.indexOf("match-setup-ux-v1.js") < html.indexOf("./shotclock-v1.js?v="));
  assert.ok(html.indexOf("match-setup-ux-v1.css") > html.indexOf("shotclock-v1.css"), "the layout sheet loads last so it wins the cascade");
  const footer = html.match(/<div class="cue-setup-footer-v1" id="cueSetupFooterV1">[\s\S]*?<\/div>\s*\n\s*\n/);
  assert.ok(footer && /id="cueSetupReasonV1"/.test(footer[0]) && /id="startGameBtn"/.test(footer[0]));
  const section = html.match(/<section class="cue-home-card-v1 cue-new-match-v1 cue-new-match-integrated-v2"[\s\S]*?<\/section>\s*\n\s*\n\s*<div class="cue-setup-footer-v1"/);
  assert.ok(section && !/id="startGameBtn"/.test(section[0]), "the start button is no longer inside the scrolling setup card");
  assert.ok(/<div class="cue-setup-reason-wrap-v1" role="status">/.test(html));
});

test("SU-2 wording (plan A, PO-approved 2026-10-30): 3 reason keys live in the main catalogs with a P4 approval record bound to [ja, en, zh-Hans]; the 4 retired keys are gone; no human review is claimed", () => {
  const keys = ["setupux.reason.p2", "setupux.reason.p1", "setupux.reason.both"];
  assert.deepEqual(Object.keys(rec.keys).sort(), [...keys].sort());
  const hash = k => crypto.createHash("sha256").update(JSON.stringify([cats.ja[k], cats.en[k], cats["zh-Hans"][k]])).digest("hex").slice(0, 16);
  const approved = { "setupux.reason.p2": "8e7119f85b3f68a7", "setupux.reason.p1": "dfb84fc2cb977df3", "setupux.reason.both": "d9d1ec071afa783b" };
  for (const k of keys) { assert.equal(rec.keys[k].h, approved[k]); assert.equal(hash(k), approved[k], k + ": text differs from the PO-approved wording"); assert.equal(rec.keys[k].r, "R1"); }
  for (const l of Object.keys(cats)) for (const gone of ["setupux.reason.other", "setupux.reason.aria", "setupux.menu.other", "setupux.menu.close"]) assert.ok(!(gone in cats[l]), l + " must not hold retired key " + gone);
  assert.equal(rec.status, "P4-APPROVED"); assert.equal(rec.humanIndependentReview, "NOT PERFORMED"); assert.match(rec.reviewedState, /P4-REVIEWED is not used/);
  assert.doesNotMatch(JSON.stringify(rec), /"status":\s*"P4-REVIEWED"/);
  assert.equal(cats.ja["setupux.reason.p2"], "対戦相手を選ぶと試合を開始できます");
});

test("SU-2b VoiceOver / fallback: the reason text itself is the accessible name, the action is the hint (existing approved wording), the 'Other…' label reuses the main 'その他', no reason is shown without a missing player", () => {
  assert.match(js, /reason\.setAttribute\("aria-label", T\(key\)\)/);
  assert.match(js, /reason\.setAttribute\("aria-description", T\(miss\[0\] === 2 && miss\.length === 1 \? "p3\.39bd0fa6" : "p3\.b3005c8a"\)\)/);
  assert.equal(cats.ja["p3.39bd0fa6"], "対戦相手を選択"); assert.equal(cats.ja["p3.b3005c8a"], "プレーヤーを選択"); assert.equal(cats.ja["p3.7c2281ce"], "その他");
  assert.match(js, /label: other \? T\("p3\.7c2281ce"\) \+ "…"/);
  assert.match(js, /if \(!miss\.length\) \{ reason\.hidden = true;/);
  assert.ok(!/CueScoreSetupUxCatalogV1|setupux\.reason\.other|setupux\.reason\.aria|setupux\.menu\./.test(js));
});

test("SU-3 policy: no DOM-watching observer (AC-S3 ratchet), no write to the start button's disabled state, explicit triggers only", () => {
  assert.ok(!/MutationObserver/.test(js));
  assert.ok(!/setAttribute\(["']disabled|\.disabled\s*=/.test(js));
  assert.match(js, /\["click", "input", "change"\]\.forEach\(t => doc\.addEventListener\(t, later, true\)\)/);
  assert.match(read("final-ui-build18.js"), /start\.disabled=players\.length<2\|\|!selected\(1\)\|\|!selected\(2\)/, "the start condition is still owned (unchanged) by final-ui-build18.js");
});

test("SU-4 menu contract: every list is a bounded-height scrolling menu with the pinned Other row, choices come from the existing sheet / the unchanged clock constants, the existing sheet code applies and validates", () => {
  assert.match(js, /MENU_MAX_HEIGHT = Math\.round\(ROW_PX \* 7\.5 \+ 14\)/);
  assert.ok(!/MENU_MAX_ROWS/.test(js), "no row-count cut-off: long lists scroll instead of falling back to the sheet");
  assert.match(js, /scrim\.setAttribute\("role", "presentation"\)/);
  assert.ok(!/scrim\.setAttribute\("aria-hidden"/.test(js), "the scrim must not be aria-hidden (global pointer-events:none rule would swallow the outside tap)");
  assert.match(js, /querySelectorAll\("\.new-match-race-options-v1 \[data-race-value\]"\)/);
  assert.match(js, /onPick: \(v, o\) => o\.real\.click\(\)/);
  assert.match(js, /if \(!real\.length\) return;/);
  assert.ok(!/61\s*,\s*90|25\s*,\s*50|15\s*,\s*20/.test(js), "no race value lists are hard-coded in the script");
  assert.match(js, /role", "listbox"/); assert.match(js, /role", "option"/); assert.match(js, /aria-selected/); assert.match(js, /key === "Escape"/); assert.match(js, /ArrowDown/);
});

test("SU-5 the existing Race to / Skill Level choice sources are unchanged (values, order, custom limits)", () => {
  assert.match(html, /Array\.from\(\{length:10\},\(_,index\)=>index\+1\)/);
  assert.match(html, /\[25,50,75,100,125,150\]/); assert.match(html, /Array\.from\(\{length:34\},\(_,index\)=>index\+7\)/); assert.match(html, /\[61,90,120,150,180,240,300\]/);
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
