/* ISOLATED PROTOTYPE (throw-away browser only; NO product file is changed): Before/After for the FORCED states
 *   B (P1 unselected): guidance under the P1 card (reason.p1)   C (both unselected): ONE shared guidance under both cards (reason.both)
 * The "After" is injected DOM/CSS in the test browser to measure and photograph the candidate. Not an implementation.
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] UP_OUT=<json> UP_SHOT=<dir> node tests/browser/unselected-player-prototype.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"390").split(",").map(Number);
const CAT={ja:{p1:"先攻プレーヤーを選ぶと試合を開始できます",both:"プレーヤーを選ぶと試合を開始できます"},en:{p1:"Select the first player to start the match",both:"Select players to start the match"},"zh-Hans":{p1:"选择先手球员后即可开始比赛",both:"选择球员后即可开始比赛"}};
const rows=[];const W=ms=>new Promise(r=>setTimeout(r,ms));
const MEAS=`const R=n=>n.getBoundingClientRect(),$=s=>document.querySelector(s),c1=$("#newMatchPlayerCard1V1"),c2=$("#newMatchPlayerCard2V1"),start=$("#startGameBtn"),tab=$(".cue-phase1-tab-bar"),sc=$("#cueHomeV1 .cue-new-match-integrated-v2");
const notes=[...document.querySelectorAll(".cue-setup-note-v1")].filter(n=>!n.hidden&&n.getClientRects().length);const gap=c=>{const nm=c.querySelector(".new-match-player-name-v1"),rc=c.querySelector(".new-match-race-row-v2");return +(R(rc).top-R(nm).bottom).toFixed(1)};
return {notes:notes.map(n=>({text:n.textContent.trim().replace(/^i/,""),left:Math.round(R(n).left),right:Math.round(R(n).right),w:Math.round(R(n).width),h:Math.round(R(n).height),gapBelowCards:+(R(n).top-Math.max(R(c1).bottom,R(c2).bottom)).toFixed(1),underC1:R(n).left<R(c1).right-1&&R(n).right>R(c1).left+1&&R(n).top>=R(c1).bottom-1,underC2:R(n).left<R(c2).right-1&&R(n).right>R(c2).left+1&&R(n).top>=R(c2).bottom-1})),
 nameRace:[gap(c1),gap(c2)],cardH:[Math.round(R(c1).height),Math.round(R(c2).height)],hscroll:document.documentElement.scrollWidth>innerWidth+1||sc.scrollWidth>sc.clientWidth+1,startToTab:Math.round(R(tab).top-R(start).bottom),scrollNeeded:sc.scrollHeight-sc.clientHeight,reason:($("#cueSetupReasonV1")&&!$("#cueSetupReasonV1").hidden)?$("#cueSetupReasonV1").textContent.trim():null}`;
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],s=seed({lang,rich:false,synthetic:false,link:false}),players=s.players.slice(0,2);
  const sd={...s,script:`try{if(!localStorage.getItem("__p2_seeded")){localStorage.setItem("rotationScoreboard.players.v1",${JSON.stringify(JSON.stringify(players))});localStorage.setItem("rotationScoreboard.matchRecords.v1","[]");localStorage.setItem("cueScore.language.v1",${JSON.stringify(lang)});localStorage.setItem("__p2_seeded","1");}}catch(e){}`};
  const app=await startApp({lang,mode:"free",seedData:sd,watchdogMs:900000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});await W(1000);
  const shot=async n=>{fs.mkdirSync(process.env.UP_SHOT,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.UP_SHOT}/${lang}_${w}_${n}.png`,Buffer.from(r.data,"base64"))};
  await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await new Promise(r=>setTimeout(r,900));window.initializePrimaryMatchSetupV1=()=>false;return 1`);
  const settle=()=>ev(`window.CueScoreBuild18PlayerSelection.refresh();document.dispatchEvent(new Event("input"));await new Promise(r=>setTimeout(r,1100));return 1`);
  for(const st of ["B","C"]){
    await ev(`selectedRegisteredPlayer[1]=null;selectedRegisteredPlayer[2]=${st==="C"?"null":"selectedRegisteredPlayer[2]||JSON.parse(localStorage.getItem('rotationScoreboard.players.v1'))[1].id"};document.getElementById("p2Name").value=${st==="C"?'""':'JSON.parse(localStorage.getItem("rotationScoreboard.players.v1"))[1].name'};return 1`);await settle();
    const before=await ev(MEAS);await shot(`${st}_before`);
    // AFTER (injected only here): B -> note under the P1 card (col 1) with reason.p1; C -> ONE shared note under both cards (spans the grid) with reason.both; the P2-only note is hidden in both
    await ev(`const grid=document.querySelector(".new-match-player-grid-v1"),old=document.getElementById("cueSetupOppNoteV1");if(old)old.hidden=true;
      const st=document.createElement("style");st.textContent='#cueSetupProtoNote{grid-row:2;display:flex;align-items:flex-start;gap:6px;margin:0;padding:8px 10px;border:1px solid #d3dde8;border-radius:12px;background:#e9eff5;color:#1c2a3a;font-size:13px;font-weight:650;line-height:1.4;text-wrap:balance}#cueSetupProtoNote i{flex:0 0 auto;width:16px;height:16px;margin-top:1px;border:1.6px solid #34506b;border-radius:50%;color:#34506b;font-size:11px;font-style:normal;font-weight:900;line-height:13px;text-align:center}#cueSetupProtoNote span{min-width:0;overflow-wrap:anywhere}html[lang="ja"] #cueSetupProtoNote span,html[lang="zh-Hans"] #cueSetupProtoNote span{word-break:keep-all}';document.head.appendChild(st);
      const n=document.createElement("div");n.id="cueSetupProtoNote";n.className="cue-setup-note-v1";n.setAttribute("aria-hidden","true");n.style.gridColumn=${st==="C"?'"1 / -1"':'"1"'};n.innerHTML="<i>i</i><span></span>";n.lastChild.textContent=${JSON.stringify(CAT[lang])}[${JSON.stringify(st==="C"?"both":"p1")}];grid.appendChild(n);await new Promise(r=>setTimeout(r,300));return 1`);
    const after=await ev(MEAS);await shot(`${st}_after`);
    await ev(`document.getElementById("cueSetupProtoNote")?.remove();return 1`);
    rows.push({lang,w,state:st,before,after,expect:CAT[lang][st==="C"?"both":"p1"]});
  }
  await app.close();
}
fs.writeFileSync(process.env.UP_OUT,JSON.stringify({timestamp:new Date().toISOString(),rows},null,1)+"\n");console.log("rows",rows.length);
