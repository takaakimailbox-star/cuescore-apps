/* Decision 046 / Official 135 AC-SC9: with the Shot Clock row (OFF and ON) the player still reaches "start match" on the smallest screens and starts it with a real press. (NOT part of `node --test`.)
 * Output per case: start-button rectangle, tab-bar top, scroll needed, and whether the press started the match. */
import { startApp, seed } from "./p2-browser-kit.mjs";
let fail = 0; const rows = [];
for (const [w, h] of [[320, 568], [375, 667], [390, 844]]) for (const on of [false, true]) for (const lang of ["ja", "en", "zh-Hans"]) {
  const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), watchdogMs: 200000 });
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: true });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  await ev(`await W(1200);
    document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="rotation"]').click();await W(1000);
    if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);`);
  if (on) await ev(`document.querySelector(".cue-sc-switch").click();await W(300)`);
  const before = JSON.parse(await app.evalJs(`(()=>{const r=document.getElementById("startGameBtn").getBoundingClientRect(),n=document.querySelector(".cue-phase1-tab-bar").getBoundingClientRect();return JSON.stringify({top:Math.round(r.top),bottom:Math.round(r.bottom),nav:Math.round(n.top)})})()`));
  // scroll the Home container the way a finger would, then press the button with real mouse events
  await ev(`document.getElementById("startGameBtn").scrollIntoView({block:"center"});await W(400)`);
  const r = JSON.parse(await app.evalJs(`(()=>{const q=document.getElementById("startGameBtn").getBoundingClientRect(),n=document.querySelector(".cue-phase1-tab-bar").getBoundingClientRect();return JSON.stringify({x:q.left+q.width/2,y:q.top+q.height/2,top:q.top,bottom:q.bottom,nav:n.top})})()`));
  const reachable = r.top >= 0 && r.bottom <= r.nav + 1;
  for (const ty of ["mousePressed", "mouseReleased"]) await app.cdp("Input.dispatchMouseEvent", { type: ty, x: r.x, y: r.y, button: "left", clickCount: 1 });
  await ev(`await W(3000)`);
  const started = await app.evalJs(`document.querySelector(".app").classList.contains("pro-game-mode")`);
  const dock = await app.evalJs(`!!document.querySelector(".cue-sc-dock")`);
  rows.push({ w, h, lang, on, startTopBeforeScroll: before.top, tabBarTop: before.nav, reachableAfterScroll: reachable, started, dock });
  if (!reachable || !started || dock !== on) { fail++; console.log("FAIL", JSON.stringify(rows.at(-1))); }
  await app.close();
}
console.log(JSON.stringify(rows));
console.log(fail ? "FAIL " + fail : "PASS " + rows.length);
process.exit(fail ? 1 : 0);
