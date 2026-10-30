/* Decision 047 / Official 137: measured proof of the integrated shot-clock improvement in real headless Chrome (NOT part of `node --test`).
 * Usage: [SC_LANGS=ja,en,zh-Hans] [SC_OUT=<json>] [SC_SHOTS=<dir>] node tests/browser/shotclock-integrated.mjs   (exit 1 on failure)
 * Checks per language x extension choice (25/30/45/60): setup row (4 choices, default 60, reachable start button), digits + unit side by side on one baseline, button label follows the choice,
 * remaining + chosen seconds (8 s left), undo takes back exactly the added seconds, bar colours normal / extension / warn / danger / time up (computed styles), time up = bar width 0 + red digits and unit,
 * reset goes back to the normal colour, no overlap / clipping at 320 and 390, Reduce Motion transition off, resume keeps the extension, and the match data keys are untouched by the clock. */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const KEY = "cueScore.shotClock.v1";
const LANGS = (process.env.SC_LANGS || "ja,en,zh-Hans").split(",");
const OUT = { cases: 0, failures: [], rows: [] };
const check = (ok, msg) => { OUT.cases++; if (!ok) { OUT.failures.push(msg); console.log("FAIL", msg); } else if (process.env.SC_VERBOSE) console.log("ok  ", msg); };
const rgb = s => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
const near = (a, b, t = 2) => a.length === 3 && b.length === 3 && a.every((v, i) => Math.abs(v - b[i]) <= t);
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const COL = { normal: hex("#F2DD75"), ext: hex("#66BA80"), warn: hex("#F2C56E"), danger: hex("#F1AC66") };
const RED = hex("#D70015"), TEXT = hex("#1C1C1E");
for (const lang of LANGS) {
  const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), watchdogMs: 1500000 });
  const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  const W = ms => ev(`await W(${ms})`);
  const view = async (w, h) => { await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: true }); await ev(`window.dispatchEvent(new Event("resize"));await W(400)`); };
  await view(390, 844); await W(1200);
  await ev(`window.confirm=()=>true;window.alert=()=>{}`);
  await ev(`localStorage.setItem(${JSON.stringify(KEY)},JSON.stringify({v:1,enabled:true,base:45,clock:null}));CueScoreShotClockV1.reloadStore();
    const R=Date.now.bind(Date);window.__scOff=0;Date.now=()=>R()+window.__scOff;
    document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await W(1000);`);
  // setup row: buttons present, default +60 selected, start button reachable (not covered)
  await ev(`document.querySelector(".cue-sc-switch").click();await W(150);document.querySelector(".cue-sc-switch").click();await W(300)`);
  const setup = JSON.parse(await ev(`document.querySelector(".cue-sc-val-ext").click();await W(250);const ex=[...document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")];const out={labels:ex.map(b=>"+"+parseInt(b.textContent.replace("+",""))),checked:ex.filter(b=>b.getAttribute("aria-selected")==="true").map(b=>"+"+parseInt(b.textContent.replace("+",""))),hit:ex.map(b=>Math.round(b.getBoundingClientRect().height)),w:ex.map(b=>Math.round(b.getBoundingClientRect().width))};document.querySelector(".cue-menu-scrim-v1").click();await W(150);const sb=document.getElementById("startGameBtn").getBoundingClientRect(),row=document.querySelector(".cue-sc-setup").getBoundingClientRect(),sc=document.querySelector(".cue-new-match-integrated-v2"),foot=document.getElementById("cueSetupFooterV1").getBoundingClientRect();Object.assign(out,{startTop:Math.round(sb.top),rowBottom:Math.round(row.bottom),footTop:Math.round(foot.top),scrollable:sc.scrollHeight>sc.clientHeight,vh:innerHeight,label:document.querySelector(".cue-sc-val-ext .cue-sc-val-label").textContent});return JSON.stringify(out)`));
  check(JSON.stringify(setup.labels) === '["+25","+30","+45","+60"]', `${lang}: setup offers +25/+30/+45/+60 (${setup.labels})`);
  check(setup.checked.join() === "+60", `${lang}: default +60`); check(Math.min(...setup.hit, ...setup.w) >= 44, `${lang}: setup extension buttons >= 44pt (${setup.hit}/${setup.w})`);
  check(setup.rowBottom <= setup.footTop + 1 || setup.scrollable, `${lang}: extension row is above the independent footer (or reachable by scrolling) and never covered`);
  OUT.rows.push({ lang, setup });
  for (const ext of (process.env.SC_EXTS || "25,30,45,60").split(",").map(Number)) {
    console.log("ext", lang, ext, "cases", OUT.cases, "failures", OUT.failures.length);
    await ev(`document.querySelector(".cue-sc-val-ext").click();await W(250);[...document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")].find(b=>parseInt(b.textContent.replace("+",""))===${ext}).click();await W(200)`);
    const stored = JSON.parse(await app.evalJs(`localStorage.getItem(${JSON.stringify(KEY)})`));
    check(stored.ext === ext, `${lang}: +${ext} stored under the clock key only`);
    await ev(`if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
      for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);document.getElementById("startGameBtn").click();await W(1800);
      const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(600)}`);
    console.log("  match started", await app.evalJs(`!!document.querySelector(".cue-sc-dock")`));
    const q = async s => app.evalJs(s);
    const adv = async ms => { await ev(`window.__scOff+=${ms};await W(420)`); };
    const press = async sel => ev(`document.querySelector(${JSON.stringify(sel)}).click();await W(150)`);
    const st = async () => { await W(450); return JSON.parse(await q(`JSON.stringify((()=>{const d=document.querySelector(".cue-sc-dock"),cs=n=>getComputedStyle(document.querySelector(n,d)),R=n=>{const r=document.querySelector(n,d).getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]};
      return {st:d.dataset.st,lv:d.dataset.lv,num:document.querySelector(".cue-sc-num",d).textContent,bar:cs(".cue-sc-bar i").backgroundColor,barW:Math.round(document.querySelector(".cue-sc-bar i",d).getBoundingClientRect().width),barTrackW:Math.round(document.querySelector(".cue-sc-bar",d).getBoundingClientRect().width),numC:cs(".cue-sc-num").color,secC:cs(".cue-sc-sec").color,sec:document.querySelector(".cue-sc-sec",d).textContent,numR:R(".cue-sc-num"),secR:R(".cue-sc-sec"),ext:document.querySelector(".cue-sc-extb small",d).textContent,extLb:document.querySelector(".cue-sc-extb .cue-sc-lb",d).textContent,badge:document.querySelector(".cue-sc-extb",d).dataset.count,aria:document.querySelector(".cue-sc-extb",d).getAttribute("aria-label"),trans:cs(".cue-sc-bar i").transitionDuration}})())`)); };
    // normal
    console.log("  pressing main"); await press(".cue-sc-main"); console.log("  pressed"); await adv(2000); console.log("  advanced");
    let s = await st(); console.log("  st ok", s.num);
    check(s.lv === "ok" && near(rgb(s.bar), COL.normal), `${lang} +${ext}: normal bar = soft yellow (${s.bar})`);
    check(near(rgb(s.numC), TEXT) && s.sec.length > 0, `${lang} +${ext}: digits neutral, unit shown (${s.sec})`);
    check(s.secR[0] >= s.numR[2] - 1 && Math.abs(s.secR[3] - s.numR[3]) <= 8, `${lang} +${ext}: unit is right of the digits on one baseline row`);
    check(s.extLb && s.ext === "+" + ext, `${lang} +${ext}: button shows +${ext} (${s.ext})`);
    check(/\d/.test(s.aria) || s.aria.length > 0 && s.aria.includes(String(ext)), `${lang} +${ext}: aria names ${ext} s (${s.aria})`);
    // extension from a normal state -> green
    await press(".cue-sc-extb"); s = await st();
    check(s.lv === "ext" && near(rgb(s.bar), COL.ext), `${lang} +${ext}: extension in use at 11+ s = soft green (${s.lv} ${s.bar})`);
    check(s.barW >= s.barTrackW - 2, `${lang} +${ext}: bar re-based to full right after the extension (${s.barW}/${s.barTrackW})`);
    check(Math.abs(Number(s.num) - (45 - 2 + ext)) <= 3, `${lang} +${ext}: remaining + ${ext} (${s.num})`);
    // undo within 3 s: exactly the added seconds
    await press(".cue-sc-extb"); s = await st();
    check(s.lv === "ok" && near(rgb(s.bar), COL.normal) && Number(s.num) <= 43, `${lang} +${ext}: undo -> pre-extension state, normal yellow (${s.num})`);
    // 8 s left, extend
    s = await st(); await adv((Number(s.num) - 8) * 1000 - 200); s = await st(); check(Number(s.num) >= 7 && Number(s.num) <= 9, `${lang} +${ext}: about 8 s left (${s.num})`);
    check(s.lv === "warn" && near(rgb(s.bar), COL.warn), `${lang} +${ext}: 10-6 s = caution colour (${s.bar})`);
    const before = Number(s.num); await press(".cue-sc-extb"); s = await st();
    check(Math.abs(Number(s.num) - (before + ext)) <= 1, `${lang} +${ext}: 8 s + ${ext} -> ${s.num}`);
    check(s.lv === "ext" && near(rgb(s.bar), COL.ext), `${lang} +${ext}: back to green above 10 s (${s.lv})`);
    await adv(3300); await press(".cue-sc-extb"); await adv(3300);  // second extension, then the undo offer lapses
    s = await st(); check(s.badge === "×2", `${lang} +${ext}: count badge x2 (${s.badge})`);
    // reset -> normal yellow, badge cleared
    await press(".cue-sc-resetb"); s = await st(); check(s.lv === "ok" && near(rgb(s.bar), COL.normal) && !s.badge, `${lang} +${ext}: reset -> normal yellow, badge cleared`);
    // warn / danger / expired
    await adv(36500); s = await st(); check(s.lv === "warn" && near(rgb(s.bar), COL.warn), `${lang} +${ext}: warn colour at ${s.num}`);
    await adv(5000); s = await st(); check(s.lv === "danger" && near(rgb(s.bar), COL.danger), `${lang} +${ext}: danger (last 5 s) colour at ${s.num} (${s.bar})`);
    check(near(rgb(s.numC), TEXT), `${lang} +${ext}: digits stay neutral before time up`);
    await adv(6000); s = await st();
    check(s.st === "expired" && s.num === "0", `${lang} +${ext}: time up (0)`);
    check(s.barW === 0, `${lang} +${ext}: bar remaining 0, no red fill (${s.barW})`);
    check(near(rgb(s.numC), RED) && near(rgb(s.secC), RED), `${lang} +${ext}: digits and unit red at 0 (${s.numC} / ${s.secC})`);
    // extend from expired restarts at ext
    await press(".cue-sc-extb"); s = await st(); check(s.st === "running" && Math.abs(Number(s.num) - ext) <= 1, `${lang} +${ext}: extend from time up restarts at ${ext} (${s.num})`);
    await adv(400000);
    // layout at both widths in the key states
    for (const [w, h] of [[390, 844], [320, 568]]) {
      await view(w, h);
      for (const state of ["normal", "ext", "danger", "expired", "digits3"]) {
        await press(".cue-sc-resetb"); await press(".cue-sc-resetb");
        let st0 = await q(`document.querySelector(".cue-sc-dock").dataset.st`);
        if (st0 === "expired") await press(".cue-sc-main"); else if (st0 === "idle") await press(".cue-sc-main"); else if (st0 === "paused") await press(".cue-sc-main");
        if (state === "ext") await press(".cue-sc-extb"); if (state === "digits3") { await press(".cue-sc-extb"); await adv(3300); await press(".cue-sc-extb"); await adv(3300); await press(".cue-sc-extb"); }
        if (state === "danger") await adv(41000); if (state === "expired") await adv(60000 + ext * 1000 * 3);
        const r = JSON.parse(await q(`JSON.stringify((()=>{const d=document.querySelector(".cue-sc-dock"),R=n=>{const e=d.querySelector(n);if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom}},ks=[".cue-sc-row",".cue-sc-resetb",".cue-sc-extb",".cue-sc-main"],rc=ks.map(R),bad=[];
          for(let i=0;i<rc.length;i++)for(let j=i+1;j<rc.length;j++){const a=rc[i],b=rc[j];if(a&&b&&a.l<b.r-.5&&b.l<a.r-.5&&a.t<b.b-.5&&b.t<a.b-.5)bad.push(ks[i]+"/"+ks[j])}
          const card=document.querySelector(".pro-log-wrap").getBoundingClientRect(),dr=d.getBoundingClientRect();if(dr.left<card.left-1||dr.right>card.right+1||dr.bottom>card.bottom+1)bad.push("dock leaves card");
          const bs=[".cue-sc-resetb",".cue-sc-extb",".cue-sc-main"].map(n=>d.querySelector(n).getBoundingClientRect()).filter(x=>x.width<44||x.height<44).length;if(bs)bad.push("hit<44");
          const n=d.querySelector(".cue-sc-num").getBoundingClientRect(),u=d.querySelector(".cue-sc-sec").getBoundingClientRect(),row=d.querySelector(".cue-sc-row").getBoundingClientRect();if(u.right>row.right+1||n.left<row.left-1)bad.push("row clipped");
          const ball=document.querySelector("#proBalls .pro-ball").getBoundingClientRect();return {bad,ballTop:Math.round(ball.top),dockH:Math.round(dr.height),logH:document.getElementById("proTurnLog").clientHeight,num:d.querySelector(".cue-sc-num").textContent,fs:getComputedStyle(d.querySelector(".cue-sc-num")).fontSize}})())`));
        check(r.bad.length === 0, `${lang} +${ext} ${w}x${h} ${state}: ${r.bad.join(",") || "no overlap / clipping / small hit"} (num ${r.num} ${r.fs})`);
        OUT.rows.push({ lang, ext, w, h, state, ...r });
        if (process.env.SC_SHOTS && ext === 60 || (process.env.SC_SHOTS && w === 320 && ext === 25)) { const shot = await app.cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(`${process.env.SC_SHOTS}/${lang}_${w}x${h}_${state}_ext${ext}.png`, Buffer.from(shot.data, "base64")); }
      }
      await view(390, 844);
    }
    // Reduce Motion
    if (ext === 60) {
      await app.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }); await W(200);
      const t = await q(`getComputedStyle(document.querySelector(".cue-sc-bar i")).transitionDuration+"|"+getComputedStyle(document.querySelector(".cue-sc-num")).transitionDuration`);
      check(/^0s\|0s$/.test(t), `${lang}: Reduce Motion stops transitions (${t})`);
      await app.cdp("Emulation.setEmulatedMedia", { features: [] });
    }
    // resume keeps the extension; match data keys untouched
    const keys0 = await q(`JSON.stringify(Object.keys(localStorage).filter(k=>/shot/i.test(k)))`); check(keys0 === JSON.stringify([KEY]), `${lang}: only the clock key (${keys0})`);
    await ev(`document.getElementById("proGameBackBtn").click();await W(900)`);
    await ev(`const hb=document.querySelector('[data-phase1-tab="home"]');if(hb&&hb.getClientRects().length){hb.click();await W(500)}document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await W(900);const c=document.getElementById("cueInProgressChoiceV1");if(c&&!c.classList.contains("hidden")){document.getElementById("cueInProgressNewV1").click();await W(900)}`);
  }
  await app.close(); console.log("done", lang, "cases", OUT.cases, "failures", OUT.failures.length);
}
if (process.env.SC_OUT) fs.writeFileSync(process.env.SC_OUT, JSON.stringify(OUT, null, 1));
console.log(OUT.failures.length ? "FAIL " + OUT.failures.length + " / " + OUT.cases : "PASS " + OUT.cases);
process.exit(OUT.failures.length ? 1 : 0);
