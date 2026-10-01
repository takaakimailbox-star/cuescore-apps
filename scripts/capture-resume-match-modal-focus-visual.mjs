import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"outputs/resume-match-modal-focus");
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

await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:["--disable-background-networking","--force-color-profile=srgb"]});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:"light",isMobile:true,hasTouch:true});
const page=await context.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:"networkidle"});
await page.waitForFunction(()=>document.getElementById("cueInProgressChoiceV1"));
await page.waitForFunction(()=>!document.getElementById("cueLogoSplashV2"));

const showModal=()=>page.evaluate(()=>{
  const modal=document.getElementById("cueInProgressChoiceV1");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
  document.body.classList.add("cue-in-progress-choice-visible-v1");
});
const focusState=selector=>page.evaluate(selector=>{
  const button=document.querySelector(selector);
  button.focus();
  const style=getComputedStyle(button);
  const rect=button.getBoundingClientRect();
  const dialog=document.querySelector("#cueInProgressChoiceV1 > section").getBoundingClientRect();
  return {
    activeElementId:document.activeElement?.id||null,
    outlineStyle:style.outlineStyle,
    outlineWidth:style.outlineWidth,
    outlineColor:style.outlineColor,
    outlineOffset:style.outlineOffset,
    boxShadow:style.boxShadow,
    touchContract:matchMedia("(hover:none) and (pointer:coarse)").matches,
    button:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,bottom:rect.bottom},
    dialog:{x:dialog.x,y:dialog.y,width:dialog.width,height:dialog.height,bottom:dialog.bottom},
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth
  };
},selector);
const screenshot=name=>page.screenshot({path:path.join(output,name),animations:"disabled"});
const layoutState=()=>page.evaluate(()=>{
  const rect=node=>{const value=node?.getBoundingClientRect();return value?{x:value.x,y:value.y,width:value.width,height:value.height,bottom:value.bottom}:null;};
  const modal=document.getElementById("cueInProgressChoiceV1"),dialog=modal.querySelector(":scope > section"),nav=document.querySelector(".cue-phase1-tab-bar"),finalAction=document.getElementById("cueInProgressCancelV1");
  const navRect=rect(nav),finalRect=rect(finalAction),dialogRect=rect(dialog);
  const point=document.elementFromPoint(innerWidth/2,Math.min(innerHeight-1,(navRect?.y||innerHeight)+10));
  return {
    viewportHeight:innerHeight,
    modal:rect(modal),dialog:dialogRect,navigation:navRect,finalAction:finalRect,
    finalActionToNavigationGap:(navRect?.y||0)-(finalRect?.bottom||0),
    dialogToNavigationGap:(navRect?.y||0)-(dialogRect?.bottom||0),
    scrollHeight:dialog.scrollHeight,clientHeight:dialog.clientHeight,
    modalZIndex:Number(getComputedStyle(modal).zIndex),navigationZIndex:Number(getComputedStyle(nav).zIndex),
    navigationPointerEvents:getComputedStyle(nav).pointerEvents,
    navigationButtonPointerEvents:getComputedStyle(nav.querySelector("button")).pointerEvents,
    navigationPointElement:{tag:point?.tagName||null,id:point?.id||null,className:typeof point?.className==="string"?point.className:null},
    backdropOwnsNavigationPoint:point===modal||modal.contains(point),
    allActions:[...modal.querySelectorAll("button")].map(button=>({label:button.textContent.trim(),rect:rect(button)}))
  };
});

