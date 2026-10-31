/* Real-app Chrome (real pointer events): the bottom "History" tab from every root and from the match-setup screen of the 6 disciplines.
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] [HT_OUT=<json>] [HT_EMPTY=1] node tests/browser/history-tab-from-setup.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"390").split(",").map(Number);
const DISCS=["9ball","10ball","jpa9","rotation","straightPool","threeCushion"];
const checks=[];let fail=0;const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,d)=>{checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],tag=`${lang}/${w}${process.env.HT_EMPTY?"/empty":""}`;
  const app=await startApp({lang,mode:"free",seedData:process.env.HT_EMPTY?seed({lang,rich:false,synthetic:false,link:false}):seed({lang,rich:true}),watchdogMs:900000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});
  await W(1200);
  await ev(`window.__errs=[];addEventListener("error",e=>__errs.push(String(e.message)));addEventListener("unhandledrejection",e=>__errs.push("rej:"+e.reason));window.__hits=[];document.addEventListener("click",e=>__hits.push((e.target.closest("[data-phase1-tab]")||e.target).tagName+":"+(e.target.closest("[data-phase1-tab]")?.dataset.phase1Tab||e.target.id||e.target.className.toString().slice(0,30))),true);window.__recBtn=0;document.getElementById("recordsBtn")?.addEventListener("click",()=>__recBtn++,true);return 1`);
  const tapTab=async key=>{const p=await ev(`const b=document.querySelector('[data-phase1-tab="${key}"]'),r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,hit:(()=>{const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return b.contains(e)})()}`);
    await ev(`window.__hits.length=0;window.__recBtn=0;return 1`);
    await app.cdp("Input.dispatchMouseEvent",{type:"mousePressed",x:p.x,y:p.y,button:"left",clickCount:1});await app.cdp("Input.dispatchMouseEvent",{type:"mouseReleased",x:p.x,y:p.y,button:"left",clickCount:1});await W(900);return p};
  const state=()=>ev(`const r=document.getElementById("recordsScreen"),cs=r&&getComputedStyle(r),rr=r&&r.getBoundingClientRect(),setup=document.getElementById("cueHomeV1")?.classList.contains("match-setup-active-v3"),sel=document.querySelector('[data-phase1-tab][aria-selected="true"]')?.dataset.phase1Tab,top=document.elementFromPoint(innerWidth/2,innerHeight/3);return {hits:window.__hits.slice(0,4),recBtn:window.__recBtn,errs:window.__errs,histHidden:r.classList.contains("hidden"),ariaHidden:r.getAttribute("aria-hidden"),display:cs.display,visible:rr.width>0&&rr.height>0&&cs.visibility!=="hidden",appRecords:document.getElementById("app")?.classList.contains("records-mode")||document.querySelector(".records-mode")!==null,setup,sel,rows:document.querySelectorAll("#recordsList > *").length,topIn:!!top&&r.contains(top),storage:localStorage.length}`);
  const hist=async(from,label)=>{const p=await tapTab("history");const s=await state();
    ck(p.hit,`${tag} ${label}: real tap hits the history tab button`,p);
    ck(s.visible&&!s.histHidden&&s.sel==="history",`${tag} ${label}: history screen opens`,s);
    return s};
  // A: home -> history
  await hist("home","home");
  await tapTab("home");await W(500);
  // B..D: setup -> history
  for(const d of DISCS){
    await ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await new Promise(r=>setTimeout(r,500))};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
    const inSetup=await ev(`return document.getElementById("cueHomeV1").classList.contains("match-setup-active-v3")`);
    ck(inSetup,`${tag} ${d}: setup screen open before the tap`);
    const before=await ev(`return localStorage.length`);
    await hist(d,`setup(${d})`);
    ck((await ev(`return localStorage.length`))===before,`${tag} ${d}: no data created by the tab tap`);
    await tapTab("home");await W(600);
  }
  // E/F: player, settings -> history
  for(const from of ["player","settings"]){await tapTab(from);await W(700);await hist(from,from)}
  if(process.env.HT_SHOT){fs.mkdirSync(process.env.HT_SHOT,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.HT_SHOT}/${tag.replace(/\//g,"_")}.png`,Buffer.from(r.data,"base64"))}
  await app.close();
}
if(process.env.HT_OUT)fs.writeFileSync(process.env.HT_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
