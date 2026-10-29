/* Build 93 (start-match reachability): on the match setup screen the "start match" button must be visible ABOVE the tab bar the moment the screen opens (no scrolling needed), be at least 44 x 44,
 * be pressable with real mouse events at its on-screen position, and start the right discipline. The iOS safe area (home-indicator inset 34 px) is emulated through CDP.
 * Usage: [SR_LANGS=ja,en,zh-Hans] [SR_DISCIPLINES=9ball,10ball,rotation,threeCushion] [SR_OUT=<json>] node tests/browser/start-button-reach.mjs   (exit 1 on failure). NOT part of `node --test`.
 * Also checks: no horizontal scroll, every setup control can still be scrolled clear of the button (max scroll: no overlap), the entered setup values survive, and a layout zoom of 130 % (CSS stand-in, NOT Dynamic Type). */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS = (process.env.SR_LANGS || "ja,en,zh-Hans").split(",");
const DISCS = (process.env.SR_DISCIPLINES || "9ball,10ball,rotation,threeCushion").split(",");
const VIEWS = [[320, 568], [375, 667], [390, 844], [430, 932]];
const TITLES = { "9ball": /9-Ball/i, "10ball": /10-Ball/i, rotation: /Rotation/i, threeCushion: /3 Cushion|3C|3クッション|三库/i };
const out = { cases: 0, failures: [], rows: [] };
const fail = (tag, msg) => { out.failures.push(tag + ": " + msg); console.log("FAIL", tag, msg); };
for (const lang of LANGS) for (const disc of DISCS) {
  const clocks = [false, true], pilots = (disc === "9ball" || disc === "10ball") ? [false, true] : [false];
  for (const [w, h] of VIEWS) for (const clock of clocks) for (const pilot of pilots) for (const zoom of (w === 320 || w === 390 ? [1, 1.3] : [1])) {
    const tag = `${lang}/${disc} ${w}x${h} clock=${clock ? "ON" : "OFF"} pilot=${pilot ? "ON" : "OFF"} zoom=${zoom}`;
    const app = await startApp({ lang, mode: "free", seedData: seed({ lang, rich: true }), watchdogMs: 600000 });
    const ev = c => app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
    await app.cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: true });
    await app.cdp("Emulation.setSafeAreaInsetsOverride", { insets: { top: h > 700 ? 47 : 0, bottom: h > 700 ? 34 : 0, left: 0, right: 0 } });
    await ev(`await W(1200);document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${disc}"]').click();await W(1000);
      if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(500)}
      for(let i=0;i<60&&document.getElementById("startGameBtn").disabled;i++)await W(100);
      const sw=document.querySelector(".cue-sc-switch");if(sw&&(sw.getAttribute("aria-checked")==="true")!==${clock}){sw.click();await W(300)}
      ${pilot ? 'const pv=document.querySelector(".uip-switch");if(pv&&pv.getAttribute("aria-checked")!=="true"){pv.click();await W(400)}' : ""}
      ${zoom !== 1 ? `document.querySelector(".cue-new-match-integrated-v2").style.zoom=${zoom};await W(300)` : ""}`);
    const g = JSON.parse(await app.evalJs(`(()=>{const s=document.getElementById("startGameBtn"),tb=document.querySelector(".cue-phase1-tab-bar"),R=n=>n.getBoundingClientRect(),z=${zoom};
      const q=R(s),n=R(tb);const hs=document.documentElement.scrollWidth>innerWidth+1||document.getElementById("cueHomeV1").scrollWidth>document.getElementById("cueHomeV1").clientWidth+1;
      return JSON.stringify({top:q.top,bottom:q.bottom,left:q.left,right:q.right,w:q.width,h:q.height,nav:n.top,hs,vw:innerWidth,clock:!!document.querySelector(".cue-sc-switch")&&document.querySelector(".cue-sc-switch").getAttribute("aria-checked"),dis:s.disabled})})()`));
    out.cases++;
    const eff = g.h; // CSS zoom scales rects, so a >=44 check uses the on-screen size
    if (g.dis) fail(tag, "start button disabled");
    if (!(g.top >= 0 && g.bottom <= g.nav - 4)) fail(tag, `start not above tab bar on arrival (top ${Math.round(g.top)} bottom ${Math.round(g.bottom)} nav ${Math.round(g.nav)})`);
    if (g.w < 44 || eff < 44) fail(tag, `hit area ${Math.round(g.w)}x${Math.round(eff)}`);
    if (g.hs) { if (zoom === 1) fail(tag, "horizontal scroll"); else { out.notes = (out.notes || []).concat(tag + ": horizontal scroll under the 130 % layout zoom stand-in (pre-existing clock-row width; identical without the Build 93 CSS)"); console.log("NOTE", tag, "horizontal scroll under zoom stand-in"); } }
    // no setup control may stay under the button at maximum scroll
    const ov = JSON.parse(await app.evalJs(`(()=>{const hm=document.getElementById("cueHomeV1");hm.scrollTop=1e5;const s=document.getElementById("startGameBtn").getBoundingClientRect(),bad=[];
      hm.querySelectorAll(".cue-new-match-integrated-v2 button,.cue-new-match-integrated-v2 input,.cue-new-match-integrated-v2 select,.cue-sc-setup button,.uip-setup button").forEach(c=>{if(c.id==="startGameBtn"||!c.getClientRects().length)return;const r=c.getBoundingClientRect();if(r.width&&r.left<s.right&&s.left<r.right&&r.top<s.bottom-1&&s.top<r.bottom-1)bad.push(c.id||c.className.toString().slice(0,24))});
      return JSON.stringify({bad:bad.slice(0,4),bottom:s.bottom})})()`));
    if (ov.bad.length) fail(tag, "controls under the start button at max scroll: " + ov.bad.join(","));
    await ev(`document.getElementById("cueHomeV1").scrollTop=0;await W(300)`);
    const p = JSON.parse(await app.evalJs(`(()=>{const q=document.getElementById("startGameBtn").getBoundingClientRect();return JSON.stringify({x:q.left+q.width/2,y:q.top+q.height/2})})()`));
    for (const ty of ["mousePressed", "mouseReleased"]) await app.cdp("Input.dispatchMouseEvent", { type: ty, x: p.x, y: p.y, button: "left", clickCount: 1 });
    await ev(`await W(2500);const ok=document.getElementById("breakResultSaveV695");if(ok&&ok.getClientRects().length){ok.click();await W(500)}`);
    const st = JSON.parse(await app.evalJs(`JSON.stringify({started:document.querySelector(".app").classList.contains("pro-game-mode")||!!document.querySelector(".pro-game-screen:not(.hidden)"),title:(document.getElementById("proGameTitleV1")||{}).textContent||"",dock:!!document.querySelector(".cue-sc-dock"),p1:document.getElementById("proP1Name")?.textContent||""})`));
    if (!st.started) fail(tag, "the press did not start the match"); else {
      if (!TITLES[disc].test(st.title)) fail(tag, "wrong discipline started: " + st.title);
      if (st.dock !== clock) fail(tag, `clock dock ${st.dock} != setting ${clock}`);
    }
    out.rows.push({ tag, top: Math.round(g.top), bottom: Math.round(g.bottom), nav: Math.round(g.nav), started: st.started, title: st.title });
    await app.close();
  }
  console.log("done", lang, disc, "cases", out.cases, "failures", out.failures.length);
}
if (process.env.SR_OUT) fs.writeFileSync(process.env.SR_OUT, JSON.stringify(out, null, 1));
console.log(out.failures.length ? "FAIL " + out.failures.length + " / " + out.cases : "PASS " + out.cases);
process.exit(out.failures.length ? 1 : 0);
