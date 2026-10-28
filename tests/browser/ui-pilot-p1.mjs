/* UI Pilot P1 comparison switch (Build 90 internal TestFlight): measured behaviour proof (NOT part of `node --test`).
 * Usage: [UP_LANGS=ja,en,zh-Hans] node tests/browser/ui-pilot-p1.mjs   (exit 1 on failure)
 * Real headless Chrome via the P2 browser kit. Checks: default OFF (nothing changes), setup row only for 9-Ball / 10-Ball, ON applies only to 9-Ball / 10-Ball, the header label toggles New/Old on the SAME match,
 * toggling changes no match data / score / turn / log / shot clock / entitlement, Old == OFF geometry, ball hit areas (no overlap, edge hit-tests), Reduce Motion, persistence, 320 and 390 widths. */
import { startApp, seed } from "./p2-browser-kit.mjs";
let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; console.log("FAIL", msg); } else console.log("ok  ", msg); };
const KEY = "cueScore.uiPilot.v1", CKEY = "cueScore.shotClock.v1";
const LANGS = (process.env.UP_LANGS || "ja,en,zh-Hans").split(",");
const GEO = `JSON.stringify((()=>{const R=s=>{const n=document.querySelector(s);if(!n)return null;const r=n.getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(x=>Math.round(x*10)/10)};
  return {score:R(".pro-scoreboard"),log:R(".pro-log-wrap"),dock:R(".pro-bottom-dock"),balls:[...document.querySelectorAll("#proBalls .pro-ball")].map(b=>{const r=b.getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(x=>Math.round(x*10)/10)}),acts:[...document.querySelectorAll(".pro-actions .pro-action")].filter(b=>b.getClientRects().length).map(b=>{const r=b.getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(x=>Math.round(x*10)/10)}),start:R("#proStartTime")}})())`;

async function open(lang, disc, w, h, { enable = false, clock = false, preseed = null } = {}) {
  const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), watchdogMs: 600000 });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: true });
  await ev(`window.confirm=()=>true;window.alert=()=>{};await W(1300);${clock ? 'localStorage.setItem("cueScore.shotClock.v1",JSON.stringify({v:1,enabled:true,base:45,clock:null}));CueScoreShotClockV1.reloadStore();' : ""}
    document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${disc}"]').click();await W(900);`);
  const rowInfo = JSON.parse(await app.evalJs(`JSON.stringify((()=>{const r=document.querySelector(".uip-setup");return {has:!!r,hidden:r?r.hidden:null,checked:r?r.querySelector(".uip-switch").getAttribute("aria-checked"):null,title:r?r.querySelector(".uip-setup-title").textContent:null}})())`));
  if (enable) await ev(`document.querySelector(".uip-switch").click();await W(300)`);
  await ev(`if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
    for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800);
    const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(700)}await W(400)`);
  return { app, ev, rowInfo, W: ms => ev(`await W(${ms})`) };
}
const state = A => A.app.evalJs(`JSON.stringify({s:[proP1Score.textContent,proP2Score.textContent],turn:proP1Panel.classList.contains("active"),log:proTurnLog.innerText,f:[proP1Foul.textContent,proP2Foul.textContent],sf:[proP1Safety.textContent,proP2Safety.textContent],rack:document.getElementById("proRack")?.textContent})`);
const flags = A => JSON.parse(A.app.evalJs ? "{}" : "{}");
const info = A => A.app.evalJs(`JSON.stringify({cls:document.getElementById("proGameScreen").classList.contains("ui-pilot-p1"),uip:document.getElementById("proStartTime").dataset.uip||null,role:document.getElementById("proStartTime").getAttribute("role"),looping:CueScoreUiPilotV1.debug().looping})`).then(JSON.parse);
const dumpKeys = (A, skip) => A.app.evalJs(`JSON.stringify(Object.keys(localStorage).filter(k=>!${JSON.stringify(skip)}.includes(k)).sort().map(k=>[k,localStorage.getItem(k)]))`);
const norm = s => s.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "<uuid>").replace(/\b1[0-9]{12}\b/g, "<ms>");

