/* Real-app Chrome: on small screens (320x568, 375x667) with the shot clock ON the setup area scrolls; after scrolling to the end every control must be fully visible
 * above the independent footer (nothing hidden or cut). Usage: [L=ja,en,zh-Hans] D2R_OUT=<json> node tests/browser/d2-small-screen-reach.mjs */
import { startApp } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja,en,zh-Hans").split(","),VIEWS={320:568,375:667};const checks=[];let fail=0;const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,d)=>{checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
for(const lang of LANGS) for(const w of [320,375]){
  const h=VIEWS[w],app=await startApp({lang,mode:"free",seedData:{script:`try{if(!localStorage.getItem("__r")){localStorage.setItem("cueScore.language.v1","${lang}");localStorage.setItem("__r","1")}}catch(e){}`,players:[],records:[]},watchdogMs:300000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:0,bottom:0,left:0,right:0}});await W(1000);
  await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await new Promise(r=>setTimeout(r,900));const sw=document.querySelector(".cue-sc-setup [role=switch]");if(sw.getAttribute("aria-checked")!=="true"){sw.click();await new Promise(r=>setTimeout(r,500))}return 1`);
  const r=await ev(`const sc=document.querySelector("#cueHomeV1 .cue-new-match-integrated-v2"),R=n=>n.getBoundingClientRect();const need=sc.scrollHeight-sc.clientHeight;sc.scrollTop=0;await new Promise(x=>setTimeout(x,200));const topOk=[...sc.querySelectorAll("#newMatchPlayerCard1V1,#newMatchPlayerCard2V1")].every(n=>R(n).top>=R(sc).top-1);
    sc.scrollTop=sc.scrollHeight;await new Promise(x=>setTimeout(x,300));const box=R(sc),foot=R(document.getElementById("cueSetupFooterV1")),ctl=[...sc.querySelectorAll("button,[role=switch],select")].filter(n=>n.getClientRects().length&&!n.classList.contains("cue-match-setup-back-v3")&&!n.closest("#newMatchRacePickerV1")&&!n.classList.contains("cue-setup-reason-v1"));
    const cut=ctl.filter(n=>R(n).bottom>box.bottom+1||R(n).top<box.top-1).map(n=>(n.id||n.className).toString().slice(0,24));const underFooter=ctl.filter(n=>R(n).bottom>foot.top+1).length;
    const start=R(document.getElementById("startGameBtn")),tab=R(document.querySelector(".cue-phase1-tab-bar"));
    return {need,topOk,cut,underFooter,startVisible:start.bottom<=tab.top&&start.top>=foot.top-1,startH:Math.round(start.height),hscroll:document.documentElement.scrollWidth>innerWidth+1}`);
  ck(r.topOk,`${lang}/${w} ON: both player cards fully reachable at the top`,r);
  ck(r.cut.length===0&&r.underFooter===0,`${lang}/${w} ON: after scrolling to the end every control is fully visible above the footer (scroll ${r.need}pt)`,r);
  ck(r.startVisible&&r.startH>=44&&!r.hscroll,`${lang}/${w} ON: start button visible above the tab bar, >=44pt, no horizontal overflow`,r);
  await app.close();
}
if(process.env.D2R_OUT)fs.writeFileSync(process.env.D2R_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
