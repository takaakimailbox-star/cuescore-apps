import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "/Users/Ludique/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"outputs/player-delete-identity");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".json":"application/json"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=new URL(request.url,"http://127.0.0.1").pathname;
    const target=pathname==="/"?"index.html":decodeURIComponent(pathname.slice(1));
    const file=path.resolve(root,target);
    if(!file.startsWith(`${root}${path.sep}`)&&file!==path.join(root,"index.html"))throw new Error("outside root");
    response.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream"});
    response.end(await readFile(file));
  }catch(_){response.writeHead(404);response.end("Not found");}
});

await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser=await chromium.launch({headless:true,executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:["--disable-background-networking","--force-color-profile=srgb"]});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:"light"});
const players=[{id:"player-visual-main-0001",name:"小瀬古 隆太郎",memo:"",isPrimary:true,avatar:{type:"default",id:"default_silhouette"},createdAt:1,updatedAt:1,lastUsed:null}];
await page.addInitScript(value=>localStorage.setItem("rotationScoreboard.players.v1",JSON.stringify(value)),players);
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:"domcontentloaded"});
await page.waitForFunction(()=>typeof openPlayerEditor==="function"&&typeof readPlayerLibrary==="function");
await page.evaluate(()=>{
  const overlay=document.getElementById("playerLibraryOverlay");
  overlay.classList.remove("hidden");overlay.setAttribute("aria-hidden","false");
  openPlayerEditor("player-visual-main-0001");
});
await page.locator("#playerEditor:not(.hidden)").waitFor({state:"visible"});
await page.waitForTimeout(100);
await mkdir(output,{recursive:true});
const image=path.join(output,"Player_Edit_Delete_No_UUID_390x844.png");
await page.screenshot({path:image,animations:"disabled"});
const audit=await page.evaluate(()=>{
  const rect=node=>{const value=node.getBoundingClientRect();return {x:value.x,y:value.y,width:value.width,height:value.height,right:value.right,bottom:value.bottom};};
  const editor=document.getElementById("playerEditor"),scroll=document.querySelector(".player-editor-scroll-v1"),deleteButton=document.getElementById("playerEditorDeleteBtn"),footer=document.querySelector(".player-editor-actions-v1"),bottomNav=document.querySelector(".player-library-bottom-nav-v1");
  const deleteRect=rect(deleteButton),footerRect=rect(footer);
  const visible=node=>{const style=getComputedStyle(node),value=rect(node);return style.display!=="none"&&style.visibility!=="hidden"&&value.width>0&&value.height>0;};
  return {
    viewport:{width:innerWidth,height:innerHeight},
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
    editorClipping:rect(editor).right>innerWidth||rect(editor).bottom>innerHeight,
    scrollOverflow:scroll.scrollHeight>scroll.clientHeight,
    deleteVisible:visible(deleteButton),
    deleteTapTarget:{width:deleteRect.width,height:deleteRect.height,pass:deleteRect.width>=44&&deleteRect.height>=44},
    deleteFooterOverlap:deleteRect.bottom>footerRect.y,
    footerVisible:visible(footer),
    footerBottom:footerRect.bottom,
    uuidVisible:/Player ID/i.test(document.body.innerText)||/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(document.body.innerText),
    bottomNavigationVisible:bottomNav?visible(bottomNav):false,
    title:document.getElementById("playerEditorModalTitleV1")?.textContent||"",
    footerActions:[...footer.querySelectorAll("button")].map(button=>button.textContent.trim())
  };
});
await writeFile(path.join(output,"Visual_Audit.json"),`${JSON.stringify({image:path.basename(image),audit},null,2)}\n`);
console.log(JSON.stringify(audit,null,2));
await browser.close();
await new Promise(resolve=>server.close(resolve));
