/* P2 closure / AC-5 characterization (NOT part of `node --test`): the same scripted 9-Ball input sequence (break results incl. scratch, pots, safety, foul,
 * player switch, undo, rack change) is recorded in the real app under ja / en / zh-Hans and on the pre-P2 baseline; the persisted in-progress state (event log with the
 * canonical Japanese resultLabel values, rows, undo history) must be byte-identical (random session UUID normalised, clock frozen).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/p2-5-recording.mjs <out.json> [lang=ja] */
import fs from "node:fs";
import { startApp, seed } from "./p2-browser-kit.mjs";
const OUT = process.argv[2], LANG = process.argv[3] || "ja";
const app = await startApp({ lang: LANG, mode: "pro", seedData: seed({ lang: LANG }), freezeTime: true, watchdogMs: Number(process.env.P2_WATCHDOG || 300000) });
const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.confirm=()=>true;window.alert=()=>{};let sv=777;Math.random=()=>{sv=(sv*1664525+1013904223)%4294967296;return sv/4294967296};${c}})()`);
const snap = async () => (await ev(`return localStorage.getItem("cueScore.inProgressMatch.v1")`)) || "";
const norm = s => s.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "<uuid>");
const out = { lang: LANG, steps: [] };
const step = async (name, code, wait = 450) => { let err = null; try { await ev(`${code}await W(${wait});return 1`); } catch (e) { err = String(e.message).slice(0, 120); } const s = norm(await snap()); out.steps.push({ name, err, len: s.length, sha: await ev(`let x=5381,y=52711;for(const c of ${JSON.stringify(s)}){const k=c.codePointAt(0);x=((x<<5)+x+k)>>>0;y=((y<<5)^(y>>>2)^k)>>>0}return x.toString(16)+y.toString(16)`) }); out.last = s; };
const ball = n => `document.querySelector('.pro-ball[data-ball-number="${n}"]')?.click();`;
const brk = (p, b, scratch) => `document.getElementById("breakPlayerP${p}V1")?.click();await W(250);document.querySelector('.break-ball-btn-v696[data-ball-number="${b}"]')?.click();await W(250);${scratch ? 'document.getElementById("breakScratchToggleV696")?.click();await W(250);' : ""}document.getElementById("breakResultSaveV695")?.click();`;
await step("start", `document.querySelector('[data-phase1-tab="home"]').click();await W(500);document.querySelector(".home-new-match-v2").click();await W(700);document.querySelector('.cue-discipline-v1[data-discipline="9ball"]').click();await W(500);
 if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
 for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1500);`, 600);
await step("rack1-break-p1-3", brk(1, 3, false), 900);
for (const [n, c] of [["pot-1", ball(1)], ["pot-2", ball(2)], ["safety", `document.getElementById("proSafetyBtn")?.click();`], ["foul", `document.getElementById("proFoulBtn")?.click();`], ["switch", `document.getElementById("proSwitchBtn")?.click();`], ["undo", `document.getElementById("proUndoBtn")?.click();`], ["pot-4", ball(4)]]) await step(n, c);
for (let n = 5; n <= 9; n++) await step("pot-" + n, ball(n));
await step("rack2-break-p2-scratch", brk(2, 1, true), 900);
await step("rack2-pot-1", ball(1)); await step("rack2-undo", `document.getElementById("proUndoBtn")?.click();`);
await step("rack2-safety", `document.getElementById("proSafetyBtn")?.click();`);
out.errors = await app.evalJs("window.__p2.errors");
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
await app.close();
console.log(JSON.stringify({ lang: LANG, steps: out.steps.length, stepErrors: out.steps.filter(s => s.err).length, finalLen: out.last.length, labels: (out.last.match(/"resultLabel":"[^"]*"/g) || []).slice(0, 6) }));
process.exit(0);