await showModal();
const layout=await layoutState();
await screenshot("01_Resume_Match_Modal_390x844.png");
const resume=await focusState("#cueInProgressResumeV1");
await screenshot("02_Resume_Focused_Touch_No_Yellow_390x844.png");
const newMatch=await focusState("#cueInProgressNewV1");
await screenshot("03_New_Match_Focused_Touch_No_Yellow_390x844.png");
const labels=await page.locator("#cueInProgressChoiceV1 button").allTextContents();
await page.locator("#cueInProgressResumeV1").tap();
const resumeTransitionClosed=await page.locator("#cueInProgressChoiceV1").evaluate(node=>node.classList.contains("hidden")&&node.getAttribute("aria-hidden")==="true");
await showModal();
await page.locator("#cueInProgressNewV1").tap();
const newMatchTransitionClosed=await page.locator("#cueInProgressChoiceV1").evaluate(node=>node.classList.contains("hidden")&&node.getAttribute("aria-hidden")==="true");
await showModal();
await page.locator("#cueInProgressCancelV1").tap();
const cancelTransitionClosed=await page.locator("#cueInProgressChoiceV1").evaluate(node=>node.classList.contains("hidden")&&node.getAttribute("aria-hidden")==="true");
await page.evaluate(()=>{window.__cueHomeTapCount=0;window.addEventListener("pointerdown",()=>window.__cueHomeTapCount+=1,{once:true,capture:true});});
await page.touchscreen.tap(12,120);
const homeUsableAfterClose=await page.evaluate(()=>window.__cueHomeTapCount===1);

const keyboardContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:"light"});
const keyboardPage=await keyboardContext.newPage();
await keyboardPage.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:"networkidle"});
await keyboardPage.waitForFunction(()=>!document.getElementById("cueLogoSplashV2"));
const keyboardCdp=await keyboardContext.newCDPSession(keyboardPage);
await keyboardCdp.send("Emulation.setEmulatedMedia",{features:[{name:"hover",value:"hover"},{name:"pointer",value:"fine"}]});
await keyboardPage.evaluate(()=>{const modal=document.getElementById("cueInProgressChoiceV1");modal.classList.remove("hidden");modal.setAttribute("aria-hidden","false");document.getElementById("cueInProgressResumeV1").focus({focusVisible:true});});
const keyboardFocus=await keyboardPage.locator("#cueInProgressResumeV1").evaluate(button=>{const style=getComputedStyle(button);return {activeElementId:document.activeElement?.id||null,disabled:button.disabled,hasOffsetParent:Boolean(button.offsetParent),inertAncestor:Boolean(button.closest("[inert]")),coarsePointer:matchMedia("(hover:none) and (pointer:coarse)").matches,outlineStyle:style.outlineStyle,outlineWidth:style.outlineWidth,outlineColor:style.outlineColor,outlineOffset:style.outlineOffset};});
await keyboardContext.close();
const audit={
  generatedAt:new Date().toISOString(),
  viewport:{width:390,height:844},
  labels:labels.map(label=>label.trim()),
  layout,resume,newMatch,keyboardFocus,resumeTransitionClosed,newMatchTransitionClosed,cancelTransitionClosed,homeUsableAfterClose,
  result:{
    touchContractPass:resume.touchContract&&newMatch.touchContract,
    resumeYellowOutlineZero:resume.outlineStyle==="none"&&resume.boxShadow==="none",
    newMatchYellowOutlineZero:newMatch.outlineStyle==="none"&&newMatch.boxShadow==="none",
    keyboardNeutralFocusPass:keyboardFocus.outlineStyle==="solid"&&keyboardFocus.outlineWidth==="3px"&&keyboardFocus.outlineColor==="rgb(23, 23, 23)",
    transitionsPass:resumeTransitionClosed&&newMatchTransitionClosed&&cancelTransitionClosed&&homeUsableAfterClose,
    layoutPass:layout.viewportHeight===844&&layout.modal?.height===844&&layout.finalActionToNavigationGap>=18&&layout.dialogToNavigationGap>=18&&layout.modalZIndex>layout.navigationZIndex&&layout.backdropOwnsNavigationPoint&&layout.allActions.every(action=>action.rect.height>=44&&action.rect.bottom<=layout.navigation.y)&&resume.button.height>=44&&newMatch.button.height>=44&&!resume.horizontalOverflow&&!newMatch.horizontalOverflow,
    labelsPass:labels.map(label=>label.trim()).join("|")==="中断中の試合を再開|新しい試合を始める|キャンセル"
  }
};
await writeFile(path.join(output,"Visual_Audit.json"),`${JSON.stringify(audit,null,2)}\n`);
console.log(JSON.stringify(audit,null,2));
await context.close();
await browser.close();
await new Promise(resolve=>server.close(resolve));
if(!Object.values(audit.result).every(Boolean))process.exitCode=1;
