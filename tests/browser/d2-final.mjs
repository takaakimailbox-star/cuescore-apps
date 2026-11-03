/* Real-app Chrome (NO injection): D2 final match-setup design (PO 2026-11-02) measured on the product itself.
 * States: A both unselected (forced), B P1 selected / P2 unselected (natural), C both selected, D JPA 9-Ball (Skill Level), E shot clock ON. Optional D2F_LONG=1: long player names.
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] D2F_OUT=<json> [D2F_SHOT=<dir>] node tests/browser/d2-final.mjs */
import { startApp } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"390").split(",").map(Number);
const checks=[];let fail=0;const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,d)=>{checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
const MEAS=`const R=n=>n.getBoundingClientRect(),$=s=>document.querySelector(s),cs=n=>getComputedStyle(n),vis=n=>!!n&&!n.hidden&&n.getClientRects().length>0;
const hd=$(".cue-selected-game-v1"),sum=$(".cue-new-match-summary-v2"),grid=$(".new-match-player-grid-v1"),sc=$("#cueHomeV1 .cue-new-match-integrated-v2"),start=$("#startGameBtn"),tab=$(".cue-phase1-tab-bar"),foot=$("#cueSetupFooterV1"),clock=$(".cue-sc-setup"),rs=$("#cueSetupReasonV1");
const card=n=>{const c=$("#newMatchPlayerCard"+n+"V1"),nm=c.querySelector(".new-match-player-name-v1"),av=c.querySelector(".new-match-avatar-v1"),race=c.querySelector(".new-match-race-row-v2"),rv=race.querySelector("strong"),lh=parseFloat(cs(nm).lineHeight)||parseFloat(cs(nm).fontSize)*1.2,cc=cs(c),ac=cs(av);
 return {empty:c.classList.contains("is-empty-v1"),top:+R(c).top.toFixed(1),w:Math.round(R(c).width),h:Math.round(R(c).height),bs:cc.borderTopStyle,abs:ac.borderTopStyle,av:Math.round(R(av).width),nameFont:parseFloat(cs(nm).fontSize),nameLines:Math.max(1,Math.round(nm.scrollHeight/lh)),nameText:nm.textContent.trim(),ellipsis:nm.scrollWidth>nm.clientWidth+1&&cs(nm).textOverflow==="ellipsis",icon:getComputedStyle(nm,"::before").content,iconW:parseFloat(getComputedStyle(nm,"::before").width)||0,avName:+(R(nm).top-R(av).bottom).toFixed(1),nameRace:+(R(race).top-R(nm).bottom).toFixed(1),raceFont:parseFloat(cs(rv).fontSize)}};
const items=[...sc.querySelectorAll("button,[role=switch],select")].filter(n=>n.getClientRects().length&&R(n).height>8&&!n.classList.contains("cue-match-setup-back-v3")&&!n.closest("#newMatchRacePickerV1")&&!n.classList.contains("cue-setup-reason-v1"));
const last=Math.max(...[...sc.children].filter(k=>k.getClientRects().length&&!k.matches(".cue-match-setup-back-v3")).map(k=>R(k).bottom));
const rr=rs?R(rs):null;
return {vh:innerHeight,topBlank:Math.round(R(sum).top-R(sc).top),headGap:Math.round(R(grid).top-R(hd).bottom),midGap:Math.round(R(clock).top-R(grid).bottom),bottomBlank:Math.round(R(foot).top-last),
 p1:card(1),p2:card(2),aligned:Math.abs(R($("#newMatchPlayerCard1V1")).top-R($("#newMatchPlayerCard2V1")).top)<=1&&Math.abs(R($("#newMatchPlayerCard1V1")).height-R($("#newMatchPlayerCard2V1")).height)<=1,
 clockH:Math.round(R(clock).height),clockTitle:parseFloat(cs(clock.querySelector(".cue-sc-setup-title")).fontSize),clockSub:parseFloat(cs(clock.querySelector(".cue-sc-setup-sub")).fontSize),clockBorder:cs(clock).borderTopColor,
 startToTab:Math.round(R(tab).top-R(start).bottom),startDisabled:start.disabled,startAria:start.getAttribute("aria-disabled"),scrollNeeded:sc.scrollHeight-sc.clientHeight,hscroll:document.documentElement.scrollWidth>innerWidth+1||sc.scrollWidth>sc.clientWidth+1,
 small:items.filter(n=>R(n).width<44||R(n).height<44).map(n=>(n.id||n.className).toString().slice(0,22)+":"+Math.round(R(n).width)+"x"+Math.round(R(n).height)),
 noteInDom:!!$("#cueSetupOppNoteV1"),blueNote:!!document.querySelector(".cue-setup-note-v1"),
 reason:rs?{hidden:rs.hidden,text:rs.textContent.trim(),label:rs.getAttribute("aria-label"),desc:rs.getAttribute("aria-description"),w:Math.round(rr.width),h:Math.round(rr.height),display:cs(rs).display,visibility:cs(rs).visibility,slot:rs.dataset.slot||null}:null,
 clockOn:clock.querySelector("[role=switch]").getAttribute("aria-checked"),errs:window.__errs||[]}`;
const rows=[];
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],tag=`${lang}/${w}${process.env.D2F_LONG?"/long":""}`;
  const app=await startApp({lang,mode:"free",seedData:{script:`try{if(!localStorage.getItem("__d2f")){localStorage.setItem("cueScore.language.v1","${lang}");localStorage.setItem("__d2f","1")}}catch(e){}`,players:[],records:[]},watchdogMs:900000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});await W(1000);
  await ev(`window.__errs=[];addEventListener("error",e=>__errs.push(String(e.message)));window.__orig=window.initializePrimaryMatchSetupV1;return 1`);
  if(process.env.D2F_LONG){await ev(`const a=JSON.parse(localStorage.getItem("rotationScoreboard.players.v1"));a[0].name=${JSON.stringify(lang==="en"?"Christopher Alexander":"あいうえおかきくけこさしすせそ")};a[1].name=${JSON.stringify(lang==="en"?"Bartholomew Montgomery":"ABCDEFGHIJKLMNOPQRSTUVWXYZ")};localStorage.setItem("rotationScoreboard.players.v1",JSON.stringify(a));return 1`);await app.cdp("Page.reload");await W(4500);await ev(`window.__errs=[];addEventListener("error",e=>__errs.push(String(e.message)));window.__orig=window.initializePrimaryMatchSetupV1;return 1`)}
  const shot=async n=>{if(!process.env.D2F_SHOT)return;fs.mkdirSync(process.env.D2F_SHOT,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.D2F_SHOT}/${lang}_${w}_${n}.png`,Buffer.from(r.data,"base64"))};
  const open=d=>ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await new Promise(r=>setTimeout(r,500))};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
  const settle=()=>ev(`CueScoreBuild18PlayerSelection.refresh();document.dispatchEvent(new Event("input"));await new Promise(r=>setTimeout(r,1200));return 1`);
  const reset=()=>ev(`window.initializePrimaryMatchSetupV1=window.__orig;const p=CueScoreBuild18PlayerSelection.validPlayers();selectedRegisteredPlayer={1:p[0].id,2:p[1].id};for(const[s,pl]of [[1,p[0]],[2,p[1]]]){document.getElementById("p"+s+"Name").value=pl.name;syncSelectedPlayerAvatarV2(s,pl);syncNewMatchNameV1("p"+s+"Name","p"+s+"NameDisplayV1")}const sw=document.querySelector(".cue-sc-setup [role=switch]");if(sw.getAttribute("aria-checked")==="true"){sw.click();await new Promise(r=>setTimeout(r,300))}return 1`);
  const STATES=[["A_both_unselected","9ball",`window.initializePrimaryMatchSetupV1=()=>false;selectedRegisteredPlayer={1:null,2:null};document.getElementById("p1Name").value="";document.getElementById("p2Name").value="";return 1`],
    ["B_P1_selected_P2_unselected","9ball",`selectedRegisteredPlayer[2]=null;document.getElementById("p2Name").value="";return 1`],
    ["C_both_selected","9ball",`return 1`],["D_jpa9_both_selected","jpa9",`return 1`],["E_clockON","9ball",`const sw=document.querySelector(".cue-sc-setup [role=switch]");sw.click();await new Promise(r=>setTimeout(r,500));return 1`]];
  for(const [name,disc,setup] of STATES){
    await open(disc);await reset();await ev(setup);await settle();
    const m=await ev(MEAS);await shot(name);rows.push({tag,state:name,...m});
    const t=`${tag}/${name[0]}`,short=w<=375;
    const sel=[m.p1,m.p2].filter(c=>!c.empty),emp=[m.p1,m.p2].filter(c=>c.empty);
    ck(m.p1.av===68&&m.p2.av===68,`${t} avatar 68pt`,[m.p1.av,m.p2.av]);
    ck(sel.every(c=>c.nameFont===23&&c.bs==="solid"),`${t} selected: name 23pt, solid card`,sel.map(c=>[c.nameFont,c.bs]));
    ck(emp.every(c=>c.nameFont===18&&c.bs==="dashed"&&c.abs==="dashed"),`${t} unselected: guidance 18pt, dashed card + dashed avatar ring`,emp.map(c=>[c.nameFont,c.bs,c.abs]));
    ck(emp.every(c=>/\/ ""/.test(c.icon)&&c.iconW===18),`${t} round (i) is decorative (CSS content, empty alt) and 18px`,emp.map(c=>c.icon));
    ck(m.p1.raceFont===17&&m.p2.raceFont===17,`${t} Race to number 17pt`,[m.p1.raceFont,m.p2.raceFont]);
    ck(sel.every(c=>c.nameFont>c.raceFont)&&emp.every(c=>c.nameFont>c.raceFont),`${t} name larger than Race to`);
    ck(m.p1.avName>=3.5&&m.p1.avName<=5&&m.p2.avName>=3.5&&m.p2.avName<=5&&Math.abs(m.p1.nameRace-10)<=0.7&&Math.abs(m.p2.nameRace-10)<=0.7,`${t} avatar->name 4pt, name->Race to 10pt`,[m.p1.avName,m.p2.avName,m.p1.nameRace,m.p2.nameRace]);
    ck(m.aligned,`${t} both cards aligned`);
    ck(!m.noteInDom&&!m.blueNote,`${t} blue-grey note below the card is gone`);
    if(name[0]==="E")ck(m.clockOn==="true"&&m.clockH===121,`${t} shot clock ON height 121pt`,m.clockH);else ck(m.clockH===52,`${t} shot clock OFF height 52pt`,m.clockH);
    ck(m.clockTitle===15&&m.clockSub===11&&/236, 236, 234|rgb\(236/.test(m.clockBorder),`${t} shot clock: 15/11pt, light border`,[m.clockTitle,m.clockSub,m.clockBorder]);
    ck(!m.hscroll&&m.small.length===0,`${t} no overflow, targets >=44pt`,{h:m.hscroll,s:m.small});
    ck(!(m.errs||[]).length,`${t} no JS exceptions`,m.errs);
    if(w===390)ck(m.startToTab===24,`${t} start->tab bar 24pt`,m.startToTab);
    if(w>=375&&!process.env.D2F_LONG&&name[0]!=="E")ck(m.scrollNeeded===0,`${t} no scroll needed`,m.scrollNeeded);
    const anyEmpty=emp.length>0;
    ck(m.startDisabled===anyEmpty&&m.startAria===(anyEmpty?"true":"false"),`${t} start button ${anyEmpty?"disabled":"enabled"} (aria-disabled kept)`,[m.startDisabled,m.startAria]);
    if(anyEmpty){const r=m.reason;
      ck(r&&!r.hidden&&r.display!=="none"&&r.visibility!=="hidden"&&r.w<=2&&r.h<=2&&r.text.length>0&&r.label===r.text&&!!r.desc,`${t} footer reason: visually folded, still in the accessibility tree (aria-label + aria-description)`,r);
      const first=m.p1.empty?m.p1:m.p2;ck(r&&r.desc&&emp.some(c=>c.nameText===r.desc),`${t} reason hint equals the approved card label`,{desc:r&&r.desc,labels:emp.map(c=>c.nameText)});
    }
    if(!process.env.D2F_LONG&&name[0]!=="E"){
      const vh=m.vh,clampv=(lo,v,hi)=>Math.min(hi,Math.max(lo,v));
      ck(Math.abs(m.headGap-clampv(24,vh*0.06,60))<=1.5,`${t} heading->cards gap = clamp(24,6vh,60) (${m.headGap}pt)`,m.headGap);
      ck(Math.abs(m.midGap-clampv(20,vh*0.053,56))<=1.5,`${t} cards->shot clock gap = clamp(20,5.3vh,56) (${m.midGap}pt)`,m.midGap);
      if(w===390)ck(m.headGap>=45&&m.headGap<=55&&m.midGap>=40&&m.midGap<=50,`${t} 390pt targets: heading->cards 45-55pt, cards->clock 40-50pt`,[m.headGap,m.midGap]);
      if(w>=390)ck(Math.max(m.topBlank,m.bottomBlank)/Math.max(1,Math.min(m.topBlank,m.bottomBlank))<=1.5,`${t} the tightened space is shared top / bottom (${m.topBlank} / ${m.bottomBlank})`);
    }
  }
  await app.close();
}
if(process.env.D2F_OUT)fs.writeFileSync(process.env.D2F_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,rows,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
