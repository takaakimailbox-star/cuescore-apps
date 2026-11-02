/* ISOLATED PROTOTYPE (D plan, 2nd UI improvement). NO product file is changed: the "After" is CSS injected into the throw-away test browser.
 * Before = the product as it is on main; After = bigger cards / avatar / name, in-card (i) guidance instead of the blue-grey note, calmer shot clock, wider heading gap.
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] D2_OUT=<json> D2_SHOT=<dir> [D2_LONG=1] node tests/browser/d2-prototype.mjs */
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
const MEAS=`const R=n=>n.getBoundingClientRect(),$=s=>document.querySelector(s),cs=n=>getComputedStyle(n),vis=n=>!!n&&!n.hidden&&n.getClientRects().length>0;
const hd=$(".cue-selected-game-v1"),grid=$(".new-match-player-grid-v1"),sc=$("#cueHomeV1 .cue-new-match-integrated-v2"),start=$("#startGameBtn"),tab=$(".cue-phase1-tab-bar"),foot=$("#cueSetupFooterV1"),clock=$(".cue-sc-setup");
const card=n=>{const c=$("#newMatchPlayerCard"+n+"V1"),nm=c.querySelector(".new-match-player-name-v1"),av=c.querySelector(".new-match-avatar-v1"),race=c.querySelector(".new-match-race-row-v2"),rv=race.querySelector("strong"),lh=parseFloat(cs(nm).lineHeight)||parseFloat(cs(nm).fontSize)*1.2;return {empty:c.classList.contains("is-empty-v1"),top:+R(c).top.toFixed(1),w:Math.round(R(c).width),h:Math.round(R(c).height),av:Math.round(R(av).width),nameFont:parseFloat(cs(nm).fontSize),nameBoxH:Math.round(R(nm).height),nameLines:Math.max(1,Math.round(nm.scrollHeight/lh)),nameText:nm.textContent.trim(),nameClipped:nm.scrollWidth>nm.clientWidth+1&&cs(nm).textOverflow==="ellipsis",avName:+(R(nm).top-R(av).bottom).toFixed(1),nameRace:+(R(race).top-R(nm).bottom).toFixed(1),raceTop:Math.round(R(race).top-R(c).top),raceFont:parseFloat(cs(rv).fontSize),raceH:Math.round(R(race).height)}};
const items=[...sc.querySelectorAll("button,[role=switch]")].filter(n=>n.getClientRects().length&&R(n).height>8&&!n.classList.contains("cue-match-setup-back-v3")&&!n.closest("#newMatchRacePickerV1"));
const last=Math.max(...[...sc.children].filter(k=>k.getClientRects().length&&!k.matches(".cue-match-setup-back-v3")).map(k=>R(k).bottom));
const note=$("#cueSetupOppNoteV1"),rs=$("#cueSetupReasonV1");
return {vh:innerHeight,headGap:Math.round(R(grid).top-R(hd).bottom),p1:card(1),p2:card(2),cardsAligned:Math.abs(R($("#newMatchPlayerCard1V1")).top-R($("#newMatchPlayerCard2V1")).top)<=1&&Math.abs(R($("#newMatchPlayerCard1V1")).height-R($("#newMatchPlayerCard2V1")).height)<=1,
 clockH:Math.round(R(clock).height),clockGapAbove:Math.round(R(clock).top-R(grid).bottom),clockTitle:parseFloat(cs(clock.querySelector(".cue-sc-setup-title")).fontSize),
 bottomEmpty:Math.round(R(foot).top-last),startToTab:Math.round(R(tab).top-R(start).bottom),scrollNeeded:sc.scrollHeight-sc.clientHeight,hscroll:document.documentElement.scrollWidth>innerWidth+1||sc.scrollWidth>sc.clientWidth+1,
 small:items.filter(n=>R(n).width<44||R(n).height<44).map(n=>(n.id||n.className).toString().slice(0,22)+":"+Math.round(R(n).width)+"x"+Math.round(R(n).height)),
 noteShown:vis(note),reason:vis(rs)?rs.textContent.trim():null,startDisabled:start.disabled}`;
const rows=[];const W=ms=>new Promise(r=>setTimeout(r,ms));
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],tag=`${lang}/${w}`;
  const app=await startApp({lang,mode:"free",seedData:{script:`try{if(!localStorage.getItem("__d2")){localStorage.setItem("cueScore.language.v1","${lang}");localStorage.setItem("__d2","1")}}catch(e){}`,players:[],records:[]},watchdogMs:900000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});await W(1000);
  await ev(`window.__orig=window.initializePrimaryMatchSetupV1;return 1`);
  if(process.env.D2_LONG){await ev(`const a=JSON.parse(localStorage.getItem("rotationScoreboard.players.v1"));a[0].name=${JSON.stringify(lang==="en"?"Christopher Alexander":"あいうえおかきくけこさしすせそ")};a[1].name=${JSON.stringify(lang==="en"?"Bartholomew Montgomery":"ABCDEFGHIJKLMNOPQRSTUVWXYZ")};localStorage.setItem("rotationScoreboard.players.v1",JSON.stringify(a));return 1`);await app.cdp("Page.reload");await W(4500)}
  const shot=async n=>{fs.mkdirSync(process.env.D2_SHOT,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.D2_SHOT}/${lang}_${w}_${n}.png`,Buffer.from(r.data,"base64"))};
  const open=d=>ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await new Promise(r=>setTimeout(r,500))};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
  const settle=()=>ev(`CueScoreBuild18PlayerSelection.refresh();document.dispatchEvent(new Event("input"));await new Promise(r=>setTimeout(r,1200));return 1`);
  const reset=()=>ev(`window.initializePrimaryMatchSetupV1=window.__orig;const p=CueScoreBuild18PlayerSelection.validPlayers();selectedRegisteredPlayer={1:p[0].id,2:p[1].id};for(const[s,pl]of [[1,p[0]],[2,p[1]]]){document.getElementById("p"+s+"Name").value=pl.name;syncSelectedPlayerAvatarV2(s,pl);syncNewMatchNameV1("p"+s+"Name","p"+s+"NameDisplayV1")}return 1`);
  const STATES=[["A_both_unselected","9ball",`window.initializePrimaryMatchSetupV1=()=>false;selectedRegisteredPlayer={1:null,2:null};document.getElementById("p1Name").value="";document.getElementById("p2Name").value="";return 1`],
    ["B_P1_selected_P2_unselected","9ball",`selectedRegisteredPlayer[2]=null;document.getElementById("p2Name").value="";return 1`],
    ["C_both_selected","9ball",`return 1`],["D_jpa9_both_selected","jpa9",`return 1`]];
  for(const [name,disc,setup] of STATES){
    await open(disc);await reset();await ev(setup);await settle();
    const before=await ev(MEAS);await shot(`${name}_before`);
    await ev(`const st=document.createElement("style");st.id="d2proto";st.textContent=${JSON.stringify(AFTER_CSS)};document.body.appendChild(st);await new Promise(r=>setTimeout(r,500));return 1`);
    const after=await ev(MEAS);await shot(`${name}_after`);
    await ev(`document.getElementById("d2proto")?.remove();return 1`);
    rows.push({tag,state:name,long:!!process.env.D2_LONG,before,after});
  }
  await app.close();
}
fs.writeFileSync(process.env.D2_OUT,JSON.stringify({timestamp:new Date().toISOString(),rows},null,1)+"\n");console.log("rows",rows.length);
