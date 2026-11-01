/* Long player names (1 and 2 lines) in the grouped cards: name->Race to stays 8-12pt, nothing overflows or overlaps. Visual-only name injection (no data written).
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] [SL_SHOTS=<dir>] node tests/browser/setup-card-longname.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja,en,zh-Hans").split(","),VIEWS={320:568,375:667,390:844,430:932},WIDTHS=(process.env.W||"320,390").split(",").map(Number);
const NAMES={ja:["小瀬古隆太郎スペシャルエディション","あ"],en:["Alexander Montgomery-Wellington III","Al"],"zh-Hans":["欧阳明轩上官云飞司徒空","李"]};
let fail=0,n=0;const W=ms=>new Promise(r=>setTimeout(r,ms));
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],app=await startApp({lang,mode:"free",seedData:seed({lang,rich:true}),watchdogMs:600000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});await W(1000);
  await ev(`document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="9ball"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
  const m=await ev(`const R=n=>n.getBoundingClientRect(),out=[];for(const k of [1,2]){const c=document.querySelector("#newMatchPlayerCard"+k+"V1"),nm=c.querySelector(".new-match-player-name-v1");nm.textContent=${JSON.stringify(NAMES[lang][0])};}
   await new Promise(r=>setTimeout(r,200));for(const k of [1,2]){const c=document.querySelector("#newMatchPlayerCard"+k+"V1"),nm=c.querySelector(".new-match-player-name-v1"),race=c.querySelector(".new-match-race-row-v2"),rn=R(nm),rr=R(race),rc=R(c);out.push({k,gap:+(rr.top-rn.bottom).toFixed(1),nameInCard:rn.left>=rc.left-0.5&&rn.right<=rc.right+0.5,raceInCard:rr.bottom<=rc.bottom+0.5,nameH:Math.round(rn.height)})}
   return {out,h:document.documentElement.scrollWidth>innerWidth+1,cardH:[1,2].map(k=>Math.round(R(document.querySelector("#newMatchPlayerCard"+k+"V1")).height))}`);
  for(const o of m.out){n++;const ok=o.gap>=8&&o.gap<=12.5&&o.nameInCard&&o.raceInCard&&!m.h;if(!ok){fail++;console.log("FAIL",lang,w,JSON.stringify(o),m.h)}}
  if(process.env.SL_SHOTS){fs.mkdirSync(process.env.SL_SHOTS,{recursive:true});const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.SL_SHOTS}/longname_${lang}_${w}.png`,Buffer.from(r.data,"base64"))}
  console.log(lang,w,JSON.stringify(m.out.map(o=>[o.gap,o.nameH])),"cardH",m.cardH);
  await app.close();
}
console.log(fail?`FAIL ${fail}/${n}`:`PASS ${n}/${n}`);process.exit(fail?1:0);
