import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"outputs/player-list-bottom-navigation");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".json":"application/json",".webmanifest":"application/manifest+json"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=new URL(request.url,"http://127.0.0.1").pathname;
    const target=pathname==="/"?"index.html":decodeURIComponent(pathname.slice(1));
    const file=path.resolve(root,target);
    if(!file.startsWith(`${root}${path.sep}`)&&file!==path.join(root,"index.html"))throw new Error("outside root");
    response.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream","cache-control":"no-store"});
    response.end(await readFile(file));
  }catch(_){response.writeHead(404);response.end("Not found");}
});

const names=["検索確認 あおい","検索確認 しょう","かいと","小瀬古 隆太郎","有栖川 結衣花","山田 太郎","佐藤 美咲","長いプレーヤー名の表示確認用","鈴木 一郎","高橋 さくら","伊藤 海","渡辺 結菜"];
const players=count=>Array.from({length:count},(_,index)=>({
  id:`player-bottom-inset-${String(index+1).padStart(2,"0")}`,
  name:names[index]||`プレーヤー ${index+1}`,
  memo:"",
  isPrimary:index===0,
  avatar:{type:"default",id:"default_silhouette"},
  createdAt:Date.UTC(2026,8,1+index),
  updatedAt:Date.UTC(2026,8,1+index),
  lastUsed:Date.UTC(2026,8,20+index)
}));
const records=count=>Array.from({length:count},(_,index)=>({
  id:`record-bottom-inset-${String(index+1).padStart(2,"0")}`,
  gameType:index%2?"nineBall":"tenBall",
  recordSchemaVersion:4,
  createdByAppVersion:"1.2",
  playedAt:new Date(Date.UTC(2026,8,28-index,6,index)).toISOString(),
  endedAt:new Date(Date.UTC(2026,8,28-index,6,index+20)).toISOString(),
  winner:index%2?1:2,
  players:{
    1:{name:"あおい",registeredPlayerId:"player-bottom-inset-01",goal:7,score:index%2?7:4},
    2:{name:"しょう",registeredPlayerId:"player-bottom-inset-02",goal:7,score:index%2?5:7}
  }
}));

await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:["--disable-background-networking","--force-color-profile=srgb"]});
const origin=`http://127.0.0.1:${server.address().port}`;

async function pageFor(playerCount,recordCount,viewport={width:390,height:844}){
  const page=await browser.newPage({viewport,deviceScaleFactor:1,colorScheme:"light"});
  await page.addInitScript(({playerRows,recordRows})=>{
    localStorage.setItem("rotationScoreboard.players.v1",JSON.stringify(playerRows));
    localStorage.setItem("rotationScoreboard.matchRecords.v1",JSON.stringify(recordRows));
  },{playerRows:players(playerCount),recordRows:records(recordCount)});
  await page.goto(`${origin}/index.html`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>window.CueScoreNavigationPhase1&&typeof renderPlayerLibrary==="function"&&typeof renderMatchRecords==="function");
  return page;
}

