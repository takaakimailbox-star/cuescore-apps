/* Decision 046 / Official 135 AC-SC1, AC-SC7, AC-SC8 (Shot Clock B4 layout): measured proof (NOT part of `node --test`).
 * Usage: [SC_LANGS=ja,en,zh-Hans] [SC_DISCIPLINES=...] [SC_OUT=<json>] node tests/browser/shotclock-layout.mjs   (exit 1 on failure)
 * Real headless Chrome via the P2 browser kit. For each language x discipline x viewport (320x568, 375x667, 375x812, 390x844, 430x932) x text scale (100/130/160/200 % pseudo-enlargement via CueScoreShotClockV1.setTextScale)
 * x clock state (idle, running, warn, danger, paused, expired, 3-digit, extension undo offer) it checks: nothing clipped / wrapped / overlapping, every control >= 44 x 44, dock inside the log card,
 * and that the ball area, action buttons, scoreboard and log-card top are at EXACTLY the same position as without the clock (the dock only takes space from the log). The pseudo-enlargement is CSS only:
 * it is NOT a real iOS Dynamic Type result. Also records the remaining inner log height (rows) per case for the report. */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const KEY = "cueScore.shotClock.v1";
const LANGS = (process.env.SC_LANGS || "ja,en,zh-Hans").split(",");
const DISCS = (process.env.SC_DISCIPLINES || "9ball,10ball,jpa9,rotation,straightPool,threeCushion").split(",");
const VIEWS = [[320, 568], [375, 667], [375, 812], [390, 844], [430, 932]];
const SCALES = [1, 1.3, 1.6, 2];
const out = { cases: 0, failures: [], logRows: [], ts: "" };
const fail = (tag, msg) => { out.failures.push(tag + ": " + msg); console.log("FAIL", tag, msg); };

const CHECK = `(() => {
  const $ = (s, r = document) => r.querySelector(s), R = n => n.getBoundingClientRect(), issues = [];
  const dock = $(".cue-sc-dock"), card = $(".pro-log-wrap"); if (!dock || !card) return { issues: ["no dock"] };
  const dr = R(dock), cr = R(card);
  const inside = (r, p, tol = 1) => r.left >= p.left - tol && r.right <= p.right + tol && r.top >= p.top - tol && r.bottom <= p.bottom + tol;
  if (!inside(dr, cr)) issues.push("dock leaves the log card");
  const parts = { time: $(".cue-sc-time", dock), ext: $(".cue-sc-extb", dock), rst: $(".cue-sc-resetb", dock), main: $(".cue-sc-main", dock) };
  const rects = Object.fromEntries(Object.entries(parts).map(([k, n]) => [k, R(n)])), keys = Object.keys(rects);
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) { const a = rects[keys[i]], b = rects[keys[j]]; if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) issues.push("overlap " + keys[i] + "/" + keys[j]); }
  for (const k of ["ext", "rst", "main"]) { const r = rects[k]; if (r.width < 44 || r.height < 44) issues.push("hit area " + k + " " + Math.round(r.width) + "x" + Math.round(r.height)); }
  dock.querySelectorAll(".cue-sc-num,.cue-sc-unit,.cue-sc-lb,.cue-sc-btn small").forEach(el => {
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), r = R(el), par = el.closest(".cue-sc-btn") || dock;
    if (!inside(r, R(par), 1.5)) issues.push("text '" + el.textContent.trim().slice(0, 14) + "' outside " + (par.className.split(" ")[1] || "dock"));
    if (el.matches(".cue-sc-lb,.cue-sc-btn small,.cue-sc-num") && r.height > fs * 1.7) issues.push("text '" + el.textContent.trim().slice(0, 14) + "' wraps");
    if (el.matches(".cue-sc-unit") && r.height > fs * 2.9) issues.push("caption wraps to 3+ lines");
    if (fs < 12) issues.push("font below 12px: " + el.className + " " + fs);
  });
  if (R($(".pro-scoreboard")).bottom > cr.top + 1) issues.push("scoreboard overlaps log card");
  const bal = $(".pro-bottom-dock"); if (bal && dr.bottom > R(bal).top + 1) issues.push("dock overlaps the ball / action area");
  const log = $("#proTurnLog"); const lg = log ? { h: Math.round(log.clientHeight), shown: getComputedStyle(log).display !== "none" } : null;
  return { issues, log: lg, cardH: Math.round(cr.height), dockH: Math.round(dr.height) };
})()`;
const GEO = `(() => { const R = s => { const n = document.querySelector(s); if (!n) return null; const r = n.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10] };
  const balls = [...document.querySelectorAll("#proBalls .pro-ball")].map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10] });
  const acts = [...document.querySelectorAll(".pro-actions button,.three-cushion-actions-v1 button")].filter(b => b.getClientRects().length).map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10] });
  return JSON.stringify({ score: R(".pro-scoreboard"), logTop: (() => { const n = document.querySelector(".pro-log-wrap").getBoundingClientRect(); return Math.round(n.top * 10) / 10 })(), balls, acts, play: R(".pro-bottom-dock") }) })()`;

