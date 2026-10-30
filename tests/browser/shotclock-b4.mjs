/* Decision 046 / Official 134-135 (Shot Clock B4): measured behaviour proof (NOT part of `node --test`).
 * Usage: [P2_APP_ROOT=<checkout>] node tests/browser/shotclock-b4.mjs   (exit 1 on failure)
 * Real headless Chrome via the P2 browser kit, real mouse presses. Time is driven by offsetting Date.now() inside the page (the clock is deadline based, so this is the same as real time passing).
 * Checks (AC-SC1..SC10): default OFF and nothing mounted; setup row; state machine buttons (start/pause/resume, reset keeps run state, extend +60 / undo 3 s / expiry / extend from expiry);
 * background-resume recomputation; zero linkage in BOTH directions (ball/foul/safety/switch/undo vs clock; clock vs score/log/stored match keys); stopped-state restore after reload; reachability of the start button. */
import { startApp, seed } from "./p2-browser-kit.mjs";
let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; console.log("FAIL", msg); } };
const KEY = "cueScore.shotClock.v1";
const LANGS = (process.env.SC_LANGS || "ja,en,zh-Hans").split(",");
for (const lang of LANGS) {
  const tag = lang;
  const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), watchdogMs: 280000 });
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  const W = ms => ev(`await W(${ms})`);
  const press = async sel => {
    await app.evalJs(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center"})`); await W(200);
    const r = await app.evalJs(`(()=>{const q=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:q.left+q.width/2,y:q.top+q.height/2}})()`);
    for (const ty of ["mousePressed", "mouseReleased"]) await app.cdp("Input.dispatchMouseEvent", { type: ty, x: r.x, y: r.y, button: "left", clickCount: 1 });
    await W(250);
  };
  const advance = async ms => { await ev(`window.__scOff=(window.__scOff||0)+${ms};await W(450)`); };   // fake elapsed time; wait for a render tick
  const st = () => app.evalJs(`(()=>{const d=document.querySelector(".cue-sc-dock");return d?JSON.stringify({state:d.dataset.st,lv:d.dataset.lv,num:document.querySelector(".cue-sc-num").textContent,main:document.querySelector(".cue-sc-main .cue-sc-lb").textContent,ext:document.querySelector(".cue-sc-extb").textContent.replace(/\\s+/g,""),extDis:document.querySelector(".cue-sc-extb").disabled,rstDis:document.querySelector(".cue-sc-resetb").disabled,count:document.querySelector(".cue-sc-extb").dataset.count,undo:document.querySelector(".cue-sc-extb").dataset.undo}):null})()`).then(x => (x ? JSON.parse(x) : null));
  const matchData = () => app.evalJs(`JSON.stringify(Object.keys(localStorage).filter(k=>k!==${JSON.stringify(KEY)}).sort().map(k=>[k,localStorage.getItem(k)]))`);
  const screenState = () => app.evalJs(`JSON.stringify({s1:document.getElementById("proP1Score")?.textContent,s2:document.getElementById("proP2Score")?.textContent,log:document.getElementById("proTurnLog")?.innerText,f1:document.getElementById("proP1Foul")?.textContent,f2:document.getElementById("proP2Foul")?.textContent,sf1:document.getElementById("proP1Safety")?.textContent,sf2:document.getElementById("proP2Safety")?.textContent,active:document.getElementById("proP1Panel")?.classList.contains("active")})`);
  const goSetup = async d => { await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await W(800);const c=document.getElementById("cueInProgressChoiceV1");if(c&&!c.classList.contains("hidden")){document.getElementById("cueInProgressNewV1").click();await W(900)}`); };
  const startMatch = async () => {
    await ev(`if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
      for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800)`);
    await ev(`const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(600)}`);
  };
  await W(1500);
  // ---- default OFF: setup row exists, nothing is mounted on the match screen, no stored value
  await goSetup("9ball");
  let row = await ev(`const r=document.querySelector(".cue-sc-setup");return JSON.stringify({has:!!r,checked:r?.querySelector(".cue-sc-switch").getAttribute("aria-checked"),baseHidden:r?.querySelector(".cue-sc-vals").hidden,title:r?.querySelector(".cue-sc-setup-title").textContent,key:localStorage.getItem(${JSON.stringify(KEY)})})`);
  row = JSON.parse(row);
  check(row.has && row.checked === "false" && row.baseHidden && row.key === null, `${tag}: default OFF, base-time hidden, nothing stored (${JSON.stringify(row)})`);
  const titles = { ja: "ショットクロック", en: "Shot Clock", "zh-Hans": "出杆计时器" };
  check(row.title === titles[lang], `${tag}: setup title ${row.title}`);
  await startMatch();
  check(await ev(`return !document.querySelector(".cue-sc-dock")&&!document.getElementById("proGameScreen").classList.contains("cue-sc-on")&&!document.querySelector(".cue-sc-sr")`), `${tag}: OFF mounts nothing on the match screen`);
  check((await ev(`return localStorage.getItem(${JSON.stringify(KEY)})`)) === null, `${tag}: OFF writes nothing`);
  // ---- ON via the real switch, choose 30 s; start a fresh match
  await app.cdp("Page.reload", {}); await W(3500);
  await goSetup("9ball");
  await press(".cue-sc-switch"); await press(".cue-sc-val-base");
  await ev(`[...document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")].find(b=>parseInt(b.textContent)===30).click();await W(200)`);
  const store = JSON.parse(await ev(`return localStorage.getItem(${JSON.stringify(KEY)})`));
  check(store.enabled === true && store.base === 30 && store.v === 1, `${tag}: switch and base time are stored under the own key (${JSON.stringify(store)})`);
  const radios = JSON.parse(await ev(`await document.querySelector(".cue-sc-val-base").click();await W(250);const o=[...document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")].map(b=>[String(parseInt(b.textContent)),b.getAttribute("aria-selected"),Math.round(b.getBoundingClientRect().width),Math.round(b.getBoundingClientRect().height)]);document.querySelector(".cue-menu-scrim-v1").click();await W(150);return JSON.stringify(o)`));
  check(JSON.stringify(radios.map(r => r[0])) === '["30","35","40","45","60"]' && radios.filter(r => r[1] === "true").length === 1 && radios[0][1] === "true" && radios.every(r => r[2] >= 44 && r[3] >= 44), `${tag}: five base times in the tap menu, 30 selected, all >=44pt (${JSON.stringify(radios)})`);
  await ev(`const R=Date.now.bind(Date);window.__scOff=0;Date.now=()=>R()+window.__scOff;`);
  await startMatch();
  let s = await st();
  check(s && s.state === "idle" && s.num === "30" && s.extDis && s.rstDis, `${tag}: dock mounted idle at 30, extend/reset disabled (${JSON.stringify(s)})`);
  // ---- start / pause / resume
  await press(".cue-sc-main"); s = await st();
  check(s.state === "running" && (s.num === "30" || s.num === "29"), `${tag}: start -> running (${JSON.stringify(s)})`);
  await advance(10000); s = await st();
  check(s.state === "running" && Number(s.num) >= 19 && Number(s.num) <= 21, `${tag}: counts down by elapsed time (${s.num})`);
  await press(".cue-sc-main"); s = await st(); const pausedNum = s.num;
  check(s.state === "paused", `${tag}: pause -> paused (${JSON.stringify(s)})`);
  await advance(15000); s = await st();
  check(s.state === "paused" && s.num === pausedNum, `${tag}: paused time does not run (${pausedNum} -> ${s.num})`);
  await press(".cue-sc-main"); s = await st();
  check(s.state === "running" && Math.abs(Number(s.num) - Number(pausedNum)) <= 1, `${tag}: resume continues from ${pausedNum} (${s.num})`);
  // ---- reset keeps the run state (running)
  await press(".cue-sc-resetb"); s = await st();
  check(s.state === "running" && Number(s.num) >= 29 && Number(s.num) <= 30, `${tag}: reset while running -> base time, still running (${JSON.stringify(s)})`);
  await press(".cue-sc-main"); await advance(5000); await press(".cue-sc-resetb"); s = await st();
  check(s.state === "paused" && s.num === "30", `${tag}: reset while paused -> base time, still paused (${JSON.stringify(s)})`);
  // ---- extend +60, count badge, undo within 3 s, no undo for reset
  await press(".cue-sc-main"); await press(".cue-sc-extb"); s = await st();
  check(s.state === "running" && Number(s.num) >= 89 && s.undo === "1", `${tag}: extend +60 -> ~90 with an undo offer (${JSON.stringify(s)})`);
  await press(".cue-sc-extb"); s = await st();
  check(Number(s.num) >= 29 && Number(s.num) <= 30 && s.undo === "0" && !s.count, `${tag}: undo within 3 s removes the 60 s and the count (${JSON.stringify(s)})`);
  await press(".cue-sc-extb"); await advance(3500); s = await st();
  check(s.undo === "0" && s.count === "×1", `${tag}: undo offer disappears after 3 s, count badge x1 (${JSON.stringify(s)})`);
  for (let i = 0; i < 3; i++) { await press(".cue-sc-extb"); await advance(3500); }
  s = await st(); check(s.count === "×4", `${tag}: no extension limit (count ${s.count})`);
  await press(".cue-sc-resetb"); s = await st();
  check(s.undo === "0" && !s.count, `${tag}: reset has no undo and clears the count (${JSON.stringify(s)})`);
  // ---- expiry: stops at 0, display only; extend from expiry restarts at 60; start from expiry restarts at base
  await advance(40000); s = await st();
  check(s.state === "expired" && s.num === "0" && !s.extDis, `${tag}: expires at 0, extend enabled (${JSON.stringify(s)})`);
  const before = await screenState(); await advance(2000); const after = await screenState();
  check(before === after, `${tag}: expiry changes no score / foul / log (no automatic foul or scoring)`);
  await press(".cue-sc-extb"); s = await st();
  check(s.state === "running" && Number(s.num) >= 59 && Number(s.num) <= 60, `${tag}: extend from expiry restarts counting at 60 (${JSON.stringify(s)})`);
  await advance(70000); await press(".cue-sc-main"); s = await st();
  check(s.state === "running" && Number(s.num) >= 29 && Number(s.num) <= 30, `${tag}: start from expiry restarts at the base time (${JSON.stringify(s)})`);
  // ---- background / lock: time passes while hidden; remaining is recomputed from real time on return
  await advance(12000);
  await ev(`window.__scOff+=20000;document.dispatchEvent(new Event("visibilitychange"));await W(400)`);
  s = await st();
  check(s.state === "expired" && s.num === "0", `${tag}: 32 s in the background on a 30 s clock -> expired on return (${JSON.stringify(s)})`);
  await press(".cue-sc-resetb"); await press(".cue-sc-main"); await advance(8000);
  await ev(`window.__scOff+=11000;document.dispatchEvent(new Event("visibilitychange"));await W(400)`);
  s = await st();
  check(s.state === "running" && Number(s.num) >= 10 && Number(s.num) <= 12, `${tag}: 19 s spent in the background are subtracted on return (${s.num})`);
  // ---- zero linkage, clock side: clock buttons change no match data / score / log
  await press(".cue-sc-main");  // pause
  const md0 = await matchData(), sc0 = await screenState();
  await press(".cue-sc-main"); await press(".cue-sc-extb"); await press(".cue-sc-resetb"); await advance(3500); await press(".cue-sc-main");
  const md1 = await matchData(), sc1 = await screenState();
  check(md0 === md1, `${tag}: clock buttons change no stored match / app data (every other localStorage key identical)`);
  check(sc0 === sc1, `${tag}: clock buttons change no score / foul / safety / log / turn`);
  // ---- zero linkage, input side: ball / safety / foul / switch / undo do not start, stop, reset or extend the clock
  await press(".cue-sc-main"); await press(".cue-sc-extb"); await advance(3500);   // running with count x1
  let c0 = await st(), t0 = Date.now();
  for (const sel of [".pro-ball", "#proSafetyBtn", "#proFoulBtn", "#proSwitchBtn", "#proUndoBtn"]) {
    await press(sel); await ev(`const c=document.querySelector("#breakPromptConfirm,.confirm-ok,[data-confirm-ok]");if(c&&c.getClientRects().length)c.click();await W(300)`);
    const c = await st(), drop = Number(c0.num) - Number(c.num), real = Math.ceil((Date.now() - t0) / 1000) + 1;
    check(c.state === "running" && c.count === c0.count && drop >= 0 && drop <= real, `${tag}: ${sel} leaves the clock untouched (${JSON.stringify(c0)} -> ${JSON.stringify(c)}; only real time passed: drop ${drop} <= ${real})`);
    c0 = c; t0 = Date.now();
  }
  await press(".cue-sc-main"); const p0 = await st();
  for (const sel of [".pro-ball", "#proSafetyBtn", "#proFoulBtn", "#proSwitchBtn"]) { await press(sel); await W(200); }
  const p1 = await st();
  check(p1.state === "paused" && p1.num === p0.num && p1.count === p0.count, `${tag}: inputs do not resume or change a paused clock (${p0.num} -> ${p1.num})`);
  // ---- restart: stopped-state restore under the own key; a new match starts idle
  const storedBefore = JSON.parse(await ev(`return localStorage.getItem(${JSON.stringify(KEY)})`));
  check(storedBefore.clock && storedBefore.clock.state === "paused" && /^m[0-9a-f]+$/.test(storedBefore.clock.key) && !JSON.stringify(storedBefore).includes("さくら"), `${tag}: state is stored paused under a hashed key, no names (${JSON.stringify(storedBefore.clock)})`);
  await app.cdp("Page.reload", {}); await W(3500);
  await press("#cueResumeCardV1"); await W(1500);
  await ev(`const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(600)}`);
  s = await st();
  check(s && s.state === "paused" && s.num === p1.num && s.count === p1.count, `${tag}: after an app restart the resumed match shows the clock stopped with the same time (${JSON.stringify(s)} vs ${p1.num})`);
  await ev(`const R=Date.now.bind(Date);window.__scOff=0;Date.now=()=>R()+window.__scOff;`);
  // ---- all six disciplines mount the dock; OFF again removes it
  await app.close();
}
console.log(fail ? "FAIL " + fail : "PASS");
process.exit(fail ? 1 : 0);
