/* Real-app Chrome: D plan match-setup UI (PO 2026-11-01). Natural first launch (fresh install -> Score 1 / Score 2 both selected) and the unselected-opponent state.
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] [DP_OUT=<json>] [DP_SHOT=<dir>] node tests/browser/d-plan-setup.mjs */
import { startApp } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"390").split(",").map(Number);
const DISCS=["9ball","10ball","jpa9","rotation","straightPool","threeCushion"];
const C_GAP={320:11,375:13,390:16,430:18};          // C-plan header-to-cards gap (measured on main 168ccfd)
const checks=[];let fail=0;const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,d)=>{checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
const MEAS=`const R=n=>n.getBoundingClientRect(),$=s=>document.querySelector(s),cs=n=>getComputedStyle(n),hd=$(".cue-selected-game-v1"),grid=$(".new-match-player-grid-v1"),sc=$("#cueHomeV1 .cue-new-match-integrated-v2"),start=$("#startGameBtn"),tab=$(".cue-phase1-tab-bar");
const card=n=>{const c=$("#newMatchPlayerCard"+n+"V1"),nm=c.querySelector(".new-match-player-name-v1"),av=c.querySelector(".new-match-avatar-v1"),race=c.querySelector(".new-match-race-row-v2"),s=cs(c),a=cs(av);return {empty:c.classList.contains("is-empty-v1"),top:R(c).top,h:R(c).height,bs:s.borderTopStyle,bw:s.borderTopWidth,bc:s.borderTopColor,abs:a.borderTopStyle,abc:a.borderTopColor,nf:parseFloat(cs(nm).fontSize),nOver:nm.scrollWidth>nm.clientWidth+1&&cs(nm).textOverflow!=="ellipsis",avName:+(R(nm).top-R(av).bottom).toFixed(1),nameRace:+(R(race).top-R(nm).bottom).toFixed(1),plus:getComputedStyle(av,"::before").content,
  red:[...c.querySelectorAll("*"),c].some(e=>{const q=cs(e);return [q.borderTopColor,q.color,q.backgroundColor,q.textDecorationColor].some(v=>{const m=/rgba?\\((\\d+), (\\d+), (\\d+)/.exec(v);return m&&+m[1]>150&&+m[2]<90&&+m[3]<90})})}};
const items=[...sc.querySelectorAll("button,[role=switch]")].filter(n=>n.getClientRects().length&&R(n).height>8&&!n.classList.contains("cue-match-setup-back-v3")&&!n.closest("#newMatchRacePickerV1"));
const note=$("#cueSetupOppNoteV1"),noteOn=!!note&&!note.hidden&&note.getClientRects().length>0,rs=$("#cueSetupReasonV1"),rsOn=!!rs&&!rs.hidden;
return {gap:Math.round(R(grid).top-R(hd).bottom),p1:card(1),p2:card(2),p1Name:$("#p1Name").value,p2Name:$("#p2Name").value,startDisabled:start.disabled,hscroll:document.documentElement.scrollWidth>innerWidth+1||sc.scrollWidth>sc.clientWidth+1,scrollNeeded:sc.scrollHeight-sc.clientHeight,small:items.filter(n=>R(n).width<44||R(n).height<44).map(n=>(n.id||n.className).toString().slice(0,24)),startToTab:Math.round(R(tab).top-R(start).bottom),noteText:noteOn?note.textContent.trim().replace(/^i/,""):null,noteAria:noteOn?note.getAttribute("aria-hidden"):null,reasonText:rsOn?rs.textContent.trim():null,errs:window.__errs||[]}`;
const rows=[];
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],tag=`${lang}/${w}`;
  const app=await startApp({lang,mode:"free",seedData:{script:`try{if(!localStorage.getItem("__dp")){localStorage.setItem("cueScore.language.v1","${lang}");localStorage.setItem("__dp","1")}}catch(e){}`,players:[],records:[]},watchdogMs:600000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});await W(1000);
  await ev(`window.__errs=[];addEventListener("error",e=>__errs.push(String(e.message)));return 1`);
  const shot=async n=>{if(!process.env.DP_SHOT)return;fs.mkdirSync(process.env.DP_SHOT,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.DP_SHOT}/${lang}_${w}_${n}.png`,Buffer.from(r.data,"base64"))};
  for(const d of DISCS){
    const t=`${tag}/${d}`;
    await ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await new Promise(r=>setTimeout(r,500))};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
    // natural first launch: Score 1 / Score 2 both selected
    const a=await ev(MEAS);rows.push({t,state:"both-selected",...a});if(d==="9ball")await shot("both_selected");
    ck(a.p1Name==="Score 1"&&a.p2Name==="Score 2"&&!a.startDisabled,`${t} first launch: Score 1 / Score 2 selected, start enabled`,{p1:a.p1Name,p2:a.p2Name,dis:a.startDisabled});
    for(const k of ["p1","p2"]){const c=a[k];
      ck(!c.empty&&c.bs==="solid",`${t} ${k} selected card: solid frame`,{bs:c.bs});
      ck(Math.abs(c.nf-23)<=0.6,`${t} ${k} selected name 23pt (D2)`,c.nf);
      ck(c.avName>=3.5&&c.avName<=5,`${t} ${k} avatar->name 4pt`,c.avName);
      ck(Math.abs(c.nameRace-10)<=0.7,`${t} ${k} name->Race to 10pt`,c.nameRace);
      ck(!c.red,`${t} ${k} no red`);}
    ck(Math.abs(a.p1.top-a.p2.top)<=1&&Math.abs(a.p1.h-a.p2.h)<=1,`${t} both cards aligned (top/height)`,{t:[a.p1.top,a.p2.top],h:[a.p1.h,a.p2.h]});
    ck(a.gap>=C_GAP[w]+30,`${t} discipline->cards gap widened vs C plan (${C_GAP[w]}pt; D2 spreads the spare height)`,a.gap);
    ck(!a.hscroll&&a.small.length===0&&!a.p1.nOver&&!a.p2.nOver,`${t} no overflow, targets >=44pt`,{h:a.hscroll,s:a.small});
    ck(a.noteText===null&&a.reasonText===null,`${t} both selected: no guidance shown`,{n:a.noteText,r:a.reasonText});
    ck(!(a.errs||[]).length,`${t} no JS exceptions`,a.errs);
    // opponent unselected (what every later launch shows): the existing selection can be cleared the same way the app does on delete
    await ev(`selectedRegisteredPlayer[2]=null;document.getElementById("p2Name").value="";CueScoreBuild18PlayerSelection.refresh();document.dispatchEvent(new Event("input"));await new Promise(r=>setTimeout(r,1300));return 1`);
    const b=await ev(MEAS);rows.push({t,state:"p2-unselected",...b});if(d==="9ball")await shot("p2_unselected");
    ck(b.p2.empty&&b.p2.bs==="dashed"&&b.p2.abs==="dashed",`${t} unselected card AND avatar ring are dashed`,{card:b.p2.bs,av:b.p2.abs});
    const grey=s=>{const m=/rgb\((\d+), (\d+), (\d+)/.exec(s);return !!m&&+m[1]>=170&&Math.abs(m[1]-m[2])<=6&&Math.abs(m[2]-m[3])<=6};
    ck(grey(b.p2.bc)&&grey(b.p2.abc),`${t} unselected frame colours are light grey`,{c:b.p2.bc,a:b.p2.abc});
    ck(b.p1.bs==="solid"&&!b.p1.empty,`${t} selected P1 stays solid`);
    ck(b.p2.plus==='"+"',`${t} add mark (+) kept`,b.p2.plus);
    ck(!b.p2.red&&!b.p1.red,`${t} no red warning mark / text`);
    ck(Math.abs(b.p1.top-b.p2.top)<=1&&Math.abs(b.p1.h-b.p2.h)<=1,`${t} mixed cards aligned (top/height)`,{t:[b.p1.top,b.p2.top],h:[b.p1.h,b.p2.h]});
    ck(Math.abs(b.p2.nameRace-10)<=0.7&&b.p2.avName>=3.5&&b.p2.avName<=5,`${t} unselected card spacing 4 / 10pt`,{a:b.p2.avName,n:b.p2.nameRace});
    ck(b.startDisabled&&b.noteText===null&&!!b.reasonText,`${t} unselected: start disabled, no blue-grey note, approved footer reason kept in the accessibility tree (D2)`,{n:b.noteText,r:b.reasonText});
    ck(!b.hscroll&&b.small.length===0&&!b.p2.nOver,`${t} no overflow, targets >=44pt`,{h:b.hscroll,s:b.small});
    if(w>=390)ck(Math.abs(b.startToTab-(w===390?24:26))<=1,`${t} start->tab-bar gap kept`,b.startToTab);
    // restore selection for the next discipline (library path is exercised by the existing tests)
    await ev(`CueScoreBuild18PlayerSelection.refresh();const s=CueScoreBuild18PlayerSelection.validPlayers();const o=s.find(p=>String(p.id)!==String(selectedRegisteredPlayer[1]));selectedRegisteredPlayer[2]=o.id;document.getElementById("p2Name").value=o.name;syncSelectedPlayerAvatarV2(2,o);syncNewMatchNameV1("p2Name","p2NameDisplayV1");CueScoreBuild18PlayerSelection.refresh();await new Promise(r=>setTimeout(r,500));return 1`);
  }
  await app.close();
}
if(process.env.DP_OUT)fs.writeFileSync(process.env.DP_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,rows,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