const rounded=value=>Math.round(Number(value)*100)/100;
async function playerAudit(count,{captureTop=false,captureBottom=false,keyboardEquivalent=false}={}){
  const page=await pageFor(count,0);
  await page.evaluate(()=>window.CueScoreNavigationPhase1.openRoot("player"));
  await page.locator("#playerLibraryOverlay:not(.hidden)").waitFor({state:"visible"});
  if(count)await page.locator("#playerLibraryList .player-management-row-v1").nth(count-1).waitFor();
  else await page.locator("#playerLibraryList .player-library-empty").waitFor();
  await page.waitForTimeout(80);
  if(captureTop){
    await page.evaluate(()=>{window.scrollTo(0,0);document.getElementById("playerLibraryList").scrollTop=0;});
    await page.screenshot({path:path.join(output,`Player_${count}_Normal_390x844.png`),animations:"disabled"});
  }
  let searchIntegrity=null;
  if(count>1){
    const expectedId="player-bottom-inset-01";
    const measureSearch=async query=>{
      await page.locator("#playerLibrarySearch").fill(query);
      await page.waitForTimeout(80);
      return page.evaluate(()=>{
        const list=document.getElementById("playerLibraryList"),rows=[...list.querySelectorAll(":scope > .player-management-row-v1")],last=rows.at(-1),listRect=list.getBoundingClientRect(),lastRect=last?.getBoundingClientRect(),info=row=>row?.querySelector(":scope > .player-hub-info-v3"),edit=row=>row?.querySelector(":scope > .player-hub-edit-v3");
        return {query:document.getElementById("playerLibrarySearch")?.value||"",rowCount:rows.length,infoCount:list.querySelectorAll(".player-hub-info-v3").length,editCount:list.querySelectorAll(".player-hub-edit-v3").length,blankRows:rows.filter(item=>!info(item)?.dataset.statsPlayer).length,orphanControls:list.querySelectorAll(":scope > .player-hub-info-v3,:scope > .player-hub-edit-v3").length,trailingCardSpace:lastRect?listRect.bottom-lastRect.bottom:null,paddingBottom:getComputedStyle(list).paddingBottom,maxScroll:list.scrollHeight-list.clientHeight,ids:rows.map(row=>({info:info(row)?.dataset.statsPlayer||"",edit:edit(row)?.dataset.editPlayer||""}))};
      });
    };
    const one=await measureSearch(names[0]);
    const two=await measureSearch("検索確認");
    searchIntegrity={one,two,pass:one.rowCount===1&&one.ids[0]?.info===expectedId&&one.ids[0]?.edit===expectedId&&one.trailingCardSpace<=2&&two.rowCount===2&&two.ids.every(item=>item.info&&item.info===item.edit)&&two.trailingCardSpace<=2&&one.paddingBottom==="0px"&&two.paddingBottom==="0px"};
    await page.locator("#playerLibrarySearch").fill("");
    await page.waitForTimeout(80);
  }
  await page.evaluate(()=>{const list=document.getElementById("playerLibraryList");list.scrollTop=list.scrollHeight;});
  await page.waitForTimeout(120);
  if(captureBottom){
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(output,`Player_${count}_Final_390x844.png`),animations:"disabled"});
  }
  const metrics=await page.evaluate(()=>{
    const rect=node=>{if(!node)return null;const value=node.getBoundingClientRect();return {x:value.x,y:value.y,width:value.width,height:value.height,right:value.right,bottom:value.bottom};};
    const list=document.getElementById("playerLibraryList"),nav=document.querySelector(".cue-phase1-tab-bar"),rows=[...list.querySelectorAll(":scope > .player-management-row-v1")],infos=[...list.querySelectorAll(".player-hub-info-v3")],edits=[...list.querySelectorAll(".player-hub-edit-v3")],last=rows.at(-1),info=last?.querySelector(".player-hub-info-v3"),edit=last?.querySelector(".player-hub-edit-v3");
    const rowIntegrity=rows.map(row=>{const info=row.querySelectorAll(":scope > .player-hub-info-v3"),edit=row.querySelectorAll(":scope > .player-hub-edit-v3"),infoId=info[0]?.dataset.statsPlayer||"",editId=edit[0]?.dataset.editPlayer||"";return {infoCount:info.length,editCount:edit.length,infoId,editId,pass:info.length===1&&edit.length===1&&Boolean(infoId)&&infoId===editId};});
    const listRect=rect(list),navRect=rect(nav),lastRowRect=rect(last),infoRect=rect(info),editRect=rect(edit);
    const visualBottom=Math.max(lastRowRect?.bottom??0,infoRect?.bottom??0,editRect?.bottom??0);
    return {
      viewport:{width:innerWidth,height:innerHeight},
      count:rows.length,
      controlCount:{info:infos.length,edit:edits.length},
      rowIntegrity,
      rowIntegrityPass:rowIntegrity.length===rows.length&&rowIntegrity.every(row=>row.pass),
      blankRows:rowIntegrity.filter(row=>!row.infoId).length,
      orphanControls:list.querySelectorAll(":scope > .player-hub-info-v3,:scope > .player-hub-edit-v3").length,
      scrollOwner:{id:list.id,overflowY:getComputedStyle(list).overflowY,scrollTop:list.scrollTop,scrollHeight:list.scrollHeight,clientHeight:list.clientHeight,maxScroll:list.scrollHeight-list.clientHeight,paddingBottom:getComputedStyle(list).paddingBottom,marginBottom:getComputedStyle(list).marginBottom,scrollPaddingBottom:getComputedStyle(list).scrollPaddingBottom},
      navigation:navRect,
      list:listRect,
      finalPlayerRow:lastRowRect,
      finalPlayer:infoRect,
      finalPlayerVisualBottom:visualBottom||null,
      trailingCardSpace:lastRowRect?listRect.bottom-lastRowRect.bottom:null,
      finalPlayerGap:visualBottom?navRect.y-visualBottom:null,
      finalEdit:editRect,
      finalEditTapTarget:editRect?editRect.width>=44&&editRect.height>=44:null,
      finalEditAboveNavigation:editRect?editRect.bottom<=navRect.y:null,
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth
    };
  });
  metrics.searchIntegrity=searchIntegrity;
  const before=metrics.scrollOwner.scrollTop;
  await page.waitForTimeout(180);
  const after=await page.locator("#playerLibraryList").evaluate(node=>node.scrollTop);
  metrics.scrollStable=Math.abs(after-before)<1;
  metrics.scrollTopAfterWait=after;
  if(keyboardEquivalent&&count){
    await page.setViewportSize({width:390,height:560});
    await page.locator("#playerLibrarySearch").focus();
    await page.evaluate(()=>{const list=document.getElementById("playerLibraryList");list.scrollTop=list.scrollHeight;});
    await page.waitForTimeout(80);
    metrics.keyboardEquivalent=await page.evaluate(()=>{
      const infos=[...document.querySelectorAll("#playerLibraryList .player-hub-info-v3")];
      const last=infos.at(-1)?.getBoundingClientRect();
      const nav=document.querySelector(".cue-phase1-tab-bar")?.getBoundingClientRect();
      return {viewportHeight:innerHeight,finalPlayerBottom:last?.bottom??null,navigationTop:nav?.top??null,gap:last&&nav?nav.top-last.bottom:null,pass:Boolean(last&&nav&&last.bottom<=nav.top)};
    });
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(50);
    await page.evaluate(()=>{const list=document.getElementById("playerLibraryList");list.scrollTop=list.scrollHeight;});
  }
  if(count){
    const finalTarget=await page.locator("#playerLibraryList .player-management-row-v1").last().evaluate(row=>({id:row.querySelector(":scope > .player-hub-edit-v3")?.dataset.editPlayer||"",name:row.querySelector(".player-management-name-v1")?.childNodes[0]?.textContent?.trim()||""}));
    await page.locator("#playerLibraryList .player-management-row-v1").last().locator(":scope > .player-hub-edit-v3").click();
    metrics.finalEditOpened=await page.locator("#playerEditor:not(.hidden)").isVisible();
    metrics.finalEditTarget={expectedId:finalTarget.id,expectedName:finalTarget.name,editorName:await page.locator("#playerEditorName").inputValue(),title:await page.locator("#playerEditorModalTitleV1").textContent()};
    metrics.finalEditTarget.pass=metrics.finalEditOpened&&metrics.finalEditTarget.editorName===finalTarget.name&&metrics.finalEditTarget.title?.trim()==="プレーヤー編集";
    if(captureBottom)await page.screenshot({path:path.join(output,`Player_${count}_Final_Edit_390x844.png`),animations:"disabled"});
  }else metrics.finalEditOpened=null;
  await page.close();
  return metrics;
}

