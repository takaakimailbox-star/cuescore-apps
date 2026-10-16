/* P4-repair: the page-text digest used to hash document.body.textContent, which includes the inline <script> source, so ANY source edit changed it (hence the stale fixture). It now hashes the text nodes outside script/style (visible-content digest). */
/* P2 Phase E / OBS-16: Pro badge differential flows (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p2-5b-badge-flows.mjs <out.json> [lang=ja]
 * Starts as FREE (rich seed: > 20 records so the history-limit notice exists), walks every surface that carries Pro decoration (player hub: 6 disciplines x 3 tabs,
 * two players; settings; history; paywall open/close), flips Free -> Pro -> Free through the public entitlement adapter, and re-renders after each flip.
 * After every step: badge count / per-host maximum / texts / aria, entry markers, history-limit notices, class-normalised hashes of the hub body and the
 * settings rows, and the text hash of the page. Same script on baseline and changed tree; outputs must be identical. */
import fs from "node:fs";
import { startApp, seed } from "./p2-browser-kit.mjs";
const OUT = process.argv[2], LANG = process.argv[3] || "ja";
process.env.P2_DATE_EDGES = "1";
const app = await startApp({ lang: LANG, mode: "free", seedData: seed({ lang: LANG, rich: true }), freezeTime: true, watchdogMs: Number(process.env.P2_WATCHDOG || 400000) });
const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
const CAP = `const h=s=>{let x=5381;for(const c of String(s))x=((x<<5)+x+c.codePointAt(0))>>>0;return x.toString(16)};
const visibleText=()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(n.parentElement&&/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentElement.tagName))continue;out.push(n.nodeValue)}return out.join('')};
const norm=(r)=>{if(!r)return "";const c=r.cloneNode(true);c.querySelectorAll('[class]').forEach(n=>n.setAttribute('class',[...new Set(n.className.split(/\\\\s+/).filter(Boolean))].sort().join(' ')));return c.outerHTML;};
const cap=()=>{const b=[...document.querySelectorAll('.cue-pro-badge-v1')];return {pro:window.CueScoreEntitlement.isPro(),badges:b.length,perHostMax:Math.max(0,...b.map(x=>x.parentElement?x.parentElement.querySelectorAll(':scope > .cue-pro-badge-v1').length:0)),texts:[...new Set(b.map(x=>x.textContent))],aria:[...new Set(b.map(x=>x.getAttribute('aria-label')))],entries:document.querySelectorAll('.cue-pro-entry-v1').length,limitNotices:document.querySelectorAll('.cue-history-limit-v1').length,
 hub:h(norm(document.getElementById('playerStatsBody'))),settings:h([...document.querySelectorAll('[data-settings-action]')].map(n=>norm(n)).join('')),records:h(norm(document.getElementById('recordsList'))),text:h(visibleText())};};`;
const out = { lang: LANG, steps: [] };
const step = async (name, code, wait = 700) => {
  let state = null, err = null;
  try { state = await ev(`${CAP}try{${code}}catch(e){window.__be=String(e)}await W(${wait});return {...cap(),e:window.__be||null}`); } catch (e) { err = String(e.message).slice(0, 160); }
  out.steps.push({ name, err, state });
};
await ev(`let cb;await window.CueScoreEntitlement.connect({subscribe(f){cb=f;return()=>{}}});window.__ent=cb;return true`);
await step("start-free", `document.querySelector('[data-phase1-tab="home"]').click();`);
await step("settings", `document.querySelector('[data-phase1-tab="settings"]').click();`, 900);
await step("settings-export-paywall", `document.querySelector('[data-settings-action="export"]').click();`, 900);
await step("paywall-close", `document.querySelector(".cue-pro-back-v1")?.click();`, 700);
await step("history", `document.querySelector('[data-phase1-tab="history"]').click();`, 1200);
await step("player-list", `document.querySelector('[data-phase1-tab="player"]').click();`, 900);
for (const [pi, label] of [[0, "p1"], [1, "p2"]]) {
  await step(`${label}:hub-open`, `[...document.querySelectorAll(".player-management-row-v1 .player-hub-info-v3")][${pi}]?.click();`, 1000);
  for (const d of ["9ball", "10ball", "rotation", "jpa9", "straightPool", "threeCushion"]) {
    for (const t of ["results", "matches", "analysis"]) await step(`${label}:${d}/${t}`, `document.querySelector('[data-hub-discipline="${d}"]')?.click();await W(350);[...document.querySelectorAll('[role="tab"]')].find(x=>x.dataset.hubTab==="${t}")?.click();`, 600);
  }
  await step(`${label}:hub-back`, `document.getElementById("playerStatsBackBtn")?.click();`, 700);
}
await step("flip-pro", `window.__ent({verified:true,isPro:true});`, 900);
await step("pro:hub", `document.querySelector('[data-phase1-tab="player"]').click();await W(500);document.querySelector(".player-management-row-v1 .player-hub-info-v3")?.click();`, 1000);
await step("pro:settings", `document.getElementById("playerStatsBackBtn")?.click();await W(300);document.querySelector('[data-phase1-tab="settings"]').click();`, 900);
await step("pro:history", `document.querySelector('[data-phase1-tab="history"]').click();`, 1200);
await step("flip-free", `window.__ent({verified:true,isPro:false});`, 900);
await step("free-again:history", `document.querySelector('[data-phase1-tab="history"]').click();`, 1200);
await step("free-again:settings", `document.querySelector('[data-phase1-tab="settings"]').click();`, 900);
await step("free-again:hub", `document.querySelector('[data-phase1-tab="player"]').click();await W(500);document.querySelector(".player-management-row-v1 .player-hub-info-v3")?.click();await W(500);document.querySelector('[data-hub-discipline="9ball"]')?.click();`, 1000);
await step("free-again:legacy-detail-fn", `window.CueScoreBuild6PlayerDetail?.render("p_probe_1","detail","rotation");`, 900);
out.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
await app.close();
console.log(JSON.stringify({ steps: out.steps.length, stepErrors: out.steps.filter(s => s.err).length, inPage: out.steps.filter(s => s.state && s.state.e).length, errors: out.errors.length }));
process.exit(0);
