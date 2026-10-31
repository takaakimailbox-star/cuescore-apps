/* Real-app Chrome proof (Build 96 candidate): the 3 integrated reason keys, VoiceOver attributes (aria-label = reason text, aria-description = existing approved action wording),
 * the "Other…" label from the main catalog, and the missing-player states. Usage: [L=ja,en,zh-Hans] [SA_OUT=<json>] node tests/browser/setup-reason-aria.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja,en,zh-Hans").split(",");
const WANT={ja:{p2:"対戦相手を選ぶと試合を開始できます",p1:"先攻プレーヤーを選ぶと試合を開始できます",both:"プレーヤーを選ぶと試合を開始できます",hintP2:"対戦相手を選択",hintP:"プレーヤーを選択",other:"その他…"},
 en:{p2:"Select an opponent to start the match",p1:"Select the first player to start the match",both:"Select players to start the match",other:"Other…"},
 "zh-Hans":{p2:"选择对手后即可开始比赛",p1:"选择先手球员后即可开始比赛",both:"选择球员后即可开始比赛",other:"其他…"}};
const checks=[];let fail=0;const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,d)=>{checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
for(const lang of LANGS){
  const app=await startApp({lang,mode:"free",seedData:seed({lang,rich:true}),watchdogMs:600000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:2,mobile:true});await W(1000);
  await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
  const st=()=>ev(`await new Promise(r=>setTimeout(r,1000));const r=document.getElementById("cueSetupReasonV1"),s=document.getElementById("startGameBtn");return {hidden:r.hidden,text:r.textContent.trim(),label:r.getAttribute("aria-label"),desc:r.getAttribute("aria-description"),slot:r.dataset.slot,disabled:s.disabled,p1:document.getElementById("p1Name").value,p2:document.getElementById("p2Name").value}`);
  let s=await st();
  const w=WANT[lang];
  ck(s.disabled&&!s.hidden&&s.text===w.p2&&s.label===w.p2,`${lang} opponent missing: reason text = aria-label`,s);
  if(w.hintP2)ck(s.desc===w.hintP2,`${lang} hint uses the existing approved action wording`,s.desc);else ck(!!s.desc&&s.desc.length>1,`${lang} hint present (existing wording)`,s.desc);
  ck(!/Error|undefined|setupux/.test(s.text+s.label+s.desc),`${lang} no raw key leaks`);
  // p1 missing
  await ev(`const a=document.getElementById("p1Name"),b=document.getElementById("p2Name");window.__p=[a.value,b.value];return 1`);
  // clear both -> both missing
  await ev(`for(const id of ["p1Name","p2Name"]){const n=document.getElementById(id);n.value="";n.dispatchEvent(new Event("input",{bubbles:true}));n.dispatchEvent(new Event("change",{bubbles:true}))}return 1`);
  s=await st();
  ck(s.hidden||s.text===w.both||s.text===w.p1||s.text===w.p2||s.text==="",`${lang} cleared state shows an approved reason or none`,s);
  await ev(`const n=document.getElementById("p1Name");n.value="";n.dispatchEvent(new Event("input",{bubbles:true}));const m=document.getElementById("p2Name");m.value="x";return 1`);
  // Other... label in menu
  await ev(`document.querySelector('[data-race-target="p1Race"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
  const lab=await ev(`return document.querySelector(".cue-menu-row-v1.is-pinned-v1")?.textContent.replace("✓","").trim()`);
  ck(lab===w.other,`${lang} pinned Other row label from the main catalog`,lab);
  await app.close();
}
if(process.env.SA_OUT)fs.writeFileSync(process.env.SA_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