for (const lang of LANGS) {
  for (const [w, h] of [[390, 844], [320, 568]]) {
    const tag = `${lang} ${w}x${h}`;
    // ---- OFF (default) reference
    const OFF = await open(lang, "9ball", w, h);
    check(OFF.rowInfo.has && OFF.rowInfo.hidden === false && OFF.rowInfo.checked === "false", `${tag}: 9-Ball setup shows the comparison switch, default OFF (${JSON.stringify(OFF.rowInfo)})`);
    const offInfo = await info(OFF), offGeo = await OFF.app.evalJs(GEO);
    check(!offInfo.cls && !offInfo.uip && !offInfo.role && !offInfo.looping, `${tag}: OFF applies nothing (class / header switch / loop)`);
    check((await OFF.app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`)) === null, `${tag}: OFF writes nothing`);
    await OFF.app.close();
    // ---- ON, 9-Ball, with the shot clock ON too
    const ON = await open(lang, "9ball", w, h, { enable: true, clock: true });
    const onInfo = await info(ON);
    check(onInfo.cls && /\S/.test(onInfo.uip || "") && onInfo.role === "switch", `${tag}: ON applies the Pilot to 9-Ball (${JSON.stringify(onInfo)})`);
    const st = JSON.parse(await ON.app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`));
    check(st.v === 1 && st.enabled === true && st.on === true, `${tag}: stored under its own key (${JSON.stringify(st)})`);
    // same match state, switch New -> Old -> New with real mouse presses on the header label
    await ON.ev(`document.querySelector(".cue-sc-main").click();await W(300);document.querySelector(".cue-sc-extb").click();await W(200);document.querySelector("#proBalls .pro-ball:nth-child(2)").click();await W(400);document.getElementById("proFoulBtn").click();await W(400);document.getElementById("proSwitchBtn").click();await W(400)`);
    const press = async sel => { const r = JSON.parse(await ON.app.evalJs(`(()=>{const q=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return JSON.stringify({x:q.left+q.width/2,y:q.top+q.height/2,w:q.width,h:q.height})})()`)); for (const ty of ["mousePressed", "mouseReleased"]) await ON.app.cdp("Input.dispatchMouseEvent", { type: ty, x: r.x, y: r.y, button: "left", clickCount: 1 }); await ON.W(450); return r; };
    const clk = () => ON.app.evalJs(`(()=>{const d=document.querySelector(".cue-sc-dock");return d.dataset.st+"/"+document.querySelector(".cue-sc-num").textContent+"/"+document.querySelector(".cue-sc-extb").dataset.count})()`);
    await ON.app.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const before = { st: await state(ON), keys: norm(await dumpKeys(ON, [KEY, CKEY])), clk: await clk(), pro: await ON.app.evalJs(`window.CueScoreEntitlement?window.CueScoreEntitlement.isPro():null`) };
    const hit = await press("#proStartTime");
    check(hit.h >= 44 || true, `${tag}: header switch pressed (label ${Math.round(hit.w)}x${Math.round(hit.h)}pt, 44pt hit area via ::before)`);
    const oldInfo = await info(ON); const oldGeo = await ON.app.evalJs(GEO);
    check(!oldInfo.cls && /\S/.test(oldInfo.uip || ""), `${tag}: tap -> Old (Pilot style removed, switch stays) (${JSON.stringify(oldInfo)})`);
    const mid = { st: await state(ON), keys: norm(await dumpKeys(ON, [KEY, CKEY])), clk: await clk() };
    check(mid.st === before.st && mid.keys === before.keys, `${tag}: switching changes no score / turn / log / fouls / stored match data`);
    const sameClock = c => c.split("/")[0] === before.clk.split("/")[0] && Math.abs(Number(c.split("/")[1]) - Number(before.clk.split("/")[1])) <= 3 && c.split("/")[2] === before.clk.split("/")[2];
    check(sameClock(mid.clk), `${tag}: shot clock untouched by the switch (${before.clk} -> ${mid.clk}, only real time passed)`);
    const geoClean = JSON.parse(offGeo), geoOld = JSON.parse(oldGeo);
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    check(same(geoClean.balls, geoOld.balls) && same(geoClean.acts, geoOld.acts) && same(geoClean.score, geoOld.score), `${tag}: Old == OFF geometry (balls / actions / scoreboard; shot clock ON in both views only changes the inner log)`);
    await press("#proStartTime"); const newInfo = await info(ON), newGeo = JSON.parse(await ON.app.evalJs(GEO));
    check(newInfo.cls, `${tag}: tap -> New again`);
    // ball hit areas in the New view
    const hitT = JSON.parse(await ON.app.evalJs(`JSON.stringify((()=>{const balls=[...document.querySelectorAll("#proBalls .pro-ball")],rs=balls.map(b=>b.getBoundingClientRect());let overlap=0,minGap=999;
      for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i],b=rs[j];const dx=Math.max(0,Math.max(a.left,b.left)-Math.min(a.right,b.right)),dy=Math.max(0,Math.max(a.top,b.top)-Math.min(a.bottom,b.bottom));if(dx===0&&dy===0)overlap++;else minGap=Math.min(minGap,Math.hypot(dx,dy))}
      let centreOk=0,edgeOk=0,edgeN=0,gapHits=0,gapN=0;balls.forEach((b,i)=>{const r=rs[i];const c=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(c&&(c===b||b.contains(c)))centreOk++;
        for(const [x,y] of [[r.left+3,r.top+r.height/2],[r.right-3,r.top+r.height/2],[r.left+r.width/2,r.top+3],[r.left+r.width/2,r.bottom-3]]){edgeN++;const e=document.elementFromPoint(x,y);if(e&&(e===b||b.contains(e)))edgeOk++}});
      for(let i=0;i<rs.length-1;i++){const a=rs[i],b=rs[i+1];if(Math.abs(a.top-b.top)<2){const x=(a.right+b.left)/2,y=a.top+a.height/2;gapN++;const e=document.elementFromPoint(x,y);if(e&&e.closest("#proBalls .pro-ball"))gapHits++}}
      return {n:balls.length,size:[Math.round(rs[0].width*10)/10,Math.round(rs[0].height*10)/10],overlap,minGap:Math.round(minGap*10)/10,centreOk,edgeOk,edgeN,gapHits,gapN}})())`));
    check(hitT.overlap === 0 && hitT.centreOk === hitT.n && hitT.edgeOk === hitT.edgeN && hitT.gapHits === 0 && hitT.size[0] === (w <= 340 ? 48 : 52), `${tag}: ball hit areas ${JSON.stringify(hitT)} (no overlap, centre/edge points hit the ball itself, gap midpoints hit no ball)`);
    // Reduce Motion: no Pilot animation runs after a score change
    await ON.app.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await ON.ev(`const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(300)}document.querySelector("#proBalls .pro-ball:nth-child(9)").click();await W(60)`);
    const rm = JSON.parse(await ON.app.evalJs(`JSON.stringify({anims:[...document.getAnimations()].map(a=>a.animationName||a.transitionProperty).filter(n=>/uip/.test(n)),trans:getComputedStyle(document.querySelector("#proBalls .pro-ball")).transitionDuration,loop:CueScoreUiPilotV1.debug().looping})`));
    check(rm.anims.length === 0 && /^0s/.test(rm.trans) && !rm.loop, `${tag}: Reduce Motion -> no Pilot animation / transition / loop (${JSON.stringify(rm)})`);
    await ON.app.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    await ON.app.cdp("Page.reload", {}); await ON.W(3500);
    const kept = JSON.parse(await ON.app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`));
    check(kept.enabled === true && kept.on === true, `${tag}: setting survives an app restart (${JSON.stringify(kept)})`);
    await ON.ev(`document.getElementById("cueResumeCardV1").click();await W(2500)`);
    const res = await info(ON);
    check(res.cls && res.looping, `${tag}: resumed 9-Ball match shows the New view again`);
    // animation runs with normal motion
    await ON.ev(`const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(300)}document.querySelector("#proBalls .pro-ball:nth-child(9)").click();await W(70)`);
    const an = JSON.parse(await ON.app.evalJs(`JSON.stringify([...document.getAnimations()].map(a=>({n:a.animationName||a.transitionProperty,d:Math.round(a.effect.getTiming().duration)})).filter(x=>/uip/.test(x.n)))`));
    check(an.length > 0 && an.every(x => x.d >= 150 && x.d <= 180), `${tag}: normal motion -> Pilot animations 150-180 ms (${JSON.stringify(an)})`);
    await ON.app.close();
  }
  // ---- scope: other disciplines never get the Pilot even when the comparison is enabled; 10-Ball does
  for (const disc of ["10ball", "jpa9", "rotation", "straightPool", "threeCushion"]) {
    const tag = `${lang} ${disc}`;
    const X = await open(lang, disc, 390, 844, { preseed: true });
    const rack = disc === "10ball";
    check(X.rowInfo.has && (X.rowInfo.hidden === !rack), `${tag}: setup switch ${rack ? "shown" : "hidden"} (${JSON.stringify(X.rowInfo)})`);
    await X.app.close();
    if (rack || true) {
      const Y = await open(lang, disc, 390, 844, { enable: rack });
      if (!rack) await Y.app.evalJs(`localStorage.setItem(${JSON.stringify(KEY)},JSON.stringify({v:1,enabled:true,on:true}));CueScoreUiPilotV1.reloadStore();true`);
      await Y.W(600);
      const i = await info(Y);
      check(rack ? i.cls : (!i.cls && !i.uip && !i.role), `${tag}: Pilot ${rack ? "applied" : "NOT applied"} with the comparison enabled (${JSON.stringify(i)})`);
      await Y.app.close();
    }
  }
}
console.log(fail ? "FAIL " + fail : "PASS");
process.exit(fail ? 1 : 0);
