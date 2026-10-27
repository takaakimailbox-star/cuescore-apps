/* Decision 046 / Official 135 AC-SC1: with the clock OFF (default) the match screen is IDENTICAL to a build without the feature. (NOT part of `node --test`.)
 * Run twice and diff the outputs:
 *   P2_APP_ROOT=<pristine checkout> SC_OFF_OUT=/path/pristine.json node tests/browser/shotclock-off-parity.mjs
 *   SC_OFF_OUT=/path/changed.json node tests/browser/shotclock-off-parity.mjs
 * Output: per language x discipline x viewport, a SHA-256 of #proGameScreen outerHTML and of every element's rectangle on the match screen (frozen time, so the start time is stable). */
import { startApp, seed, sha } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS = (process.env.SC_LANGS || "ja,en,zh-Hans").split(",");
const DISCS = (process.env.SC_DISCIPLINES || "9ball,10ball,jpa9,rotation,straightPool,threeCushion").split(",");
const VIEWS = [[320, 568], [375, 812], [390, 844], [430, 932]];
const out = {};
for (const lang of LANGS) for (const disc of DISCS) {
  const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), freezeTime: true, watchdogMs: 900000 });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await ev(`await W(1200);document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${disc}"]').click();await W(1000);
    if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800);
    const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(600)}`);
  for (const [w, h] of VIEWS) {
    await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: true });
    await ev(`window.dispatchEvent(new Event("resize"));await W(600)`);
    const dom = await app.evalJs(`document.getElementById("proGameScreen").outerHTML`);
    const rects = await app.evalJs(`JSON.stringify([...document.getElementById("proGameScreen").querySelectorAll("*")].map(n=>{const r=n.getBoundingClientRect();return [n.tagName,n.id,Math.round(r.left*10),Math.round(r.top*10),Math.round(r.width*10),Math.round(r.height*10)]}))`);
    out[`${lang}/${disc}/${w}x${h}`] = { dom: sha(dom), rects: sha(rects), nodes: JSON.parse(rects).length, shotClockMarkup: /cue-sc-|shotclock/i.test(dom) };
  }
  await app.close();
  console.log("done", lang, disc);
}
if (process.env.SC_OFF_OUT) fs.writeFileSync(process.env.SC_OFF_OUT, JSON.stringify(out, null, 1));
console.log(Object.keys(out).length + " cases; any clock markup: " + Object.values(out).some(v => v.shotClockMarkup));
