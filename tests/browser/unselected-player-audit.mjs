/* READ-ONLY audit (real-app Chrome): match-setup unselected P1/P2 messages & presentation vs the approved setupux.reason.p1/p2/both.
 * Natural states (reachable by user operation) are separated from FORCED states (selection nulled in the throw-away browser only; no product file is changed).
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] [UA_DISCS=...] [UA_OUT=<json>] [UA_SHOT=<dir>] node tests/browser/unselected-player-audit.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"390").split(",").map(Number);
const DISCS=(process.env.UA_DISCS||"9ball,10ball,jpa9,rotation,straightPool,threeCushion").split(",");
const rows=[];const W=ms=>new Promise(r=>setTimeout(r,ms));
const seedN=(lang,n)=>{const s=seed({lang,rich:false,synthetic:false,link:false});const players=s.players.slice(0,n);
  return {...s,script:`try{if(!localStorage.getItem("__p2_seeded")){localStorage.setItem("rotationScoreboard.players.v1",${JSON.stringify(JSON.stringify(players))});localStorage.setItem("rotationScoreboard.matchRecords.v1","[]");localStorage.setItem("cueScore.language.v1",${JSON.stringify(lang)});localStorage.setItem("__p2_seeded","1");}}catch(e){}`}};
const MEASURE=`const R=n=>n.getBoundingClientRect(),$=s=>document.querySelector(s),vis=n=>!!n&&!n.hidden&&n.getClientRects().length>0;
const c1=$("#newMatchPlayerCard1V1"),c2=$("#newMatchPlayerCard2V1"),note=$("#cueSetupOppNoteV1"),rs=$("#cueSetupReasonV1"),start=$("#startGameBtn"),guide=$(".match-player-guide-v18"),sc=$("#cueHomeV1 .cue-new-match-integrated-v2"),tab=$(".cue-phase1-tab-bar");
const gaps=c=>{const nm=c.querySelector(".new-match-player-name-v1"),av=c.querySelector(".new-match-avatar-v1"),race=c.querySelector(".new-match-race-row-v2");return {avName:+(R(nm).top-R(av).bottom).toFixed(1),nameRace:+(R(race).top-R(nm).bottom).toFixed(1)}};
const noteOn=vis(note),rsOn=vis(rs);
const items=[...sc.querySelectorAll("button,[role=switch]")].filter(n=>n.getClientRects().length&&R(n).height>8&&!n.classList.contains("cue-match-setup-back-v3")&&!n.closest("#newMatchRacePickerV1"));
return {p1:($("#p1Name").value||""),p2:($("#p2Name").value||""),empty1:c1.classList.contains("is-empty-v1"),empty2:c2.classList.contains("is-empty-v1"),
 note:noteOn?{text:note.textContent.trim(),ariaHidden:note.getAttribute("aria-hidden"),col2:R(note).left>=R(c2).left-1,gapBelowCard2:+(R(note).top-R(c2).bottom).toFixed(1),h:Math.round(R(note).height),lines:Math.round(R(note).height/18)}:null,
 reason:rsOn?{text:rs.textContent.trim(),slot:rs.dataset.slot,aria:rs.getAttribute("aria-label"),desc:rs.getAttribute("aria-description")}:null,
 startDisabled:start.disabled,startAria:start.getAttribute("aria-disabled"),guide:vis(guide),g1:gaps(c1),g2:gaps(c2),
 hscroll:document.documentElement.scrollWidth>innerWidth+1||sc.scrollWidth>sc.clientWidth+1,small:items.filter(n=>R(n).width<44||R(n).height<44).map(n=>(n.id||n.className).toString().slice(0,24)+":"+Math.round(R(n).width)+"x"+Math.round(R(n).height)),
 startToTab:Math.round(R(tab).top-R(start).bottom),storage:localStorage.length}`;
for(const lang of LANGS) for(const w of WIDTHS) for(const n of [0,1,2]){
  const h=VIEWS[w],tag=`${lang}/${w}/players${n}`;
  const app=await startApp({lang,mode:"free",seedData:seedN(lang,n),watchdogMs:900000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});await W(1000);
  await ev(`window.__errs=[];addEventListener("error",e=>__errs.push(String(e.message)));window.__origInit=window.initializePrimaryMatchSetupV1;return 1`);
  const shot=async name=>{if(!process.env.UA_SHOT)return;fs.mkdirSync(process.env.UA_SHOT,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.UA_SHOT}/${lang}_${w}_${name}.png`,Buffer.from(r.data,"base64"))};
  const settle=()=>ev(`window.CueScoreBuild18PlayerSelection.refresh();document.dispatchEvent(new Event("input"));await new Promise(r=>setTimeout(r,1100));return 1`);
  const reset=()=>ev(`window.initializePrimaryMatchSetupV1=window.__origInit;selectedRegisteredPlayer={1:null,2:null};document.getElementById("p1Name").value="";document.getElementById("p2Name").value="";window.CueScoreBuild18PlayerSelection.refresh();await new Promise(r=>setTimeout(r,300));document.dispatchEvent(new Event("input"));await new Promise(r=>setTimeout(r,900));return 1`);
  const open=d=>ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await new Promise(r=>setTimeout(r,500))};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
  const rec=async(d,state,kind)=>{const m=await ev(MEASURE);m.errs=await ev(`return window.__errs`);rows.push({tag,disc:d,state,kind,...m});if(d==="9ball")await shot(`${state}_p${n}`)};
  for(const d of DISCS){
    await open(d);await reset();
    if(n===0){await rec(d,"natural-0players","natural");continue}
    if(n===1){await rec(d,"natural-1player","natural");continue}
    await rec(d,"A-P1sel-P2empty(natural)","natural");
    await ev(`document.getElementById("p2PlayerSearchBtn").click();await new Promise(r=>setTimeout(r,500));document.querySelector("[data-select-player]")?.click();await new Promise(r=>setTimeout(r,800));return 1`);await settle();
    await rec(d,"both-selected(natural)","natural");
    // FORCED: P1 nulled (P2 kept), auto-select disabled in this throw-away browser only
    await ev(`window.initializePrimaryMatchSetupV1=()=>false;selectedRegisteredPlayer[1]=null;return 1`);await settle();await rec(d,"B-P1empty-P2sel(FORCED)","forced");
    await ev(`selectedRegisteredPlayer[2]=null;return 1`);await settle();await rec(d,"C-both-empty(FORCED)","forced");
  }
  await app.close();
}
if(process.env.UA_OUT)fs.writeFileSync(process.env.UA_OUT,JSON.stringify({timestamp:new Date().toISOString(),rows},null,1)+"\n");
console.log("rows",rows.length);
