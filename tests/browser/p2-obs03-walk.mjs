/* OBS-03 differential random walk (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p2-obs03-walk.mjs <out.json> <seed> <steps>
 * A seeded sequence of real UI actions (open library for a slot, pick, add / edit / delete players, back, tab switches, swap, start attempts,
 * library wipe through the production writer) is replayed in the real app; after EVERY step the match-setup texts and state that the
 * player-selection refresh owns are recorded. The same seed must give identical output on the baseline and on the changed tree. */
import fs from "node:fs";
import { startApp, seed } from "./p2-browser-kit.mjs";
const OUT = process.argv[2], SEED = Number(process.argv[3] || 1), STEPS = Number(process.argv[4] || 30);
let x = SEED * 2654435761 % 4294967296 || 1; const rnd = () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;
const BASE = `document.getElementById("playerEditor")?.classList.contains("hidden")===false&&document.getElementById("playerLibraryBackBtn")?.click();await W(200);document.getElementById("playerLibraryBackBtn")?.click();await W(200);document.querySelector('[data-phase1-tab="home"]')?.click();await W(300);document.querySelector("#cueDisciplineSwitcherV1 [data-discipline]")?.click();await W(300);`;
const pick = (slot, which) => `${BASE}document.getElementById("p${slot}PlayerSearchBtn")?.click();await W(300);const l=[...document.querySelectorAll("[data-select-player]")];(${which}===0?l[0]:${which}===1?l[l.length-1]:l[Math.min(1,l.length-1)])?.click();`;
const A = {
  pick1First: pick(1, 0), pick1Last: pick(1, 1), pick2First: pick(2, 0), pick2Last: pick(2, 1), pick2Mid: pick(2, 2),
  addViaSlot2: `${BASE}document.getElementById("p2PlayerSearchBtn")?.click();await W(300);document.getElementById("playerLibraryAddBtn")?.click();await W(300);const n=document.getElementById("playerEditorName");if(n){n.value="walk"+(++window.__wn);n.dispatchEvent(new Event("input",{bubbles:true}));document.getElementById("playerEditorSaveBtn")?.click();await W(300);document.getElementById("playerEditorSaveBtn")?.click();}await W(300);`,
  editViaSlot1: `${BASE}document.getElementById("p1PlayerSearchBtn")?.click();await W(300);document.querySelector("[data-edit-player]")?.click();await W(300);const n=document.getElementById("playerEditorName");if(n){n.value=n.value+"x";n.dispatchEvent(new Event("input",{bubbles:true}));}document.getElementById("playerEditorSaveBtn")?.click();await W(300);`,
  deleteSelected1: `${BASE}const id=(selectedRegisteredPlayer||{})[1];if(id)window.deleteCueScorePlayerV1(id);`,
  deleteSelected2: `${BASE}const id=(selectedRegisteredPlayer||{})[2];if(id)window.deleteCueScorePlayerV1(id);`,
  deleteFirstFn: `const id=readPlayerLibrary()[0]?.id;if(id)window.deleteCueScorePlayerV1(id);`,
  deleteAllFn: `writePlayerLibrary([]);`, reseedFn: `writePlayerLibrary(JSON.parse(window.__players0));`,
  reseedRaw: `localStorage.setItem("rotationScoreboard.players.v1",window.__players0);`,
  openCancel1: `${BASE}document.getElementById("p1PlayerSearchBtn")?.click();await W(300);document.getElementById("playerLibraryBackBtn")?.click();`,
  swap: `${BASE}document.getElementById("starterSwapBtnV1")?.click();`, startTry: `${BASE}document.getElementById("startGameBtn")?.click();`,
  hubRestore: `document.querySelector('[data-phase1-tab="player"]')?.click();await W(400);document.querySelector(".player-management-row-v1 .player-hub-info-v3")?.click();await W(500);const snap=window.CueScorePlayerHubV2?.snapshot?.();document.querySelector('[data-phase1-tab="home"]')?.click();await W(400);if(snap)window.CueScorePlayerHubV2.restore(snap);await W(300);document.querySelector('[data-phase1-tab="home"]')?.click();`,
  tabsRoundTrip: `document.querySelector('[data-phase1-tab="player"]')?.click();await W(300);document.querySelector('[data-phase1-tab="settings"]')?.click();await W(300);document.querySelector('[data-phase1-tab="home"]')?.click();`,
  playerTabEdit: `document.querySelector('[data-phase1-tab="player"]')?.click();await W(400);document.querySelector("[data-edit-player]")?.click();await W(300);const n=document.getElementById("playerEditorName");if(n){n.value=n.value+"y";n.dispatchEvent(new Event("input",{bubbles:true}));}document.getElementById("playerEditorSaveBtn")?.click();await W(300);`,
  playerTabAdd: `document.querySelector('[data-phase1-tab="player"]')?.click();await W(400);document.getElementById("playerLibraryAddBtn")?.click();await W(300);const n=document.getElementById("playerEditorName");if(n){n.value="walk"+(++window.__wn);n.dispatchEvent(new Event("input",{bubbles:true}));document.getElementById("playerEditorSaveBtn")?.click();await W(300);document.getElementById("playerEditorSaveBtn")?.click();}await W(300);`
};
const names = Object.keys(A); const plan = [];
while (plan.length < STEPS) { const n = names[Math.floor(rnd() * names.length)]; plan.push(n); if (n === "deleteAllFn" || (/^delete/.test(n) && rnd() < 0.5)) plan.push(rnd() < 0.5 ? "reseedFn" : "reseedRaw"); }
const app = await startApp({ mode: "free", seedData: seed({}), freezeTime: true, watchdogMs: Number(process.env.P2_WATCHDOG || 280000) });
const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.confirm=()=>true;window.alert=()=>{};${c}})()`);
const probe = `const g=id=>document.getElementById(id);return {p1:g("p1NameDisplayV1")?.textContent,p2:g("p2NameDisplayV1")?.textContent,in1:g("p1Name")?.value,in2:g("p2Name")?.value,guide:document.querySelector(".match-player-guide-v18")?.textContent||"",guideHidden:document.querySelector(".match-player-guide-v18")?.hidden,startDisabled:g("startGameBtn")?.disabled,aria:g("startGameBtn")?.getAttribute("aria-disabled"),sel:JSON.stringify(selectedRegisteredPlayer),players:readPlayerLibrary().map(p=>p.id+":"+p.name+":"+p.isPrimary).join("|"),libOpen:!g("playerLibraryOverlay")?.classList.contains("hidden"),editorOpen:!g("playerEditor")?.classList.contains("hidden")}`;
await ev(`window.__wn=0;window.__players0=localStorage.getItem("rotationScoreboard.players.v1");`);
const out = { seed: SEED, plan, steps: [] };
for (const name of plan) {
  let s, err = null;
  try { await ev(`try{${A[name]}}catch(e){}await W(450);`); s = await ev(probe); } catch (e) { err = String(e.message).slice(0, 120); }
  out.steps.push({ name, err, s });
}
out.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
await app.close();
console.log(JSON.stringify({ seed: SEED, steps: out.steps.length, stepErrors: out.steps.filter(s => s.err).length, errors: out.errors.length }));
process.exit(0);
