/* ISOLATED PROTOTYPE: shot clock ON state (time selectors expanded), Before/After, with the injected D2 CSS. No product file changes. */
import { startApp } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"390").split(",").map(Number);
const S='body.cue-phase1-normal-mode #cueHomeV1.match-setup-active-v3';
const AFTER_CSS=`
${S} .cue-new-match-summary-v2{margin:0 0 clamp(18px,5vh,44px)!important}
${S} .cue-player-stack-v2 .new-match-player-select-v1 .new-match-avatar-v1.has-player-avatar-v2{width:68px!important;height:68px!important;min-width:68px;min-height:68px;flex:0 0 68px!important}
${S} .new-match-player-card-v1{padding:10px 8px 8px!important}
${S} .new-match-swap-v1{top:34px!important}
${S} .cue-player-stack-v2 .new-match-player-card-v1:not(.is-empty-v1) .new-match-player-select-v1 .new-match-player-name-v1{font-size:23px!important;line-height:1.2!important;min-height:28px}
${S} .cue-player-stack-v2 .is-empty-v1 .new-match-player-select-v1 .new-match-player-name-v1{font-size:18px!important;line-height:1.2!important;min-height:28px;font-weight:800!important;display:flex!important;align-items:center;justify-content:center;gap:6px;text-align:center}
${S} .cue-player-stack-v2 .is-empty-v1 .new-match-player-select-v1 .new-match-player-name-v1::before{content:"i" / "";display:inline-flex;align-items:center;justify-content:center;flex:0 0 18px;width:18px;height:18px;border:1.7px solid #5a6b7d;border-radius:50%;color:#5a6b7d;font-size:12px;font-weight:900;line-height:1;text-align:center;box-sizing:border-box}
@media(max-width:399px){html[lang="en"] ${S} .cue-player-stack-v2 .is-empty-v1 .new-match-player-select-v1 .new-match-player-name-v1{min-height:44px!important}html[lang="en"] ${S} .cue-player-stack-v2 .new-match-player-card-v1:not(.is-empty-v1) .new-match-player-select-v1 .new-match-player-name-v1{min-height:44px!important;line-height:44px!important}}
@media(max-width:379px){${S} .cue-player-stack-v2 .is-empty-v1 .new-match-player-select-v1 .new-match-player-name-v1{min-height:44px!important}${S} .cue-player-stack-v2 .new-match-player-card-v1:not(.is-empty-v1) .new-match-player-select-v1 .new-match-player-name-v1{min-height:44px!important;line-height:44px!important}}
${S} .is-empty-v1 .new-match-avatar-v1::before{right:-3px;bottom:-3px}
${S} .new-match-race-row-v2 strong{font-size:17px!important}
${S} .new-match-race-row-v2 .goal-label-v1{font-size:11px!important}
${S} #cueSetupOppNoteV1{display:none!important}
${S} .cue-sc-setup{margin-top:clamp(16px,4vh,40px)!important;padding:3px 12px!important;border-color:#ececea!important}
${S} .cue-sc-setup-title{font-size:15px!important;line-height:20px!important;font-weight:500!important}
${S} .cue-sc-setup-sub{font-size:11px!important;line-height:14px!important}
`;

const MEAS=`const R=n=>n.getBoundingClientRect(),$=s=>document.querySelector(s),clock=$(".cue-sc-setup"),sc=$("#cueHomeV1 .cue-new-match-integrated-v2"),tab=$(".cue-phase1-tab-bar"),start=$("#startGameBtn");
const items=[...sc.querySelectorAll("button,[role=switch],select")].filter(n=>n.getClientRects().length&&R(n).height>8&&!n.classList.contains("cue-match-setup-back-v3")&&!n.closest("#newMatchRacePickerV1"));
const sw=clock.querySelector("[role=switch]");const vals=[...document.querySelectorAll(".cue-sc-val")].filter(n=>n.getClientRects().length);
return {on:sw.getAttribute("aria-checked"),clockH:Math.round(R(clock).height),valsH:vals.map(n=>Math.round(R(n).height)),valsW:vals.map(n=>Math.round(R(n).width)),switchH:Math.round(R(sw).height),small:items.filter(n=>R(n).width<44||R(n).height<44).map(n=>(n.id||n.className).toString().slice(0,22)+":"+Math.round(R(n).width)+"x"+Math.round(R(n).height)),startToTab:Math.round(R(tab).top-R(start).bottom),scrollNeeded:sc.scrollHeight-sc.clientHeight,hscroll:document.documentElement.scrollWidth>innerWidth+1||sc.scrollWidth>sc.clientWidth+1}`;
const rows=[];const W=ms=>new Promise(r=>setTimeout(r,ms));
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w];const app=await startApp({lang,mode:"free",seedData:{script:`try{if(!localStorage.getItem("__d2")){localStorage.setItem("cueScore.language.v1","${lang}");localStorage.setItem("__d2","1")}}catch(e){}`,players:[],records:[]},watchdogMs:600000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});await W(1000);
  await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await new Promise(r=>setTimeout(r,900));const sw=document.querySelector(".cue-sc-setup [role=switch]");if(sw.getAttribute("aria-checked")!=="true"){sw.click();await new Promise(r=>setTimeout(r,500))}return 1`);
  const shot=async n=>{fs.mkdirSync(process.env.D2_SHOT,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.D2_SHOT}/${lang}_${w}_${n}.png`,Buffer.from(r.data,"base64"))};
  const before=await ev(MEAS);await shot("E_clockON_before");
  await ev(`const st=document.createElement("style");st.id="d2proto";st.textContent=${JSON.stringify(AFTER_CSS)};document.body.appendChild(st);await new Promise(r=>setTimeout(r,500));return 1`);
  const after=await ev(MEAS);await shot("E_clockON_after");rows.push({tag:`${lang}/${w}`,before,after});await app.close();
}
fs.writeFileSync(process.env.D2_OUT,JSON.stringify({timestamp:new Date().toISOString(),rows},null,1)+"\n");console.log("rows",rows.length);
