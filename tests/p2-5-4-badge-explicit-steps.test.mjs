import "./helpers/ja-fs.mjs";
/* P2 Phase E / OBS-16 (Pro badges): decorate() is an explicit step. The design check is this file: the set of surfaces that carry Pro decoration and the
 * code that EMITS them is closed and pinned, so every producer has a call; the end-to-end equivalence with the former body-wide observer is proven by
 * tests/browser/p2-5b-badge-flows.mjs (baseline vs changed tree, Free -> Pro -> Free, every hub tab, settings, history, legacy detail). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { read, count } from "./helpers/p2-source.mjs";

const mon = read("monetization-v1.js"), nav = read("navigation-phase2-6.js"), b6 = read("player-detail-build6.js"), html = read("index.html");
const files = fs.readdirSync(new URL("../", import.meta.url)).filter(f => /\.(js|html)$/.test(f) && f !== "sw.js");

test("[Phase E / OBS-16] closed inventory of the code that EMITS decorated hosts (hub tab, rival entry, bests heading, Settings export/restore rows)", () => {
  const per = (re) => { const o = {}; for (const f of files) { const n = count(read(f), re); if (n) o[f] = n; } return o; };
  assert.deepEqual(per(/data-hub-opponents/g), { "monetization-v1.js": 2, "navigation-phase2-6.js": 2 });
  assert.deepEqual(per(/data-pd7-rivals/g), { "monetization-v1.js": 2, "player-detail-build6.js": 2 });
  assert.deepEqual(per(/hub-heading-v2/g), { "monetization-v1.js": 1, "navigation-phase2-6.js": 4 });
  assert.deepEqual(per(/hub-bests-v2/g), { "monetization-v1.js": 2, "navigation-phase2-6.js": 2, "ui-revision-v12.js": 1 });
  assert.deepEqual(per(/data-hub-tab/g), { "monetization-v1.js": 2, "navigation-phase2-6.js": 4 });
  assert.deepEqual(per(/data-settings-action="(export|restore)"/g), { "index.html": 2, "monetization-v1.js": 4 });
  // ui-revision-v12.js only REMOVES / reads .hub-bests-v2 (never emits it)
  assert.ok(!/hub-bests-v2[^\n]{0,80}(innerHTML|insertAdjacent|createElement)/.test(read("ui-revision-v12.js")));
});
test("[Phase E / OBS-16] every emitting renderer is followed by a decorate() call; the Settings rows are built once (guard) and decorated at load", () => {
  assert.equal(count(nav, "window.CueScorePro?.decorate?.();"), 1);
  assert.ok(/body\.innerHTML=`<div class="player-hub-v2">[\s\S]*?window\.CueScorePro\?\.decorate\?\.\(\);\n  \}/.test(nav), "the call is at the end of the hub render(), after body.innerHTML is written");
  assert.equal(count(b6, "window.CueScorePro?.decorate?.();"), 1);
  assert.ok(b6.includes('level==="detail"?renderDetail(player,active):renderInfo(player);window.CueScorePro?.decorate?.();}'));
  assert.ok(html.includes('screen.dataset.formalSettingsV1 === "ready"'), "Settings rows are created once");
  assert.ok(mon.includes("syncSettingsPlan();decorate();"), "static Settings rows are decorated at load");
  assert.ok(/entitlement\.subscribe\(snapshot=>\{syncPaywall\(\);syncSettingsPlan\(snapshot\);decorate\(\)/.test(mon), "every entitlement change decorates / un-decorates");
});
test("[Phase E / OBS-16] no observer remains in monetization-v1.js; decorate is published on the frozen CueScorePro API", () => {
  assert.ok(!mon.includes("MutationObserver"));
  assert.ok(mon.includes("window.CueScorePro=Object.freeze({open,close,source:()=>currentSource,decorate});"));
});
test("[Phase E / OBS-16] decoration content is unchanged: badge markup, aria text, the four Free surfaces and the Pro clean-up are pinned", () => {
  assert.ok(mon.includes(`const badge=()=>'<span class="cue-pro-badge-v1" aria-label="Pro限定">🔒 Pro</span>';`));
  const seg = mon.slice(mon.indexOf("function decorate(){"), mon.indexOf("// P2 Phase E / OBS-16"));
  for (const piece of ['document.querySelectorAll(\'[data-hub-tab="analysis"]\')', "[data-hub-opponents],[data-pd7-rivals]", '[data-settings-action="export"],[data-settings-action="restore"]', ".hub-bests-v2", 'node.classList.remove("cue-pro-entry-v1")', ".cue-history-limit-v1"]) assert.ok(seg.includes(piece), piece);
  assert.equal(count(seg, "badge()"), 4);
});
