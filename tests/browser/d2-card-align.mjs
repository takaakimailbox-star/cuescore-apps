/* Real-app Chrome, ISOLATED data only (no user data): card alignment test (Build 99 STOP repair): the NATURAL "main player 0, >=2 registered" start screen (Official 103/104: no auto-promotion), plus P1-empty/P2-selected and P1-selected/P2-empty.
 * The two player cards must keep the same top / height / Race-to row whether or not one guidance label wraps. Width sweep x letter-spacing (emulates other fonts' glyph widths) x 3 languages.
 * Usage: [L=ja,en,zh-Hans] [WS=...] [SPACINGS=0,1.2] AP_OUT=<json> node tests/browser/d2-card-align.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(","),WS=(process.env.WS||"360,370,375,380,385,390,395,400,410,430").split(",").map(Number);
const rows=[];const checks=[];let fail=0;const SP=(process.env.SPACINGS||"0,1.2").split(",");const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,d)=>{checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
const MEAS=`const R=n=>n.getBoundingClientRect(),cs=n=>getComputedStyle(n);const f=n=>{const c=document.querySelector("#newMatchPlayerCard"+n+"V1"),nm=c.querySelector(".new-match-player-name-v1"),lh=parseFloat(cs(nm).lineHeight)||parseFloat(cs(nm).fontSize)*1.2,race=c.querySelector(".new-match-race-row-v2");return {empty:c.classList.contains("is-empty-v1"),top:+R(c).top.toFixed(1),h:Math.round(R(c).height),lines:Math.max(1,Math.round(nm.scrollHeight/lh)),nameBox:Math.round(R(nm).height),raceTop:+(R(race).top-R(c).top).toFixed(1),text:nm.textContent.trim()}};
const a=f(1),b=f(2);return {p1:a,p2:b,topDiff:+Math.abs(a.top-b.top).toFixed(1),hDiff:Math.abs(a.h-b.h),raceDiff:+Math.abs(a.raceTop-b.raceTop).toFixed(1),start:document.getElementById("startGameBtn").disabled}`;
for(const lang of LANGS) for(const w of WS) for(const sp of SP){
  const h=w>=410?932:844;
  const s=seed({lang,rich:false,synthetic:false,link:false});
  // 3 registered players, NONE is the main player (what remains after deleting the main player; Official 104: no auto-promotion)
  const players=s.players.slice(0,3).map(p=>{const q={...p};delete q.isPrimary;return q});
  const script=`try{if(!localStorage.getItem("__ap")){localStorage.setItem("rotationScoreboard.players.v1",${JSON.stringify(JSON.stringify(players))});localStorage.setItem("rotationScoreboard.matchRecords.v1","[]");localStorage.setItem("cueScore.language.v1","${lang}");localStorage.setItem("__ap","1")}}catch(e){}`;
  const app=await startApp({lang,mode:"free",seedData:{script,players:[],records:[]},watchdogMs:300000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:47,bottom:34,left:0,right:0}});await W(1000);
  if(+sp)await ev(`const st=document.createElement("style");st.textContent="body{letter-spacing:${sp}px!important}";document.body.appendChild(st);return 1`);
  await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await new Promise(r=>setTimeout(r,1000));return 1`);await W(800);
  const nat=await ev(MEAS);rows.push({lang,w,sp,state:"NATURAL both unselected (main 0, 3 registered)",...nat});
  await ev(`const p=CueScoreBuild18PlayerSelection.validPlayers();selectedRegisteredPlayer[2]=p[1].id;document.getElementById("p2Name").value=p[1].name;syncSelectedPlayerAvatarV2(2,p[1]);syncNewMatchNameV1("p2Name","p2NameDisplayV1");CueScoreBuild18PlayerSelection.refresh();await new Promise(r=>setTimeout(r,1200));return 1`);
  rows.push({lang,w,sp,state:"NATURAL P1 empty / P2 selected",...await ev(MEAS)});
  await ev(`const p=CueScoreBuild18PlayerSelection.validPlayers();selectedRegisteredPlayer[1]=p[0].id;document.getElementById("p1Name").value=p[0].name;syncSelectedPlayerAvatarV2(1,p[0]);syncNewMatchNameV1("p1Name","p1NameDisplayV1");selectedRegisteredPlayer[2]=null;document.getElementById("p2Name").value="";CueScoreBuild18PlayerSelection.refresh();document.dispatchEvent(new Event("input"));await new Promise(r=>setTimeout(r,1200));return 1`);
  rows.push({lang,w,sp,state:"NATURAL P1 selected / P2 empty",...await ev(MEAS)});
  await app.close();
}
for(const r of rows){const t=`${r.lang}/${r.w}/ls${r.sp} ${r.state.slice(8,34)}`;
  ck(r.hDiff<=1&&r.topDiff<=1&&r.raceDiff<=1,`${t}: both cards share top / height / Race-to row`,{top:r.topDiff,h:r.hDiff,race:r.raceDiff,p1:r.p1.h,p2:r.p2.h});
  ck([176,192].includes(r.p1.h)||r.p1.h>176,`${t}: card height is a design value (176 one line / 192 two lines or taller for Skill Level)`,r.p1.h);
  ck(r.start===true,`${t}: start button stays disabled while a player is unselected`);}
if(process.env.AP_OUT)fs.writeFileSync(process.env.AP_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,rows,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
