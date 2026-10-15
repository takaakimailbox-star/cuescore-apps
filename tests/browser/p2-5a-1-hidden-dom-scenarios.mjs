/* P2-5a-1 hidden-DOM audit (NOT part of `node --test`). Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p2-5a-1-hidden-dom-scenarios.mjs <out.json> <variant> <rich:0|1>
 * Exercises the analysis-v2 PLAYER view through hidden -> visible, visible -> hidden, re-render while hidden (select change), re-render while visible,
 * for each load-failure variant, and records the view DOM, the root DOM, the Analytics aggregate numbers and a storage digest after every step.
 * Run on the baseline and on the changed tree; differences are classified by the audit (hidden-only vs visible). */
import fs from "node:fs";
import { startApp, seed } from "./p2-browser-kit.mjs";
const OUT = process.argv[2], VARIANT = process.argv[3] || "normal", RICH = process.argv[4] === "1";
const block = [], delay = [];
if (VARIANT === "block-final-rc" || VARIANT === "block-both") block.push("*analysis-final-rc.js*");
if (VARIANT === "block-build4" || VARIANT === "block-both") block.push("*analysis-build4.js*");
if (VARIANT === "delay-final-rc") delay.push({ glob: "*analysis-final-rc.js*", ms: 3000 });
const app = await startApp({ mode: "pro", seedData: seed({ rich: RICH }), blockUrls: block, delayUrls: delay, watchdogMs: Number(process.env.P2_WATCHDOG || 300000) });
const ev = c => app.evalJs(`(async()=>{${c}})()`);
const W = ms => `await new Promise(r=>setTimeout(r,${ms}));`;
const pre = `const h=s=>{let x=5381;for(const c of String(s))x=((x<<5)+x+c.codePointAt(0))>>>0;return x.toString(16)};
const cap=(label)=>{const root=document.querySelector(".analysis-v2");const v=root.querySelector('[data-analysis-view="player"]');const ctx=window.CueScoreAnalysisV2Context;let agg=null;try{const p=ctx.selectedPlayer();const recs=ctx.recordsFor(p).filter(r=>ctx.discipline(r)===ctx.selectedDiscipline());const a=ctx.aggregate(recs.slice(0,10),p);agg=JSON.parse(JSON.stringify(a));}catch(e){agg="err:"+e.message}
 return {label,viewHidden:v.hidden,status:v.querySelector(".analysis-v2-status")?.textContent??null,statusState:v.querySelector(".analysis-v2-status")?.dataset.analysisState??null,change:v.querySelector(".analysis-v2-change")?.textContent??null,ems:[...v.querySelectorAll(".analysis-v2-delta em,.analysis-v2-metric em")].map(e=>e.textContent),goal:v.querySelector(".analysis-v2-advice-row:last-child span")?.textContent??null,prior:v.querySelector(".analysis-v2-target")?.dataset.priorGames??null,viewHash:h(v.innerHTML),rootTextHash:h(root.textContent),otherViewsHidden:["home","match"].map(n=>root.querySelector('[data-analysis-view="'+n+'"]').hidden),aggregate:agg,storage:h(localStorage.getItem("rotationScoreboard.matchRecords.v1")+localStorage.getItem("rotationScoreboard.players.v1").replace(/"(lastUsed|updatedAt)":\\d+/g,""))};};
const sel=(q,val)=>{const e=document.querySelector(q);if(!e)return false;e.value=val;e.dispatchEvent(new Event("change",{bubbles:true}));return true;};`;
const steps = [
  ["A-visible-open", `document.getElementById("openRankingsBtn").click();${W(900)}document.querySelector("[data-open-player-analysis]").click();${W(1300)}`],
  ["B-visible-to-hidden", `document.querySelector("[data-analysis-back]").click();${W(900)}`],
  ["C-hidden-rerender-discipline", `sel("[data-analysis-discipline]","rotation");${W(1300)}`],
  ["D-hidden-rerender-player", `sel("[data-analysis-player]","p_probe_2");${W(1300)}`],
  ["E-hidden-to-visible", `document.querySelector("[data-open-player-analysis]").click();${W(1300)}`],
  ["F-visible-rerender-discipline", `sel("[data-analysis-discipline]","threeCushion");${W(1300)}`],
  ["G-visible-rerender-player", `sel("[data-analysis-player]","p_probe_1");${W(1300)}`],
  ["H-visible-to-hidden-again", `document.querySelector("[data-analysis-back]").click();${W(900)}`],
  ["I-hidden-to-visible-again", `document.querySelector("[data-open-player-analysis]").click();${W(1300)}`],
  ["J-settled", `${W(1800)}`]
];
const out = { variant: VARIANT, rich: RICH, loaded: await ev(`return {finalRc:!!window.CueScoreAnalyticsFinalRC,build4:!!window.CueScoreBuild4Analytics}`), steps: [] };
for (const [name, code] of steps) {
  let state, error = null;
  try { state = await ev(`${pre}try{${code}}catch(e){window.__e=String(e)}return {...cap(${JSON.stringify(name)}),e:window.__e||null}`); } catch (e) { error = String(e.message).slice(0, 200); }
  out.steps.push({ name, error, state });
}
out.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
await app.close();
console.log(JSON.stringify({ variant: VARIANT, rich: RICH, stepErrors: out.steps.filter(s => s.error).length, e: out.steps.filter(s => s.state && s.state.e).length, errors: out.errors.length }));
process.exit(0);
