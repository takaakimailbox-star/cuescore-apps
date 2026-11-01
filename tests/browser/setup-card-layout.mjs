/* Real-app Chrome: match-setup card grouping + section spacing + start-button-to-tab-bar gap (C-plan implementation). Real DOM rect distances.
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] [SL_OUT=<json>] [SL_SHOTS=<dir>] [SL_NOCHECK=1 (measure only, for Before)] node tests/browser/setup-card-layout.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja,en,zh-Hans").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"320,375,390,430").split(",").map(Number);
const DISCS=["9ball","10ball","jpa9","rotation","straightPool","threeCushion"];
const NOCHECK=!!process.env.SL_NOCHECK;
const rows=[],checks=[];let fail=0;const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,d)=>{if(NOCHECK)return;checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
const MEASURE=`const R=n=>n.getBoundingClientRect(),$=s=>document.querySelector(s),sc=$("#cueHomeV1 .cue-new-match-integrated-v2"),sr=R(sc),hd=$(".cue-selected-game-v1"),grid=$(".new-match-player-grid-v1"),start=$("#startGameBtn"),tab=$(".cue-phase1-tab-bar"),foot=$("#cueSetupFooterV1"),clock=$(".cue-sc-setup"),note=$("#cueSetupOppNoteV1");
const card=n=>{const c=$("#newMatchPlayerCard"+n+"V1"),nm=c.querySelector(".new-match-player-name-v1"),av=c.querySelector(".new-match-avatar-v1"),race=c.querySelector(".new-match-race-row-v2"),ra=R(av),rn=R(nm),rr=R(race),rc=R(c);return {cardTop:Math.round(rc.top),cardH:Math.round(rc.height),avBottom_nameTop:+(rn.top-ra.bottom).toFixed(1),nameBottom_raceTop:+(rr.top-rn.bottom).toFixed(1),raceBottom_cardBottom:+(rc.bottom-rr.bottom).toFixed(1),nameH:Math.round(rn.height),raceH:Math.round(rr.height),empty:c.classList.contains("is-empty-v1")}};
const items=[...sc.querySelectorAll("button,[role=switch]")].filter(n=>n.getClientRects().length&&R(n).height>8&&!n.classList.contains("cue-match-setup-back-v3")&&!n.closest("#newMatchRacePickerV1"));
const small=items.filter(n=>R(n).width<44||R(n).height<44).map(n=>(n.id||n.className).toString().slice(0,28)+":"+Math.round(R(n).width)+"x"+Math.round(R(n).height));
const guide=$(".match-player-guide-v18"),guideShown=!!guide&&!guide.hidden&&guide.getClientRects().length>0;
const cs=getComputedStyle($("#newMatchPlayerCard2V1")),ncs=note&&getComputedStyle(note);
const last=Math.max(...[...sc.children].filter(k=>k.getClientRects().length&&!k.matches(".cue-match-setup-back-v3")).map(k=>R(k).bottom));
return {vh:innerHeight,topGap:Math.round(R(hd).top-sr.top),hdBottom_gridTop:Math.round(R(grid).top-R(hd).bottom),gridBottom_clockTop:Math.round(R(clock).top-R(grid).bottom),clockBottom_footTop:Math.round(R(foot).top-R(clock).bottom),scrollNeeded:sc.scrollHeight-sc.clientHeight,p1:card(1),p2:card(2),btn:{top:Math.round(R(start).top),bottom:Math.round(R(start).bottom),h:Math.round(R(start).height)},btnBottom_tabTop:+(R(tab).top-R(start).bottom).toFixed(1),footBottom_tabTop:+(R(tab).top-R(foot).bottom).toFixed(1),hscroll:document.documentElement.scrollWidth>innerWidth+1,small,guideShown,
 note:note&&!note.hidden&&note.getClientRects().length?{text:note.textContent.trim(),ariaHidden:note.getAttribute("aria-hidden"),top:Math.round(R(note).top),h:Math.round(R(note).height),gapBelowCard2:+(R(note).top-R($("#newMatchPlayerCard2V1")).bottom).toFixed(1),insideCol2:R(note).left>=R($("#newMatchPlayerCard2V1")).left-1&&R(note).right<=R($("#newMatchPlayerCard2V1")).right+1,bg:ncs.backgroundColor,color:ncs.color}:null,
 card2Border:cs.borderTopStyle+" "+cs.borderTopColor+" "+cs.borderTopWidth,card2Bg:cs.backgroundColor,
 yellowOnEmpty:[...$("#newMatchPlayerCard2V1").querySelectorAll("*"),$("#newMatchPlayerCard2V1")].some(n=>{const s=getComputedStyle(n);return /201, 162, 39|255, 213, 74/.test(s.borderColor+s.textDecorationColor+s.outlineColor)}),underline:getComputedStyle($("#newMatchPlayerCard2V1 .new-match-player-name-v1")).textDecorationLine,
 lastBottom_footTop:Math.round(R(foot).top-last)}`;
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],tag=`${lang}/${w}`;
  const app=await startApp({lang,mode:"free",seedData:seed({lang,rich:true}),watchdogMs:900000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});await W(1000);
  const shot=async n=>{if(!process.env.SL_SHOTS)return;fs.mkdirSync(process.env.SL_SHOTS,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.SL_SHOTS}/${n}.png`,Buffer.from(r.data,"base64"))};
  const open=d=>ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await new Promise(r=>setTimeout(r,500))};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
  const clk=on=>ev(`const sw=document.querySelector(".cue-sc-switch");if(sw&&(sw.getAttribute("aria-checked")==="true")!==${on}){sw.click();await new Promise(r=>setTimeout(r,300))}await new Promise(r=>setTimeout(r,300));return 1`);
  const pickOpp=()=>ev(`if(!document.getElementById("p2Name").value){document.getElementById("p2PlayerSearchBtn").click();await new Promise(r=>setTimeout(r,500));document.querySelector("[data-select-player]")?.click();await new Promise(r=>setTimeout(r,700))}return 1`);
  for(const d of DISCS){
    await open(d);
    for(const clock of [false,true]){
      await clk(clock);const m=await ev(MEASURE);const t=`${tag}/${d}/clock${clock?"ON":"OFF"}/oppEmpty`;rows.push({t,...m});
      if(d==="9ball"&&!clock)await shot(`${lang}_${w}_9ball_empty_clockOFF`);if(d==="9ball"&&clock)await shot(`${lang}_${w}_9ball_empty_clockON`);
      ck(!m.hscroll&&m.small.length===0,`${t} no overflow, targets >=44pt`,{h:m.hscroll,s:m.small});
      ck(m.btn.h>=54,`${t} start button >=54pt`,m.btn.h);
      for(const k of ["p1","p2"]){ck(m[k].avBottom_nameTop>=4&&m[k].avBottom_nameTop<=8.5,`${t} ${k} avatar->name 4-8pt`,m[k].avBottom_nameTop);ck(m[k].nameBottom_raceTop>=8&&m[k].nameBottom_raceTop<=12.5,`${t} ${k} name->Race to 8-12pt`,m[k].nameBottom_raceTop)}
      if(!m.guideShown){ck(m.note&&m.note.text.length>0&&m.note.ariaHidden==="true"&&m.note.insideCol2&&m.note.gapBelowCard2>=0&&m.note.gapBelowCard2<=14,`${t} opponent note directly below the opponent card`,m.note);}
      ck(!m.yellowOnEmpty&&m.underline==="none"&&/dashed/.test(m.card2Border),`${t} unselected card: light-grey dashed frame (D plan), no yellow, no underline`,{b:m.card2Border,u:m.underline,y:m.yellowOnEmpty});
      if(h>=800)ck(m.btnBottom_tabTop>=20&&m.btnBottom_tabTop<=28,`${t} start button -> tab bar 20-28pt`,m.btnBottom_tabTop);else ck(m.btnBottom_tabTop>=8,`${t} start button clears the tab bar (short screen)`,m.btnBottom_tabTop);
    }
  }
  await clk(false);await pickOpp();      // the opponent selection persists across disciplines: measure the selected state after all empty-state cases
  for(const d of DISCS){
    await open(d);await clk(false);
    const m=await ev(MEASURE);const t=`${tag}/${d}/oppSelected`;rows.push({t,...m});
    ck(m.note===null,`${t} note and its spacing disappear after selecting the opponent`,m.note);
    ck(m.p1.nameBottom_raceTop>=8&&m.p1.nameBottom_raceTop<=12.5&&m.p2.nameBottom_raceTop>=8&&m.p2.nameBottom_raceTop<=12.5,`${t} name->Race to 8-12pt (both)`,[m.p1.nameBottom_raceTop,m.p2.nameBottom_raceTop]);
    ck(m.btn.h>=54&&m.small.length===0&&!m.hscroll,`${t} start >=54pt, targets >=44pt, no overflow`,{h:m.btn.h,s:m.small});
    if(d==="9ball")await shot(`${lang}_${w}_9ball_selected_clockOFF`);
  }
  await app.close();
}
if(process.env.SL_OUT)fs.writeFileSync(process.env.SL_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks:checks.length,fail,rows},null,1)+"\n");
console.log(NOCHECK?"measured only":fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
