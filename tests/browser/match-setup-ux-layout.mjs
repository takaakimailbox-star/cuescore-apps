/* Match-setup UX trial (Build 95 candidate): layout proof of the REAL app in headless Chrome (NOT part of `node --test`). Usage: [L=ja,en,zh-Hans] [MS_OUT=<json>] node tests/browser/match-setup-ux-layout.mjs  (exit 1 on failure)
 * 6 disciplines x 4 widths (320x568, 375x667, 390x844, 430x932; home-indicator inset emulated) x 3 languages x player states (B: opponent unselected, A: both selected, E1 / E0: one / no registered player = first-time use) x clock OFF / ON.
 * Per case: start button above the tab bar and >= 44pt, footer never covers a setup control, the last control is reachable, no truncated text, no horizontal overflow, 44pt targets,
 * the HTML disabled attribute follows the start condition (disabled iff a player is missing); the footer reason is shown while it is disabled, except with fewer than two registered players where the existing guide card explains it. */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja,en,zh-Hans").split(","),VIEWS=[[320,568],[375,667],[390,844],[430,932]],DISCS=["9ball","10ball","jpa9","rotation","straightPool","threeCushion"];
const rows=[];
const MEASURE=`JSON.stringify((()=>{
 const R=n=>n.getBoundingClientRect(),$=s=>document.querySelector(s),sc=$("#cueHomeV1 .cue-new-match-integrated-v2"),foot=R($("#cueSetupFooterV1")),tb=R($(".cue-phase1-tab-bar")),s=$("#startGameBtn"),sr=R(s);
 const items=[...document.querySelectorAll("#cueHomeV1 .cue-new-match-integrated-v2 button, #cueHomeV1 .cue-new-match-integrated-v2 [role=switch]")].filter(n=>n.getClientRects().length&&R(n).height>8&&!n.classList.contains("cue-match-setup-back-v3"));
 const guideShown=!!$(".match-player-guide-v18")&&!$(".match-player-guide-v18").hidden&&$(".match-player-guide-v18").getClientRects().length>0;
 const hit=[...items,s,$("#cueSetupReasonV1")].filter(n=>n&&n.getClientRects().length&&!n.hidden).map(n=>{let r=R(n);if(n.id==="cueSetupReasonV1"||n.matches(".starter-choice"))r={width:r.width+16,height:r.height+24};return {n,r}}).filter(x=>x.r.width<44||x.r.height<44).map(x=>(x.n.id||x.n.className).toString().slice(0,30)+":"+Math.round(x.r.width)+"x"+Math.round(x.r.height));
 /* "covered" = the VISIBLE part of a control (inside the scroll region) is hit by something else (elementFromPoint); a control that is simply below the fold of the scroll region is not covered (reach below proves it can be scrolled into view) */
 const scr=R(sc);const covered=items.filter(n=>{const r=R(n),t=Math.max(r.top,scr.top),b=Math.min(r.bottom,scr.bottom);if(b-t<8)return false;const e=document.elementFromPoint(r.left+r.width/2,(t+b)/2);return !(e&&(n===e||n.contains(e)))}).length;
 sc.scrollTop=sc.scrollHeight;const lastB=Math.max(...items.map(n=>R(n).bottom));const reach=lastB<=foot.top+1;sc.scrollTop=0;
 const trunc=[...sc.querySelectorAll(".new-match-player-name-v1,.goal-label-v1,.cue-sc-val-label,.cue-sc-val-v,.cue-sc-setup-title,.cue-sc-setup-sub,#cueSelectedGameNameV1")].filter(n=>n.getClientRects().length&&n.scrollWidth>n.clientWidth+1).map(n=>n.className.toString().slice(0,20)+":"+n.textContent.trim().slice(0,12));
 const cards=[...document.querySelectorAll(".new-match-player-card-v1,.cue-sc-setup")].map(R);const out=cards.filter(r=>r.left<-0.5||r.right>innerWidth+0.5).length;
 const rowOver=[...document.querySelectorAll(".new-match-race-row-v2,.cue-sc-val")].filter(n=>n.getClientRects().length).filter(n=>{const p=R(n);return [...n.children].some(c=>c.getClientRects().length&&(R(c).right>p.right+0.5||R(c).left<p.left-0.5))}).length;
 const inView=items.filter(n=>R(n).top>=0&&R(n).bottom<=foot.top+0.5).length;
 return {guideShown,scrollNeeded:sc.scrollHeight-sc.clientHeight,hscroll:document.documentElement.scrollWidth>innerWidth+1,vh:innerHeight,startTop:Math.round(sr.top),startBottom:Math.round(sr.bottom),footTop:Math.round(foot.top),footBottom:Math.round(foot.bottom),tabsTop:Math.round(tb.top),startAboveTabs:foot.bottom<=tb.top+1&&sr.bottom<=foot.bottom,startH:Math.round(sr.height),startW:Math.round(sr.width),startDisabled:s.disabled,startAttr:s.hasAttribute("disabled"),reason:$("#cueSetupReasonV1").hidden?"":$("#cueSetupReasonV1").textContent,empty:[1,2].map(n=>$("#newMatchPlayerCard"+n+"V1").classList.contains("is-empty-v1")),hit,covered,reach,trunc,out,rowOver,inView,nItems:items.length,hdr:Math.round(R($(".cue-selected-game-v1")).height),cardH:Math.round(R($("#newMatchPlayerCard1V1")).height)}})())`;
