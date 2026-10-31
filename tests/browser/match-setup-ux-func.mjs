/* Match-setup UX trial (Build 95 candidate): functional proof in real headless Chrome (NOT part of `node --test`). Usage: [L=ja|en|zh-Hans] [MS_OUT=<log>] node tests/browser/match-setup-ux-func.mjs  (exit 1 on failure)
 * Checks: the disabled start button + reason line + empty-player state; Skill Level / 14-1 / 3 Cushion / Rotation tap menus (existing sheet applies the value; cancel / Escape keep it; "Other" opens the existing custom input);
 * 9-Ball (long list) keeps the existing sheet; clock base / extension menus and the unchanged store; selecting an opponent enables the start button; a real start. Chrome only: NOT a device result. */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const lang=process.env.L||"ja";let fail=0;const res=[];
const ck=(ok,m)=>{res.push((ok?"ok   ":"FAIL ")+m);if(!ok)fail++;console.log(ok?"ok  ":"FAIL",m)};
const app=await startApp({lang,mode:"free",seedData:seed({lang,rich:true}),watchdogMs:200000});
const ev=c=>app.evalJs(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));${c}})()`);
await app.cdp("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:2,mobile:true});
await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:47,bottom:34,left:0,right:0}});
const W=ms=>new Promise(r=>setTimeout(r,ms));
const shot=async f=>{const p=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(f,Buffer.from(p.data,"base64"))};
await ev(`await W(1200)`);
const disc=async d=>ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await W(500)}document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await W(900);const c=document.getElementById("cueInProgressChoiceV1");if(c&&!c.classList.contains("hidden")){document.getElementById("cueInProgressNewV1").click();await W(800)}`);
const q=(s)=>app.evalJs(s);
const tapAt=async(x,y)=>{await app.cdp("Input.dispatchMouseEvent",{type:"mousePressed",x,y,button:"left",clickCount:1});await app.cdp("Input.dispatchMouseEvent",{type:"mouseReleased",x,y,button:"left",clickCount:1})};   // real pointer events: an el.click() would not have caught the aria-hidden scrim defect
const menuRows=()=>q(`JSON.stringify([...document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")].map(b=>b.textContent.trim().replace(/\\s+/g," ")))`).then(JSON.parse);
const hidden=()=>q(`document.getElementById("newMatchRacePickerV1").classList.contains("hidden")`);
// --- initial: opponent unselected -> disabled start + reason + empty class
await disc("jpa9");
let st=JSON.parse(await q(`JSON.stringify({dis:document.getElementById("startGameBtn").disabled,aria:document.getElementById("startGameBtn").getAttribute("aria-disabled"),reasonHidden:document.getElementById("cueSetupReasonV1").hidden,reason:document.getElementById("cueSetupReasonV1").textContent,empty2:document.getElementById("newMatchPlayerCard2V1").classList.contains("is-empty-v1"),empty1:document.getElementById("newMatchPlayerCard1V1").classList.contains("is-empty-v1"),inFooter:!!document.querySelector("#cueSetupFooterV1 #startGameBtn")})`));
ck(st.dis===true&&st.inFooter,"start button keeps the HTML disabled attribute while the opponent is unselected (and sits in the footer)");
ck(!st.reasonHidden&&st.reason.length>3,"reason line shown: "+st.reason);
ck(st.empty2&&!st.empty1,"only the opponent card is in the empty state");
// disabled start click does nothing
await q(`document.getElementById("startGameBtn").click();1`);await W(300);
ck(await q(`!document.querySelector("#proGameScreen")||!document.querySelector("#proGameScreen").getClientRects().length`),"clicking the disabled start button starts nothing");
// --- JPA SL menu
await q(`document.querySelector("[data-race-target=p1Race]").click();1`);await W(900);
let rows=await menuRows();ck(rows.length===9&&hidden()===false||rows.length===9,"JPA Skill Level opens a tap menu with 9 rows: "+rows.slice(0,3).join(" | "));
ck(await q(`getComputedStyle(document.getElementById("newMatchRacePickerV1")).opacity==="0"`),"the existing sheet is invisible while the menu is shown");

