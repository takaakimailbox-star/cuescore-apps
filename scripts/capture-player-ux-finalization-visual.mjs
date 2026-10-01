import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"outputs/player-ux-finalization");
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

const names=["テストc","テストd","テストe","テストf","あおい","しょう","かいと","ゆな","たくみ","削除テストB","削除テストA"];
const players=names.map((name,index)=>({
  id:`player-ux-${String(index+1).padStart(2,"0")}`,
  name,memo:"",isPrimary:name==="ゆな",avatar:{type:"default",id:"default_silhouette"},
  createdAt:Date.UTC(2026,8,1+index),updatedAt:Date.UTC(2026,8,1+index),lastUsed:null
}));
const record=(id,playerIndex,date)=>({
  id,gameType:"tenBall",recordSchemaVersion:4,createdByAppVersion:"1.2",playedAt:date,endedAt:date,winner:1,
  players:{1:{name:players[playerIndex].name,registeredPlayerId:players[playerIndex].id,goal:7,score:7},2:{name:"対戦相手",registeredPlayerId:"opponent",goal:7,score:4}}
});
const baseRecords=[
  record("sort-a",4,"2026-09-27T09:00:00.000Z"),
  record("sort-b",5,"2026-09-29T09:00:00.000Z"),
  record("sort-c",6,"2026-09-28T09:00:00.000Z")
];

await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:["--disable-background-networking","--force-color-profile=srgb"]});
const origin=`http://127.0.0.1:${server.address().port}`;

async function pageFor(playerRows=players,recordRows=baseRecords,viewport={width:390,height:844}){
  const page=await browser.newPage({viewport,deviceScaleFactor:1,colorScheme:"light"});
  await page.addInitScript(({players,records})=>{
    localStorage.setItem("rotationScoreboard.players.v1",JSON.stringify(players));
    localStorage.setItem("rotationScoreboard.matchRecords.v1",JSON.stringify(records));
  },{players:playerRows,records:recordRows});
  await page.goto(`${origin}/index.html`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>window.CueScoreNavigationPhase1&&typeof renderPlayerLibrary==="function"&&window.CueScorePlayerLibraryOrderV1);
  return page;
}