async function historyAudit(count,{captureBottom=false}={}){
  const page=await pageFor(2,count);
  await page.evaluate(()=>window.CueScoreNavigationPhase1.openRoot("history"));
  await page.locator("#recordsScreen:not(.hidden)").waitFor({state:"visible"});
  if(count)await page.locator("#recordsList [data-record-id]").nth(count-1).waitFor();
  else await page.locator("#recordsList .record-empty").waitFor();
  await page.evaluate(()=>{const list=document.getElementById("recordsList");list.scrollTop=list.scrollHeight;});
  await page.waitForTimeout(120);
  if(captureBottom)await page.screenshot({path:path.join(output,`History_${count}_Final_390x844.png`),animations:"disabled"});
  const metrics=await page.evaluate(()=>{
    const rect=node=>{if(!node)return null;const value=node.getBoundingClientRect();return {x:value.x,y:value.y,width:value.width,height:value.height,right:value.right,bottom:value.bottom};};
    const list=document.getElementById("recordsList"),nav=document.querySelector(".cue-phase1-tab-bar"),last=list.querySelector("[data-record-id]:last-of-type");
    const navRect=rect(nav),lastRect=rect(last);
    return {
      viewport:{width:innerWidth,height:innerHeight},
      count:list.querySelectorAll("[data-record-id]").length,
      scrollOwner:{id:list.id,overflowY:getComputedStyle(list).overflowY,scrollTop:list.scrollTop,scrollHeight:list.scrollHeight,clientHeight:list.clientHeight,maxScroll:list.scrollHeight-list.clientHeight,paddingBottom:getComputedStyle(list).paddingBottom},
      navigation:navRect,
      finalMatch:lastRect,
      finalMatchGap:lastRect?navRect.y-lastRect.bottom:null,
      finalMatchAboveNavigation:lastRect?lastRect.bottom<=navRect.y:null,
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth
    };
  });
  const before=metrics.scrollOwner.scrollTop;
  await page.waitForTimeout(180);
  const after=await page.locator("#recordsList").evaluate(node=>node.scrollTop);
  metrics.scrollStable=Math.abs(after-before)<1;
  metrics.scrollTopAfterWait=after;
  await page.close();
  return metrics;
}