const start=async o=>{for(let i=0;i<3;i++){try{return await startApp(o)}catch(e){await new Promise(r=>setTimeout(r,3000))}}return startApp(o)};   // a headless Chrome start can time out under load
for(const lang of LANGS) for(const [w,h] of VIEWS) for(const state of ["B","A","E1","E0"]){
  const app=await start({lang,mode:"free",seedData:seed({lang,rich:true}),watchdogMs:900000});
  const ev=c=>app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});
  await ev(`await W(1000)`);
  if(state==="E1"||state==="E0"){   // fewer than two registered players (first-time use): trim the test library, then reload
    await ev(`const k="rotationScoreboard.players.v1";const a=JSON.parse(localStorage.getItem(k)||"[]");localStorage.setItem(k,JSON.stringify(a.slice(0,${state==="E1"?1:0})))`);
    await app.cdp("Page.reload");await new Promise(r=>setTimeout(r,3500));await ev(`await W(800)`);
  }
  if(state==="A") await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await W(900);if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await W(500);document.querySelector("[data-select-player]")?.click();await W(700)}`);
  for(const d of DISCS){
    await ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await W(500)};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await W(900)`);
    for(const clock of [false,true]){
      await ev(`const sw=document.querySelector(".cue-sc-switch");if(sw&&(sw.getAttribute("aria-checked")==="true")!==${clock}){sw.click();await W(300)}await W(300)`);
      const m=JSON.parse(await app.evalJs(MEASURE));rows.push({lang,w,h,state,d,clock,...m});
    }
  }
  await app.close();console.log("done",lang,w,state);
}
if(process.env.MS_OUT)fs.writeFileSync(process.env.MS_OUT,JSON.stringify(rows,null,1));
const bad=rows.filter(r=>r.hit.length||r.covered||!r.reach||r.trunc.length||r.out||r.rowOver||r.hscroll||!r.startAboveTabs||r.startH<44||(r.startDisabled!==(r.state!=="A"))||(r.startDisabled&&!r.reason&&!r.guideShown)||(!r.startDisabled&&r.reason)||(r.startDisabled&&r.guideShown&&r.reason)||(r.startDisabled!==r.startAttr)||((r.state==="E1"||r.state==="E0")&&!r.guideShown)||((r.state==="A"||r.state==="B")&&r.guideShown));
for(const r of bad.slice(0,20))console.log("FAIL",r.lang,r.w,r.state,r.d,r.clock,JSON.stringify({hit:r.hit,covered:r.covered,reach:r.reach,trunc:r.trunc,out:r.out,rowOver:r.rowOver,hscroll:r.hscroll,above:r.startAboveTabs,h:r.startH}));
console.log(bad.length?"FAIL "+bad.length+" / "+rows.length:"PASS "+rows.length);
process.exit(bad.length?1:0);
