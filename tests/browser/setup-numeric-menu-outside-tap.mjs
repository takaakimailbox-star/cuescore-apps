/* Real-app Chrome proof (Build 95 PO feedback): numeric menus (9-Ball/10-Ball 1-10+Other, 3 Cushion 7-40+Other, other disciplines), outside tap / Escape / X cancel,
 * current value outside the presets, background-button isolation, focus return, vertical balance. Real mouse/key events (CDP Input.*), no el.click().
 * Usage: [L=ja,en,zh-Hans] [W=320,375,390,430] [NM_OUT=<json>] [NM_SHOTS=<dir>] node tests/browser/setup-numeric-menu-outside-tap.mjs */
import { startApp, seed } from "./p2-browser-kit.mjs";
import fs from "node:fs";
const LANGS=(process.env.L||"ja,en,zh-Hans").split(","),VIEWS={320:568,375:667,390:844,430:932};
const WIDTHS=(process.env.W||"320,375,390,430").split(",").map(Number);
const checks=[];let fail=0;
const W=ms=>new Promise(r=>setTimeout(r,ms));
const ck=(ok,label,detail)=>{checks.push({ok:!!ok,label,...(detail===undefined?{}:{detail})});if(!ok){fail++;console.log("FAIL",label,JSON.stringify(detail))}};
for(const lang of LANGS) for(const w of WIDTHS){
  const h=VIEWS[w],tag=`${lang}/${w}`;
  const app=await startApp({lang,mode:"free",seedData:seed({lang,rich:true}),watchdogMs:900000});
  const ev=async c=>JSON.parse(await app.evalJs(`(async()=>JSON.stringify(await (async()=>{${c}})()))()`));
  const rect=async s=>ev(`const n=document.querySelector(${JSON.stringify(s)});if(!n)return null;const r=n.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}`);
  const tapXY=async(x,y)=>{await app.cdp("Input.dispatchMouseEvent",{type:"mousePressed",x,y,button:"left",clickCount:1});await app.cdp("Input.dispatchMouseEvent",{type:"mouseReleased",x,y,button:"left",clickCount:1});await W(350)};
  const tap=async s=>{const p=await rect(s);if(!p)throw new Error("no "+s);await tapXY(p.x,p.y);return p};
  const key=async k=>{const code={Escape:27,Tab:9}[k];await app.cdp("Input.dispatchKeyEvent",{type:"keyDown",key:k,code:k,windowsVirtualKeyCode:code});await app.cdp("Input.dispatchKeyEvent",{type:"keyUp",key:k,code:k,windowsVirtualKeyCode:code});await W(250)};
  await app.cdp("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:2,mobile:true});
  await app.cdp("Emulation.setSafeAreaInsetsOverride",{insets:{top:h>700?47:0,bottom:h>700?34:0,left:0,right:0}});
  await W(1000);
  const menuState=()=>ev(`const m=document.querySelector(".cue-menu-v1");if(!m)return {open:false};const rows=[...m.querySelectorAll(".cue-menu-row-v1")],r=m.getBoundingClientRect(),oth=m.querySelector(".is-pinned-v1"),or=oth&&oth.getBoundingClientRect();return {open:true,n:rows.length,labels:rows.map(x=>x.textContent.replace("✓","").trim()),sel:rows.filter(x=>x.getAttribute("aria-selected")==="true").map(x=>x.textContent.replace("✓","").trim()),inView:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,h:Math.round(r.height),scrollable:m.scrollHeight>m.clientHeight+1,minRow:Math.min(...rows.map(x=>x.getBoundingClientRect().height)),pinnedVisible:!!or&&or.bottom<=r.bottom+1&&or.top>=r.top-1,role:m.getAttribute("role"),scrimAria:document.querySelector(".cue-menu-scrim-v1").getAttribute("aria-hidden"),scrollTop:m.scrollTop}`);
  const val=id=>ev(`return document.getElementById(${JSON.stringify(id)}).value`);
  const setup=d=>ev(`const bk=document.getElementById("cueMatchSetupBackV3");if(bk&&bk.getClientRects().length){bk.click();await new Promise(r=>setTimeout(r,500))};document.querySelector('#cueDisciplineSwitcherV1 [data-discipline="${d}"]').click();await new Promise(r=>setTimeout(r,900));return 1`);
  for(const d of ["9ball","10ball","threeCushion","straightPool","rotation"]){
    await setup(d);
    const t=`${tag}/${d}`, targetBtn='[data-race-target="p1Race"]';
    // open
    await tap(targetBtn);
    let s=await menuState();
    ck(s.open,`${t} menu opens`,s);
    if(!s.open){continue}
    ck(s.scrimAria===null,`${t} scrim is not aria-hidden`,s.scrimAria);
    ck(s.inView&&s.minRow>=44,`${t} menu inside viewport, rows >=44px`,{inView:s.inView,minRow:s.minRow});
    ck(s.pinnedVisible,`${t} "Other" is visible without scrolling`);
    const exp={"9ball":[1,10],"10ball":[1,10],threeCushion:[7,40]}[d];
    if(exp){
      const nums=s.labels.filter(x=>/^\d+$/.test(x)).map(Number);
      const want=Array.from({length:exp[1]-exp[0]+1},(_,i)=>exp[0]+i);
      ck(JSON.stringify(nums)===JSON.stringify(want),`${t} contiguous ${exp[0]}-${exp[1]} presets`,nums.join(","));
      ck(s.labels.length===want.length+1,`${t} presets + Other only`,s.labels.length);
    }
    if(d==="threeCushion"){ck(s.scrollable&&s.h<=360,`${t} bounded-height scrolling list`,{h:s.h,scrollable:s.scrollable});ck(s.sel.length===1,`${t} selected value visible/marked`,s.sel)}
    // outside tap cancels, no value change, no tap-through
    const before=await val("p1Race"),swapBefore=await ev(`return [document.getElementById("p1Name").value,document.getElementById("p2Name").value]`);
    const m=await rect(".cue-menu-v1"),swap=await rect(".new-match-swap-v1");
    const outside=swap&&(swap.x<m.l||swap.x>m.r||swap.y<m.t||swap.y>m.b)?{x:swap.x,y:swap.y}:{x:8,y:h-8};
    await tapXY(outside.x,outside.y);
    s=await menuState();
    ck(!s.open,`${t} outside tap closes the menu`);
    ck((await val("p1Race"))===before,`${t} outside tap keeps the unconfirmed value`,before);
    ck(JSON.stringify(await ev(`return [document.getElementById("p1Name").value,document.getElementById("p2Name").value]`))===JSON.stringify(swapBefore),`${t} no tap-through to the control below (names unchanged)`);
    ck(await ev(`return !!document.querySelector("#newMatchRacePickerV1.hidden")`),`${t} picker sheet closed`);
    ck(await ev(`return document.activeElement===document.querySelector('[data-race-target="p1Race"]')||document.activeElement?.id==="p1Race"`),`${t} focus returns to the trigger`);
    // Escape cancels
    await tap(targetBtn);await key("Escape");
    ck(!(await menuState()).open&&(await val("p1Race"))===before,`${t} Escape cancels`);
    // choose a value: auto close + applied
    await tap(targetBtn);
    const pick=d==="threeCushion"?"20":d==="9ball"||d==="10ball"?"7":null;
    if(pick){
      const ok=await ev(`const b=[...document.querySelectorAll(".cue-menu-row-v1")].find(x=>x.textContent.replace("✓","").trim()==="${pick}");if(!b)return false;b.scrollIntoView({block:"center"});return true`);
      await W(150);
      const rows=await ev(`const b=[...document.querySelectorAll(".cue-menu-row-v1")].find(x=>x.textContent.replace("✓","").trim()==="${pick}");const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}`);
      await tapXY(rows.x,rows.y);
      ck(ok&&!(await menuState()).open&&(await val("p1Race"))===pick,`${t} choosing ${pick} applies and auto-closes`,await val("p1Race"));
    } else { await key("Escape") }
    // Other: custom input, current value outside presets
    await tap(targetBtn);
    await ev(`const b=document.querySelector(".cue-menu-row-v1.is-pinned-v1");b.scrollIntoView({block:"nearest"});return 1`);
    const op=await rect(".cue-menu-row-v1.is-pinned-v1");await tapXY(op.x,op.y);
    ck(await ev(`const c=document.getElementById("newMatchRaceCustomV1");return !!c&&!c.classList.contains("hidden")`),`${t} "Other" opens the numeric input`);
    // outside tap during Other input = cancel
    const customBefore=await val("p1Race");
    await ev(`const i=document.getElementById("newMatchRaceCustomInputV1");i.value="55";i.dispatchEvent(new Event("input",{bubbles:true}));return 1`);
    await tapXY(4,4);
    ck(await ev(`return !!document.querySelector("#newMatchRacePickerV1.hidden")`)&&(await val("p1Race"))===customBefore,`${t} outside tap during Other input cancels without applying`,await val("p1Race"));
    // now apply 55 (non-candidate) and reopen: it must show as selected row
    await tap(targetBtn);
    const op2=await rect(".cue-menu-row-v1.is-pinned-v1");await tapXY(op2.x,op2.y);
    await ev(`const i=document.getElementById("newMatchRaceCustomInputV1");i.value="45";i.dispatchEvent(new Event("input",{bubbles:true}));document.getElementById("newMatchRaceCustomApplyV1").click();return 1`);await W(300);
    ck((await val("p1Race"))==="45",`${t} custom 45 applied`,await val("p1Race"));
    await tap(targetBtn);s=await menuState();
    ck(s.open&&s.labels.includes("45")&&s.sel.join()==="45",`${t} current value outside the presets is shown selected`,{sel:s.sel});
    await key("Escape");
    // restore a normal value
    await ev(`const i=document.getElementById("p1Race");i.value=${d==="threeCushion"?20:d==="9ball"||d==="10ball"?7:90};i.dispatchEvent(new Event("change",{bubbles:true}));return 1`);
    // layout: horizontal overflow
    ck(await ev(`return document.documentElement.scrollWidth<=innerWidth+1`),`${t} no horizontal overflow`);
  }
  // vertical balance + start reachable (9-Ball)
  await setup("9ball");
  const bal=await ev(`const sc=document.querySelector("#cueHomeV1 .cue-new-match-integrated-v2"),R=n=>n.getBoundingClientRect(),first=R(sc.querySelector(".cue-new-match-summary-v2")),last=[...sc.children].filter(k=>k.getClientRects().length&&!k.matches(".cue-match-setup-back-v3")).map(k=>R(k).bottom).reduce((a,b)=>Math.max(a,b),0),s=R(sc),st=R(document.getElementById("startGameBtn")),tb=R(document.querySelector(".cue-phase1-tab-bar"));return {top:Math.round(first.top-s.top),bottom:Math.round(s.bottom-last),startBottom:Math.round(st.bottom),tabTop:Math.round(tb.top),startH:Math.round(st.height)}`);
  ck(bal.startBottom<=bal.tabTop&&bal.startH>=44,`${tag} start button above tab bar, >=44px`,bal);
  if(h>=800)ck(bal.top>20&&bal.bottom<bal.top*3.2,`${tag} vertical balance (top ${bal.top} / bottom ${bal.bottom})`,bal);
  if(process.env.NM_SHOTS){fs.mkdirSync(process.env.NM_SHOTS,{recursive:true});
    const shot=async n=>{const r=await app.cdp("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`${process.env.NM_SHOTS}/${n}.png`,Buffer.from(r.data,"base64"))};
    await shot(`${lang}_${w}_9ball_setup`);await tap('[data-race-target="p1Race"]');await shot(`${lang}_${w}_9ball_menu`);await key("Escape");
    await setup("threeCushion");await tap('[data-race-target="p1Race"]');await shot(`${lang}_${w}_3c_menu`);await key("Escape");}
  await app.close();
}
if(process.env.NM_OUT)fs.writeFileSync(process.env.NM_OUT,JSON.stringify({timestamp:new Date().toISOString(),checks,pass:fail===0},null,1)+"\n");
console.log(fail?`FAIL ${fail}/${checks.length}`:`PASS ${checks.length}/${checks.length}`);
process.exit(fail?1:0);
