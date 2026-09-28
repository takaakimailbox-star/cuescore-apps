import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"outputs/match-sharing-stage5a");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".json":"application/json"};
const server=createServer(async(request,response)=>{
  try{
    const target=new URL(request.url,"http://127.0.0.1").pathname==="/"?"index.html":decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname.slice(1));
    const file=path.resolve(root,target);
    if(!file.startsWith(`${root}${path.sep}`)&&file!==path.join(root,"index.html"))throw new Error("outside root");
    response.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream"});response.end(await readFile(file));
  }catch(_){response.writeHead(404);response.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:"light"});
await page.addInitScript(()=>{
  const listeners=new Map();
  window.Capacitor={Plugins:{CueScoreQRScanner:{
    authorizationStatus:async()=>({status:"authorized"}),requestPermission:async()=>({status:"authorized"}),
    startScan:async()=>({active:true}),stopScan:async()=>({active:false}),openSettings:async()=>({opened:true}),
    addListener:async(name,callback)=>{listeners.set(name,callback);return {remove:()=>listeners.delete(name)}},
  }}};
});
await page.goto(`http://127.0.0.1:${port}/index.html`,{waitUntil:"domcontentloaded"});
await page.waitForFunction(()=>typeof window.openMatchSharingReceiverV1==="function");
await page.waitForTimeout(1800);
await page.evaluate(()=>{
  const listeners=new Map();
  window.Capacitor={Plugins:{CueScoreQRScanner:{
    authorizationStatus:async()=>({status:"authorized"}),requestPermission:async()=>({status:"authorized"}),
    startScan:async()=>({active:true}),stopScan:async()=>({active:false}),openSettings:async()=>({opened:true}),
    addListener:async(name,callback)=>{listeners.set(name,callback);return {remove:()=>listeners.delete(name)}},
  }}};
});
await page.evaluate(()=>window.openMatchSharingReceiverV1());
await page.locator("#matchSharingReceiverV1:not(.hidden)").waitFor({state:"visible"});
// Browser-only visual audit: Capacitor has no native camera surface here, so
// keep the authorized scanner state visible and audit the real product DOM/CSS.
await page.evaluate(()=>{
  document.getElementById("matchSharingScannerStateV1").hidden=false;
  document.getElementById("matchSharingReceiverMessageV1").hidden=true;
});
await mkdir(output,{recursive:true});
await page.screenshot({path:path.join(output,"Receiver_QR_Scanner_390x844.png"),animations:"disabled"});
const audit=await page.evaluate(()=>{
  const overlay=document.getElementById("matchSharingReceiverV1"),guide=document.getElementById("matchSharingPreviewGuideV1"),back=document.getElementById("matchSharingReceiverBackV1");
  const rect=node=>{const value=node.getBoundingClientRect();return {x:value.x,y:value.y,width:value.width,height:value.height,right:value.right,bottom:value.bottom}};
  return {
    viewport:{width:innerWidth,height:innerHeight},overlay:rect(overlay),guide:rect(guide),back:rect(back),
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
    verticalOverflow:overlay.scrollHeight>overlay.clientHeight,
    clipping:guide.getBoundingClientRect().right>innerWidth||guide.getBoundingClientRect().bottom>innerHeight,
    bottomElements:document.elementsFromPoint(innerWidth/2,innerHeight-20).map(node=>({tag:node.tagName,id:node.id,className:String(node.className||"")})).slice(0,6),
    scannerTitle:overlay.querySelector("h1")?.textContent,
    instruction:[...overlay.querySelectorAll(".match-sharing-scanner-copy-v1 p")].map(node=>node.textContent),
  };
});
await readFile(path.join(output,"Receiver_QR_Scanner_390x844.png"));
console.log(JSON.stringify(audit,null,2));
await browser.close();await new Promise(resolve=>server.close(resolve));
