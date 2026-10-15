/* P2 Phase D: journey (player history / rivals) differential flows (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p2-5b-journey-flows.mjs <out.json> [lang=ja]
 * Real UI paths in Pro (public adapter simulation) with a rich seed (many rows per discipline, date edges, a frozen clock): for each discipline the
 * all-matches list, the rivals list, an opponent-fixed history, a filter chip, a match detail and its return. After EVERY step the full outerHTML hash and
 * the visible texts of both journey roots are recorded (class attributes are compared as sorted sets: the former observers re-ran the revision several times, which only changed the ORDER of class tokens). The same script runs on the baseline and on the changed tree; outputs must be identical. */
import fs from "node:fs";
import { startApp, seed } from "./p2-browser-kit.mjs";
const OUT = process.argv[2], LANG = process.argv[3] || "ja";
process.env.P2_DATE_EDGES = "1";
const app = await startApp({ lang: LANG, mode: "pro", seedData: seed({ lang: LANG, rich: true }), freezeTime: true, watchdogMs: Number(process.env.P2_WATCHDOG || 400000) });
const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
const CAP = `const h=s=>{let x=5381;for(const c of String(s))x=((x<<5)+x+c.codePointAt(0))>>>0;return x.toString(16)};
const norm=(r)=>{const c=r.cloneNode(true);c.querySelectorAll('[class]').forEach(n=>n.setAttribute('class',[...new Set(n.className.split(/\\s+/).filter(Boolean))].sort().join(' ')));c.setAttribute('class',[...new Set(c.className.split(/\\s+/).filter(Boolean))].sort().join(' '));return c;};
const root=(id)=>{const r=document.getElementById(id);if(!r)return null;const rows=[...r.querySelectorAll("[data-player-record-id]")].map(n=>({date:n.querySelector(".journey-match-date-v3")?.textContent??null,aria:n.getAttribute("aria-label"),open:n.querySelector(".journey-match-open-v3")?.textContent??null,cls:[...new Set(n.className.split(/\\s+/).filter(Boolean))].sort().join(' '),vs:!!n.querySelector(".journey-match-vs-v3"),opp:!!n.querySelector(".journey-match-opponent-v3>strong")}));
 const riv=[...r.querySelectorAll("[data-rival-opponent]")].map(n=>n.dataset.rivalOpponent);
 return {hidden:r.classList.contains("hidden"),ariaHidden:r.getAttribute("aria-hidden"),fixed:[r.dataset.pd8Opponent||"",r.dataset.pd8Discipline||""],title:r.querySelector(".player-journey-header-v2 h1")?.textContent??null,titleAria:r.querySelector(".player-journey-header-v2 h1")?.getAttribute("aria-label")??null,
  rows,riv,fixedSpan:r.querySelector(".pd12-fixed-discipline")?.textContent??null,ctxAria:r.querySelector(".pd13-rival-context")?.getAttribute("aria-label")??null,summaries:r.querySelectorAll(".journey-summary-v2,.journey-segment-v2").length,selects:r.querySelectorAll(".journey-discipline-v2 select").length,
  oppHeader:!!r.querySelector(".journey-history-opponent-v11"),period:!!r.querySelector("[data-history-period]"),disciplineBar:!!r.querySelector(".player-history-disciplines-v4"),analysis:r.querySelectorAll("[data-player-analysis-record-id]").length,wrappers:r.querySelectorAll(".pd8-history-match").length,html:h(norm(r).outerHTML),text:h(r.textContent)};};
const cap=()=>({history:root("playerMatchHistoryV2"),rivals:root("playerOpponentRecordsV2"),detailOpen:!!document.querySelector(".record-detail-overlay:not(.hidden)")});`;
const out = { lang: LANG, steps: [] };
const step = async (name, code, wait = 900) => {
  let state = null, err = null;
  try { state = await ev(`${CAP}try{${code}}catch(e){window.__je=String(e)}await W(${wait});return {...cap(),e:window.__je||null}`); } catch (e) { err = String(e.message).slice(0, 160); }
  out.steps.push({ name, err, state });
};
const BACK = `(document.querySelector("#playerMatchHistoryV2:not(.hidden) [data-journey-back]")||document.querySelector("#playerOpponentRecordsV2:not(.hidden) [data-journey-back]"))?.click();`;
await step("tab-player", `document.querySelector('[data-phase1-tab="player"]').click();await W(700);document.querySelector(".player-management-row-v1 .player-hub-info-v3").click();`, 1200);
for (const d of ["9ball", "10ball", "rotation", "jpa9", "straightPool", "threeCushion"]) {
  const sel = `document.querySelector('[data-hub-discipline="${d}"]')?.click();await W(500);[...document.querySelectorAll('[role="tab"]')].find(x=>x.dataset.hubTab==="matches")?.click();await W(500);`;
  await step(`${d}:all-matches`, `${sel}document.querySelector("[data-hub-all-matches]")?.click();`, 1300);
  await step(`${d}:history-filter-chip`, `const c=[...document.querySelectorAll("#playerMatchHistoryV2 [data-history-filter]")];(c[1]||c[0])?.click();`, 900);
  await step(`${d}:history-back`, BACK, 900);
  await step(`${d}:rivals`, `${sel}document.querySelector("[data-hub-opponents]")?.click();`, 1300);
  await step(`${d}:rival-history`, `document.querySelector("#playerOpponentRecordsV2 [data-rival-opponent]")?.click();`, 1400);
  await step(`${d}:match-detail`, `document.querySelector("#playerMatchHistoryV2 [data-player-record-id]")?.click();`, 1200);
  await step(`${d}:detail-close`, `window.closeFormalMatchDetailV2?.();`, 900);
  await step(`${d}:rival-history-back`, BACK, 900);
  await step(`${d}:rivals-back`, BACK, 900);
  await step(`${d}:hub-back`, `document.getElementById("playerStatsBackBtn")?.click();await W(300);document.querySelector(".player-management-row-v1 .player-hub-info-v3")?.click();`, 1000);
}
out.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
await app.close();
console.log(JSON.stringify({ steps: out.steps.length, stepErrors: out.steps.filter(s => s.err).length, inPage: out.steps.filter(s => s.state && s.state.e).length, errors: out.errors.length }));
process.exit(0);