for (const lang of LANGS) for (const disc of DISCS) {
  const tag0 = `${lang}/${disc}`;
  const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), watchdogMs: 1500000 });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  const W = ms => ev(`await W(${ms})`);
  const press = async sel => { await ev(`document.querySelector(${JSON.stringify(sel)}).click();await W(150)`); };
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await W(1200);
  await ev(`localStorage.setItem(${JSON.stringify(KEY)},JSON.stringify({v:1,enabled:true,base:45,clock:null}));CueScoreShotClockV1.reloadStore();
    const R=Date.now.bind(Date);window.__scOff=0;Date.now=()=>R()+window.__scOff;
    document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${disc}"]').click();await W(1000);
    if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800);
    const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(600)}`);
  if (!(await ev(`return !!document.querySelector(".cue-sc-dock")`))) { fail(tag0, "dock not mounted"); await app.close(); continue; }
  const advance = async ms => { await ev(`window.__scOff+=${ms};await W(420)`); };
  // clock states, reached through the real buttons and fake elapsed time
  const driveTo = async state => {
    if (state === "idle") {   // idle is reachable from a fresh dock, or from expiry (reset turns expired into idle); reset alone keeps running / paused
      let st = await ev(`return document.querySelector(".cue-sc-dock").dataset.st`);
      if (st === "idle") return;
      if (st === "paused") { await press(".cue-sc-main"); st = "running"; }
      if (st === "running") await advance(400000);
      await press(".cue-sc-resetb"); await W(150);
      return;
    }
    await driveTo("idle");
    if (state === "running") { await press(".cue-sc-main"); await advance(2000); }
    else if (state === "warn") { await press(".cue-sc-main"); await advance(36500); }
    else if (state === "danger") { await press(".cue-sc-main"); await advance(41000); }
    else if (state === "paused") { await press(".cue-sc-main"); await advance(2000); await press(".cue-sc-main"); }
    else if (state === "expired") { await press(".cue-sc-main"); await advance(46000); }
    else if (state === "three-digit") { await press(".cue-sc-main"); await press(".cue-sc-extb"); await advance(3300); await press(".cue-sc-extb"); await advance(3300); }
    else if (state === "undo-offer") { await press(".cue-sc-main"); await press(".cue-sc-extb"); await W(200); }
  };
  const STATES = ["idle", "running", "warn", "danger", "paused", "expired", "three-digit", "undo-offer"];
  for (const [w, h] of VIEWS) {
    await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: true });
    await ev(`window.dispatchEvent(new Event("resize"));await W(500)`);
    console.log("view", tag0, w + "x" + h, "cases", out.cases, "failures", out.failures.length);
    for (const state of STATES) {
      await driveTo(state);
      const got = await ev(`return document.querySelector(".cue-sc-dock").dataset.st+"/"+document.querySelector(".cue-sc-num").textContent`);
      for (const ts of SCALES) {
        const tag = `${tag0} ${w}x${h} ${state}(${got}) x${ts}`;
        await ev(`CueScoreShotClockV1.setTextScale(${ts});await W(150)`);
        const c = JSON.parse(await app.evalJs(`JSON.stringify(${CHECK})`));
        out.cases++;
        if (c.issues.length) fail(tag, c.issues.join("; "));
        if (state === "running" || state === "idle") out.logRows.push({ lang, disc, w, h, ts, state, logH: c.log && c.log.h, logShown: c.log && c.log.shown, cardH: c.cardH, dockH: c.dockH });
        // geometry versus the same screen without the clock (dock detached, class removed: the OFF layout)
        const withClock = await app.evalJs(GEO);
        await ev(`window.__scHold=document.querySelector(".cue-sc-dock");window.__scPar=window.__scHold.parentNode;window.__scHold.remove();document.getElementById("proGameScreen").classList.remove("cue-sc-on");const cw=document.querySelector(".pro-log-wrap");window.__scNo=cw.classList.contains("cue-sc-nolog");cw.classList.remove("cue-sc-nolog");await W(120)`);
        const without = await app.evalJs(GEO);
        await ev(`window.__scPar.appendChild(window.__scHold);document.getElementById("proGameScreen").classList.add("cue-sc-on");if(window.__scNo)document.querySelector(".pro-log-wrap").classList.add("cue-sc-nolog");await W(120)`);
        if (withClock !== without) fail(tag, "ball / action / scoreboard / log-top position differs from the no-clock layout");
      }
      await ev(`CueScoreShotClockV1.setTextScale(1);await W(100)`);
    }
  }
  await app.close();
  console.log("done", tag0, "cases so far", out.cases, "failures", out.failures.length);
}
if (process.env.SC_OUT) fs.writeFileSync(process.env.SC_OUT, JSON.stringify(out, null, 1));
console.log(out.failures.length ? "FAIL " + out.failures.length + " / " + out.cases : "PASS " + out.cases);
process.exit(out.failures.length ? 1 : 0);
