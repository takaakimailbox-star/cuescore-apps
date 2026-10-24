/* P2-5a-1 player-flow scenarios for OBS-10 (editor texts), OBS-17 (library title) and OBS-03 (setup texts). NOT part of `node --test`.
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p2-5a-1-flow-scenarios.mjs <outFile.json> [lang=ja] [mode=free|pro]
 * Walks real UI flows (Player tab, editor open/cancel, add, selection mode from match setup, tab switches while the editor is open) and
 * records the visible texts after EVERY step. The same script runs on the baseline and on the changed tree; outputs must be identical. */
import fs from "node:fs";
import { startApp, seed } from "./p2-browser-kit.mjs";
const OUT = process.argv[2], LANG = process.argv[3] || "ja", MODE = process.argv[4] || "free";
const app = await startApp({ lang: LANG, mode: MODE, seedData: seed({ lang: LANG }), freezeTime: process.env.P2_FREEZE === "1", watchdogMs: Number(process.env.P2_WATCHDOG || 200000) });
const ev = c => app.evalJs(`(async()=>{${c}})()`);
const W = ms => `await new Promise(r=>setTimeout(r,${ms}));`;
const probe = `const g=id=>document.getElementById(id);const vis=n=>!!(n&&n.offsetParent);const P=()=>({ctx:document.body.dataset.cuePlayerContext||null,libTitle:g("playerLibraryTitle")?.textContent,libVisible:!g("playerLibraryOverlay")?.classList.contains("hidden"),editorOpen:!g("playerEditor")?.classList.contains("hidden"),
 edTitle:g("playerEditorModalTitleV1")?.textContent,edCopy:g("playerEditorModalCopyV1")?.innerHTML,save:g("playerEditorSaveBtn")?.textContent,delHidden:g("playerEditorDeleteBtn")?.classList.contains("hidden"),
 addDisplay:g("playerLibraryAddBtn")?.style.display||"",addAria:g("playerLibraryAddBtn")?.getAttribute("aria-label"),registerHidden:g("playerLibraryRegisterBtnV2")?.hidden??null,back:g("playerLibraryBackBtn")?.textContent?.trim()||"",backAria:g("playerLibraryBackBtn")?.getAttribute("aria-label"),
 search:g("playerLibrarySearch")?.placeholder,p1:g("p1NameDisplayV1")?.textContent,p2:g("p2NameDisplayV1")?.textContent,guide:document.querySelector(".match-player-guide-v18")?.textContent||"",bodyClasses:[...document.body.classList].filter(c=>/player|modal|editor/.test(c)).sort().join(" ")});`;
const steps = [
  // selection / pre-Player-tab flows FIRST: the Player-tab context ("browse") is sticky once visited, so these cover the non-browse titles
  ["pre-new-match", `document.querySelector("#cueDisciplineSwitcherV1 [data-discipline]")?.click();`],
  ["pre-p1-search", `document.getElementById("p1PlayerSearchBtn")?.click();`],
  ["pre-open-add", `document.getElementById("playerLibraryAddBtn")?.click();`],
  ["pre-cancel-add", `document.querySelector(".player-editor-cancel-v1")?.click();`],
  ["pre-edit", `document.querySelector("[data-edit-player]")?.click();`],
  ["pre-cancel-edit", `document.querySelector(".player-editor-cancel-v1")?.click();`],
  ["pre-pick", `document.querySelector("[data-select-player]")?.click();`],
  ["pre-p2-search", `document.getElementById("p2PlayerSearchBtn")?.click();`],
  ["pre-back", `document.getElementById("playerLibraryBackBtn")?.click();`],
  ["tab-player", `document.querySelector('[data-phase1-tab="player"]').click();`],
  ["open-edit", `document.querySelector("[data-edit-player]").click();`],
  ["cancel-edit", `document.querySelector(".player-editor-cancel-v1").click();`],
  ["open-add", `document.getElementById("playerLibraryAddBtn").click();`],
  ["cancel-add", `document.querySelector(".player-editor-cancel-v1").click();`],
  ["open-edit-2", `document.querySelector("[data-edit-player]").click();`],
  ["tab-history-while-editing", `document.querySelector('[data-phase1-tab="history"]').click();`],
  ["tab-player-again", `document.querySelector('[data-phase1-tab="player"]').click();`],
  ["hub-open", `document.querySelector(".player-management-row-v1 .player-hub-info-v3")?.click();`],
  ["hub-back", `document.getElementById("playerStatsBackBtn")?.click();`],
  ["tab-home", `document.querySelector('[data-phase1-tab="home"]').click();`],
  ["new-match", `document.querySelector("#cueDisciplineSwitcherV1 [data-discipline]").click();`],
  ["p2-search", `document.getElementById("p2PlayerSearchBtn")?.click();`],
  ["selection-open-add", `document.getElementById("playerLibraryAddBtn")?.click();`],
  ["selection-cancel-add", `document.querySelector(".player-editor-cancel-v1")?.click();`],
  ["selection-edit", `document.querySelector("[data-edit-player]")?.click();`],
  ["selection-cancel-edit", `document.querySelector(".player-editor-cancel-v1")?.click();`],
  ["selection-pick", `document.querySelector("[data-select-player]")?.click();`],
  ["p1-search", `document.getElementById("p1PlayerSearchBtn")?.click();`],
  ["selection-back", `document.getElementById("playerLibraryBackBtn")?.click();`],
  ["tab-settings", `document.querySelector('[data-phase1-tab="settings"]').click();`],
  ["tab-player-3", `document.querySelector('[data-phase1-tab="player"]').click();`],
  ["open-edit-3", `document.querySelector("[data-edit-player]").click();`],
  ["back-from-editor-button", `document.getElementById("playerLibraryBackBtn")?.click();`],
  ["tab-home-2", `document.querySelector('[data-phase1-tab="home"]').click();`]
];
const out = { lang: LANG, mode: MODE, steps: [] };
for (const [name, code] of steps) {
  let state, error = null;
  try { state = await ev(`${probe}try{${code}}catch(e){}${W(700)}return P()`); } catch (e) { error = String(e.message).slice(0, 160); }
  out.steps.push({ name, error, state });
}
out.storage = await app.evalJs(`(async()=>{const h=async s=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("");const o={};for(const k of ["rotationScoreboard.players.v1","rotationScoreboard.matchRecords.v1","rotationScoreboard.matchCategories.v1","rotationScoreboard.matchSeasons.v1"])o[k]=await h(String(localStorage.getItem(k)));return o})()`);
out.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
await app.close();
console.log(JSON.stringify({ lang: LANG, mode: MODE, steps: out.steps.length, stepErrors: out.steps.filter(s => s.error).length, errors: out.errors.length }));
process.exit(0);
