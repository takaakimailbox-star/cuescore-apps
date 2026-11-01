/* Real-app Chrome (real pointer events): the bottom tab selection after choosing an opponent from the match-setup screen (and real Player-tab navigation).
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] [PS_OUT=<json>] [PS_SHOT=<dir>] node tests/browser/player-select-tab-state.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"390").split(",").map(Number);
const DISCS=(process.env.PS_DISCS||"9ball,10ball,jpa9,rotation,straightPool,threeCushion").split(",");
const checks=[];let fail=0;const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,d)=>{checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],tag=`${lang}/${w}`;
  const app=await startApp({lang,mode:"free",seedData:seed({lang,rich:true}),watchdogMs:900000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});
  await W(1200);
  await ev(`window.__errs=[];addEventListener("error",e=>__errs.push(String(e.message)));addEventListener("unhandledrejection",e=>__errs.push("rej:"+e.reason));return 1`);
  const tap=async sel=>{const p=await ev(`const b=document.querySelector(${JSON.stringify(sel)}),r=b.getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {x:r.left+r.width/2,y:r.top+r.height/2,hit:b.contains(e)}`);
    await app.cdp("Input.dispatchMouseEvent",{type:"mousePressed",x:p.x,y:p.y,button:"left",clickCount:1});await app.cdp("Input.dispatchMouseEvent",{type:"mouseReleased",x:p.x,y:p.y,button:"left",clickCount:1});await W(900);return p};
  const tabs=()=>ev(`const all=[...document.querySelectorAll('[data-phase1-tab]')].map(b=>b.dataset.phase1Tab+":"+b.getAttribute("aria-selected"));const sel=all.filter(x=>x.endsWith(":true")).map(x=>x.split(":")[0]);const lib=document.getElementById("playerLibraryOverlay"),libVis=!!lib&&!lib.classList.contains("hidden")&&getComputedStyle(lib).display!=="none";return {sel,body:document.body.dataset.cuePhase1Tab,setup:document.getElementById("cueHomeV1").classList.contains("match-setup-active-v3"),libVis,ctx:document.body.dataset.cuePlayerContext||null,opp:document.getElementById("p2Name")?.value||"",storage:localStorage.length,errs:window.__errs}`);
  for(const d of DISCS){
    const t=`${tag}/${d}`;
    await ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await new Promise(r=>setTimeout(r,500))};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
    const s0=await tabs();ck(s0.setup&&s0.sel.length===1&&s0.sel[0]==="home",`${t} setup open: only Home selected`,s0);
    const before=s0.storage;
    await tap("#p2PlayerSearchBtn");
    const s1=await tabs();ck(s1.libVis,`${t} opponent picker (library) opens`,s1);
    await ev(`document.querySelector("[data-select-player]")?.click();await new Promise(r=>setTimeout(r,900));return 1`);
    await W(500);
    const s2=await tabs();
    ck(s2.setup&&!s2.libVis&&s2.opp!=="",`${t} back on setup with opponent selected`,s2);
    ck(s2.sel.length===1&&s2.sel[0]==="home"&&s2.body==="home",`${t} AFTER SELECT: exactly Home selected (no stale Player)`,s2);
    ck(s2.storage===before,`${t} selection created no stored data`,{before,after:s2.storage});
    // real Player tab from setup, then back to Home
    await tap('[data-phase1-tab="player"]');const s3=await tabs();
    ck(s3.sel.length===1&&s3.sel[0]==="player"&&s3.libVis,`${t} real Player tab: Player selected, library shown`,s3);
    await tap('[data-phase1-tab="history"]');const s4=await tabs();ck(s4.sel.length===1&&s4.sel[0]==="history",`${t} History tab: History selected`,s4);
    await tap('[data-phase1-tab="settings"]');const s5=await tabs();ck(s5.sel.length===1&&s5.sel[0]==="settings",`${t} Settings tab: Settings selected`,s5);
    await tap('[data-phase1-tab="home"]');const s6=await tabs();ck(s6.sel.length===1&&s6.sel[0]==="home",`${t} Home tab: Home selected`,s6);
    ck(!(s6.errs||[]).length,`${t} no JS exceptions`,s6.errs);
    if(process.env.PS_SHOT&&d==="9ball"){fs.mkdirSync(process.env.PS_SHOT,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.PS_SHOT}/${tag.replace(/\//g,"_")}_home.png`,Buffer.from(r.data,"base64"))}
  }
  await app.close();
}
if(process.env.PS_OUT)fs.writeFileSync(process.env.PS_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
