/* Race to label fix (9-Ball / 10-Ball scorecard): measured proof (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] RT_OUT=<json> node tests/browser/race-to-label.mjs
 * Plays the same foul / switch sequence in all six disciplines x ja/en/zh-Hans and records the scorecard stat lines, the badge, the log text and every stored localStorage key (normalised).
 * Run once on the pristine checkout and once on the changed tree, then compare with tests/browser/race-to-label-compare.mjs (match data / log / scores identical, only the label text differs). */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const norm = s => s.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "<uuid>").replace(/\b1[0-9]{12}\b/g, "<ms>");
const out = {};
for (const lang of (process.env.RT_LANGS || "ja,en,zh-Hans").split(",")) for (const disc of ["9ball", "10ball", "jpa9", "rotation", "straightPool", "threeCushion"]) {
  const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), freezeTime: true, watchdogMs: 200000 });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await ev(`window.confirm=()=>true;await W(1200);document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${disc}"]').click();await W(900);
    if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800);
    const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(700)}`);
  const state = () => app.evalJs(`JSON.stringify({stats:[...document.querySelectorAll(".pro-stats")].map(s=>s.innerText.split("\\n").join(" ").trim()),goalLabel:[proP1GoalLabelV1.textContent,proP2GoalLabelV1.textContent],goal:[proP1Goal.textContent,proP2Goal.textContent],
    badge:["proP1NoticeV1","proP2NoticeV1"].map(i=>{const n=document.getElementById(i);return n?{text:n.textContent,hidden:n.hidden,shown:n.getClientRects().length>0}:null}),text:document.getElementById("proGameScreen").innerText.includes("手球フリー")||document.getElementById("proGameScreen").innerText.includes("Ball in hand")||document.getElementById("proGameScreen").innerText.includes("自由球"),score:[proP1Score.textContent,proP2Score.textContent],log:proTurnLog.innerText.split("\\n").join("|"),
    fouls:[proP1Foul.textContent,proP2Foul.textContent]})`);
  const steps = [["start", null]];
  for (const [n, a] of [["foul1", "#proFoulBtn"], ["switch1", "#proSwitchBtn"], ["foul2", "#proFoulBtn"], ["switch2", "#proSwitchBtn"], ["foul3", "#proFoulBtn"]]) steps.push([n, a]);
  const trace = [];
  for (const [n, a] of steps) {
    if (a) await ev(`const b=document.querySelector(${JSON.stringify(a)});if(b&&!b.disabled)b.click();await W(450);const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(300)}`);
    trace.push([n, JSON.parse(await state())]);
  }
  const store = norm(await app.evalJs(`JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]))`));
  out[`${lang}/${disc}`] = { trace, store };
  await app.close(); console.log("done", lang, disc);
}
if (process.env.RT_OUT) fs.writeFileSync(process.env.RT_OUT, JSON.stringify(out));