await q(`document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")[6].click();1`);await W(900);
ck(await q(`document.getElementById("p1RaceDisplayV2").textContent==="SL 7"&&document.getElementById("p1Race").value==="55"`),"choosing SL 7 applies through the existing sheet code (display SL 7, target 55)");
ck(await q(`!document.querySelector(".cue-menu-layer-v1")&&document.getElementById("newMatchRacePickerV1").classList.contains("hidden")`),"menu and sheet both closed after the choice");
// cancel keeps value
await q(`document.querySelector("[data-race-target=p2Race]").click();1`);await W(900);await tapAt(6,6);await W(300);
ck(await q(`!document.querySelector(".cue-menu-layer-v1")&&document.getElementById("newMatchRacePickerV1").classList.contains("hidden")&&document.getElementById("p2RaceDisplayV2").textContent==="SL 5"`),"cancel (tap outside) closes everything and keeps SL 5");
// Escape
await q(`document.querySelector("[data-race-target=p2Race]").click();1`);await W(900);await q(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));1`);await W(300);
ck(await q(`!document.querySelector(".cue-menu-layer-v1")&&document.getElementById("newMatchRacePickerV1").classList.contains("hidden")`),"Escape closes the menu and the sheet");
// --- 14-1 / 3C / Rotation: menu + other(custom)
for(const [d,vals,lim] of [["straightPool",[25,50,75,100,125,150],"1〜1000"],["threeCushion",Array.from({length:34},(_,i)=>i+7),"1〜100"],["rotation",[61,90,120,150,180,240,300],"1〜1000"]]){
  await disc(d);await q(`document.querySelector("[data-race-target=p1Race]").click();1`);await W(900);
  rows=await menuRows();ck(rows.length===vals.length+1&&vals.every((v,i)=>rows[i].startsWith(String(v))),d+" menu rows = existing options + Other: "+rows.join(","));
  await q(`document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")[1].click();1`);await W(900);
  ck(await q(`document.getElementById("p1RaceDisplayV2").textContent==="${vals[1]}"`),d+" value change applied ("+vals[1]+")");
  await q(`document.querySelector("[data-race-target=p1Race]").click();1`);await W(900);
  await q(`[...document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")].pop().click();1`);await W(500);
  const cu=JSON.parse(await q(`JSON.stringify({sheetVisible:getComputedStyle(document.getElementById("newMatchRacePickerV1")).opacity,custom:!document.getElementById("newMatchRaceCustomV1").classList.contains("hidden"),menu:!!document.querySelector(".cue-menu-layer-v1"),ph:document.getElementById("newMatchRaceCustomInputV1").placeholder})`));
  ck(cu.custom&&cu.sheetVisible!=="0"&&!cu.menu,d+" 'Other' opens the existing custom input (range "+cu.ph+")");
  await q(`document.getElementById("newMatchRacePickerCloseV1").click();1`);await W(300);
}
// --- 9-Ball: 1-10 + Other is a tap menu too (Build 95 PO feedback)
await disc("9ball");await q(`document.querySelector("[data-race-target=p1Race]").click();1`);await W(900);
rows=await menuRows();ck(rows.length===11,"9-Ball menu rows = 1-10 + Other: "+rows.join(","));
await q(`document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")[6].click();1`);await W(300);
ck(await q(`document.getElementById("p1RaceDisplayV2").textContent==="7"`),"9-Ball menu choice applied (7)");
// --- clock menus
await q(`const sw=document.querySelector(".cue-sc-switch");if(sw.getAttribute("aria-checked")!=="true")sw.click();1`);await W(300);
await q(`document.querySelector(".cue-sc-val-base").click();1`);await W(300);rows=await menuRows();
ck(JSON.stringify(rows.map(r=>parseInt(r)))===JSON.stringify([30,35,40,45,60]),"base-time menu = 30/35/40/45/60 ("+rows.join(",")+")");

await q(`document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")[1].click();1`);await W(300);
await q(`document.querySelector(".cue-sc-val-ext").click();1`);await W(300);rows=await menuRows();
ck(JSON.stringify(rows.map(r=>parseInt(r.replace("+",""))))===JSON.stringify([25,30,45,60]),"extension menu = +25/+30/+45/+60 ("+rows.join(",")+")");
await q(`document.querySelectorAll(".cue-menu-v1 .cue-menu-row-v1")[2].click();1`);await W(300);
const store=JSON.parse(await q(`localStorage.getItem("cueScore.shotClock.v1")`));
ck(store.enabled===true&&store.base===35&&store.ext===45,"clock settings saved in the unchanged store {enabled,base:35,ext:45}: "+JSON.stringify({e:store.enabled,b:store.base,x:store.ext}));
ck(await q(`document.querySelector(".cue-sc-val-base .cue-sc-val-v").textContent.startsWith("35")&&document.querySelector(".cue-sc-val-ext .cue-sc-val-v").textContent.startsWith("+45")`),"values shown after the choice (35 / +45)");
// --- select opponent -> start enabled, empty gone, reason gone
await q(`document.getElementById("p2PlayerSearchBtn").click();1`);await W(500);await q(`document.querySelector("[data-select-player]")?.click();1`);await W(700);
st=JSON.parse(await q(`JSON.stringify({dis:document.getElementById("startGameBtn").disabled,reasonHidden:document.getElementById("cueSetupReasonV1").hidden,empty2:document.getElementById("newMatchPlayerCard2V1").classList.contains("is-empty-v1"),name:document.getElementById("p2NameDisplayV1").textContent})`));
ck(st.dis===false&&st.reasonHidden&&!st.empty2,"after choosing an opponent: start enabled, reason hidden, empty state gone ("+st.name+")");

// reason line -> opens the existing selection
// start for real
await q(`document.getElementById("startGameBtn").click();1`);await W(1800);
ck(await q(`!!document.querySelector("#proGameScreen")&&document.querySelector("#proGameScreen").getClientRects().length>0`),"an enabled start button really starts the match");
ck(await q(`!!document.querySelector(".cue-sc-dock")`)&&JSON.parse(await q(`JSON.stringify(window.CueScoreShotClockV1.debug())`)).base===35,"the match screen shows the clock dock with the chosen base time (35)");
console.log(fail?"FAIL "+fail:"PASS");if(process.env.MS_OUT)fs.writeFileSync(process.env.MS_OUT,res.join("\n")+"\n"+(fail?"FAIL "+fail:"PASS")+"\n");
await app.close();process.exit(fail?1:0);