async function rootRegression(){
  const page=await pageFor(12,12);
  const result={};
  for(const key of ["home","player","history","settings"]){
    await page.evaluate(value=>window.CueScoreNavigationPhase1.openRoot(value),key);
    await page.waitForTimeout(80);
    result[key]=await page.evaluate(value=>{
      const nav=document.querySelector(".cue-phase1-tab-bar"),selected=nav?.querySelector(`[data-phase1-tab="${value}"]`);
      return {navVisible:Boolean(nav&&getComputedStyle(nav).display!=="none"),selected:selected?.getAttribute("aria-selected")==="true",horizontalOverflow:document.documentElement.scrollWidth>innerWidth,navHeight:nav?.getBoundingClientRect().height??null};
    },key);
  }
  await page.close();
  return result;
}

const audit={
  generatedAt:new Date().toISOString(),
  viewport:{width:390,height:844},
  contract:{navigationHeightToken:68,normalGap:18,safeAreaExpression:"env(safe-area-inset-bottom)"},
  player:{
    0:await playerAudit(0),
    1:await playerAudit(1),
    2:await playerAudit(2,{captureTop:true}),
    7:await playerAudit(7,{captureTop:true,captureBottom:true}),
    11:await playerAudit(11,{captureTop:true,captureBottom:true}),
    12:await playerAudit(12,{captureBottom:true,keyboardEquivalent:true})
  },
  history:{
    0:await historyAudit(0),
    1:await historyAudit(1),
    12:await historyAudit(12,{captureBottom:true})
  },
  roots:await rootRegression()
};

const playerPass=[audit.player[1],audit.player[2],audit.player[7],audit.player[11],audit.player[12]].every(item=>item.rowIntegrityPass&&item.blankRows===0&&item.orphanControls===0&&item.controlCount.info===item.count&&item.controlCount.edit===item.count&&item.finalPlayerGap>=17&&item.finalEditTapTarget&&item.finalEditAboveNavigation&&item.finalEditOpened&&item.finalEditTarget?.pass&&item.scrollStable&&!item.horizontalOverflow&&item.scrollOwner.paddingBottom==="0px"&&item.scrollOwner.marginBottom==="86px"&&item.trailingCardSpace<=2)&&[audit.player[1],audit.player[2],audit.player[7]].every(item=>item.scrollOwner.maxScroll===0)&&[audit.player[11],audit.player[12]].every(item=>item.scrollOwner.maxScroll>0)&&(audit.player[2].searchIntegrity?.pass===true)&&(audit.player[7].searchIntegrity?.pass===true)&&(audit.player[11].searchIntegrity?.pass===true)&&(audit.player[12].searchIntegrity?.pass===true);
const historyPass=[audit.history[1],audit.history[12]].every(item=>item.finalMatchAboveNavigation&&item.scrollStable&&!item.horizontalOverflow);
audit.result={playerPass,historyPass,rootPass:Object.values(audit.roots).every(item=>item.navVisible&&item.selected&&!item.horizontalOverflow),keyboardEquivalentPass:audit.player[12].keyboardEquivalent?.pass===true};
await writeFile(path.join(output,"Visual_Audit.json"),`${JSON.stringify(audit,null,2)}\n`);
console.log(JSON.stringify(audit,null,2));

await browser.close();
await new Promise(resolve=>server.close(resolve));
if(!Object.values(audit.result).every(Boolean))process.exitCode=1;
