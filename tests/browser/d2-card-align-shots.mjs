/* Evidence screenshots (isolated data): natural main-player-0 start screen. Usage: [P2_APP_ROOT=<unfixed tree>] AS_TAG=before|after AS_DIR=<dir> node tests/browser/d2-card-align-shots.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const W=ms=>new Promise(r=>setTimeout(r,ms));const tag=process.env.AS_TAG,dir=process.env.AS_DIR;fs.mkdirSync(dir,{recursive:true});
for(const [lang,w] of [["ja",380],["ja",390],["en",390]]){
  const s=seed({lang,rich:false,synthetic:false,link:false});const players=s.players.slice(0,3).map(p=>{const q={...p};delete q.isPrimary;return q});
  const script=`try{if(!localStorage.getItem("__as")){localStorage.setItem("rotationScoreboard.players.v1",${JSON.stringify(JSON.stringify(players))});localStorage.setItem("rotationScoreboard.matchRecords.v1","[]");localStorage.setItem("cueScore.language.v1","${lang}");localStorage.setItem("__as","1")}}catch(e){}`;
  const app=await startApp({lang,mode:"free",seedData:{script,players:[],records:[]},watchdogMs:200000});
  const ev=c=>app.evalJs(`(async()=>{${c}})()`);
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:844,deviceScaleFactor:2,mobile:true});await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:47,bottom:34,left:0,right:0}});await W(1000);
  await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await new Promise(r=>setTimeout(r,1000));return 1`);await W(1200);
  const shot=async n=>{const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${dir}/${lang}_${w}_${n}_${tag}.png`,Buffer.from(r.data,"base64"))};
  await shot("A_natural_both_unselected");
  await ev(`const p=CueScoreBuild18PlayerSelection.validPlayers();selectedRegisteredPlayer[2]=p[1].id;document.getElementById("p2Name").value=p[1].name;syncSelectedPlayerAvatarV2(2,p[1]);syncNewMatchNameV1("p2Name","p2NameDisplayV1");CueScoreBuild18PlayerSelection.refresh();await new Promise(r=>setTimeout(r,1200));return 1`);
  await shot("B_natural_P1_unselected_P2_selected");
  await app.close();
}