const shot=async(page,name)=>page.screenshot({path:path.join(output,name),animations:"disabled"});
const namesInList=page=>page.locator("#playerLibraryList .player-management-name-v1").evaluateAll(nodes=>nodes.map(node=>node.childNodes[0]?.textContent?.trim()||""));
const rects=page=>page.evaluate(()=>{
  const rect=node=>{if(!node)return null;const value=node.getBoundingClientRect();return {x:value.x,y:value.y,width:value.width,height:value.height,right:value.right,bottom:value.bottom};};
  const notice=document.querySelector(".player-delete-notice-v1"),title=notice?.querySelector("strong"),body=notice?.querySelector(".player-delete-notice-copy-v1 span"),dialog=document.querySelector(".player-delete-confirm-card-v1");
  return {notice:rect(notice),noticeTitle:rect(title),noticeBody:rect(body),dialog:rect(dialog),horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
});

const audit={generatedAt:new Date().toISOString(),viewport:{width:390,height:844},screens:{}};
const page=await pageFor();
await page.evaluate(()=>window.CueScoreNavigationPhase1.openRoot("player"));
await page.locator("#playerLibraryOverlay:not(.hidden)").waitFor({state:"visible"});
await page.locator("#playerLibraryList .player-management-row-v1").nth(10).waitFor();
await page.waitForTimeout(100);
audit.screens.formalSort={names:await namesInList(page)};
await shot(page,"01_Player_11_Formal_Sort_390x844.png");

await page.evaluate(newRecord=>{
  const records=JSON.parse(localStorage.getItem("rotationScoreboard.matchRecords.v1")||"[]");
  records.push(newRecord);localStorage.setItem("rotationScoreboard.matchRecords.v1",JSON.stringify(records));
  window.dispatchEvent(new Event("pageshow"));renderPlayerLibrary();
},record("sort-f-latest",3,"2026-10-01T12:00:00.000Z"));
await page.waitForTimeout(100);
audit.screens.latestUpdated={names:await namesInList(page)};
await shot(page,"03_Player_Latest_Match_Updated_390x844.png");

await page.evaluate(()=>{const list=document.getElementById("playerLibraryList");list.scrollTop=list.scrollHeight;});
await page.waitForTimeout(100);
audit.screens.bottom=await page.evaluate(()=>{
  const row=document.querySelector("#playerLibraryList .player-management-row-v1:last-child")?.getBoundingClientRect();
  const edit=document.querySelector("#playerLibraryList .player-management-row-v1:last-child .player-hub-edit-v3")?.getBoundingClientRect();
  const nav=document.querySelector(".cue-phase1-tab-bar")?.getBoundingClientRect();
  return {finalPlayerBottom:Math.max(row?.bottom||0,edit?.bottom||0),navigationTop:nav?.top||0,gap:(nav?.top||0)-Math.max(row?.bottom||0,edit?.bottom||0),editTapTarget:{width:edit?.width||0,height:edit?.height||0},pass:Boolean(row&&edit&&nav&&edit.bottom<=nav.top)};
});
await shot(page,"04_Player_Final_Row_Bottom_Navigation_390x844.png");

await page.locator('[data-edit-player="player-ux-01"]').click();
await page.locator("#playerEditor:not(.hidden)").waitFor({state:"visible"});
await shot(page,"05_Player_Edit_Delete_390x844.png");
await page.locator("#playerEditorDeleteBtn").click();
await page.locator("#playerDeleteConfirmV1").waitFor({state:"visible"});
audit.screens.deleteConfirmation={buttons:await page.locator("#playerDeleteConfirmV1 button").allTextContents(),...(await rects(page))};
await shot(page,"06_Player_Delete_Confirmation_Japanese_390x844.png");
await page.locator("[data-player-delete-cancel]").click();

await page.evaluate(()=>showPlayerDeleteNoticeV1("success","プレーヤーを削除しました","過去の試合履歴は保持されています"));
audit.screens.successNotice=await rects(page);
await shot(page,"07_Player_Delete_Success_Notification_390x844.png");
await page.waitForTimeout(1300);
await page.evaluate(()=>showPlayerDeleteNoticeV1("blocked","プレーヤーを削除できません","このプレーヤーは中断中の試合で使用されています。試合を終了または破棄してから削除してください。"));
audit.screens.blockedNotice=await rects(page);
await shot(page,"08_Player_Delete_Blocked_Notification_390x844.png");
await page.close();

const registrationPlayers=players.slice(0,4).map(player=>({...player,isPrimary:false}));
const registrationPage=await pageFor(registrationPlayers,[]);
await registrationPage.evaluate(()=>window.CueScoreNavigationPhase1.openRoot("player"));
await registrationPage.locator("#playerLibraryList .player-management-row-v1").nth(3).waitFor();
audit.screens.registrationOrder={names:await namesInList(registrationPage)};
await shot(registrationPage,"02_Player_No_Match_Registration_Order_390x844.png");
await registrationPage.close();

const noOverlap=entry=>!entry.notice||(!entry.noticeTitle||!entry.noticeBody||entry.noticeTitle.bottom<=entry.noticeBody.y);
audit.result={
  formalSortPass:audit.screens.formalSort.names[0]==="ゆな"&&audit.screens.formalSort.names.slice(1,4).join("|")==="しょう|かいと|あおい",
  registrationOrderPass:audit.screens.registrationOrder.names.join("|")==="テストc|テストd|テストe|テストf",
  latestUpdatePass:audit.screens.latestUpdated.names[0]==="ゆな"&&audit.screens.latestUpdated.names[1]==="テストf",
  bottomNavigationPass:audit.screens.bottom.pass&&audit.screens.bottom.gap>=17,
  japaneseConfirmationPass:audit.screens.deleteConfirmation.buttons.map(value=>value.trim()).join("|")==="キャンセル|削除",
  successNoticePass:noOverlap(audit.screens.successNotice)&&!audit.screens.successNotice.horizontalOverflow,
  blockedNoticePass:noOverlap(audit.screens.blockedNotice)&&!audit.screens.blockedNotice.horizontalOverflow
};

await writeFile(path.join(output,"Visual_Audit.json"),`${JSON.stringify(audit,null,2)}\n`);
console.log(JSON.stringify(audit,null,2));
await browser.close();
await new Promise(resolve=>server.close(resolve));
if(!Object.values(audit.result).every(Boolean))process.exitCode=1;
