/* Real-app Chrome: new-install initial Players ("Score 1" / "Score 2") and every case that must NOT create them.
 * Each scenario boots a fresh isolated profile with a given pre-existing localStorage (script), reads the stored Player library and the screen.
 * Usage: [L=ja,en,zh-Hans] [IP_OUT=<json>] node tests/browser/initial-players.mjs */
import { startApp } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja").split(",");const W=ms=>new Promise(r=>setTimeout(r,ms));
const checks=[];let fail=0;const ck=(ok,label,d)=>{checks.push({ok:!!ok,label,...(d===undefined?{}:{detail:d})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(d))}};
const P=(id,name,extra={})=>({id,name,memo:"",avatar:{type:"default",id:"default_silhouette"},createdAt:1767225600000,updatedAt:1767225600000,lastUsed:null,...extra});
const rec={id:"r1",winner:1,disciplineId:"9ball",gameType:"9ball",players:{1:{name:"Old A",score:9},2:{name:"Old B",score:3}},endedAt:"2026-01-02T00:00:00.000Z",playedAt:"2026-01-02T00:00:00.000Z",startedAt:"2026-01-02T00:00:00.000Z"};
const set=o=>`try{if(!localStorage.getItem("__ip_seeded")){${Object.entries(o).map(([k,v])=>`localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(typeof v==="string"?v:JSON.stringify(v))});`).join("")}localStorage.setItem("__ip_seeded","1");}}catch(e){}`;
const PK="rotationScoreboard.players.v1",RK="rotationScoreboard.matchRecords.v1";
const SCEN=[
 {n:"fresh",ls:{},expect:"seed"},
 {n:"existing-1-player",ls:{[PK]:[P("e1","Aki",{isPrimary:true})]},expect:"keep"},
 {n:"existing-3-players",ls:{[PK]:[P("e1","Aki",{isPrimary:true}),P("e2","Bo"),P("e3","Cy")]},expect:"keep"},
 {n:"existing-0-players(key [])",ls:{[PK]:[]},expect:"keep"},
 {n:"history-only(players absent)",ls:{[RK]:[rec]},expect:"none"},
 {n:"other-usage-key(selectedDiscipline)",ls:{"cueScore.selectedDiscipline.v1":"9ball"},expect:"none"},
 {n:"corrupted-players-json",ls:{[PK]:"{not json"},expect:"corrupt"},
 {n:"initial-deleted(key [] after seed)",ls:{[PK]:[]},expect:"keep"},
 {n:"initial-renamed(Score 1 -> Yuki)",ls:{[PK]:[P("s1","Yuki",{isPrimary:true}),P("s2","Score 2")]},expect:"keep"},
 {n:"restored-backup(replaced library)",ls:{[PK]:[P("b1","Restored A",{isPrimary:true}),P("b2","Restored B")],[RK]:[rec]},expect:"keep"},
 {n:"demo-mode-active",ls:{"cuescore-demo.mode.v1":"demo"},expect:"demo"}
];
for(const lang of LANGS){
  for(const sc of SCEN){
    const t=`${lang}/${sc.n}`;
    const ls={...sc.ls,"cueScore.language.v1":lang};
    const app=await startApp({lang,mode:"free",seedData:{script:set(ls),players:[],records:[]},watchdogMs:300000});
    const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
    await W(800);
    const snap=()=>ev(`const raw=localStorage.getItem("${PK}");let pl=null;try{pl=JSON.parse(raw)}catch(e){}return {raw,pl,rec:localStorage.getItem("${RK}"),p1:document.getElementById("p1Name")?.value,p2:document.getElementById("p2Name")?.value,start:document.getElementById("startGameBtn")?.disabled,guide:(()=>{const g=document.querySelector(".match-player-guide-v18");return !!g&&!g.hidden})(),demo:localStorage.getItem("cuescore-demo.mode.v1")||null,keys:Object.keys(localStorage).filter(k=>k.startsWith("rotationScoreboard.")||k.startsWith("cueScore.")).length}`);
    const before=sc.ls[PK]!==undefined?JSON.stringify(typeof sc.ls[PK]==="string"?sc.ls[PK]:sc.ls[PK]):null;
    const s1=await snap();
    if(sc.expect==="seed"){
      const pl=s1.pl||[];
      ck(pl.length===2&&pl[0].name==="Score 1"&&pl[1].name==="Score 2",`${t} two players Score 1 / Score 2 created`,pl.map(p=>p.name));
      ck(new Set(pl.map(p=>p.id)).size===2&&pl.every(p=>p.id&&String(p.id).length>=8),`${t} independent unique Player IDs`,pl.map(p=>p.id));
      ck(pl[0]?.isPrimary===true&&!pl[1]?.isPrimary,`${t} Score 1 is the main player`);
      ck(s1.p1==="Score 1"&&s1.p2==="Score 2"&&s1.start===false&&!s1.guide,`${t} first launch: both selected, start enabled, add-guide hidden`,{p1:s1.p1,p2:s1.p2,start:s1.start,guide:s1.guide});
      ck(pl.every(p=>p.avatar?.type==="default"&&p.lastUsed===null&&p.memo===""),`${t} ordinary player records (default avatar, unused)`);
      ck(s1.rec===null||s1.rec==="[]",`${t} no match records created`,s1.rec);
      // second launch: no duplicate, same ids
      await app.cdp("Page.reload");await W(4500);
      const s2=await snap();
      ck(s2.pl.length===2&&s2.pl[0].id===pl[0].id&&s2.pl[1].id===pl[1].id,`${t} 2nd launch: no duplicate registration, IDs unchanged`,s2.pl.map(p=>p.id));
      ck(s2.p1==="Score 1",`${t} 2nd launch: main player auto-selected (existing rule)`,s2.p1);
      // rename keeps ID; delete all -> reload never recreates
      await ev(`const a=JSON.parse(localStorage.getItem("${PK}"));a[0].name="Yuki";localStorage.setItem("${PK}",JSON.stringify(a));return 1`);
      await app.cdp("Page.reload");await W(4500);
      const s3=await snap();ck(s3.pl.length===2&&s3.pl[0].id===pl[0].id&&s3.pl[0].name==="Yuki",`${t} renamed initial player keeps its ID and name after restart`,s3.pl.map(p=>p.name));
      await ev(`localStorage.setItem("${PK}","[]");return 1`);
      await app.cdp("Page.reload");await W(4500);
      const s4=await snap();ck(s4.raw==="[]",`${t} after deleting all players a restart does NOT recreate Score 1/2`,s4.raw);
    } else if(sc.expect==="keep"){
      ck(s1.raw===JSON.stringify(typeof sc.ls[PK]==="string"?sc.ls[PK]:sc.ls[PK])||JSON.stringify(s1.pl)===JSON.stringify(sc.ls[PK]),`${t} stored players unchanged (no Score 1/2 added)`,s1.pl&&s1.pl.map(p=>p.name));
      ck(!(s1.pl||[]).some(p=>p.name==="Score 1"||p.name==="Score 2")||sc.n.includes("renamed"),`${t} no initial players added`);
      if(sc.ls[RK])ck(s1.rec===JSON.stringify(sc.ls[RK]),`${t} history unchanged`);
    } else if(sc.expect==="none"){
      ck(s1.raw===null,`${t} players key still absent (existing use detected, nothing added)`,s1.raw);
      if(sc.ls[RK])ck(s1.rec===JSON.stringify(sc.ls[RK]),`${t} history unchanged`);
    } else if(sc.expect==="corrupt"){
      ck(s1.raw==="{not json",`${t} corrupted data left as is, nothing added`,s1.raw);
    } else if(sc.expect==="demo"){
      ck(s1.raw===null,`${t} real player key untouched while demo mode is active`,s1.raw);
    }
    ck(true,`${t} done`);
    await app.close();
  }
}
// language switch after seeding: same stored names and IDs
{
  const app=await startApp({lang:"ja",mode:"free",seedData:{script:set({"cueScore.language.v1":"ja"}),players:[],records:[]},watchdogMs:300000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await W(800);const a=await ev(`return JSON.parse(localStorage.getItem("${PK}")).map(p=>[p.id,p.name])`);
  for(const lg of ["en","zh-Hans","ja"]){await ev(`localStorage.setItem("cueScore.language.v1","${lg}");return 1`);await app.cdp("Page.reload");await W(4500);const b=await ev(`return JSON.parse(localStorage.getItem("${PK}")).map(p=>[p.id,p.name])`);ck(JSON.stringify(a)===JSON.stringify(b),`language ${lg}: stored Player names and IDs unchanged`,b)}
  await app.close();
}
// history protection: delete / rename / re-create the initial players
{
  const app=await startApp({lang:"ja",mode:"free",seedData:{script:set({"cueScore.language.v1":"ja"}),players:[],records:[]},watchdogMs:300000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  await W(800);
  const ids=await ev(`return JSON.parse(localStorage.getItem("${PK}")).map(p=>p.id)`);
  const old=ids[0];
  const r={...rec,id:"hist1",players:{1:{name:"Score 1",registeredPlayerId:old,score:9},2:{name:"Score 2",registeredPlayerId:ids[1],score:3}}};
  await ev(`localStorage.setItem("${RK}",${JSON.stringify(JSON.stringify([r]))});return 1`);
  await app.cdp("Page.reload");await W(4500);
  const recBefore=await ev(`return localStorage.getItem("${RK}")`);
  // rename keeps the ID (editor path writes the same record with a new name)
  await ev(`const a=JSON.parse(localStorage.getItem("${PK}"));a[0].name="Yuki";localStorage.setItem("${PK}",JSON.stringify(a));return 1`);
  await app.cdp("Page.reload");await W(4500);
  ck((await ev(`return JSON.parse(localStorage.getItem("${PK}"))[0].id`))===old,"rename keeps the Player ID");
  // delete through the production function (confirmed) -> the completed match stays, nothing is rewritten
  const del=await ev(`return deletePlayerByIdV1(${JSON.stringify(old)},{confirmed:true})`);
  const after=await ev(`return {pl:JSON.parse(localStorage.getItem("${PK}")).map(p=>p.name),rec:localStorage.getItem("${RK}")}`);
  ck(del===true&&after.pl.length===1&&after.pl[0]==="Score 2","initial player can be deleted like any other",after.pl);
  ck(after.rec===recBefore,"completed match history is unchanged after deleting the player");
  // re-create a player with the same name: new ID, never the old one, history keeps the old ID
  await ev(`const a=JSON.parse(localStorage.getItem("${PK}"));a.push({id:makePlayerId(),name:"Score 1",memo:"",avatar:{type:"default",id:"default_silhouette"},createdAt:1,updatedAt:1,lastUsed:null});localStorage.setItem("${PK}",JSON.stringify(a));return 1`);
  await app.cdp("Page.reload");await W(4500);
  const fin=await ev(`return {pl:JSON.parse(localStorage.getItem("${PK}")),rec:JSON.parse(localStorage.getItem("${RK}"))}`);
  const fresh=fin.pl.find(p=>p.name==="Score 1");
  ck(fresh&&fresh.id!==old,"a new player with the same name gets a different ID",{fresh:fresh&&fresh.id,old});
  ck(fin.rec[0].players[1].registeredPlayerId===old&&fin.pl.length===2,"history keeps the OLD ID; no duplicate initial registration",fin.rec[0].players[1]);
  await app.close();
}
if(process.env.IP_OUT)fs.writeFileSync(process.env.IP_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);process.exit(fail?1:0);
