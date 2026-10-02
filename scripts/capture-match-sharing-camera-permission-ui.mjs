import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"docs/implementation/evidence/build84-camera-permission-ui");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".json":"application/json"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname);
    const target=pathname==="/"?"index.html":pathname.slice(1);
    const file=path.resolve(root,target);
    if(!file.startsWith(`${root}${path.sep}`)&&file!==path.join(root,"index.html"))throw new Error("outside root");
    response.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream"});response.end(await readFile(file));
  }catch(_){response.writeHead(404);response.end("Not found");}
});

await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:"light"});
await page.addInitScript(()=>{
  window.Capacitor={Plugins:{CueScoreQRScanner:{
    authorizationStatus:async()=>({status:"denied"}),
    requestPermission:async()=>({status:"denied"}),
    startScan:async()=>({active:true}),stopScan:async()=>({active:false}),openSettings:async()=>({opened:true}),
    addListener:async()=>({remove(){}}),
  }}};
});
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:"domcontentloaded"});
await page.waitForFunction(()=>typeof window.openMatchSharingReceiverV1==="function");
await page.waitForTimeout(1200);
await page.evaluate(()=>window.openMatchSharingReceiverV1());
await page.locator("#matchSharingReceiverMessageV1:not([hidden])").waitFor({state:"visible"});

await mkdir(output,{recursive:true});
const screenshot=path.join(output,"Receiver_Camera_Permission_Denied_390x844.png");
await page.screenshot({path:screenshot,animations:"disabled"});
const audit=await page.evaluate(()=>{
  const rect=node=>{const value=node.getBoundingClientRect();return {x:value.x,y:value.y,width:value.width,height:value.height,right:value.right,bottom:value.bottom}};
  const overlay=document.getElementById("matchSharingReceiverV1");
  const message=document.getElementById("matchSharingReceiverMessageV1");
  const retry=document.getElementById("matchSharingReceiverRetryV1");
  const settings=document.getElementById("matchSharingReceiverSettingsV1");
  const back=document.getElementById("matchSharingReceiverBackV1");
  const visible=node=>getComputedStyle(node).display!=="none"&&!node.hidden;
  const visibleActions=[...message.querySelectorAll("button")].filter(visible);
  return {
    viewport:{width:innerWidth,height:innerHeight},
    title:document.getElementById("matchSharingReceiverMessageTitleV1")?.textContent,
    body:document.getElementById("matchSharingReceiverMessageTextV1")?.textContent,
    overlay:rect(overlay),message:rect(message),settings:rect(settings),back:rect(back),
    visibleActionLabels:visibleActions.map(node=>node.textContent.trim()),
    cameraCheckVisible:visible(retry),settingsVisible:visible(settings),backVisible:visible(back),
    settingsTapTargetAtLeast44:settings.getBoundingClientRect().height>=44,
    backTapTargetAtLeast44:back.getBoundingClientRect().height>=44&&back.getBoundingClientRect().width>=44,
    clipping:visibleActions.some(node=>{const value=node.getBoundingClientRect();return value.left<0||value.right>innerWidth||value.top<0||value.bottom>innerHeight}),
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
    bottomNavigationVisible:[...document.querySelectorAll(".cue-bottom-nav-v1,.cue-phase1-tab-bar,.records-bottom-nav-v1,.player-library-bottom-nav-v1")].some(visible),
    messageScroll:{scrollHeight:message.scrollHeight,clientHeight:message.clientHeight},
  };
});
await writeFile(path.join(output,"Receiver_Camera_Permission_Denied_390x844.json"),`${JSON.stringify(audit,null,2)}\n`);
console.log(JSON.stringify(audit,null,2));
await browser.close();
await new Promise(resolve=>server.close(resolve));
