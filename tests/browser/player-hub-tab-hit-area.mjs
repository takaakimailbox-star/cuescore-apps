/* Gate 003 / DS-REQ-018: measured Player Hub tab hit area (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/player-hub-tab-hit-area.mjs   (exit 1 on failure)
 * Headless Chrome via the P2 browser kit, deviceScaleFactor 3 (1 CSS px = 1 iOS pt). For every tab, in Free and Pro at 390x844 / 430x932 / 320x568:
 *  - vertical hit extent via elementFromPoint (0.25 CSS px steps) must be >= 44;
 *  - real mouse presses at the centre, 0.9px above the top edge and 0.9px below the bottom edge must activate the tab (Free + analysis: the Pro paywall opens, the tab is not selected);
 *  - a press 3px outside must not activate it.
 * The tab under test is never the one already selected (a DOM click selects another tab first). */
import { startApp, seed } from "./p2-browser-kit.mjs";
let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; console.log("FAIL", msg); } };
for (const mode of ["free", "pro"]) for (const [w, h] of [[390, 844], [430, 932], [320, 568]]) {
  const app = await startApp({ lang: "ja", mode, seedData: seed({ lang: "ja", rich: true }), freezeTime: true, watchdogMs: 200000 });
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 3, mobile: true });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  const open = () => ev(`document.querySelector('[data-phase1-tab="player"]').click();await W(900);document.querySelector(".player-management-row-v1 .player-hub-info-v3").click();await W(1200)`);
  const selected = () => app.evalJs(`document.querySelector('.hub-tabs-v2 .is-selected')?.dataset.hubTab`);
  const paywall = () => app.evalJs(`[...document.querySelectorAll('.cue-pro-overlay-v1')].some(e=>e.getClientRects().length&&!e.classList.contains('hidden'))`);
  await open();
  const g = await app.evalJs(`(()=>{const o={};for(const b of document.querySelectorAll('.hub-tabs-v2 [data-hub-tab]')){const r=b.getBoundingClientRect(),cx=r.left+r.width/2;let a=null,z=null;for(let y=r.top-6;y<=r.bottom+6;y+=0.25){const e=document.elementFromPoint(cx,y);if(e&&(e===b||b.contains(e))){if(a===null)a=y;z=y}}o[b.dataset.hubTab]=a===null?0:z-a}return o})()`);
  for (const [t, hit] of Object.entries(g)) check(hit >= 44, `${mode} ${w}x${h} ${t}: vertical hit ${hit} < 44`);
  for (const target of ["results", "matches", "analysis"]) {
    const base = target === "results" ? "matches" : "results";
    for (const [nm, f, shouldAct] of [["center", r => (r.top + r.bottom) / 2, true], ["above-0.9", r => r.top - 0.9, true], ["below+0.9", r => r.bottom + 0.9, true], ["outside-3", r => r.top - 3, false]]) {
      await open();
      await ev(`document.querySelectorAll('.cue-pro-overlay-v1').forEach(o=>o.querySelector('button')?.click());await W(300)`);
      check(!(await paywall()), `${mode} ${w}x${h} ${target} ${nm}: paywall overlay could not be dismissed before the press`);
      await ev(`document.querySelector('[data-hub-tab="${base}"]').click();await W(500)`);
      const r = await app.evalJs(`(()=>{const q=document.querySelector('[data-hub-tab="${target}"]').getBoundingClientRect();return {x:q.left+q.width/2,top:q.top,bottom:q.bottom}})()`);
      for (const ty of ["mousePressed", "mouseReleased"]) await app.cdp("Input.dispatchMouseEvent", { type: ty, x: r.x, y: f(r), button: "left", clickCount: 1 });
      await ev(`await W(700)`);
      const sel = await selected(), pw = await paywall();
      const gated = mode === "free" && target === "analysis";
      const acted = gated ? pw : sel === target;
      check(acted === shouldAct, `${mode} ${w}x${h} ${target} ${nm}: expected ${shouldAct ? "activation" : "no activation"} (selected=${sel}, paywall=${pw})`);
      if (gated) check(sel !== "analysis", `${mode} ${w}x${h} analysis must stay gated in Free`);
    }
  }
  await app.close();
}
console.log(fail ? "FAIL " + fail : "PASS");
process.exit(fail ? 1 : 0);
