/* P2-5a-1 fault/delay scenarios (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p2-5a-1-fault-scenarios.mjs <outFile.json> <variant> <rich:0|1>
 * variants: normal | block-final-rc | delay-final-rc | block-build4 | block-both
 * Runs the analysis-v2 match view (8 wording cases) and player view (6 disciplines, select re-render, UI open path) in Pro (public adapter
 * simulation) while analysis-final-rc.js and/or analysis-build4.js fail to load or arrive late. The SAME script is run on the pristine
 * baseline and on the changed tree; the two JSON files must be identical (user-visible text and DOM hashes). */
import fs from "node:fs";
import { startApp, seed, WORDING_CASES } from "./p2-browser-kit.mjs";

const OUT = process.argv[2], VARIANT = process.argv[3] || "normal", RICH = process.argv[4] === "1";
const block = [], delay = [];
if (VARIANT === "block-final-rc" || VARIANT === "block-both") block.push("*analysis-final-rc.js*");
if (VARIANT === "block-build4" || VARIANT === "block-both") block.push("*analysis-build4.js*");
if (VARIANT === "delay-final-rc") delay.push({ glob: "*analysis-final-rc.js*", ms: 3000 });
const app = await startApp({ mode: "pro", seedData: seed({ rich: RICH }), blockUrls: block, delayUrls: delay, watchdogMs: Number(process.env.P2_WATCHDOG || 200000) });
const ev = c => app.evalJs(`(async()=>{${c}})()`);
const W = ms => `await new Promise(r=>setTimeout(r,${ms}));`;
const H = `const h=s=>{let x=5381;for(const c of String(s))x=((x<<5)+x+c.codePointAt(0))>>>0;return x.toString(16)};`;
const playerRead = `const readP=()=>{const v=document.querySelector('[data-analysis-view="player"]');const r={hidden:v.hidden,status:v.querySelector(".analysis-v2-status")?.textContent??null,statusState:v.querySelector(".analysis-v2-status")?.dataset.analysisState??null,change:v.querySelector(".analysis-v2-change")?.textContent??null,changeState:v.querySelector(".analysis-v2-change")?.dataset.analysisState??null,prior:v.querySelector(".analysis-v2-target")?.dataset.priorGames??null,ems:[...v.querySelectorAll(".analysis-v2-delta em,.analysis-v2-metric em")].map(e=>e.textContent),goal:v.querySelector(".analysis-v2-advice-row:last-child span")?.textContent??null,headings:[...v.querySelectorAll("h2")].map(x=>x.textContent),len:v.textContent.length,hash:h(v.innerHTML)};return r;};`;
const result = { variant: VARIANT, rich: RICH, loaded: await ev(`return {finalRc:!!window.CueScoreAnalyticsFinalRC,build4:!!window.CueScoreBuild4Analytics}`) };
result.player = await ev(`${H}${playerRead}const out={};for(const d of ["9ball","10ball","rotation","jpa9","straightPool","threeCushion"]){window.openPlayerAnalysisForPlayerV5("p_probe_1",d);${W(1300)}out[d]={first:readP()};${W(1600)}out[d].settled=readP();const b=document.querySelector("[data-analysis-back]");b&&b.click();${W(300)}}return out`);
result.rerender = await ev(`${H}${playerRead}window.openPlayerAnalysisForPlayerV5("p_probe_1","9ball");${W(1300)}const out={};const sd=document.querySelector("[data-analysis-discipline]");if(sd){sd.value="rotation";sd.dispatchEvent(new Event("change",{bubbles:true}));${W(900)}out.discipline=readP();}
 const sp=document.querySelector("[data-analysis-player]");if(sp){sp.value="p_probe_2";sp.dispatchEvent(new Event("change",{bubbles:true}));${W(900)}out.player=readP();}
 const b=document.querySelector("[data-analysis-back]");b&&b.click();${W(300)}return out`);
result.uiPath = await ev(`${H}${playerRead}document.getElementById("openRankingsBtn").click();${W(900)}const o=document.querySelector("[data-open-player-analysis]");if(!o)return "no entry";o.click();${W(1300)}const rr=readP();const b=document.querySelector("[data-analysis-back]");b&&b.click();${W(300)}return rr`);
result.match = await ev(`${H}const key="rotationScoreboard.matchRecords.v1";const saved=localStorage.getItem(key);const recs=JSON.parse(saved);const out={};
 for(const [id] of ${JSON.stringify(WORDING_CASES)}){const r2=recs.map(r=>r.id===id?{...r,endedAt:"2030-01-01T00:00:00.000Z",playedAt:"2030-01-01T00:00:00.000Z",startedAt:"2030-01-01T00:00:00.000Z"}:r);localStorage.setItem(key,JSON.stringify(r2));
  window.openMatchAnalysisForPlayerV5(id,"p_probe_1","");${W(1100)}const v=document.querySelector('[data-analysis-view="match"]');const first=[...v.querySelectorAll(".analysis-v2-point span")].map(s=>s.textContent);${W(1400)}
  out[id]={points:first,settled:[...v.querySelectorAll(".analysis-v2-point span")].map(s=>s.textContent),hash:h(v.innerHTML),meta:v.querySelector(".analysis-v2-match-meta")?.textContent};const b=document.querySelector("[data-analysis-back]");b&&b.click();${W(300)}}
 localStorage.setItem(key,saved);return out`);
result.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
await app.close();
console.log(JSON.stringify({ variant: VARIANT, rich: RICH, loaded: result.loaded, errors: result.errors.length }));
process.exit(0);
