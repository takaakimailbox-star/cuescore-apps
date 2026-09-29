import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import {stage1Fixtures} from "../tests/helpers/match-sharing-stage1-fixtures.mjs";

const require=createRequire(import.meta.url);
const adapters=require("../match-sharing-adapters-v1.js");
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"outputs/match-sharing-stage5b");
const fixture=stage1Fixtures().find(item=>item.gameType==="jpa9"&&item.lengthClass==="Medium");
const logical=adapters.buildSharedMatchV1(fixture.source,{sharedMatchId:fixture.sharedMatchId});
const players=[
  {id:"receiver-main",name:"貴章",isPrimary:true,avatar:{type:"default",id:"avatar_03"},createdAt:1,updatedAt:1,lastUsed:null},
  {id:"receiver-side-1",name:logical.players[1].name,avatar:{type:"default",id:"avatar_01"},createdAt:2,updatedAt:2,lastUsed:null},
  {id:"receiver-side-2",name:logical.players[2].name,avatar:{type:"default",id:"avatar_02"},createdAt:3,updatedAt:3,lastUsed:null},
  {id:"receiver-other",name:"長い名前の確認用プレーヤーABCDEFGHIJ",avatar:{type:"default",id:"default_silhouette"},createdAt:3,updatedAt:3,lastUsed:null},
];
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".json":"application/json"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=new URL(request.url,"http://127.0.0.1").pathname;
    const target=pathname==="/"?"index.html":decodeURIComponent(pathname.slice(1));
    const file=path.resolve(root,target);
    if(!file.startsWith(`${root}${path.sep}`)&&file!==path.join(root,"index.html"))throw new Error("outside root");
    response.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream"});response.end(await readFile(file));
  }catch(_){response.writeHead(404);response.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:"light"});
await page.addInitScript(value=>localStorage.setItem("rotationScoreboard.players.v1",JSON.stringify(value)),players);
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:"domcontentloaded"});
await page.waitForFunction(()=>typeof window.CueScoreMatchSharingUiV1==="object");
await page.waitForTimeout(1800);
await page.evaluate(value=>{
  const overlay=document.getElementById("matchSharingFlowV1");
  overlay.classList.remove("hidden");overlay.setAttribute("aria-hidden","false");
  document.body.classList.add("match-sharing-flow-visible-v1");
  ensureMatchSharingFlowControllerV1().setLogicalMatch(value);
},logical);
await mkdir(output,{recursive:true});
const auditPage=()=>page.evaluate(()=>{
  const screens=[document.getElementById("matchSharingFlowV1"),document.getElementById("matchSharingReceiverV1"),document.getElementById("recordDetailOverlay")].filter(Boolean);
  const visible=screens.find(node=>!node.classList.contains("hidden"));
  const rect=node=>{const value=node.getBoundingClientRect();return {x:value.x,y:value.y,width:value.width,height:value.height,right:value.right,bottom:value.bottom};};
  const controls=[...document.querySelectorAll("button:not([hidden]),input:not([hidden])")].filter(node=>{const value=rect(node);return value.width&&value.height&&value.right>0&&value.bottom>0&&value.x<innerWidth&&value.y<innerHeight;});
  return {
    viewport:{width:innerWidth,height:innerHeight},visibleScreen:visible?.id||null,
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
    clipping:visible?rect(visible).right>innerWidth||rect(visible).bottom>innerHeight:false,
    undersizedVisibleControls:controls.map(node=>({id:node.id||null,text:(node.textContent||node.value||"").trim().slice(0,40),...rect(node)})).filter(item=>item.width<44||item.height<44),
    importedBadges:[...document.querySelectorAll("body *")].filter(node=>/^(Imported|受信badge|QRから追加)$/.test((node.textContent||"").trim())).length,
    successStatus:[...document.querySelectorAll('[role="status"]')].filter(node=>{const style=getComputedStyle(node),value=node.getBoundingClientRect();return style.display!=="none"&&style.visibility!=="hidden"&&value.width>0&&value.height>0}).map(node=>(node.textContent||"").trim()).find(text=>text.includes("試合を取り込みました"))||null,
  };
});
const shots=[],screenAudits=[];
const capture=async(name)=>{const file=path.join(output,name);await page.screenshot({path:file,animations:"disabled"});shots.push(file);screenAudits.push({name,...await auditPage()});};
await capture("01_Unified_Mapping_Initial_390x844.png");
await page.evaluate(()=>{const flow=ensureMatchSharingFlowControllerV1();flow.selectMapping(1,{kind:"existing",playerId:"receiver-side-1"});flow.selectMapping(2,{kind:"existing",playerId:"receiver-side-2"})});
await capture("02_Unified_Mapping_Complete_390x844.png");
await page.locator("[data-flow-next]").click();
await capture("03_Final_Import_Confirmation_390x844.png");
await page.locator("[data-flow-import]").click();
await page.waitForFunction(()=>!document.getElementById("recordDetailOverlay")?.classList.contains("hidden"));
await capture("05_Import_Success_Normal_Detail_390x844.png");
await page.evaluate(()=>{document.querySelector(".toast")?.remove();document.getElementById("recordDetailOverlay")?.classList.add("hidden");const overlay=document.getElementById("matchSharingReceiverV1");overlay?.classList.remove("hidden");overlay?.setAttribute("aria-hidden","false");document.body.classList.add("match-sharing-receiver-visible-v1");renderMatchSharingReceiverStateV1({screen:"error",code:"DUPLICATE",message:"この試合はすでに取り込まれています。",retryable:true})});
await capture("04_Duplicate_Dedicated_UX_390x844.png");
await page.setViewportSize({width:360,height:780});
await page.evaluate(value=>{document.getElementById("matchSharingReceiverV1")?.classList.add("hidden");const overlay=document.getElementById("matchSharingFlowV1");overlay?.classList.remove("hidden");overlay?.setAttribute("aria-hidden","false");document.body.classList.add("match-sharing-flow-visible-v1");const flow=ensureMatchSharingFlowControllerV1();flow.reset();flow.setLogicalMatch(value);flow.selectMapping(1,{kind:"existing",playerId:"receiver-other"});flow.selectMapping(2,{kind:"existing",playerId:"receiver-side-2"})},logical);
const audit={screens390:screenAudits,"360x780-unified-complete":await auditPage()};
await writeFile(path.join(output,"Visual_Audit.json"),`${JSON.stringify({fixture:fixture.fixtureId,shots:shots.map(file=>path.basename(file)).sort(),audit},null,2)}\n`);
console.log(JSON.stringify(audit,null,2));
await browser.close();await new Promise(resolve=>server.close(resolve));
